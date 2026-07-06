import type { SalesByDay, PaymentBreakdown, HourlyPeak, SummaryMetrics, StatusBreakdown, BeachRevenue } from '@/hooks/useStats';
import { formatCurrency } from '@/utils/format';
import S from '@/components/admin/styles';
import PaymentBreakdownComponent from './PaymentBreakdown';
import WeekChart from './WeekChart';
import PeakHours from './PeakHours';

const PRODUCTS_TITLE = 'Top productos';
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  delivering: 'En reparto',
  delivered: 'Entregado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

type StatsProps = {
  period: 'hoy' | 'semana' | 'mes';
  onPeriodChange: (period: 'hoy' | 'semana' | 'mes') => void;
  salesByDay: SalesByDay[];
  paymentBreakdown: PaymentBreakdown[];
  hourlyPeak: HourlyPeak[];
  statusBreakdown: StatusBreakdown[];
  beachRevenue: BeachRevenue[];
  summary: SummaryMetrics;
};

export default function Stats({ period, onPeriodChange, salesByDay, paymentBreakdown, hourlyPeak, statusBreakdown, beachRevenue, summary }: StatsProps) {
  return (
    <div style={S.section as React.CSSProperties}>
      <div style={S.filterRow as React.CSSProperties}>
        {(['hoy', 'semana', 'mes'] as const).map((option) => (
          <button
            key={option}
            style={(S.filterChip as (active: boolean) => React.CSSProperties)(period === option)}
            onClick={() => onPeriodChange(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div style={S.metricGrid as React.CSSProperties}>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#FF6B2B')}>
          <p style={S.metricLabel as React.CSSProperties}>Ventas</p>
          <p style={S.metricValue as React.CSSProperties}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(summary.total)}</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#22C55E')}>
          <p style={S.metricLabel as React.CSSProperties}>Pedidos</p>
          <p style={S.metricValue as React.CSSProperties}>{summary.orders}</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#3B82F6')}>
          <p style={S.metricLabel as React.CSSProperties}>Ticket medio</p>
          <p style={S.metricValue as React.CSSProperties}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(summary.avgTicket)}</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#8B5CF6')}>
          <p style={S.metricLabel as React.CSSProperties}>Tiempo medio de entrega</p>
          <p style={S.metricValue as React.CSSProperties}>{summary.avgDeliveryMinutes > 0 ? `${Math.round(summary.avgDeliveryMinutes)} min` : 'N/A'}</p>
          <p style={S.metricSub as React.CSSProperties}>Desde pedido hasta entrega</p>
        </div>
      </div>

      <div style={S.metricGrid as React.CSSProperties}>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#F59E0B')}>
          <p style={S.metricLabel as React.CSSProperties}>Pendiente → Preparando</p>
          <p style={S.metricValue as React.CSSProperties}>{summary.pendingToPreparingMinutes !== null ? `${summary.pendingToPreparingMinutes} min` : 'N/A'}</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#3B82F6')}>
          <p style={S.metricLabel as React.CSSProperties}>Preparando → En reparto</p>
          <p style={S.metricValue as React.CSSProperties}>{summary.preparingToDeliveringMinutes !== null ? `${summary.preparingToDeliveringMinutes} min` : 'N/A'}</p>
        </div>
        <div style={(S.metricCard as (accent: string) => React.CSSProperties)('#22C55E')}>
          <p style={S.metricLabel as React.CSSProperties}>Reparto → Entregado</p>
          <p style={S.metricValue as React.CSSProperties}>{summary.deliveringToDeliveredMinutes !== null ? `${summary.deliveringToDeliveredMinutes} min` : 'N/A'}</p>
        </div>
      </div>

      <PaymentBreakdownComponent breakdown={paymentBreakdown} />
      <WeekChart salesByDay={salesByDay} />
      <PeakHours hourlyPeak={hourlyPeak} />

<<<<<<< HEAD
      <div style={S.card as React.CSSProperties}>
        <p style={S.sectionTitle as React.CSSProperties}>{PRODUCTS_TITLE}</p>
=======
      <div style={S.card}>
        <p style={S.sectionTitle}>Pedidos por estado</p>
        {statusBreakdown.length === 0 ? (
          <p style={{ color: '#888', marginTop: 6 }}>No hay datos de estados disponibles.</p>
        ) : (
          statusBreakdown.map((item, index) => {
            const total = Math.max(1, statusBreakdown.reduce((sum, entry) => sum + entry.count, 0));
            return (
              <div key={`${item.status}-${index}`} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#CCC' }}>{STATUS_LABELS[item.status] ?? item.status}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FF6B2B' }}>{item.count} pedidos</span>
                </div>
                <div style={S.progressBar()}>
                  <div style={{ ...S.progressFill((item.count / total) * 100), width: `${(item.count / total) * 100}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Ingresos por playa</p>
        {beachRevenue.length === 0 ? (
          <p style={{ color: '#888', marginTop: 6 }}>No hay datos de ubicación disponibles.</p>
        ) : (
          beachRevenue.map((item, index) => (
            <div key={`${item.beach_location}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < beachRevenue.length - 1 ? '1px solid #222' : 'none' }}>
              <span style={{ color: '#F1F0ED' }}>{item.beach_location}</span>
              <span style={{ color: '#FF6B2B', fontWeight: 700 }}>{formatCurrency(item.total)}</span>
            </div>
          ))
        )}
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>{PRODUCTS_TITLE}</p>
>>>>>>> 527ddd70ff713fb1a0e94f3176226b1b72c645e3
        {summary.topProducts.length === 0 ? (
          <p style={{ color: '#888', marginTop: 6 }}>No hay datos de productos vendidos.</p>
        ) : (
          summary.topProducts.map((product, index) => (
            <div key={`${product.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < summary.topProducts.length - 1 ? '1px solid #222' : 'none' }}>
              <span style={{ color: '#F1F0ED' }}>{index + 1}. {product.name}</span>
              <span style={{ color: '#FF6B2B' }}>{product.qty}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
