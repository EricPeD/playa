import { formatCurrency, elapsed } from '@/utils/format';
import { STATUS_CONFIG, getStatusConfig } from '@/utils/statusConfig';
import type { OrderWithDetails } from '@/hooks/useOrders';
import { icons } from '@/components/admin/icons';
import S from '@/components/admin/styles';

type OrderDetailProps = {
  order: OrderWithDetails;
  onClose: () => void;
  onAdvance: (orderId: number, newStatus: string) => Promise<boolean>;
  onCancel: (orderId: number) => Promise<boolean>;
};

export default function OrderDetail({ order, onClose, onAdvance, onCancel }: OrderDetailProps) {
  const cfg = getStatusConfig(order.status);
  const nextCfg = cfg.next ? getStatusConfig(cfg.next) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', zIndex: 200, overflowY: 'auto', maxWidth: '430px', margin: '0 auto' }}>
      <div style={S.topbar}>
        <div>
          <p style={S.topbarTitle}>Pedido #{order.id}</p>
          <p style={S.topbarSub}>{order.customer_name}</p>
        </div>
        <button onClick={onClose} style={{ ...S.btnSecondary, padding: '8px 12px' }}>
          {icons.close}
        </button>
      </div>

      <div style={S.section}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <span style={S.statusBadge(order.status)}>{cfg.label}</span>
          <span style={S.timeBadge}>{elapsed(order.created_at)} atrás</span>
          <span style={{ ...S.payBadge(order.paid), marginLeft: 'auto' }}>
            {order.paid ? 'Pagado' : 'Pendiente'} · {order.payment_method ?? 'N/A'}
          </span>
        </div>

        <div style={S.card}>
          <p style={S.sectionTitle}>Localización</p>
          <div style={S.locationRow}>
            {icons.location}
            <span>{order.beach_location ?? 'Sin ubicación'}</span>
          </div>
        </div>

        {order.notes && (
          <div style={S.notesBox}>
            {icons.warn}
            <span>{order.notes}</span>
          </div>
        )}

        <div style={S.card}>
          <p style={S.sectionTitle}>Productos</p>
          {order.items.map((item) => (
            <div key={item.id} style={S.itemRow}>
              <span>{item.qty}× {item.name}</span>
              <span style={{ color: '#F1F0ED', fontWeight: 600 }}>{formatCurrency(item.qty * item.price)}</span>
            </div>
          ))}
          <div style={S.divider} />
          <div style={S.totalRow}>
            <span style={{ fontSize: 13, color: '#666' }}>Total</span>
            <span style={S.totalAmount}>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style={S.card}>
          <p style={S.sectionTitle}>Cliente</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#F1F0ED', margin: '0 0 8px' }}>{order.customer_name}</p>
          <a href={`tel:${order.customer_phone ?? ''}`} style={{ textDecoration: 'none' }}>
            <div style={{ ...S.btnSecondary, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', borderRadius: 10 }}>
              {icons.phone}
              <span style={{ color: '#F1F0ED', fontWeight: 600 }}>{order.customer_phone ?? 'Sin teléfono'}</span>
            </div>
          </a>
        </div>

        {cfg.next && (
          <button
            onClick={() => onAdvance(order.id, cfg.next)}
            style={S.opBtn(nextCfg?.color ?? '#6B7280')}
          >
            → {cfg.nextLabel}
          </button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            onClick={() => onCancel(order.id)}
            style={{ ...S.btnDanger, width: '100%', marginTop: 8, borderRadius: 12 }}
          >
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  );
}
