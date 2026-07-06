import S from '@/components/admin/styles';

type OrderFiltersProps = {
  filter: string;
  counts: Record<string, number>;
  onChange: (filter: string) => void;
};

const FILTERS = [
  { key: 'all', label: 'Todo' },
  { key: 'pending', label: 'Pendiente' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'delivering', label: 'Reparto' },
  { key: 'delivered', label: 'Entregado' },
];

export default function OrderFilters({ filter, counts, onChange }: OrderFiltersProps) {
  return (
    <div style={S.filterRow as React.CSSProperties}>
      {FILTERS.map((item) => (
        <button
          key={item.key}
          style={(S.filterChip as (active: boolean) => React.CSSProperties)(filter === item.key)}
          onClick={() => onChange(item.key)}
        >
          {item.label} {item.key === 'all' ? `(${Object.values(counts).reduce((sum, value) => sum + value, 0)})` : `(${counts[item.key] ?? 0})`}
        </button>
      ))}
    </div>
  );
}
