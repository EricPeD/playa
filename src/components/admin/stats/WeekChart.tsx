import S from '@/components/admin/styles';
import type { SalesByDay } from '@/hooks/useStats';

type WeekChartProps = {
  salesByDay: SalesByDay[];
};

export default function WeekChart({ salesByDay }: WeekChartProps) {
  const maxSales = Math.max(1, ...salesByDay.map((item) => item.total));

  return (
    <div style={S.card as React.CSSProperties}>
      <p style={S.sectionTitle as React.CSSProperties}>Ventas por día (semana)</p>
      <div style={S.barChart as React.CSSProperties}>
        {salesByDay.map((entry) => (
          <div key={entry.day} style={S.barCol as React.CSSProperties}>
            <div style={(S.bar as (pct: number, isToday: boolean) => React.CSSProperties)((entry.total / maxSales) * 100, false)} />
            <span style={S.barLabel as React.CSSProperties}>{entry.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
