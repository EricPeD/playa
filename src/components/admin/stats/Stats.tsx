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
    <div style={S.section}>
      <div style={S.filterRow}>
        {(['hoy', 'semana', 'mes'] as const).map((option) => (
          <button
            key={option}
            style={S.filterChip(period === option)}
            onClick={() => onPeriodChange(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div style={S.metricGrid}>
        <div style={S.metricCard('#FF6B2B')}>
          <p style={S.metricLabel}>Ventas</p>
          <p style={S.metricValue}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(summary.total)}</p>
        </div>
        <div style={S.metricCard('#22C55E')}>
          <p style={S.metricLabel}>Pedidos</p>
          <p style={S.metricValue}>{summary.orders}</p>
        </div>
        <div style={S.metricCard('#3B82F6')}>
          <p style={S.metricLabel}>Ticket medio</p>
          <p style={S.metricValue}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(summary.avgTicket)}</p>
        </div>
        <div style={S.metricCard('#8B5CF6')}>
          <p style={S.metricLabel}>Tiempo medio de entrega</p>
          <p style={S.metricValue}>{summary.avgDeliveryMinutes > 0 ? `${Math.round(summary.avgDeliveryMinutes)} min` : 'N/A'}</p>
          <p style={S.metricSub}>Desde pedido hasta entrega</p>
        </div>
      </div>

      <div style={S.metricGrid}>
        <div style={S.metricCard('#F59E0B')}>
          <p style={S.metricLabel}>Pendiente → Preparando</p>
          <p style={S.metricValue}>{summary.pendingToPreparingMinutes !== null ? `${summary.pendingToPreparingMinutes} min` : 'N/A'}</p>
        </div>
        <div style={S.metricCard('#3B82F6')}>
          <p style={S.metricLabel}>Preparando → En reparto</p>
          <p style={S.metricValue}>{summary.preparingToDeliveringMinutes !== null ? `${summary.preparingToDeliveringMinutes} min` : 'N/A'}</p>
        </div>
        <div style={S.metricCard('#22C55E')}>
          <p style={S.metricLabel}>Reparto → Entregado</p>
          <p style={S.metricValue}>{summary.deliveringToDeliveredMinutes !== null ? `${summary.deliveringToDeliveredMinutes} min` : 'N/A'}</p>
        </div>
      </div>

      <PaymentBreakdownComponent breakdown={paymentBreakdown} />
      <WeekChart salesByDay={salesByDay} />
      <PeakHours hourlyPeak={hourlyPeak} />

      <div style={S.card}>
        <p style={S.sectionTitle}>{PRODUCTS_TITLE}</p>
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
