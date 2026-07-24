import { supabase } from '@/lib/supabase';
import {
  Customer,
  Order,
  OrderItem,
  CreateOrderPayload,
  CreateOrderResult,
} from './types';

// ── 1. Upsert customer por teléfono ──────────────────────────────────────────
// Si ya existe un cliente con ese teléfono lo reutilizamos; si no, lo creamos.
// Si no hay teléfono, siempre creamos un cliente anónimo.
export async function upsertCustomer(
  phone: string | null,
  countryCode: string,
): Promise<Customer | null> {
  const fullPhone = phone ? `${countryCode} ${phone}` : null;
  console.group('[upsertCustomer]');
  console.log('phone:', fullPhone ?? 'anónimo');

  if (fullPhone) {
    // Buscar cliente existente
    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', fullPhone)
      .maybeSingle();

    if (findError) {
      console.error('[upsertCustomer] Error buscando:', findError.message);
      console.groupEnd();
      return null;
    }

    if (existing) {
      console.log('[upsertCustomer] Cliente existente encontrado, id:', existing.id);
      console.groupEnd();
      return existing as Customer;
    }
  }

  // Crear nuevo cliente
  const { data, error } = await supabase
    .from('customers')
    .insert({ name: 'Cliente playa', phone: fullPhone, email: null })
    .select()
    .single();

  if (error) {
    console.error('[upsertCustomer] Error creando:', error.message);
    console.groupEnd();
    return null;
  }

  console.log('[upsertCustomer] Cliente creado, id:', data.id);
  console.groupEnd();
  return data as Customer;
}

// ── 2. Crear la cabecera del pedido ──────────────────────────────────────────
export async function createOrder(
  customerId: number | null,
  payload: CreateOrderPayload,
): Promise<Order | null> {
  const subtotal = payload.cart.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const deliveryFee = payload.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  const beachLocation = payload.gpsData
    ? `${payload.gpsData.latitude.toFixed(6)},${payload.gpsData.longitude.toFixed(6)}`
    : null;

  console.group('[createOrder]');
  console.log('customerId:', customerId, '| subtotal:', subtotal, '| total:', total);
  console.log('beachLocation:', beachLocation);
  console.log('notes:', payload.notes ?? 'sin notas');

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      status: 'pending',
      beach_location: beachLocation,
      notes: payload.notes ?? null,
      subtotal: parseFloat(subtotal.toFixed(2)),
      delivery_fee: parseFloat(deliveryFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      payment_method: null,
      paid_at: null,
    })
    .select()
    .single();

  if (error) {
    console.error('[createOrder] Error:', error.message);
    console.groupEnd();
    return null;
  }

  console.log('[createOrder] Pedido creado, id:', data.id);
  console.groupEnd();
  return data as Order;
}

// ── 3. Insertar líneas del pedido ─────────────────────────────────────────────
export async function createOrderItems(
  orderId: number,
  payload: CreateOrderPayload,
): Promise<OrderItem[] | null> {
  console.group('[createOrderItems]');
  console.log('orderId:', orderId, '| items:', payload.cart.length);

  const rows = payload.cart.map(({ product, quantity }) => ({
    order_id: orderId,
    product_id: product.id,
    quantity,
    unit_price: parseFloat(product.price.toFixed(2)),
  }));

  const { data, error } = await supabase
    .from('order_items')
    .insert(rows)
    .select();

  if (error) {
    console.error('[createOrderItems] Error:', error.message);
    console.groupEnd();
    return null;
  }

  console.log('[createOrderItems] Items insertados:', data.length);
  console.groupEnd();
  return data as OrderItem[];
}

// ── 4. Crear entrada inicial de tracking ─────────────────────────────────────
export async function createInitialTracking(orderId: number): Promise<boolean> {
  console.group('[createInitialTracking]');
  console.log('orderId:', orderId);

  const { error } = await supabase.from('delivery_tracking').insert({
    order_id: orderId,
    status: 'pending',
    notes: 'Pedido recibido',
  });

  if (error) {
    console.error('[createInitialTracking] Error:', error.message);
    console.groupEnd();
    return false;
  }

  console.log('[createInitialTracking] Tracking creado');
  console.groupEnd();
  return true;
}

// ── 5. Orquestador principal ──────────────────────────────────────────────────
export async function submitOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResult> {
  console.group('[submitOrder] ── Inicio flujo completo ──');

  console.log(
    'Payload:',
    JSON.stringify(
      {
        items: payload.cart.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          qty: i.quantity,
        })),
        phone: payload.phone
          ? `${payload.countryCode} ${payload.phone}`
          : null,
        gps: payload.gpsData,
        notes: payload.notes,
      },
      null,
      2,
    ),
  );

  try {
    // 1. Customer
    const customer = await upsertCustomer(
      payload.phone,
      payload.countryCode,
    );

    if (!customer) {
      throw new Error('No se pudo crear el cliente');
    }

    // 2. Order
    const order = await createOrder(customer.id, payload);

    if (!order) {
      throw new Error('No se pudo crear el pedido');
    }

    // 3. Order items
    const items = await createOrderItems(order.id, payload);

    if (!items) {
      throw new Error('No se pudieron insertar los items');
    }

    // 4. Tracking
    await createInitialTracking(order.id);

    console.log('[submitOrder] ✅ Flujo completo. orderId:', order.id);
    console.groupEnd();

    return {
      success: true,
      orderId: order.id,

      total: order.total,
      currency: 'EUR',

      items: payload.cart.map((item) => ({
        id: String(item.product.id),
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error desconocido';

    console.error('[submitOrder] ❌ Error:', message);
    console.groupEnd();

    return {
      success: false,
      error: message,
    };
  }
}

// ── 6. Pedido formateado para el Pixel de Meta ────────────────────────────────
export type PixelOrder = {
  id: number;
  total: number;
  order_items: {
    quantity: number;
    unit_price: number;
    products: {
      id: number;
      name: string;
    };
  }[];
};

export async function getOrderForPixel(orderId: number): Promise<PixelOrder | null> {
  console.group('[getOrderForPixel]');
  console.log('orderId:', orderId);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      order_items(
        quantity,
        unit_price,
        products(
          id,
          name
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('[getOrderForPixel] Error:', error.message);
    console.groupEnd();
    return null;
  }

  console.log('[getOrderForPixel] Pedido obtenido, id:', data.id);
  console.groupEnd();
  return data as unknown as PixelOrder;
}
