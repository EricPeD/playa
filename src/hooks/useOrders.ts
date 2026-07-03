import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/lib/types';

export type OrderItemDetail = {
  id: number;
  product_id: number;
  qty: number;
  price: number;
  subtotal: number;
  name: string;
};

export type OrderWithDetails = Order & {
  customer_name: string;
  customer_phone: string | null;
  items: OrderItemDetail[];
  paid: boolean;
};

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapOrder = (order: any): OrderWithDetails => {
    const items = Array.isArray(order.order_items)
      ? order.order_items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          qty: item.quantity,
          price: parseFloat(item.unit_price ?? '0') || 0,
          subtotal: parseFloat(item.subtotal ?? '0') || 0,
          name: item.products?.name ?? `Producto ${item.product_id}`,
        }))
      : [];

    return {
      ...order,
      customer_name: order.customers?.name ?? 'Cliente desconocido',
      customer_phone: order.customers?.phone ?? null,
      items,
      paid: Boolean(order.paid_at),
      subtotal: parseFloat(order.subtotal ?? '0') || 0,
      delivery_fee: parseFloat(order.delivery_fee ?? '0') || 0,
      total: parseFloat(order.total ?? '0') || 0,
    };
  };

  const fetchOrders = useCallback(async () => {
    if (!loadedOnce) setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('orders')
      .select(
        `id, customer_id, status, beach_location, notes, subtotal, delivery_fee, total, paid_at, payment_method, created_at, customers(name, phone), order_items(id, product_id, quantity, unit_price, subtotal, products(name)))`
      )
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
      setOrders([]);
      setLoading(false);
      setLoadedOnce(true);
      return;
    }

    if (!data) {
      setOrders([]);
      setLoading(false);
      setLoadedOnce(true);
      return;
    }

    const normalized = data.map(mapOrder);
    setOrders(normalized);
    setLoading(false);
    setLoadedOnce(true);
  }, [loadedOnce]);

  useEffect(() => {
    fetchOrders();
    const interval = window.setInterval(fetchOrders, 30000);
    return () => window.clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: number, newStatus: string) => {
    if (!loadedOnce) setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updateError) {
      setError(updateError.message);
      if (!loadedOnce) setLoading(false);
      return false;
    }

    const { error: trackingError } = await supabase
      .from('delivery_tracking')
      .insert([{ order_id: orderId, status: newStatus, notes: `Estado actualizado a ${newStatus}` }]);

    if (trackingError) {
      setError(trackingError.message);
      if (!loadedOnce) setLoading(false);
      return false;
    }

    await fetchOrders();
    return true;
  }, [fetchOrders, loadedOnce]);

  const advanceOrder = useCallback(async (orderId: number, newStatus: string) => {
    return updateOrderStatus(orderId, newStatus);
  }, [updateOrderStatus]);

  const cancelOrder = useCallback(async (orderId: number) => {
    return updateOrderStatus(orderId, 'cancelled');
  }, [updateOrderStatus]);

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    advanceOrder,
    cancelOrder,
  };
}
