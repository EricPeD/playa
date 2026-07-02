import type { OrderWithDetails } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/format';
import { elapsed } from '@/utils/format';
import { STATUS_CONFIG } from '@/utils/statusConfig';
import { icons } from '@/components/admin/icons';
import S from '@/components/admin/styles';

type OperatorProps = {
  orders: OrderWithDetails[];
  onAdvance: (orderId: number, newStatus: string) => Promise<boolean>;
};

export default function Operator({ orders, onAdvance }: OperatorProps) {
  const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing');

  if (activeOrders.length === 0) {
    return (
      <div style={{ ...S.section, paddingTop: 48 }}>
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>🏖️</div>
          <p style={S.emptyTitle}>Sin pedidos activos</p>
          <p style={S.emptyText}>Cuando lleguen pedidos aparecerán aquí para gestionarlos rápidamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.section}>
      <div style={{
        background: 'rgba(255,107,43,0.08)',
        border: '1px solid rgba(255,107,43,0.2)',
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 16,
        fontSize: 13,
        color: '#FF6B2B',
        fontWeight: 600,
      }}>
        ⚡ {activeOrders.length} pedido{activeOrders.length > 1 ? 's' : ''} activo{activeOrders.length > 1 ? 's' : ''}
      </div>

      {activeOrders.map((order) => {
        const cfg = STATUS_CONFIG[order.status];
        return (
          <div key={order.id} style={{ ...S.operatorCard, borderLeft: `5px solid ${cfg.color}` }}>
            <p style={S.opOrderId}>PEDIDO #{order.id} · {elapsed(order.created_at)}</p>
            <p style={S.opName}>{order.customer_name}</p>
            <div style={S.opLocation}>
              {icons.location}
              <span>{order.beach_location ?? 'Sin ubicación'}</span>
            </div>

            {order.notes && (
              <div style={{ ...S.notesBox, marginBottom: 12 }}>
                {icons.warn}
                <span>{order.notes}</span>
              </div>
            )}

            <div style={S.opItems}>
              {order.items.map((item) => (
                <div key={item.id} style={S.opItem}>
                  <span><strong style={{ color: '#FF6B2B' }}>{item.qty}×</strong> {item.name}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(item.qty * item.price)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={S.opTotal}>{formatCurrency(order.total)}</span>
              <span style={S.payBadge(order.paid)}>
                {order.paid ? 'Pagado' : 'Sin cobrar'} · {order.payment_method ?? 'N/A'}
              </span>
            </div>

            {cfg.next && (
              <button
                style={S.opBtn(STATUS_CONFIG[cfg.next].color)}
                onClick={() => onAdvance(order.id, cfg.next)}
              >
                {cfg.nextLabel} →
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
