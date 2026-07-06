import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type SalesByDay = { day: string; total: number };
export type PaymentBreakdown = { method: string; count: number; total: number };
export type HourlyPeak = { hour: string; count: number };
export type StatusBreakdown = { status: string; count: number };
export type BeachRevenue = { beach_location: string; total: number };

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

function isRevenueOrder(order: any) {
  const normalizedStatus = (order?.status ?? '').toLowerCase();
  const hasPaidAt = Boolean(order?.paid_at);
  const completedStatuses = ['paid', 'confirmed', 'preparing', 'delivering', 'delivered'];

  return normalizedStatus !== 'cancelled' && (hasPaidAt || completedStatuses.includes(normalizedStatus));
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
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [beachRevenue, setBeachRevenue] = useState<BeachRevenue[]>([]);
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
      .select('id, total, payment_method, created_at, status, beach_location, paid_at')
      .gte('created_at', range.start)
      .lte('created_at', range.end)
      .order('created_at', { ascending: true });

    if (ordersResult.error) {
      setError(ordersResult.error.message);
      setLoading(false);
      setLoadedOnce(true);
      return;
    }

    const revenueOrders = (Array.isArray(ordersResult.data) ? ordersResult.data : []).filter(isRevenueOrder);
    const paidOrderIds = revenueOrders.map((order: any) => order.id).filter(Boolean);

    let itemsResult: any = { data: [], error: null };

    if (paidOrderIds.length > 0) {
      itemsResult = await supabase
        .from('order_items')
        .select('order_id, product_id, quantity, products(name)')
        .in('order_id', paidOrderIds);
    }

    if (itemsResult.error) {
      setError(itemsResult.error.message ?? 'Error al cargar estadísticas.');
      setLoading(false);
      setLoadedOnce(true);
      return;
    }

    const total = revenueOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total ?? 0), 0);
    const ordersCount = revenueOrders.length;
    const avgTicket = ordersCount > 0 ? total / ordersCount : 0;
    const profit = total * 0.28;

    const paymentMap: Record<string, PaymentBreakdown> = {};
    const hourlyMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const beachMap: Record<string, number> = {};

    revenueOrders.forEach((order: any) => {
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

      const statusKey = (order.status ?? 'pending').toLowerCase();
      statusMap[statusKey] = (statusMap[statusKey] ?? 0) + 1;

      const beachKey = (order.beach_location ?? 'Sin ubicación').trim() || 'Sin ubicación';
      beachMap[beachKey] = (beachMap[beachKey] ?? 0) + parseFloat(order.total ?? 0);
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
    setStatusBreakdown(Object.entries(statusMap).map(([status, count]) => ({ status, count })));
    setBeachRevenue(Object.entries(beachMap).map(([beach_location, total]) => ({ beach_location, total })));
    setSummary({
      total,
      orders: ordersCount,
      avgTicket,
      profit,
      avgDeliveryMinutes: 0,
      pendingToPreparingMinutes: null,
      preparingToDeliveringMinutes: null,
      deliveringToDeliveredMinutes: null,
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
    statusBreakdown,
    beachRevenue,
    summary,
    loading,
    error,
    refresh: loadStats,
  };
}
