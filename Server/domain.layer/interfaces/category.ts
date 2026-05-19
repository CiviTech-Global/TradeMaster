interface ICategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default ICategory;
