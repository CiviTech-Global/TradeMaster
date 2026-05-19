import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { IOrder, IOrderItem } from "../../interfaces/order";
import { Optional } from "sequelize";
import { User } from "../user";
import { Business } from "../business";
import { Product } from "../product";
import { ProductVariant } from "../product";

// Order
type OrderCreationAttributes = Optional<IOrder, "id" | "createdAt" | "updatedAt" | "deletedAt" | "status" | "currency" | "shipping_address" | "shipping_latitude" | "shipping_longitude" | "notes" | "cancelled_reason" | "confirmed_at" | "shipped_at" | "delivered_at" | "cancelled_at">;

@Table({
  tableName: "orders",
  timestamps: true,
  paranoid: true,
})
export class Order extends Model<IOrder, OrderCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare order_number: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare buyer_id: number;

  @ForeignKey(() => Business)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare business_id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(20), defaultValue: 'pending' })
  declare status: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  declare total_amount: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(3), defaultValue: 'USD' })
  declare currency: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare shipping_address: string | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(11, 8))
  declare shipping_latitude: number | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 8))
  declare shipping_longitude: number | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare cancelled_reason: string | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare confirmed_at: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare shipped_at: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare delivered_at: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare cancelled_at: Date | null;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Column(DataType.DATE)
  declare deletedAt: Date;

  @BelongsTo(() => User)
  declare buyer: User;

  @BelongsTo(() => Business)
  declare business: Business;

  @HasMany(() => OrderItem)
  declare items: OrderItem[];
}

// OrderItem
type OrderItemCreationAttributes = Optional<IOrderItem, "id" | "createdAt" | "updatedAt" | "variant_id">;

@Table({
  tableName: "order_items",
  timestamps: true,
})
export class OrderItem extends Model<IOrderItem, OrderItemCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Order)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare order_id: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare product_id: number;

  @ForeignKey(() => ProductVariant)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare variant_id: number | null;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  declare quantity: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  declare unit_price: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  declare total_price: number;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => ProductVariant)
  declare variant: ProductVariant;
}
