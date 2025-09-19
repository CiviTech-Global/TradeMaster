import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, HasMany } from "sequelize-typescript";
import IUser from "../../interfaces/user";
import { Optional } from "sequelize";
import { Business } from "../business";

type UserCreationAttributes = Optional<IUser, "id" | "createdAt" | "updatedAt" | "deletedAt">;

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true,
})
export class User extends Model<IUser, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare firstname: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare lastname: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare password: string;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @Column(DataType.DATE)
  declare deletedAt: Date;

  @HasMany(() => Business, 'owner')
  declare businesses: Business[];

  static async createUser(user: UserCreationAttributes): Promise<User> {
    return this.create(user);
  }
}
