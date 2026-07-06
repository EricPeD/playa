import type { CSSProperties } from 'react';
import S from '@/components/admin/styles';

type TopbarProps = {
  title: string;
  pendingCount: number;
};

export default function Topbar({ title, pendingCount }: TopbarProps) {
  return (
    <header style={S.topbar as CSSProperties}>
      <div>
        <p style={S.topbarTitle as CSSProperties}>🏖️ {title}</p>
        <p style={S.topbarSub as CSSProperties}>Chiringuito Beach Delivery</p>
      </div>
      <div style={S.liveChip as CSSProperties}>
        <div style={S.liveDot as CSSProperties} />
        <span>LIVE</span>
      </div>
    </header>
  );
}
