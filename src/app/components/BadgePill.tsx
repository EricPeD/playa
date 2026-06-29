export function BadgePill({ type }: { type: 'nuevo' | 'oferta' | 'top' }) {
  const map = {
    nuevo:  { cls: 'bg-[#E8F5E9] text-[#2E7D32]', label: 'Nuevo'  },
    oferta: { cls: 'bg-[#FFF3E0] text-[#E65100]', label: 'Oferta' },
    top:    { cls: 'bg-[#FCE4EC] text-[#880E4F]', label: 'Top'    },
  };
  const { cls, label } = map[type];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}