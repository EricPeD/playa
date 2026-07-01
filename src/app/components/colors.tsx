import { IcoDrink, IcoWine, IcoSandwich, IcoCookie, IcoIceCream, IcoCigarette, IcoPill, IcoSun, IcoGift } from '@/app/components/Icons';
import type { ReactNode } from "react";

export const CAT_ICONS: Record<string, React.ReactNode> = {
  bebidas:    <IcoDrink />,
  alcohol:    <IcoWine />,
  bocadillos: <IcoSandwich />,
  snacks:     <IcoCookie />,
  helados:    <IcoIceCream />,
  fumadores:  <IcoCigarette />,
  farmacia:   <IcoPill />,
  playa:      <IcoSun />,
  packs:      <IcoGift />,
};


export const CAT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  bebidas:    { bg: '#EBF4FF', text: '#1E3A5F', icon: '#3B82F6' },
  alcohol:    { bg: '#F5F0FF', text: '#3B1A6B', icon: '#7C3AED' },
  bocadillos: { bg: '#FFF7ED', text: '#7C2D12', icon: '#EA580C' },
  snacks:     { bg: '#FFFBEB', text: '#78350F', icon: '#D97706' },
  helados:    { bg: '#FFF0F5', text: '#881337', icon: '#E11D48' },
  fumadores:  { bg: '#F1F5F9', text: '#1E293B', icon: '#475569' },
  farmacia:   { bg: '#F0FFF4', text: '#14532D', icon: '#16A34A' },
  playa:      { bg: '#FFFDE7', text: '#713F12', icon: '#CA8A04' },
  packs:      { bg: '#FFF5F0', text: '#7C2D12', icon: '#DC2626' },
};
