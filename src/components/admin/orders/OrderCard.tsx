import { formatCurrency, elapsed } from '@/utils/format';
import { STATUS_CONFIG, getStatusConfig } from '@/utils/statusConfig';
import type { OrderWithDetails } from '@/hooks/useOrders';
import { icons } from '@/components/admin/icons';
import S from '@/components/admin/styles';

type OrderCardProps = {
  order: OrderWithDetails;
  onAdvance: (orderId: number, newStatus: string) => Promise<boolean>;
  onCancel: (orderId: number) => Promise<boolean>;
  onOpen: (order: OrderWithDetails) => void;
};

export default function OrderCard({ order, onAdvance, onCancel, onOpen }: OrderCardProps) {
  const cfg = getStatusConfig(order.status);
  const nextCfg = cfg.next ? getStatusConfig(cfg.next) : null;

  return (
    <div style={S.orderCard(order.status)}>
      <div style={S.orderCardInner}>
        <div style={S.orderHead}>
          <div>
            <p style={S.orderId}>#{order.id}</p>
            <p style={S.orderName}>{order.customer_name}</p>
            <span style={S.timeBadge}>{elapsed(order.created_at)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={S.statusBadge(order.status)}>{cfg.label}</span>
            <p style={{ ...S.totalAmount, fontSize: '16px', marginTop: 6 }}>{formatCurrency(order.total)}</p>
          </div>
        </div>

        {order.notes && (
          <div style={S.notesBox}>
            {icons.warn}
            <span style={{ fontSize: 11 }}>{order.notes}</span>
          </div>
        )}

        <div style={S.locationRow}>
          {icons.location}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {order.beach_location ?? 'Sin ubicación'}
          </span>
        </div>

        <div style={S.divider} />

        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          {order.items.map((it, index) => (
            <span key={it.id || `${order.id}-${index}`}>{index > 0 ? ' · ' : ''}{it.qty}× {it.name}</span>
          ))}
        </div>

        <div style={S.actionRow}>
          {cfg.next && (
            <button
              style={S.btnPrimary(nextCfg?.color ?? '#6B7280')}
              onClick={() => onAdvance(order.id, cfg.next)}
            >
              {cfg.nextLabel}
            </button>
          )}
          <button style={S.btnSecondary} onClick={() => onOpen(order)}>
            {icons.eye}
          </button>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button style={S.btnDanger} onClick={() => onCancel(order.id)}>
              {icons.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
