import { Request, Response } from "express";
import {
  getAllCategoriesQuery,
  getCategoryByIdQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
  generateSlug,
} from "../../infrastructure.layer/utils/category.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const parentId = req.query.parent_id ? parseInt(req.query.parent_id as string, 10) : undefined;
    const categories = await getAllCategoriesQuery(parentId);
    res.json({ data: categories, message: "Categories retrieved successfully" });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await getCategoryByIdQuery(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ data: category, message: "Category retrieved successfully" });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to get category" });
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description, parent_id, icon, sort_order, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const slug = generateSlug(name);

    const category = await createCategoryQuery({
      name: name.trim(),
      slug,
      description: description || null,
      parent_id: parent_id || null,
      icon: icon || null,
      sort_order: sort_order !== undefined ? sort_order : 0,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({ data: category, message: "Category created successfully" });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "A category with this name already exists" });
    }
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const { name, description, parent_id, icon, sort_order, is_active } = req.body;

    const updateData: any = {};
    if (name) {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description;
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    if (icon !== undefined) updateData.icon = icon;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const category = await updateCategoryQuery(categoryId, updateData);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ data: category, message: "Category updated successfully" });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "A category with this name already exists" });
    }
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await deleteCategoryQuery(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
}
