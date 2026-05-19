import { Request, Response } from "express";
import {
  getProductsQuery,
  getProductByIdQuery,
  getProductsByBusinessQuery,
  getNearbyProductsQuery,
  createProductQuery,
  updateProductQuery,
  deleteProductQuery,
  addProductImageQuery,
  deleteProductImageQuery,
  updateProductImageQuery,
  getProductVariantsQuery,
  createProductVariantQuery,
  updateProductVariantQuery,
  deleteProductVariantQuery,
  verifyBusinessOwnership,
  getProductBusinessOwnerId,
  unifiedSearchQuery,
} from "../../infrastructure.layer/utils/product.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";

// Products CRUD
export async function getProducts(req: Request, res: Response) {
  try {
    const filters = {
      business_id: req.query.business_id ? parseInt(req.query.business_id as string) : undefined,
      category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
      min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      search: req.query.search as string | undefined,
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radius_km: req.query.radius_km ? parseFloat(req.query.radius_km as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string | undefined,
    };
    const result = await getProductsQuery(filters);
    res.json({ ...result, message: "Products retrieved successfully" });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

    const product = await getProductByIdQuery(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ data: product, message: "Product retrieved successfully" });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
}

export async function getProductsByBusiness(req: Request, res: Response) {
  try {
    const businessId = parseInt(req.params.businessId, 10);
    if (isNaN(businessId)) return res.status(400).json({ error: "Invalid business ID" });

    const products = await getProductsByBusinessQuery(businessId);
    res.json({ data: products, message: "Products retrieved successfully" });
  } catch (error) {
    console.error("Error fetching business products:", error);
    res.status(500).json({ error: "Failed to get business products" });
  }
}

export async function getNearbyProducts(req: Request, res: Response) {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = req.query.radius_km ? parseFloat(req.query.radius_km as string) : 10;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Valid lat and lng parameters are required" });
    }

    const products = await getNearbyProductsQuery(lat, lng, radiusKm, limit);
    res.json({ data: products, message: "Nearby products retrieved successfully" });
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    res.status(500).json({ error: "Failed to get nearby products" });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const { business_id, category_id, title, description, price, currency, stock_quantity, is_active } = req.body;

    if (!business_id || !title || price === undefined) {
      return res.status(400).json({ error: "business_id, title, and price are required" });
    }

    const isOwner = await verifyBusinessOwnership(business_id, req.user!.id);
    if (!isOwner) {
      return res.status(403).json({ error: "You can only add products to your own business" });
    }

    const product = await createProductQuery({
      business_id,
      category_id: category_id || null,
      title,
      description: description || null,
      price,
      currency: currency || 'USD',
      stock_quantity: stock_quantity !== undefined ? stock_quantity : 0,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({ data: product, message: "Product created successfully" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

    const ownerId = await getProductBusinessOwnerId(id);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "You can only update your own products" });
    }

    const { title, description, price, currency, stock_quantity, is_active, category_id } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (category_id !== undefined) updateData.category_id = category_id;

    const product = await updateProductQuery(id, updateData);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ data: product, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

    const ownerId = await getProductBusinessOwnerId(id);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "You can only delete your own products" });
    }

    const product = await deleteProductQuery(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
}

// Product Images
export async function uploadProductImages(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    const ownerId = await getProductBusinessOwnerId(productId);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const images = [];
    for (let i = 0; i < files.length; i++) {
      const image = await addProductImageQuery(productId, {
        url: `/uploads/${files[i].filename}`,
        alt_text: req.body.alt_text || null,
        sort_order: i,
        is_primary: i === 0 && req.body.set_primary === 'true',
      });
      images.push(image);
    }

    res.status(201).json({ data: images, message: "Images uploaded successfully" });
  } catch (error) {
    console.error("Error uploading product images:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
}

export async function deleteProductImage(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    const imageId = parseInt(req.params.imageId, 10);

    const ownerId = await getProductBusinessOwnerId(productId);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const image = await deleteProductImageQuery(imageId);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
}

export async function updateProductImage(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    const imageId = parseInt(req.params.imageId, 10);

    const ownerId = await getProductBusinessOwnerId(productId);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { sort_order, is_primary, alt_text } = req.body;
    const updateData: any = {};
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_primary !== undefined) updateData.is_primary = is_primary;
    if (alt_text !== undefined) updateData.alt_text = alt_text;

    const image = await updateProductImageQuery(imageId, updateData);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.json({ data: image, message: "Image updated successfully" });
  } catch (error) {
    console.error("Error updating product image:", error);
    res.status(500).json({ error: "Failed to update image" });
  }
}

// Product Variants
export async function getVariants(req: Request, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    const variants = await getProductVariantsQuery(productId);
    res.json({ data: variants, message: "Variants retrieved successfully" });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ error: "Failed to get variants" });
  }
}

export async function createVariant(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ error: "Invalid product ID" });

    const ownerId = await getProductBusinessOwnerId(productId);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, value, price_modifier, stock_quantity, sku } = req.body;
    if (!name || !value) {
      return res.status(400).json({ error: "name and value are required" });
    }

    const variant = await createProductVariantQuery(productId, {
      name, value, price_modifier, stock_quantity, sku,
    });

    res.status(201).json({ data: variant, message: "Variant created successfully" });
  } catch (error) {
    console.error("Error creating variant:", error);
    res.status(500).json({ error: "Failed to create variant" });
  }
}

export async function updateVariant(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    const variantId = parseInt(req.params.variantId, 10);

    const ownerId = await getProductBusinessOwnerId(productId);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const variant = await updateProductVariantQuery(variantId, req.body);
    if (!variant) return res.status(404).json({ error: "Variant not found" });

    res.json({ data: variant, message: "Variant updated successfully" });
  } catch (error) {
    console.error("Error updating variant:", error);
    res.status(500).json({ error: "Failed to update variant" });
  }
}

export async function deleteVariant(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id, 10);
    const variantId = parseInt(req.params.variantId, 10);

    const ownerId = await getProductBusinessOwnerId(productId);
    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const variant = await deleteProductVariantQuery(variantId);
    if (!variant) return res.status(404).json({ error: "Variant not found" });

    res.json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({ error: "Failed to delete variant" });
  }
}

// Unified Search
export async function unifiedSearch(req: Request, res: Response) {
  try {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Search query 'q' is required" });
    }

    const type = (req.query.type as string) || 'all';
    const filters = {
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radius_km: req.query.radius_km ? parseFloat(req.query.radius_km as string) : undefined,
      category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
    };

    const results = await unifiedSearchQuery(q, type, filters);
    res.json({ data: results, message: "Search completed successfully" });
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({ error: "Search failed" });
  }
}
