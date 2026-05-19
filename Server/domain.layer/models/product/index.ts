import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { IProduct, IProductImage, IProductVariant } from "../../interfaces/product";
import { Optional } from "sequelize";
import { Business } from "../business";
import { Category } from "../category";

// Product
type ProductCreationAttributes = Optional<IProduct, "id" | "createdAt" | "updatedAt" | "deletedAt" | "description" | "category_id" | "currency" | "stock_quantity" | "is_active">;

@Table({
  tableName: "products",
  timestamps: true,
  paranoid: true,
})
export class Product extends Model<IProduct, ProductCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Business)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare business_id: number;

  @ForeignKey(() => Category)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare category_id: number | null;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  declare price: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(3), defaultValue: 'USD' })
  declare currency: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare stock_quantity: number;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Column(DataType.DATE)
  declare deletedAt: Date;

  @BelongsTo(() => Business)
  declare business: Business;

  @BelongsTo(() => Category)
  declare category: Category;

  @HasMany(() => ProductImage)
  declare images: ProductImage[];

  @HasMany(() => ProductVariant)
  declare variants: ProductVariant[];
}

// ProductImage
type ProductImageCreationAttributes = Optional<IProductImage, "id" | "createdAt" | "updatedAt" | "alt_text" | "sort_order" | "is_primary">;

@Table({
  tableName: "product_images",
  timestamps: true,
})
export class ProductImage extends Model<IProductImage, ProductImageCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare url: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare alt_text: string | null;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare sort_order: number;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_primary: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => Product)
  declare product: Product;
}

// ProductVariant
type ProductVariantCreationAttributes = Optional<IProductVariant, "id" | "createdAt" | "updatedAt" | "price_modifier" | "stock_quantity" | "sku" | "is_active">;

@Table({
  tableName: "product_variants",
  timestamps: true,
})
export class ProductVariant extends Model<IProductVariant, ProductVariantCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare value: string;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  declare price_modifier: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare stock_quantity: number | null;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  declare sku: string | null;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => Product)
  declare product: Product;
}
