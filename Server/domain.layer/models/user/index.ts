import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, Unique, HasMany } from "sequelize-typescript";
import IUser from "../../interfaces/user";
import { Optional } from "sequelize";
import { Business } from "../business";

type UserCreationAttributes = Optional<IUser, "id" | "createdAt" | "updatedAt" | "deletedAt" | "avatar" | "phone" | "bio" | "default_latitude" | "default_longitude">;

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

  @AllowNull(true)
  @Column(DataType.STRING(500))
  declare avatar: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare bio: string | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(11, 8))
  declare default_latitude: number | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 8))
  declare default_longitude: number | null;

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
