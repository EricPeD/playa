import type { HourlyPeak, SalesByDay } from '@/hooks/useStats';
import type { OrderWithDetails } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/format';
import S from '@/components/admin/styles';

type DashboardProps = {
  orders: OrderWithDetails[];
  stats: { total: number; orders: number; avgTicket: number; profit: number };
  salesByDay: SalesByDay[];
  hourlyPeak: HourlyPeak[];
};

export default function Dashboard({ orders, stats, salesByDay, hourlyPeak }: DashboardProps) {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const delivering = orders.filter((o) => o.status === 'delivering').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  const todaySales = stats.total;
  const avgTicket = stats.avgTicket;
  const maxSales = Math.max(1, ...salesByDay.map((item) => item.total));
  const maxPeakCount = Math.max(1, ...hourlyPeak.map((item) => item.count));

  return (
    <div style={S.section}>
      <p style={S.sectionTitle}>Resumen del día</p>
      <div style={S.metricGrid}>
        <div style={S.metricCard('#F59E0B')}>
          <p style={S.metricLabel}>Pendientes</p>
          <p style={S.metricValue}>{pending}</p>
          <p style={S.metricSub}>esperando</p>
        </div>
        <div style={S.metricCard('#3B82F6')}>
          <p style={S.metricLabel}>Preparando</p>
          <p style={S.metricValue}>{preparing}</p>
          <p style={S.metricSub}>en cocina</p>
        </div>
        <div style={S.metricCard('#FF6B2B')}>
          <p style={S.metricLabel}>En reparto</p>
          <p style={S.metricValue}>{delivering}</p>
          <p style={S.metricSub}>en camino</p>
        </div>
        <div style={S.metricCard('#22C55E')}>
          <p style={S.metricLabel}>Entregados</p>
          <p style={S.metricValue}>{delivered}</p>
          <p style={S.metricSub}>completados</p>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={S.metricLabel}>Facturación</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B2B', margin: 0 }}>{formatCurrency(todaySales)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={S.metricLabel}>Ticket medio</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#F1F0ED', margin: 0 }}>{formatCurrency(avgTicket)}</p>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Ventas esta semana</p>
        <div style={S.barChart}>
          {salesByDay.map((entry, index) => (
            <div key={entry.day} style={S.barCol}>
              <div style={S.bar((entry.total / maxSales) * 100, index === salesByDay.length - 1)} />
              <span style={S.barLabel}>{entry.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Hora pico</p>
        {hourlyPeak.length === 0 ? (
          <p style={{ color: '#888', marginTop: 6 }}>No hay datos de horas pico disponibles.</p>
        ) : (
          hourlyPeak.slice(0, 5).map((item) => (
            <div key={item.hour} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#888' }}>{item.hour}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F1F0ED' }}>{item.count} pedidos</span>
              </div>
              <div style={S.progressBar()}>
                <div style={{ ...S.progressFill((item.count / maxPeakCount) * 100), width: `${(item.count / maxPeakCount) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
