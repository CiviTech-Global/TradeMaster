import { Product, ProductImage, ProductVariant } from "../../domain.layer/models/product";
import { Business } from "../../domain.layer/models/business";
import { Category } from "../../domain.layer/models/category";
import { User } from "../../domain.layer/models/user";
import { Op, literal } from "sequelize";

const productIncludes: any[] = [
  {
    model: ProductImage,
    as: 'images',
  },
  {
    model: ProductVariant,
    as: 'variants',
    required: false,
  },
  {
    model: Business,
    attributes: ['id', 'title', 'owner', 'latitude', 'longitude', 'address', 'logo'],
    include: [
      { model: User, attributes: ['id', 'firstname', 'lastname'] },
    ],
  },
  {
    model: Category,
    attributes: ['id', 'name', 'slug', 'icon'],
    required: false,
  },
];

interface ProductFilters {
  business_id?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
}

export async function getProductsQuery(filters: ProductFilters) {
  const where: any = { is_active: true };
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;

  if (filters.business_id) where.business_id = filters.business_id;
  if (filters.category_id) where.category_id = filters.category_id;
  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    where.price = {};
    if (filters.min_price !== undefined) where.price[Op.gte] = filters.min_price;
    if (filters.max_price !== undefined) where.price[Op.lte] = filters.max_price;
  }
  if (filters.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${filters.search}%` } },
      { description: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  let order: any[] = [['createdAt', 'DESC']];
  if (filters.sort_by) {
    const sortMap: Record<string, any[]> = {
      'price_asc': [['price', 'ASC']],
      'price_desc': [['price', 'DESC']],
      'newest': [['createdAt', 'DESC']],
      'oldest': [['createdAt', 'ASC']],
      'title': [['title', 'ASC']],
    };
    if (sortMap[filters.sort_by]) order = sortMap[filters.sort_by];
  }

  // Location-based filtering via business
  let businessWhere: any = undefined;
  if (filters.lat !== undefined && filters.lng !== undefined && filters.radius_km) {
    businessWhere = literal(
      `(6371 * acos(cos(radians(${filters.lat})) * cos(radians(CAST("business"."latitude" AS FLOAT))) * cos(radians(CAST("business"."longitude" AS FLOAT)) - radians(${filters.lng})) + sin(radians(${filters.lat})) * sin(radians(CAST("business"."latitude" AS FLOAT))))) <= ${filters.radius_km}`
    );
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: ProductImage,
        as: 'images',
      },
      {
        model: ProductVariant,
        as: 'variants',
        where: { is_active: true },
        required: false,
      },
      {
        model: Business,
        attributes: ['id', 'title', 'owner', 'latitude', 'longitude', 'address', 'logo'],
        where: businessWhere ? businessWhere : undefined,
        include: [
          { model: User, attributes: ['id', 'firstname', 'lastname'] },
        ],
      },
      {
        model: Category,
        attributes: ['id', 'name', 'slug', 'icon'],
        required: false,
      },
    ],
    order,
    limit,
    offset,
    distinct: true,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getProductByIdQuery(id: number) {
  return await Product.findByPk(id, { include: productIncludes });
}

export async function getProductsByBusinessQuery(businessId: number) {
  return await Product.findAll({
    where: { business_id: businessId },
    include: productIncludes,
    order: [['createdAt', 'DESC']],
  });
}

export async function getNearbyProductsQuery(lat: number, lng: number, radiusKm: number = 10, limit: number = 20) {
  return await Product.findAll({
    where: { is_active: true },
    include: [
      {
        model: ProductImage,
        as: 'images',
      },
      {
        model: Business,
        attributes: ['id', 'title', 'latitude', 'longitude', 'address', 'logo'],
        where: literal(
          `(6371 * acos(cos(radians(${lat})) * cos(radians(CAST("business"."latitude" AS FLOAT))) * cos(radians(CAST("business"."longitude" AS FLOAT)) - radians(${lng})) + sin(radians(${lat})) * sin(radians(CAST("business"."latitude" AS FLOAT))))) <= ${radiusKm}`
        ),
      },
      {
        model: Category,
        attributes: ['id', 'name', 'slug'],
        required: false,
      },
    ],
    limit,
    order: [['createdAt', 'DESC']],
  });
}

export async function createProductQuery(data: any) {
  const product = await Product.create(data);
  return await getProductByIdQuery(product.id);
}

export async function updateProductQuery(id: number, data: any) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.update(data);
  return await getProductByIdQuery(id);
}

export async function deleteProductQuery(id: number) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return product;
}

// Product Images
export async function addProductImageQuery(productId: number, data: any) {
  return await ProductImage.create({ ...data, product_id: productId });
}

export async function deleteProductImageQuery(imageId: number) {
  const image = await ProductImage.findByPk(imageId);
  if (!image) return null;
  await image.destroy();
  return image;
}

export async function updateProductImageQuery(imageId: number, data: any) {
  const image = await ProductImage.findByPk(imageId);
  if (!image) return null;
  await image.update(data);
  return image;
}

// Product Variants
export async function getProductVariantsQuery(productId: number) {
  return await ProductVariant.findAll({ where: { product_id: productId } });
}

export async function createProductVariantQuery(productId: number, data: any) {
  return await ProductVariant.create({ ...data, product_id: productId });
}

export async function updateProductVariantQuery(variantId: number, data: any) {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) return null;
  await variant.update(data);
  return variant;
}

export async function deleteProductVariantQuery(variantId: number) {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) return null;
  await variant.destroy();
  return variant;
}

// Verify business ownership
export async function verifyBusinessOwnership(businessId: number, userId: number): Promise<boolean> {
  const business = await Business.findOne({ where: { id: businessId, owner: userId } });
  return !!business;
}

export async function getProductBusinessOwnerId(productId: number): Promise<number | null> {
  const product = await Product.findByPk(productId, {
    include: [{ model: Business, attributes: ['owner'] }],
  });
  return product?.business?.owner || null;
}

// Unified search
export async function unifiedSearchQuery(q: string, type: string = 'all', filters: any = {}) {
  const results: any = {};

  if (type === 'all' || type === 'product') {
    const products = await getProductsQuery({ ...filters, search: q });
    results.products = products;
  }

  if (type === 'all' || type === 'business') {
    const businessWhere: any = {
      is_active: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } },
      ],
    };

    const businesses = await Business.findAll({
      where: businessWhere,
      include: [
        { model: User, attributes: ['id', 'firstname', 'lastname'] },
        { model: Category, attributes: ['id', 'name', 'slug'], required: false },
      ],
      limit: 20,
    });
    results.businesses = businesses;
  }

  return results;
}
