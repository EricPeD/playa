import S from '@/components/admin/styles';
import type { PaymentBreakdown } from '@/hooks/useStats';

type Props = {
  breakdown: PaymentBreakdown[];
};

export default function PaymentBreakdown({ breakdown }: Props) {
  const total = breakdown.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div style={S.card as React.CSSProperties}>
      <p style={S.sectionTitle as React.CSSProperties}>Métodos de pago</p>
      {breakdown.map((item) => (
        <div key={item.method} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#CCC' }}>{item.method}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FF6B2B' }}>{item.count} pedidos</span>
          </div>
          <div style={(S.progressBar as (pct?: number) => React.CSSProperties)()}>
            <div style={{ ...(S.progressFill as (pct: number) => React.CSSProperties)((item.count / total) * 100), width: `${(item.count / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
