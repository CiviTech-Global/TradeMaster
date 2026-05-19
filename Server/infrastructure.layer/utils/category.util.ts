import { Category } from "../../domain.layer/models/category";
import ICategory from "../../domain.layer/interfaces/category";
import { Optional } from "sequelize";

type CategoryCreationAttributes = Optional<ICategory, "id" | "createdAt" | "updatedAt" | "deletedAt" | "description" | "parent_id" | "icon" | "sort_order">;
type CategoryUpdateAttributes = Partial<Omit<ICategory, "id" | "createdAt" | "updatedAt" | "deletedAt">>;

export async function getAllCategoriesQuery(parentId?: number) {
  const where: any = { is_active: true };
  if (parentId !== undefined) {
    where.parent_id = parentId;
  }

  return await Category.findAll({
    where,
    include: [
      {
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false,
      }
    ],
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  });
}

export async function getCategoryByIdQuery(id: number) {
  return await Category.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false,
      },
      {
        model: Category,
        as: 'parent',
      }
    ],
  });
}

export async function createCategoryQuery(data: CategoryCreationAttributes) {
  return await Category.create(data);
}

export async function updateCategoryQuery(id: number, data: CategoryUpdateAttributes) {
  const category = await Category.findByPk(id);
  if (!category) return null;

  await category.update(data);
  return await getCategoryByIdQuery(id);
}

export async function deleteCategoryQuery(id: number) {
  const category = await Category.findByPk(id);
  if (!category) return null;

  await category.destroy();
  return category;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
