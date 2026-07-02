export const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    next: 'preparing',
    nextLabel: 'Preparar',
  },
  preparing: {
    label: 'Preparando',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
    next: 'delivering',
    nextLabel: 'En reparto',
  },
  delivering: {
    label: 'En reparto',
    color: '#FF6B2B',
    bg: 'rgba(255,107,43,0.15)',
    next: 'delivered',
    nextLabel: 'Entregado',
  },
  delivered: {
    label: 'Entregado',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    next: null,
    nextLabel: null,
  },
  cancelled: {
    label: 'Cancelado',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
    next: null,
    nextLabel: null,
  },
} as const;

export type OrderStatus = keyof typeof STATUS_CONFIG;
