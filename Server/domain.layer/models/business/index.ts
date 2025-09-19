import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import IBusiness from "../../interfaces/business";
import { Optional } from "sequelize";
import { User } from "../user";

type BusinessCreationAttributes = Optional<IBusiness, "id" | "createdAt" | "updatedAt" | "deletedAt">;

@Table({
  tableName: "businesses",
  timestamps: true,
  paranoid: true,
})
export class Business extends Model<IBusiness, BusinessCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare owner: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare title: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 8))
  declare longitude: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(11, 8))
  declare latitude: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare address: string;

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING))
  declare emails: string[];

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING))
  declare phones: string[];

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  declare is_active: boolean;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  declare logo: string;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Column(DataType.DATE)
  declare deletedAt: Date;

  @BelongsTo(() => User)
  declare user: User;

  static async createBusiness(business: BusinessCreationAttributes): Promise<Business> {
    return this.create(business);
  }
}