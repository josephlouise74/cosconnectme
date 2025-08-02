

// Filter state type
export interface FilterState {
  search: string;
  category: string | '';
  priceRange: [number, number];
  tags: string[];
  gender: string | '';
  size: string | '';
  color: string | '';
  sort: 'newest' | 'price-low' | 'price-high' | 'popular';
}

// Props for filter sidebar
export interface FilterSidebarProps {
  filters: any; // Using any for now since we're using form.watch()
  form: any; // Using any for now to represent the React Hook Form methods
  minMaxPrice: [number, number];
  isOpen: boolean;
  onClose: () => void;
}

// Props for product grid
export interface ProductGridProps {
  products: any[];
  loading: boolean;
}

// Props for product card
export interface ProductCardProps {
  product: any;
}

// Props for search bar
export interface SearchBarProps {
  search: string;
  form: any; // React Hook Form methods
  onFilter?: () => void;
}

// Props for category filter
export interface CategoryFilterProps {
  selectedCategory: string | '';
  setSelectedCategory: (category: string | '') => void;
}

// Props for price range filter
export interface PriceRangeFilterProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minMaxPrice: [number, number];
}

// Props for tag filter
export interface TagFilterProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}
