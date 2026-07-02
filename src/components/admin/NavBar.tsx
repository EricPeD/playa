import type { CSSProperties } from 'react';
import S from '@/components/admin/styles';
import { icons } from '@/components/admin/icons';

type NavBarProps = {
  tabs: { key: string; label: string }[];
  activeTab: string;
  pendingCount: number;
  onTabChange: (tab: string) => void;
};

export default function NavBar({ tabs, activeTab, onTabChange, pendingCount }: NavBarProps) {
  return (
    <nav style={S.navBar as CSSProperties}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          style={S.navItem(tab.key === activeTab) as CSSProperties}
          onClick={() => onTabChange(tab.key)}
          aria-label={tab.label}
        >
          <div style={{ position: 'relative' }}>
            {icons[tab.key]}
            {tab.key === 'orders' && pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -6,
                background: '#FF6B2B',
                color: '#fff',
                borderRadius: '50%',
                width: 16,
                height: 16,
                fontSize: 9,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {pendingCount}
              </span>
            )}
          </div>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
