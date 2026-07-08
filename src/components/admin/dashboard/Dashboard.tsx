import type { HourlyPeak, SalesByDay } from '@/hooks/useStats';
import type { OrderWithDetails } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/format';
import S from '@/components/admin/styles';

type DashboardProps = {
  orders: OrderWithDetails[];
  stats: { total: number; orders: number; avgTicket: number; profit: number };
  salesByDay: SalesByDay[];
  hourlyPeak: HourlyPeak[];
  publicBlocked: boolean;
  onToggleSiteBlocked: (nextValue: boolean) => Promise<boolean> | boolean;
};

export default function Dashboard({ orders, stats, salesByDay, hourlyPeak, publicBlocked, onToggleSiteBlocked }: DashboardProps) {
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
      <div style={{ ...S.card, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <p style={S.sectionTitle}>Estado del sitio</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8B857A' }}>
              {publicBlocked ? 'El sitio está cerrado para clientes.' : 'El sitio está abierto para clientes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onToggleSiteBlocked(!publicBlocked)}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '8px 14px',
              fontWeight: 700,
              cursor: 'pointer',
              color: publicBlocked ? '#fff' : '#1A1A1A',
              background: publicBlocked ? '#E65100' : '#F3F1EB',
            }}
          >
            {publicBlocked ? 'Cerrar sitio' : 'Abrir sitio'}
          </button>
        </div>
      </div>

      <p style={S.sectionTitle}>Resumen del día</p>
      <div style={S.metricGrid}>
        <div style={S.metricCard('#F59E0B')}>
          <p style={S.metricLabel}>Pendientes</p>
          <p style={S.metricValue}>{pending}</p>
          <p style={S.metricSub}>esperando</p>
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
