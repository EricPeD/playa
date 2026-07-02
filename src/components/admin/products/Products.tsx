import { useMemo, useState } from 'react';
import type { ProductWithCategory } from '@/hooks/useProducts';
import type { Category } from '@/lib/types';
import S from '@/components/admin/styles';
import CategoryFilter from './CategoryFilter';
import ProductRow from './ProductRow';

type ProductsProps = {
  products: ProductWithCategory[];
  categories: Array<{ id: number; name: string; emoji: string | null }>;
  onToggleActive: (id: number, active: boolean) => Promise<boolean>;
  onAdjustStock: (id: number, delta: number) => Promise<boolean>;
};

export default function Products({ products, categories, onToggleActive, onAdjustStock }: ProductsProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  const categoryOptions = useMemo(() => ['Todos', ...categories.map((cat) => cat.name)], [categories]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'Todos' || product.category_name === categoryFilter;
      const lowerSearch = search.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(lowerSearch) || (product.sku ?? '').toLowerCase().includes(lowerSearch);
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, search]);

  return (
    <div style={S.section}>
      <input
        style={S.input}
        placeholder="Buscar producto o SKU…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <CategoryFilter
        categories={categoryOptions}
        activeCategory={categoryFilter}
        onSelect={setCategoryFilter}
      />

      <div style={S.card}>
        {filtered.length === 0 ? (
          <div style={{ ...S.emptyState, padding: '24px 0' }}>
            <p style={S.emptyTitle}>Sin resultados</p>
          </div>
        ) : (
          filtered.map((product, index) => (
            <ProductRow
              key={product.id}
              product={product}
              onToggleActive={onToggleActive}
              onAdjustStock={onAdjustStock}
              isLast={index === filtered.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
