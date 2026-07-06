import S from '@/components/admin/styles';
import type { HourlyPeak } from '@/hooks/useStats';

type PeakHoursProps = {
  hourlyPeak: HourlyPeak[];
};

export default function PeakHours({ hourlyPeak }: PeakHoursProps) {
  const maxCount = Math.max(1, ...hourlyPeak.map((item) => item.count));

  return (
    <div style={S.card as React.CSSProperties}>
      <p style={S.sectionTitle as React.CSSProperties}>Horas pico</p>
      {hourlyPeak.map((item) => (
        <div key={item.hour} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#888' }}>{item.hour}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F1F0ED' }}>{item.count} pedidos</span>
          </div>
          <div style={(S.progressBar as (pct?: number) => React.CSSProperties)()}>
            <div style={{ ...(S.progressFill as (pct: number) => React.CSSProperties)((item.count / maxCount) * 100), width: `${(item.count / maxCount) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
