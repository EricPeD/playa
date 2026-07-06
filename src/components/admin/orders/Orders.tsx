import { useMemo, useState } from 'react';
import type { OrderWithDetails } from '@/hooks/useOrders';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import OrderCard from '@/components/admin/orders/OrderCard';
import OrderDetail from '@/components/admin/orders/OrderDetail';
import S from '@/components/admin/styles';

type OrdersProps = {
  orders: OrderWithDetails[];
  onAdvance: (orderId: number, newStatus: string) => Promise<boolean>;
  onCancel: (orderId: number) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
};

export default function Orders({ orders, onAdvance, onCancel }: OrdersProps) {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  const counts = useMemo(() => ({
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    delivering: orders.filter((o) => o.status === 'delivering').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }), [orders]);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [filter, orders]);

  return (
    <div style={S.section as React.CSSProperties}>
      <OrderFilters filter={filter} counts={counts} onChange={setFilter} />

      {filtered.length === 0 && (
        <div style={S.emptyState as React.CSSProperties}>
          <div style={S.emptyIcon as React.CSSProperties}>📭</div>
          <p style={S.emptyTitle as React.CSSProperties}>Sin pedidos</p>
          <p style={S.emptyText as React.CSSProperties}>No hay pedidos en este estado.</p>
        </div>
      )}

      {filtered.map((order) => (
        <OrderCard key={order.id} order={order} onAdvance={onAdvance} onCancel={onCancel} onOpen={setSelectedOrder} />
      ))}

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAdvance={onAdvance}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
