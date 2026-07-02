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
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
    return { start: startOfWeek.toISOString(), end: now.toISOString() };
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: startOfMonth.toISOString(), end: now.toISOString() };
}

export function useStats(period: Period) {
  const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [hourlyPeak, setHourlyPeak] = useState<HourlyPeak[]>([]);
  const [summary, setSummary] = useState({ total: 0, orders: 0, avgTicket: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => toPeriodRange(period), [period]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('orders')
      .select('id, total, payment_method, created_at')
      .eq('status', 'delivered')
      .gte('created_at', range.start)
      .lte('created_at', range.end)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const deliveredOrders = Array.isArray(data) ? data : [];
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

      const dayLabel = createdAt.toLocaleDateString('es-ES', { weekday: 'short' });
      dayMap[dayLabel] = (dayMap[dayLabel] ?? 0) + parseFloat(order.total ?? 0);
    });

    const salesByDayList = Object.entries(dayMap).map(([day, totalValue]) => ({ day, total: totalValue }));
    const hourlyPeakList = Object.entries(hourlyMap)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);

    setSalesByDay(salesByDayList);
    setPaymentBreakdown(Object.values(paymentMap));
    setHourlyPeak(hourlyPeakList);
    setSummary({ total, orders: ordersCount, avgTicket, profit });
    setLoading(false);
  }, [range.end, range.start]);

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
