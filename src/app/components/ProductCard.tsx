import {IcoPlus, IcoBox, IcoMinus } from"./icons";
import {Product} from"@/lib/types";
import {BadgePill} from "./BadgePill";

export function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[#F0EDE8] last:border-0">
      {/* Thumb */}
      <div className="w-[56px] h-[56px] rounded-xl bg-[#F5F2ED] flex items-center justify-center shrink-0 text-[#B0ABA4]">
        <IcoBox />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[14px] font-semibold text-[#1A1A1A] leading-snug">{product.name}</p>
          {product.badge && <BadgePill type={product.badge} />}
        </div>
        {product.brand && (
          <p className="text-[11px] text-[#9B9589] mt-0.5">{product.brand}</p>
        )}
        <p className="text-[15px] font-bold text-[#1A1A1A] mt-1">{Number(product.price).toFixed(2)} €</p>
      </div>

      {/* Quantity control */}
      {quantity === 0 ? (
        <button
          onClick={() => {
            console.log(`[ProductCard] + pulsado: ${product.name} (id=${product.id})`);
            onAdd();
          }}
          disabled={product.stock === 0}
          className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform shrink-0"
          aria-label={`Añadir ${product.name}`}
        >
          <IcoPlus size={17} />
        </button>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              console.log(`[ProductCard] - pulsado: ${product.name} (id=${product.id}), qty actual=${quantity}`);
              onRemove();
            }}
            className="w-8 h-8 rounded-full border border-[#E0DDD8] text-[#1A1A1A] flex items-center justify-center active:scale-95 transition-transform"
            aria-label={`Quitar uno de ${product.name}`}
          >
            <IcoMinus size={15} />
          </button>
          <span className="text-[14px] font-bold w-5 text-center tabular-nums">{quantity}</span>
          <button
            onClick={() => {
              console.log(`[ProductCard] + pulsado (ya en carrito): ${product.name}, qty actual=${quantity}`);
              onAdd();
            }}
            className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label={`Más de ${product.name}`}
          >
            <IcoPlus size={15} />
          </button>
        </div>
      )}
    </div>
  );
}