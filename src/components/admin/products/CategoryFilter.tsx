import S from '@/components/admin/styles';

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
};

export default function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div style={{ ...S.filterRow, marginBottom: 16 }}>
      {categories.map((category) => (
        <button
          key={category}
          style={S.filterChip(activeCategory === category)}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
