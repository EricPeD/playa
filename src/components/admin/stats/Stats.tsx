import type { SalesByDay, PaymentBreakdown, HourlyPeak, SummaryMetrics } from '@/hooks/useStats';
import S from '@/components/admin/styles';
import PaymentBreakdownComponent from './PaymentBreakdown';
import WeekChart from './WeekChart';
import PeakHours from './PeakHours';

const PRODUCTS_TITLE = 'Top productos';

type StatsProps = {
  period: 'hoy' | 'semana' | 'mes';
  onPeriodChange: (period: 'hoy' | 'semana' | 'mes') => void;
  salesByDay: SalesByDay[];
  paymentBreakdown: PaymentBreakdown[];
  hourlyPeak: HourlyPeak[];
  summary: SummaryMetrics;
};

export default function Stats({ period, onPeriodChange, salesByDay, paymentBreakdown, hourlyPeak, summary }: StatsProps) {
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

      <div style={S.card as React.CSSProperties}>
        <p style={S.sectionTitle as React.CSSProperties}>{PRODUCTS_TITLE}</p>
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
