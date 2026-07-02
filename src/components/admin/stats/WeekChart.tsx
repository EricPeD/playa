import S from '@/components/admin/styles';
import type { SalesByDay } from '@/hooks/useStats';

type WeekChartProps = {
  salesByDay: SalesByDay[];
};

export default function WeekChart({ salesByDay }: WeekChartProps) {
  const maxSales = Math.max(1, ...salesByDay.map((item) => item.total));

  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Ventas por día (semana)</p>
      <div style={S.barChart}>
        {salesByDay.map((entry) => (
          <div key={entry.day} style={S.barCol}>
            <div style={S.bar((entry.total / maxSales) * 100, false)} />
            <span style={S.barLabel}>{entry.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
