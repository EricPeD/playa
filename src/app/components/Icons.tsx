import { ArrowLeft, Beer, Box, CheckCircle2, Cigarette, CupSoda, Gift, IceCreamCone, MapPin, MapPinOff, Minus, Package2, Phone, Pill, Plus, ShoppingCart, Sandwich, SunMedium } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconProps = LucideProps & { size?: number };

const withSize = (size: number, props: IconProps) => ({ size: props.size ?? size, ...props });

export function IcoBox(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Box {...withSize(size, rest)} />;
}

export function IcoCart(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <ShoppingCart {...withSize(size, rest)} />;
}

export function IcoCheck(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <CheckCircle2 {...withSize(size, rest)} />;
}
export function IcoTruck({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="11" rx="1" />
      <path d="M15 9h4l3 3v5h-7z" />
      <circle cx="6" cy="19" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="19" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IcoPin(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <MapPin {...withSize(size, rest)} />;
}

export function IcoPinOff(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <MapPinOff {...withSize(size, rest)} />;
}

export function IcoPhone(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Phone {...withSize(size, rest)} />;
}

export function IcoBack(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <ArrowLeft {...withSize(size, rest)} />;
}

export function IcoPlus(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Plus {...withSize(size, rest)} />;
}

export function IcoMinus(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Minus {...withSize(size, rest)} />;
}

export function IcoDrink(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <CupSoda {...withSize(size, rest)} />;
}

export function IcoWine(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Beer {...withSize(size, rest)} />;
}

export function IcoSandwich(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Sandwich {...withSize(size, rest)} />;
}

export function IcoCookie(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Package2 {...withSize(size, rest)} />;
}

export function IcoIceCream(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <IceCreamCone {...withSize(size, rest)} />;
}

export function IcoCigarette(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Cigarette {...withSize(size, rest)} />;
}

export function IcoPill(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Pill {...withSize(size, rest)} />;
}

export function IcoSun(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <SunMedium {...withSize(size, rest)} />;
}

export function IcoGift(props: IconProps) {
  const { size = 20, ...rest } = props;
  return <Gift {...withSize(size, rest)} />;
}
