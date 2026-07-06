import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type SalesByDay = { day: string; total: number };
export type PaymentBreakdown = { method: string; count: number; total: number };
export type HourlyPeak = { hour: string; count: number };

type Period = 'hoy' | 'semana' | 'mes';

function toPeriodRange(period: Period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'hoy') {
    return { start: today.toISOString(), end: now.toISOString() };
  }

  if (period === 'semana') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    return { start: startOfWeek.toISOString(), end: now.toISOString() };
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: startOfMonth.toISOString(), end: now.toISOString() };
}

export type TopProduct = {
  name: string;
  qty: number;
};

export type SummaryMetrics = {
  total: number;
  orders: number;
  avgTicket: number;
  profit: number;
  avgDeliveryMinutes: number;
  pendingToPreparingMinutes: number | null;
  preparingToDeliveringMinutes: number | null;
  deliveringToDeliveredMinutes: number | null;
  topProducts: TopProduct[];
};

export function useStats(period: Period) {
  const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [hourlyPeak, setHourlyPeak] = useState<HourlyPeak[]>([]);
  const [summary, setSummary] = useState<SummaryMetrics>({
    total: 0,
    orders: 0,
    avgTicket: 0,
    profit: 0,
    avgDeliveryMinutes: 0,
    pendingToPreparingMinutes: null,
    preparingToDeliveringMinutes: null,
    deliveringToDeliveredMinutes: null,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => toPeriodRange(period), [period]);

  const loadStats = useCallback(async () => {
    if (!loadedOnce) setLoading(true);
    setError(null);

    const ordersResult = await supabase
      .from('orders')
      .select('id, total, payment_method, created_at')
      .eq('status', 'delivered')
      .gte('created_at', range.start)
      .lte('created_at', range.end)
      .order('created_at', { ascending: true });

    if (ordersResult.error) {
      setError(ordersResult.error.message);
      setLoading(false);
      setLoadedOnce(true);
      return;
    }

    const deliveredOrders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
    const deliveredOrderIds = deliveredOrders.map((order: any) => order.id).filter(Boolean);

    let trackingResult: any = { data: [], error: null };
    let itemsResult: any = { data: [], error: null };

    if (deliveredOrderIds.length > 0) {
      [trackingResult, itemsResult] = await Promise.all([
        supabase
          .from('delivery_tracking')
          .select('order_id, status, created_at')
          .in('order_id', deliveredOrderIds),
        supabase
          .from('order_items')
          .select('order_id, product_id, quantity, products(name)')
          .in('order_id', deliveredOrderIds),
      ]);
    }

    if (trackingResult.error || itemsResult.error) {
      setError(trackingResult.error?.message ?? itemsResult.error?.message ?? 'Error al cargar estadísticas.');
      setLoading(false);
      setLoadedOnce(true);
      return;
    }
    const total = deliveredOrders.reduce((sum, order: any) => sum + parseFloat(order.total ?? 0), 0);
    const ordersCount = deliveredOrders.length;
    const avgTicket = ordersCount > 0 ? total / ordersCount : 0;
    const profit = total * 0.28;

    const paymentMap: Record<string, PaymentBreakdown> = {};
    const hourlyMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    deliveredOrders.forEach((order: any) => {
      const method = order.payment_method ?? 'Desconocido';
      const paymentKey = method.toLowerCase();
      paymentMap[paymentKey] = paymentMap[paymentKey] || { method, count: 0, total: 0 };
      paymentMap[paymentKey].count += 1;
      paymentMap[paymentKey].total += parseFloat(order.total ?? 0);

      const createdAt = new Date(order.created_at);
      const hourLabel = `${String(createdAt.getHours()).padStart(2, '0')}:00`;
      hourlyMap[hourLabel] = (hourlyMap[hourLabel] ?? 0) + 1;

      const dayKey = createdAt.toISOString().slice(0, 10);
      dayMap[dayKey] = (dayMap[dayKey] ?? 0) + parseFloat(order.total ?? 0);
    });

    const trackingRows = Array.isArray(trackingResult.data) ? trackingResult.data : [];
    const trackingByOrder = trackingRows.reduce((acc: Record<number, Array<{ status: string; created_at: string; order_created_at: string | null }>>, row: any) => {
      const set = acc[row.order_id] ?? [];
      set.push({
        status: row.status,
        created_at: row.created_at,
        order_created_at: row.orders?.created_at ?? null,
      });
      acc[row.order_id] = set;
      return acc;
    }, {} as Record<number, Array<{ status: string; created_at: string; order_created_at: string | null }>>);

    const deliveryDurations: number[] = [];
    const pendingToPreparing: number[] = [];
    const preparingToDelivering: number[] = [];
    const deliveringToDelivered: number[] = [];

    deliveredOrders.forEach((order: any) => {
      const rows = trackingByOrder[order.id] ?? [];
      const createdAt = new Date(order.created_at).getTime();
      const byStatus = Object.fromEntries(rows.map((row: { status: string; created_at: string }) => [row.status, new Date(row.created_at).getTime()]));
      if (byStatus.delivered) {
        const diff = Math.max(0, Math.round((byStatus.delivered - createdAt) / 60000));
        deliveryDurations.push(diff);
      }
      if (byStatus.preparing) {
        const diff = Math.max(0, Math.round((byStatus.preparing - createdAt) / 60000));
        pendingToPreparing.push(diff);
      }
      if (byStatus.preparing && byStatus.delivering) {
        preparingToDelivering.push(Math.max(0, Math.round((byStatus.delivering - byStatus.preparing) / 60000)));
      }
      if (byStatus.delivering && byStatus.delivered) {
        deliveringToDelivered.push(Math.max(0, Math.round((byStatus.delivered - byStatus.delivering) / 60000)));
      }
    });

    const itemRows = Array.isArray(itemsResult.data) ? itemsResult.data : [];
    const productMap: Record<string, { name: string; qty: number }> = {};
    itemRows.forEach((item: any) => {
      const name = item.products?.name ?? `Producto ${item.product_id}`;
      const key = `${item.product_id}`;
      productMap[key] = productMap[key] || { name, qty: 0 };
      productMap[key].qty += item.quantity ?? 0;
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const salesByDayList = Object.entries(dayMap)
      .map(([dayKey, totalValue]) => ({
        day: new Date(dayKey).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        total: totalValue,
        dayKey,
      }))
      .sort((a, b) => new Date(a.dayKey).getTime() - new Date(b.dayKey).getTime())
      .map(({ day, total }) => ({ day, total }));

    const hourlyPeakList = Object.entries(hourlyMap)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);

    setSalesByDay(salesByDayList);
    setPaymentBreakdown(Object.values(paymentMap));
    setHourlyPeak(hourlyPeakList);
    setSummary({
      total,
      orders: ordersCount,
      avgTicket,
      profit,
      avgDeliveryMinutes: deliveryDurations.length > 0 ? deliveryDurations.reduce((sum, value) => sum + value, 0) / deliveryDurations.length : 0,
      pendingToPreparingMinutes: pendingToPreparing.length > 0 ? Math.round(pendingToPreparing.reduce((sum, value) => sum + value, 0) / pendingToPreparing.length) : null,
      preparingToDeliveringMinutes: preparingToDelivering.length > 0 ? Math.round(preparingToDelivering.reduce((sum, value) => sum + value, 0) / preparingToDelivering.length) : null,
      deliveringToDeliveredMinutes: deliveringToDelivered.length > 0 ? Math.round(deliveringToDelivered.reduce((sum, value) => sum + value, 0) / deliveringToDelivered.length) : null,
      topProducts,
    });
    setLoading(false);
    setLoadedOnce(true);
  }, [loadedOnce, range.end, range.start]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    salesByDay,
    paymentBreakdown,
    hourlyPeak,
    summary,
    loading,
    error,
    refresh: loadStats,
  };
}
