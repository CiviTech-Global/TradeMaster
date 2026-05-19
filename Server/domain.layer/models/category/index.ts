import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, ForeignKey, HasMany, BelongsTo } from "sequelize-typescript";
import ICategory from "../../interfaces/category";
import { Optional } from "sequelize";

type CategoryCreationAttributes = Optional<ICategory, "id" | "createdAt" | "updatedAt" | "deletedAt" | "description" | "parent_id" | "icon" | "sort_order">;

@Table({
  tableName: "categories",
  timestamps: true,
  paranoid: true,
})
export class Category extends Model<ICategory, CategoryCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare slug: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @ForeignKey(() => Category)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare parent_id: number | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare icon: string | null;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare sort_order: number;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Column(DataType.DATE)
  declare deletedAt: Date;

  @BelongsTo(() => Category, 'parent_id')
  declare parent: Category;

  @HasMany(() => Category, 'parent_id')
  declare children: Category[];
}
