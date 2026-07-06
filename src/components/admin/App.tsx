'use client';

import { useMemo, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useStats } from '@/hooks/useStats';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Topbar from '@/components/admin/Topbar';
import NavBar from '@/components/admin/NavBar';
import Dashboard from '@/components/admin/dashboard/Dashboard';
import Orders from '@/components/admin/orders/Orders';
import Operator from '@/components/admin/operator/Operator';
import Products from '@/components/admin/products/Products';
import Stats from '@/components/admin/stats/Stats';
import S from '@/components/admin/styles';

const TABS: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Inicio' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'operator', label: 'Repartidor' },
  { key: 'products', label: 'Productos' },
  { key: 'stats', label: 'Estadísticas' },
];

type TabKey = (typeof TABS)[number]['key'];

export default function AdminApp() {
  const [tab, setTab] = useState<TabKey>('operator');
  const [statsPeriod, setStatsPeriod] = useState<'hoy' | 'semana' | 'mes'>('hoy');
  const { orders, loading: ordersLoading, error: ordersError, advanceOrder, cancelOrder, refresh: refreshOrders } = useOrders();
  const { products, categories, loading: productsLoading, error: productsError, toggleActive, adjustStock } = useProducts();
  const { salesByDay, paymentBreakdown, hourlyPeak, statusBreakdown, beachRevenue, summary, loading: statsLoading, error: statsError, refresh: refreshStats } = useStats(statsPeriod);
  const { publicBlocked, loading: settingsLoading, setPublicBlocked } = useSiteSettings();

  const pendingCount = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders]);

  const isLoading = ordersLoading || productsLoading || statsLoading || settingsLoading;
  const errorMessage = ordersError ?? productsError ?? statsError;

  return (
    <div style={S.app}>
      <Topbar title={TABS.find((item) => item.key === tab)?.label ?? 'Admin'} pendingCount={pendingCount} />

      {isLoading && (
        <div style={{ ...S.section, textAlign: 'center', color: '#999' }}>
          Cargando datos...
        </div>
      )}

      {errorMessage && (
        <div style={{ ...S.section, textAlign: 'center', color: '#EF4444' }}>
          Error: {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          {tab === 'dashboard' && (
            <Dashboard
              orders={orders}
              stats={summary}
              salesByDay={salesByDay}
              hourlyPeak={hourlyPeak}
              publicBlocked={publicBlocked}
              onToggleSiteBlocked={setPublicBlocked}
            />
          )}
          {tab === 'orders' && (
            <Orders orders={orders} onAdvance={advanceOrder} onCancel={cancelOrder} refreshOrders={refreshOrders} />
          )}
          {tab === 'operator' && <Operator orders={orders} onAdvance={advanceOrder} />}
          {tab === 'products' && (
            <Products products={products} categories={categories} onToggleActive={toggleActive} onAdjustStock={adjustStock} />
          )}
          {tab === 'stats' && (
            <Stats
              period={statsPeriod}
              onPeriodChange={setStatsPeriod}
              salesByDay={salesByDay}
              paymentBreakdown={paymentBreakdown}
              hourlyPeak={hourlyPeak}
              statusBreakdown={statusBreakdown}
              beachRevenue={beachRevenue}
              summary={summary}
            />
          )}
        </>
      )}

      <NavBar tabs={TABS} activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />
    </div>
  );
}
