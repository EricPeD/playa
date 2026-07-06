import { formatCurrency } from '@/utils/format';
import type { ProductWithCategory } from '@/hooks/useProducts';
import S from '@/components/admin/styles';

type ProductRowProps = {
  product: ProductWithCategory;
  onToggleActive: (id: number, active: boolean) => Promise<boolean>;
  onAdjustStock: (id: number, delta: number) => Promise<boolean>;
  isLast: boolean;
};

export default function ProductRow({ product, onToggleActive, onAdjustStock, isLast }: ProductRowProps) {
  const emoji = product.category_emoji ?? '📦';
  const stock = product.stock ?? 0;

  return (
    <div style={{ ...S.productRow, borderBottom: isLast ? 'none' : '1px solid #222' }}>
      <div style={S.productEmoji}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={S.productName}>{product.name}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', color: '#666', fontSize: 12 }}>
          <span>{product.brand ?? '—'}</span>
          <span>·</span>
          <span>{product.category_name}</span>
          <span>·</span>
          <span>{formatCurrency(product.price)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <span style={S.stockBadge(stock)}>{stock} uds</span>
          <button
            style={{ ...S.btnSecondary, padding: '6px 10px', fontSize: 13, borderRadius: 8 }}
            onClick={() => onAdjustStock(product.id, -1)}
          >
            −1
          </button>
          <button
            style={{ ...S.btnSecondary, padding: '6px 10px', fontSize: 13, borderRadius: 8 }}
            onClick={() => onAdjustStock(product.id, 10)}
          >
            +10
          </button>
        </div>
      </div>
      <button
        style={S.toggleSwitch(product.is_active)}
        onClick={() => onToggleActive(product.id, !product.is_active)}
        aria-label={product.is_active ? 'Desactivar producto' : 'Activar producto'}
      >
        <div style={S.toggleKnob(product.is_active)} />
      </button>
    </div>
  );
}
