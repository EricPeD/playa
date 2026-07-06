import type { SalesByDay } from '@/hooks/useStats';
import type { OrderWithDetails } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/format';
import { STATUS_CONFIG } from '@/utils/statusConfig';
import S from '@/components/admin/styles';

type DashboardProps = {
  orders: OrderWithDetails[];
  stats: { total: number; orders: number; avgTicket: number; profit: number };
  salesByDay: SalesByDay[];
};

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function Dashboard({ orders, stats, salesByDay }: DashboardProps) {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const delivering = orders.filter((o) => o.status === 'delivering').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  const todaySales = stats.total;
  const avgTicket = stats.avgTicket;
  const maxSales = Math.max(1, ...salesByDay.map((item) => item.total));

  return (
    <div style={S.section as React.CSSProperties}>
      <p style={S.sectionTitle as React.CSSProperties}>Resumen del día</p>
      <div style={S.metricGrid as React.CSSProperties}>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#F59E0B')}>
          <p style={S.metricLabel as React.CSSProperties}>Pendientes</p>
          <p style={S.metricValue as React.CSSProperties}>{pending}</p>
          <p style={S.metricSub as React.CSSProperties}>esperando</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#3B82F6')}>
          <p style={S.metricLabel as React.CSSProperties}>Preparando</p>
          <p style={S.metricValue as React.CSSProperties}>{preparing}</p>
          <p style={S.metricSub as React.CSSProperties}>en cocina</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#FF6B2B')}>
          <p style={S.metricLabel as React.CSSProperties}>En reparto</p>
          <p style={S.metricValue as React.CSSProperties}>{delivering}</p>
          <p style={S.metricSub as React.CSSProperties}>en camino</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#22C55E')}>
          <p style={S.metricLabel as React.CSSProperties}>Entregados</p>
          <p style={S.metricValue as React.CSSProperties}>{delivered}</p>
          <p style={S.metricSub as React.CSSProperties}>completados</p>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={S.metricLabel as React.CSSProperties}>Facturación</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B2B', margin: 0 }}>{formatCurrency(todaySales)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={S.metricLabel as React.CSSProperties}>Ticket medio</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#F1F0ED', margin: 0 }}>{formatCurrency(avgTicket)}</p>
          </div>
        </div>
      </div>

      <div style={S.card as React.CSSProperties}>
        <p style={S.sectionTitle as React.CSSProperties}>Ventas esta semana</p>
        <div style={S.barChart as React.CSSProperties}>
          {salesByDay.map((entry, index) => (
            <div key={entry.day} style={S.barCol as React.CSSProperties}>
              <div style={(S.bar as (value: number, isLast: boolean) => React.CSSProperties)((entry.total / maxSales) * 100, index === salesByDay.length - 1)} />
              <span style={S.barLabel as React.CSSProperties}>{entry.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card as React.CSSProperties}>
        <p style={S.sectionTitle as React.CSSProperties}>Hora pico</p>
        {orders
          .filter((o) => o.status === 'delivered')
          .slice(0, 5)
          .map((order) => (
            <div key={order.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#888' }}>{new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F1F0ED' }}>{order.items.length} productos</span>
              </div>
              <div style={(S.progressBar as (pct?: number) => React.CSSProperties)()}>
                <div style={(S.progressFill as (pct: number) => React.CSSProperties)(60)} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
