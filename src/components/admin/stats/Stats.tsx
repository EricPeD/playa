import type { SalesByDay, PaymentBreakdown, HourlyPeak } from '@/hooks/useStats';
import S from '@/components/admin/styles';
import PaymentBreakdownComponent from './PaymentBreakdown';
import WeekChart from './WeekChart';
import PeakHours from './PeakHours';

type StatsProps = {
  period: 'hoy' | 'semana' | 'mes';
  onPeriodChange: (period: 'hoy' | 'semana' | 'mes') => void;
  salesByDay: SalesByDay[];
  paymentBreakdown: PaymentBreakdown[];
  hourlyPeak: HourlyPeak[];
  summary: {
    total: number;
    orders: number;
    avgTicket: number;
    profit: number;
  };
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
          <p style={S.metricLabel}>Beneficio</p>
          <p style={S.metricValue}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(summary.profit)}</p>
          <p style={S.metricSub}>Estimado ~28%</p>
        </div>
      </div>

      <PaymentBreakdownComponent breakdown={paymentBreakdown} />
      <WeekChart salesByDay={salesByDay} />
      <PeakHours hourlyPeak={hourlyPeak} />
    </div>
  );
}
