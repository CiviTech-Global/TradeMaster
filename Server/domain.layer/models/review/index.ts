import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import IReview from "../../interfaces/review";
import { Optional } from "sequelize";
import { User } from "../user";
import { Business } from "../business";
import { Product } from "../product";

type ReviewCreationAttributes = Optional<IReview, "id" | "createdAt" | "updatedAt" | "deletedAt" | "product_id" | "order_id" | "comment">;

@Table({
  tableName: "reviews",
  timestamps: true,
  paranoid: true,
})
export class Review extends Model<IReview, ReviewCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare reviewer_id: number;

  @ForeignKey(() => Business)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare business_id: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare order_id: number | null;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare rating: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare comment: string | null;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Column(DataType.DATE)
  declare deletedAt: Date;

  @BelongsTo(() => User, 'reviewer_id')
  declare reviewer: User;

  @BelongsTo(() => Business)
  declare business: Business;
}
