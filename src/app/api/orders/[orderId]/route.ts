import { supabase } from '@/lib/supabase';

export async function GET(
  _: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = Number(params.orderId);

  if (!orderId) {
    return Response.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('total')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return Response.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      quantity,
      unit_price,
      products (
        id,
        name
      )
    `)
    .eq('order_id', orderId);

  if (itemsError) {
    return Response.json({ error: itemsError.message }, { status: 500 });
  }

  return Response.json({
    total: Number(order.total),
    currency: 'EUR',
    items: items.map((item: any) => ({
      id: String(item.products.id),
      name: item.products.name,
      quantity: item.quantity,
      price: Number(item.unit_price),
    })),
  });
}