'use client';

import { useState, useEffect } from 'react';

// ─── Datos mock ──────────────────────────────────────────────────────────────

const INITIAL_ORDERS = [
  {
    id: 153, created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    status: 'pending', customer: 'Juan Martínez', phone: '+34 611 234 567',
    beach_location: 'Playa Badalona, sector 3, sombrilla azul junto al chiringuito',
    notes: 'Sin prisa, estamos aquí hasta las 7',
    items: [{ name: 'Bocadillo Jamón Serrano', qty: 2, price: 4.50 }, { name: 'Coca-Cola lata', qty: 3, price: 2.50 }],
    total: 16.50, payment_method: 'bizum', paid: true,
  },
  {
    id: 154, created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    status: 'pending', customer: 'Laura Sánchez', phone: '+34 622 345 678',
    beach_location: 'Playa Badalona, sector 5, toalla rosa, al lado del socorrista',
    notes: '',
    items: [{ name: 'Magnum Classic', qty: 1, price: 3.00 }, { name: 'Agua 50cl', qty: 2, price: 1.50 }],
    total: 6.00, payment_method: 'card', paid: true,
  },
  {
    id: 155, created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'preparing', customer: 'Marc Puig', phone: '+34 633 456 789',
    beach_location: 'Playa Badalona, sector 1, hamaca de pago número 12',
    notes: 'Alérgico al gluten',
    items: [{ name: 'Pack Cervezas 🍺', qty: 1, price: 10.00 }, { name: 'Pringles Original', qty: 2, price: 3.00 }],
    total: 16.00, payment_method: 'cash', paid: false,
  },
  {
    id: 156, created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    status: 'delivering', customer: 'Ana García', phone: '+34 644 567 890',
    beach_location: 'Playa Badalona, sector 2, sombrilla amarilla, fila del fondo',
    notes: '',
    items: [{ name: 'Estrella Damm lata', qty: 4, price: 2.80 }, { name: 'Lay\'s Sal', qty: 2, price: 2.50 }],
    total: 16.20, payment_method: 'bizum', paid: true,
  },
  {
    id: 157, created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    status: 'delivered', customer: 'Carlos Ruiz', phone: '+34 655 678 901',
    beach_location: 'Playa Badalona, sector 4, entrada por la calle del bar',
    notes: 'Llamad al llegar',
    items: [{ name: 'Pack Amigos 🍺', qty: 1, price: 18.00 }],
    total: 18.00, payment_method: 'card', paid: true,
  },
  {
    id: 158, created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    status: 'delivered', customer: 'Marta López', phone: '+34 666 789 012',
    beach_location: 'Playa Badalona, sector 3, zona infantil',
    notes: '',
    items: [{ name: 'Pack Niños 🍦', qty: 2, price: 8.00 }, { name: 'Agua 1L', qty: 1, price: 2.00 }],
    total: 18.00, payment_method: 'bizum', paid: true,
  },
];

const PRODUCTS = [
  { id: 1, sku: 'BEB-001', name: 'Coca-Cola lata 330ml', category: 'Bebidas', price: 2.50, stock: 80, active: true },
  { id: 2, sku: 'BEB-014', name: 'Agua 50cl', category: 'Bebidas', price: 1.50, stock: 120, active: true },
  { id: 3, sku: 'BEB-012', name: 'Red Bull lata 250ml', category: 'Bebidas', price: 3.50, stock: 40, active: true },
  { id: 4, sku: 'ALC-001', name: 'Estrella Damm lata 330ml', category: 'Alcohol', price: 2.80, stock: 100, active: true },
  { id: 5, sku: 'ALC-003', name: 'Mahou 5* lata 330ml', category: 'Alcohol', price: 2.80, stock: 80, active: true },
  { id: 6, sku: 'ALC-013', name: 'Mojito lata 330ml', category: 'Alcohol', price: 3.00, stock: 50, active: true },
  { id: 7, sku: 'BOC-001', name: 'Bocadillo Jamón Serrano', category: 'Bocadillos', price: 4.50, stock: 20, active: true },
  { id: 8, sku: 'BOC-009', name: 'Bocadillo Bacon Queso', category: 'Bocadillos', price: 5.00, stock: 10, active: true },
  { id: 9, sku: 'SNK-001', name: 'Lay\'s Sal', category: 'Snacks', price: 2.50, stock: 60, active: true },
  { id: 10, sku: 'SNK-006', name: 'Pringles Original', category: 'Snacks', price: 3.00, stock: 50, active: true },
  { id: 11, sku: 'HEL-001', name: 'Magnum Classic', category: 'Helados', price: 3.00, stock: 40, active: true },
  { id: 12, sku: 'HEL-005', name: 'Calippo Lima', category: 'Helados', price: 2.00, stock: 40, active: true },
  { id: 13, sku: 'HEL-009', name: 'Mini Milk', category: 'Helados', price: 1.50, stock: 50, active: true },
  { id: 14, sku: 'FUM-001', name: 'Marlboro Gold', category: 'Fumadores', price: 5.80, stock: 30, active: true },
  { id: 15, sku: 'PLA-002', name: 'Crema Solar SPF50', category: 'Playa', price: 7.00, stock: 30, active: true },
  { id: 16, sku: 'FAR-010', name: 'Biodramina 4u', category: 'Farmacia', price: 4.00, stock: 20, active: true },
  { id: 17, sku: 'PACK-01', name: 'Pack Cervezas 🍺', category: 'Packs', price: 10.00, stock: 30, active: true },
  { id: 18, sku: 'PACK-02', name: 'Pack Amigos 🍺', category: 'Packs', price: 18.00, stock: 20, active: true },
  { id: 19, sku: 'PACK-09', name: 'Pack Niños 🍦', category: 'Packs', price: 8.00, stock: 20, active: true },
  { id: 20, sku: 'BEB-005', name: 'Aquarius Limón lata', category: 'Bebidas', price: 2.50, stock: 4, active: true },
];

const WEEK_STATS = [
  { day: 'Lun', sales: 312, orders: 18 },
  { day: 'Mar', sales: 445, orders: 26 },
  { day: 'Mié', sales: 389, orders: 22 },
  { day: 'Jue', sales: 521, orders: 30 },
  { day: 'Vie', sales: 678, orders: 39 },
  { day: 'Sáb', sales: 892, orders: 51 },
  { day: 'Hoy', sales: 343, orders: 19 },
];

const TOP_PRODUCTS = [
  { name: 'Estrella Damm lata', units: 89, revenue: 249.20 },
  { name: 'Agua 50cl', units: 76, revenue: 114.00 },
  { name: 'Coca-Cola lata', units: 64, revenue: 160.00 },
  { name: 'Pack Cervezas 🍺', units: 31, revenue: 310.00 },
  { name: 'Bocadillo Jamón', units: 28, revenue: 126.00 },
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  next: 'preparing',  nextLabel: 'Preparar' },
  preparing: { label: 'Preparando', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  next: 'delivering', nextLabel: 'En reparto' },
  delivering:{ label: 'En reparto', color: '#FF6B2B', bg: 'rgba(255,107,43,0.15)',  next: 'delivered',  nextLabel: 'Entregado' },
  delivered: { label: 'Entregado',  color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   next: null,         nextLabel: null },
  cancelled: { label: 'Cancelado',  color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   next: null,         nextLabel: null },
};

function elapsed(isoString) {
  const mins = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatCurrency(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

// ─── Componentes de icono SVG ─────────────────────────────────────────────────

const icons = {
  dashboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  orders: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  operator: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  products: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21.73a2 2 0 0 0 2 0L20 17.73A2 2 0 0 0 21 16z"/>
      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  stats: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
    </svg>
  ),
  location: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  toggle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3" fill="currentColor"/>
    </svg>
  ),
  warn: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),
};

// ─── Estilos globales (inyectados inline como objeto) ─────────────────────────

const S = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#111111',
    color: '#F1F0ED',
    minHeight: '100dvh',
    maxWidth: '430px',
    margin: '0 auto',
    position: 'relative',
    paddingBottom: '80px',
  },
  topbar: {
    background: '#1A1A1A',
    borderBottom: '1px solid #2A2A2A',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  topbarTitle: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#F1F0ED',
    margin: 0,
  },
  topbarSub: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
    marginTop: 1,
  },
  liveChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '20px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#22C55E',
    letterSpacing: '0.3px',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#22C55E',
    animation: 'pulse 2s infinite',
  },
  navBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    background: '#1A1A1A',
    borderTop: '1px solid #2A2A2A',
    display: 'flex',
    padding: '8px 0 12px',
    zIndex: 100,
  },
  navItem: (active) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '4px 0',
    border: 'none',
    background: 'transparent',
    color: active ? '#FF6B2B' : '#555',
    cursor: 'pointer',
    transition: 'color 0.15s',
    fontSize: '10px',
    fontWeight: active ? 600 : 400,
  }),
  section: {
    padding: '16px',
  },
  card: {
    background: '#1E1E1E',
    border: '1px solid #2A2A2A',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '16px',
  },
  metricCard: (accent) => ({
    background: '#1E1E1E',
    border: `1px solid ${accent ? accent + '30' : '#2A2A2A'}`,
    borderRadius: '14px',
    padding: '14px',
    borderLeft: accent ? `3px solid ${accent}` : '1px solid #2A2A2A',
  }),
  metricLabel: {
    fontSize: '11px',
    color: '#666',
    marginBottom: '4px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#F1F0ED',
    lineHeight: 1,
  },
  metricSub: {
    fontSize: '11px',
    color: '#555',
    marginTop: '3px',
  },
  orderCard: (status) => ({
    background: '#1E1E1E',
    border: '1px solid #2A2A2A',
    borderRadius: '14px',
    overflow: 'hidden',
    marginBottom: '10px',
    borderLeft: `4px solid ${STATUS_CONFIG[status]?.color || '#555'}`,
  }),
  orderCardInner: {
    padding: '14px',
  },
  orderHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  orderId: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#FF6B2B',
    lineHeight: 1,
  },
  orderName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#F1F0ED',
    marginTop: '2px',
  },
  statusBadge: (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 9px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    background: STATUS_CONFIG[status]?.bg || '#333',
    color: STATUS_CONFIG[status]?.color || '#aaa',
    whiteSpace: 'nowrap',
  }),
  timeBadge: {
    display: 'inline-block',
    padding: '2px 7px',
    background: '#2A2A2A',
    borderRadius: '20px',
    fontSize: '11px',
    color: '#888',
    marginTop: '4px',
  },
  locationRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-start',
    color: '#888',
    fontSize: '12px',
    marginBottom: '4px',
    lineHeight: 1.4,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#CCC',
    marginBottom: '4px',
  },
  divider: {
    height: 1,
    background: '#2A2A2A',
    margin: '10px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  totalAmount: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#F1F0ED',
  },
  payBadge: (paid) => ({
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    background: paid ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
    color: paid ? '#22C55E' : '#EF4444',
  }),
  actionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  btnPrimary: (color) => ({
    flex: 1,
    padding: '11px',
    borderRadius: '10px',
    border: 'none',
    background: color || '#FF6B2B',
    color: '#fff',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '0.2px',
  }),
  btnSecondary: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #2A2A2A',
    background: 'transparent',
    color: '#888',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '12px',
    marginTop: '4px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterChip: (active) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    border: active ? 'none' : '1px solid #2A2A2A',
    background: active ? '#FF6B2B' : '#1E1E1E',
    color: active ? '#fff' : '#888',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  }),
  productRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  productEmoji: {
    width: 40,
    height: 40,
    borderRadius: '10px',
    background: '#2A2A2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  productName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#F1F0ED',
    marginBottom: '2px',
  },
  productMeta: {
    fontSize: '12px',
    color: '#666',
  },
  stockBadge: (stock) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    background: stock > 10 ? 'rgba(34,197,94,0.1)' : stock > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
    color: stock > 10 ? '#22C55E' : stock > 0 ? '#F59E0B' : '#EF4444',
  }),
  toggleSwitch: (active) => ({
    width: 36,
    height: 20,
    borderRadius: '10px',
    background: active ? '#FF6B2B' : '#333',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s',
    flexShrink: 0,
    border: 'none',
  }),
  toggleKnob: (active) => ({
    position: 'absolute',
    top: 2,
    left: active ? 18 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
  }),
  barChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
    height: '80px',
    marginTop: '8px',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  bar: (pct, isToday) => ({
    width: '100%',
    height: `${pct}%`,
    background: isToday ? '#FF6B2B' : '#2A2A2A',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s',
    minHeight: 4,
  }),
  barLabel: {
    fontSize: '10px',
    color: '#555',
  },
  topProductRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  topProductRank: {
    width: 22,
    height: 22,
    borderRadius: '6px',
    background: '#2A2A2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#666',
    flexShrink: 0,
  },
  progressBar: (pct) => ({
    height: 4,
    borderRadius: 2,
    background: '#2A2A2A',
    marginTop: 4,
    overflow: 'hidden',
  }),
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: '#FF6B2B',
    borderRadius: 2,
  }),
  operatorCard: {
    background: '#1E1E1E',
    border: '1px solid #2A2A2A',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '12px',
  },
  opOrderId: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#FF6B2B',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  opName: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#F1F0ED',
    marginBottom: '8px',
  },
  opLocation: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '5px',
  },
  opItems: {
    background: '#151515',
    borderRadius: '10px',
    padding: '10px 12px',
    marginBottom: '12px',
  },
  opItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#CCC',
    marginBottom: '5px',
  },
  opTotal: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#F1F0ED',
  },
  opBtn: (color) => ({
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: color,
    color: '#fff',
    fontWeight: 800,
    fontSize: '16px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    marginTop: '10px',
  }),
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#444',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '6px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#444',
    lineHeight: 1.6,
  },
  notesBox: {
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '12px',
    color: '#F59E0B',
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: '#151515',
    border: '1px solid #2A2A2A',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#F1F0ED',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
};

// ─── Vista: Dashboard ─────────────────────────────────────────────────────────

function Dashboard({ orders }) {
  const today = orders;
  const pending = today.filter(o => o.status === 'pending').length;
  const preparing = today.filter(o => o.status === 'preparing').length;
  const delivering = today.filter(o => o.status === 'delivering').length;
  const delivered = today.filter(o => o.status === 'delivered').length;
  const todaySales = today.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const avgTicket = delivered > 0 ? todaySales / delivered : 0;
  const maxSales = Math.max(...WEEK_STATS.map(d => d.sales));

  return (
    <div style={S.section}>
      <p style={S.sectionTitle}>Resumen del día</p>

      <div style={S.metricGrid}>
        <div style={S.metricCard('#F59E0B')}>
          <p style={S.metricLabel}>Pendientes</p>
          <p style={S.metricValue}>{pending}</p>
          <p style={S.metricSub}>esperando</p>
        </div>
        <div style={S.metricCard('#3B82F6')}>
          <p style={S.metricLabel}>Preparando</p>
          <p style={S.metricValue}>{preparing}</p>
          <p style={S.metricSub}>en cocina</p>
        </div>
        <div style={S.metricCard('#FF6B2B')}>
          <p style={S.metricLabel}>En reparto</p>
          <p style={S.metricValue}>{delivering}</p>
          <p style={S.metricSub}>en camino</p>
        </div>
        <div style={S.metricCard('#22C55E')}>
          <p style={S.metricLabel}>Entregados</p>
          <p style={S.metricValue}>{delivered}</p>
          <p style={S.metricSub}>completados</p>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={S.metricLabel}>Facturación hoy</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#FF6B2B', margin: 0 }}>{formatCurrency(todaySales)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={S.metricLabel}>Ticket medio</p>
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#F1F0ED', margin: 0 }}>{formatCurrency(avgTicket)}</p>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Ventas esta semana</p>
        <div style={S.barChart}>
          {WEEK_STATS.map((d, i) => (
            <div key={i} style={S.barCol}>
              <div style={S.bar((d.sales / maxSales) * 100, i === WEEK_STATS.length - 1)} />
              <span style={S.barLabel}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Más vendidos hoy</p>
        {TOP_PRODUCTS.map((p, i) => (
          <div key={i} style={S.topProductRow}>
            <div style={{ ...S.topProductRank, color: i === 0 ? '#FF6B2B' : '#666' }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#F1F0ED', margin: 0, marginBottom: 2 }}>{p.name}</p>
              <div style={S.progressBar()}>
                <div style={S.progressFill((p.units / TOP_PRODUCTS[0].units) * 100)} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#F1F0ED', margin: 0 }}>{p.units}u</p>
              <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>{formatCurrency(p.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista: Pedidos ───────────────────────────────────────────────────────────

function OrderDetail({ order, onClose, onAdvance, onCancel }) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#111',
      zIndex: 200, overflowY: 'auto', maxWidth: '430px', margin: '0 auto',
    }}>
      <div style={S.topbar}>
        <div>
          <p style={S.topbarTitle}>Pedido #{order.id}</p>
          <p style={S.topbarSub}>{order.customer}</p>
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
            {order.paid ? 'Pagado' : 'Pendiente'} · {order.payment_method}
          </span>
        </div>

        <div style={S.card}>
          <p style={S.sectionTitle}>Localización</p>
          <div style={S.locationRow}>
            {icons.location}
            <span>{order.beach_location}</span>
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
          {order.items.map((item, i) => (
            <div key={i} style={S.itemRow}>
              <span>{item.qty}× {item.name}</span>
              <span style={{ color: '#F1F0ED', fontWeight: 600 }}>{formatCurrency(item.qty * item.price)}</span>
            </div>
          ))}
          <div style={S.divider} />
          <div style={S.totalRow}>
            <span style={{ fontSize: '13px', color: '#666' }}>Total</span>
            <span style={S.totalAmount}>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div style={S.card}>
          <p style={S.sectionTitle}>Cliente</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#F1F0ED', margin: '0 0 8px' }}>{order.customer}</p>
          <a href={`tel:${order.phone}`} style={{ textDecoration: 'none' }}>
            <div style={{ ...S.btnSecondary, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', borderRadius: 10 }}>
              {icons.phone}
              <span style={{ color: '#F1F0ED', fontWeight: 600 }}>{order.phone}</span>
            </div>
          </a>
        </div>

        {cfg.next && (
          <button
            onClick={() => { onAdvance(order.id, cfg.next); onClose(); }}
            style={S.opBtn(STATUS_CONFIG[cfg.next].color)}
          >
            → {cfg.nextLabel}
          </button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            onClick={() => { onCancel(order.id); onClose(); }}
            style={{ ...S.btnDanger, width: '100%', marginTop: 8, borderRadius: 12 }}
          >
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  );
}

function Orders({ orders, onAdvance, onCancel }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filters = [
    { key: 'all', label: `Todo (${orders.length})` },
    { key: 'pending', label: `Pendiente (${orders.filter(o => o.status === 'pending').length})` },
    { key: 'preparing', label: `Preparando (${orders.filter(o => o.status === 'preparing').length})` },
    { key: 'delivering', label: `Reparto (${orders.filter(o => o.status === 'delivering').length})` },
    { key: 'delivered', label: `Entregado (${orders.filter(o => o.status === 'delivered').length})` },
  ];

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === 'filter');
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (selected) {
    return (
      <OrderDetail
        order={selected}
        onClose={() => setSelected(null)}
        onAdvance={onAdvance}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div style={S.section}>
      <div style={S.filterRow}>
        {filters.map(f => (
          <button key={f.key} style={S.filterChip(filter === f.key)} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>📭</div>
          <p style={S.emptyTitle}>Sin pedidos</p>
          <p style={S.emptyText}>No hay pedidos en este estado.</p>
        </div>
      )}

      {filtered.map(order => {
        const cfg = STATUS_CONFIG[order.status];
        return (
          <div key={order.id} style={S.orderCard(order.status)}>
            <div style={S.orderCardInner}>
              <div style={S.orderHead}>
                <div>
                  <p style={S.orderId}>#{order.id}</p>
                  <p style={S.orderName}>{order.customer}</p>
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
                  <span style={{ fontSize: '11px' }}>{order.notes}</span>
                </div>
              )}

              <div style={S.locationRow}>
                {icons.location}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {order.beach_location}
                </span>
              </div>

              <div style={S.divider} />

              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {order.items.map((it, i) => (
                  <span key={i}>{i > 0 ? ' · ' : ''}{it.qty}× {it.name}</span>
                ))}
              </div>

              <div style={S.actionRow}>
                {cfg.next && (
                  <button
                    style={S.btnPrimary(STATUS_CONFIG[cfg.next].color)}
                    onClick={() => onAdvance(order.id, cfg.next)}
                  >
                    {cfg.nextLabel}
                  </button>
                )}
                <button style={S.btnSecondary} onClick={() => setSelected(order)}>
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
      })}
    </div>
  );
}

// ─── Vista: Operador ──────────────────────────────────────────────────────────

function Operator({ orders, onAdvance }) {
  const active = orders.filter(o => o.status === 'pending' || o.status === 'preparing');

  if (active.length === 0) {
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
        fontSize: '13px',
        color: '#FF6B2B',
        fontWeight: 600,
      }}>
        ⚡ {active.length} pedido{active.length > 1 ? 's' : ''} activo{active.length > 1 ? 's' : ''}
      </div>

      {active.map(order => {
        const cfg = STATUS_CONFIG[order.status];
        return (
          <div key={order.id} style={{ ...S.operatorCard, borderLeft: `5px solid ${cfg.color}` }}>
            <p style={S.opOrderId}>PEDIDO #{order.id} · {elapsed(order.created_at)}</p>
            <p style={S.opName}>{order.customer}</p>
            <div style={S.opLocation}>
              {icons.location}
              <span>{order.beach_location}</span>
            </div>

            {order.notes && (
              <div style={{ ...S.notesBox, marginBottom: 12 }}>
                {icons.warn}
                <span>{order.notes}</span>
              </div>
            )}

            <div style={S.opItems}>
              {order.items.map((item, i) => (
                <div key={i} style={S.opItem}>
                  <span><strong style={{ color: '#FF6B2B' }}>{item.qty}×</strong> {item.name}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(item.qty * item.price)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={S.opTotal}>{formatCurrency(order.total)}</span>
              <span style={S.payBadge(order.paid)}>
                {order.paid ? 'Pagado' : 'Sin cobrar'} · {order.payment_method}
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

// ─── Vista: Productos ─────────────────────────────────────────────────────────

const CATEGORY_EMOJI = {
  Bebidas: '🥤', Alcohol: '🍺', Bocadillos: '🥪', Snacks: '🍟',
  Helados: '🍦', Fumadores: '🚬', Farmacia: '💊', Playa: '☀️', Packs: '🎁',
};

function Products() {
  const [products, setProducts] = useState(PRODUCTS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');

  const cats = ['Todos', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
  const filtered = products.filter(p => {
    const matchCat = catFilter === 'Todos' || p.category === catFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleActive = (id) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };
  const updateStock = (id, delta) => {
    setProducts(ps => ps.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  return (
    <div style={S.section}>
      <input
        style={S.input}
        placeholder="Buscar producto o SKU…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div style={{ ...S.filterRow, marginBottom: 16 }}>
        {cats.map(c => (
          <button key={c} style={S.filterChip(catFilter === c)} onClick={() => setCatFilter(c)}>
            {c !== 'Todos' ? (CATEGORY_EMOJI[c] || '') + ' ' : ''}{c}
          </button>
        ))}
      </div>

      <div style={S.card}>
        {filtered.length === 0 && (
          <div style={{ ...S.emptyState, padding: '24px 0' }}>
            <p style={S.emptyTitle}>Sin resultados</p>
          </div>
        )}
        {filtered.map((p, i) => (
          <div key={p.id} style={{ ...S.productRow, borderBottom: i < filtered.length - 1 ? '1px solid #222' : 'none' }}>
            <div style={S.productEmoji}>{CATEGORY_EMOJI[p.category] || '📦'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={S.productName}>{p.name}</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={S.productMeta}>{p.sku}</span>
                <span style={{ color: '#444', fontSize: 10 }}>·</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#F1F0ED' }}>{formatCurrency(p.price)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                <span style={S.stockBadge(p.stock)}>{p.stock} uds</span>
                <button
                  onClick={() => updateStock(p.id, -1)}
                  style={{ ...S.btnSecondary, padding: '2px 8px', fontSize: 14, borderRadius: 6 }}
                >−</button>
                <button
                  onClick={() => updateStock(p.id, 10)}
                  style={{ ...S.btnSecondary, padding: '2px 8px', fontSize: 14, borderRadius: 6 }}
                >+10</button>
              </div>
            </div>
            <button
              onClick={() => toggleActive(p.id)}
              style={{ ...S.toggleSwitch(p.active), flexShrink: 0 }}
              aria-label={p.active ? 'Desactivar' : 'Activar'}
            >
              <div style={S.toggleKnob(p.active)} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista: Estadísticas ──────────────────────────────────────────────────────

function Stats({ orders }) {
  const [period, setPeriod] = useState('hoy');
  const delivered = orders.filter(o => o.status === 'delivered');
  const total = delivered.reduce((s, o) => s + o.total, 0);

  const payBreakdown = [
    { method: 'Bizum', count: delivered.filter(o => o.payment_method === 'bizum').length, color: '#FF6B2B' },
    { method: 'Tarjeta', count: delivered.filter(o => o.payment_method === 'card').length, color: '#3B82F6' },
    { method: 'Efectivo', count: delivered.filter(o => o.payment_method === 'cash').length, color: '#22C55E' },
  ];
  const totalPay = payBreakdown.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <div style={S.section}>
      <div style={{ ...S.filterRow, marginBottom: 16 }}>
        {['hoy', 'semana', 'mes'].map(p => (
          <button key={p} style={S.filterChip(period === p)} onClick={() => setPeriod(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div style={S.metricGrid}>
        <div style={S.metricCard('#FF6B2B')}>
          <p style={S.metricLabel}>Ventas</p>
          <p style={S.metricValue}>{formatCurrency(period === 'hoy' ? total : period === 'semana' ? 3580 : 14200)}</p>
        </div>
        <div style={S.metricCard('#22C55E')}>
          <p style={S.metricLabel}>Pedidos</p>
          <p style={S.metricValue}>{period === 'hoy' ? delivered.length : period === 'semana' ? 205 : 820}</p>
        </div>
        <div style={S.metricCard('#3B82F6')}>
          <p style={S.metricLabel}>Ticket medio</p>
          <p style={S.metricValue}>{formatCurrency(period === 'hoy' ? (total / (delivered.length || 1)) : period === 'semana' ? 17.46 : 17.32)}</p>
        </div>
        <div style={S.metricCard('#8B5CF6')}>
          <p style={S.metricLabel}>Beneficio</p>
          <p style={S.metricValue}>{formatCurrency(period === 'hoy' ? total * 0.28 : period === 'semana' ? 1002 : 3976)}</p>
          <p style={S.metricSub}>~28% margen</p>
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Métodos de pago</p>
        {payBreakdown.map(p => (
          <div key={p.method} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#CCC' }}>{p.method}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.count} pedidos</span>
            </div>
            <div style={S.progressBar()}>
              <div style={{ ...S.progressFill((p.count / totalPay) * 100), background: p.color }} />
            </div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Ventas por día (semana)</p>
        <div style={S.barChart}>
          {WEEK_STATS.map((d, i) => {
            const maxS = Math.max(...WEEK_STATS.map(x => x.sales));
            return (
              <div key={i} style={S.barCol}>
                <div style={S.bar((d.sales / maxS) * 100, i === WEEK_STATS.length - 1)} />
                <span style={S.barLabel}>{d.day}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {WEEK_STATS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: i === WEEK_STATS.length - 1 ? '#FF6B2B' : '#555', margin: 0 }}>
                {formatCurrency(d.sales)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <p style={S.sectionTitle}>Horas pico</p>
        {[
          { hour: '12:00–13:00', orders: 8, pct: 65 },
          { hour: '14:00–15:00', orders: 12, pct: 100 },
          { hour: '16:00–17:00', orders: 10, pct: 83 },
          { hour: '18:00–19:00', orders: 7, pct: 58 },
          { hour: '20:00–21:00', orders: 5, pct: 42 },
        ].map((h, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#888' }}>{h.hour}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F1F0ED' }}>{h.orders} pedidos</span>
            </div>
            <div style={S.progressBar()}>
              <div style={S.progressFill(h.pct)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const TABS = [
  { key: 'dashboard', label: 'Inicio',    icon: icons.dashboard },
  { key: 'orders',    label: 'Pedidos',   icon: icons.orders },
  { key: 'operator',  label: 'Operador',  icon: icons.operator },
  { key: 'products',  label: 'Productos', icon: icons.products },
  { key: 'stats',     label: 'Stats',     icon: icons.stats },
];

export default function ChiringuitoAdmin() {
  const [tab, setTab] = useState('operator');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const advanceOrder = (orderId, newStatus) => {
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };
  const cancelOrder = (orderId) => {
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
  };

  const TAB_LABELS = {
    dashboard: 'Dashboard',
    orders:    'Pedidos',
    operator:  'Vista operador',
    products:  'Productos',
    stats:     'Estadísticas',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { background: #0A0A0A; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { display: none; }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={S.app}>
        {/* Topbar */}
        <header style={S.topbar}>
          <div>
            <p style={S.topbarTitle}>🏖️ {TAB_LABELS[tab]}</p>
            <p style={S.topbarSub}>Chiringuito Beach Delivery</p>
          </div>
          <div style={S.liveChip}>
            <div style={S.liveDot} />
            <span>LIVE</span>
          </div>
        </header>

        {/* Contenido */}
        {tab === 'dashboard' && <Dashboard orders={orders} />}
        {tab === 'orders'    && <Orders orders={orders} onAdvance={advanceOrder} onCancel={cancelOrder} />}
        {tab === 'operator'  && <Operator orders={orders} onAdvance={advanceOrder} />}
        {tab === 'products'  && <Products />}
        {tab === 'stats'     && <Stats orders={orders} />}

        {/* Nav bar */}
        <nav style={S.navBar}>
          {TABS.map(t => (
            <button
              key={t.key}
              style={S.navItem(tab === t.key)}
              onClick={() => setTab(t.key)}
              aria-label={t.label}
            >
              <div style={{ position: 'relative' }}>
                {t.icon}
                {t.key === 'orders' && pendingCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    background: '#FF6B2B', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {pendingCount}
                  </span>
                )}
              </div>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}