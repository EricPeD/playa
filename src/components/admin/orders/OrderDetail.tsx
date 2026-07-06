'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { formatCurrency, elapsed } from '@/utils/format';
import { getStatusConfig } from '@/utils/statusConfig';
import type { OrderWithDetails } from '@/hooks/useOrders';
import { geocodeLocation } from '@/utils/geocode';
import { icons } from '@/components/admin/icons';
import S from '@/components/admin/styles';

type OrderDetailProps = {
  order: OrderWithDetails;
  onClose: () => void;
  onAdvance: (orderId: number, newStatus: string) => Promise<boolean>;
  onCancel: (orderId: number) => Promise<boolean>;
};

const OrderMap = dynamic(() => import('./OrderMap'), { ssr: false });

export default function OrderDetail({ order, onClose, onAdvance, onCancel }: OrderDetailProps) {
  const [geoPoint, setGeoPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const cfg = getStatusConfig(order.status);
  const nextCfg = cfg.next ? getStatusConfig(cfg.next) : null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setGeoError(null);
      setGeoPoint(null);
      if (!order.beach_location) return;
      setIsGeocoding(true);
      const result = await geocodeLocation(order.beach_location);
      if (cancelled) return;
      setIsGeocoding(false);
      if (!result) {
        setGeoError('No se pudo geocodificar la ubicación.');
        return;
      }
      setGeoPoint(result);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [order.beach_location]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', zIndex: 200, overflowY: 'auto', maxWidth: '430px', margin: '0 auto' }}>
      <div style={S.topbar as React.CSSProperties}>
        <div>
          <p style={S.topbarTitle as React.CSSProperties}>Pedido #{order.id}</p>
          <p style={S.topbarSub as React.CSSProperties}>{order.customer_name}</p>
        </div>
        <button onClick={onClose} style={{ ...S.btnSecondary, padding: '8px 12px' }}>
          {icons.close}
        </button>
      </div>

      <div style={S.section as React.CSSProperties}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <span style={(S.statusBadge as (status: string) => React.CSSProperties)(order.status)}>{cfg.label}</span>
          <span style={S.timeBadge as React.CSSProperties}>{elapsed(order.created_at)} atrás</span>
          <span style={{ ...(S.payBadge as (paid: boolean) => React.CSSProperties)(order.paid), marginLeft: 'auto' }}>
            {order.paid ? 'Pagado' : 'Pendiente'} · {order.payment_method ?? 'N/A'}
          </span>
        </div>

        <div style={S.card as React.CSSProperties}>
          <p style={S.sectionTitle as React.CSSProperties}>Localización</p>
          <div style={S.locationRow as React.CSSProperties}>
            {icons.location}
            <span>{order.beach_location ?? 'Sin ubicación'}</span>
          </div>
          {order.beach_location && geoPoint && (
            <OrderMap lat={geoPoint.lat} lng={geoPoint.lng} label={order.beach_location} />
          )}
          {order.beach_location && isGeocoding && (
            <p style={{ color: '#AAA', fontSize: 12, marginTop: 10 }}>Cargando mapa...</p>
          )}
          {order.beach_location && !isGeocoding && geoError && (
            <p style={{ color: '#EF4444', fontSize: 12, marginTop: 10 }}>{geoError}</p>
          )}
        </div>

        {order.notes && (
          <div style={S.notesBox as React.CSSProperties}>
            {icons.warn}
            <span>{order.notes}</span>
          </div>
        )}

        <div style={S.card as React.CSSProperties}>
          <p style={S.sectionTitle as React.CSSProperties}>Productos</p>
          {order.items.map((item) => (
            <div key={item.id} style={S.itemRow as React.CSSProperties}>
              <span>{item.qty}× {item.name}</span>
              <span style={{ color: '#F1F0ED', fontWeight: 600 }}>{formatCurrency(item.qty * item.price)}</span>
            </div>
          ))}
          <div style={S.divider as React.CSSProperties} />
          <div style={S.totalRow as React.CSSProperties}>
            <span style={{ fontSize: 13, color: '#666' }}>Total</span>
            <span style={S.totalAmount as React.CSSProperties}>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style={S.card as React.CSSProperties}>
          <p style={S.sectionTitle as React.CSSProperties}>Cliente</p>
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
            style={(S.opBtn as (color: string) => React.CSSProperties)(nextCfg?.color ?? '#6B7280')}
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
