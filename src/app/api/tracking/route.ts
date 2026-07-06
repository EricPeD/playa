import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function normalizeQuery(value: string | null) {
  return (value ?? '').trim();
}

function isPhoneQuery(value: string) {
  return /^\+?\d{5,15}$/.test(value.replace(/\s+/g, ''));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeQuery(searchParams.get('q'));

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    let orderQuery = supabase.from('orders').select('id, status, beach_location, notes, created_at, total, subtotal').order('created_at', { ascending: false });

    if (isPhoneQuery(query)) {
      const normalizedPhone = query.replace(/\s+/g, '');
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (customerError) {
        return NextResponse.json({ error: customerError.message }, { status: 500 });
      }

      if (!customerData) {
        return NextResponse.json({ error: 'No order found' }, { status: 404 });
      }

      orderQuery = orderQuery.eq('customer_id', customerData.id);
    } else {
      orderQuery = orderQuery.eq('id', Number(query));
    }

    const { data: orders, error } = await orderQuery.limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'No order found' }, { status: 404 });
    }

    const order = orders[0];
    const { data: trackingRows, error: trackingError } = await supabase
      .from('delivery_tracking')
      .select('status, created_at, notes')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    if (trackingError) {
      return NextResponse.json({ error: trackingError.message }, { status: 500 });
    }

    const { data: itemsRows, error: itemsError } = await supabase
      .from('order_items')
      .select('quantity, unit_price, products(name)')
      .eq('order_id', order.id);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const items = (itemsRows ?? []).map((item: any) => ({
      name: item.products?.name ?? 'Producto',
      quantity: item.quantity,
      price: item.unit_price,
    }));

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        beach_location: order.beach_location,
        notes: order.notes,
        created_at: order.created_at,
        subtotal: order.subtotal,
        total: order.total,
      },
      tracking: trackingRows ?? [],
      items,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
