export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
  parent?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  data: Category | Category[];
  message: string;
}
