import { Model, Table } from "sequelize-typescript";
import IUser from "../../interfaces/user";
import { Optional } from "sequelize";

type UserCreationAttributes = Optional<IUser, "id">;

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true,
})
export class User extends Model<UserCreationAttributes> {
  declare id: number;
  declare firstname: string;
  declare lastname: string;
  declare email: string;
  declare password: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date;

  static async createUser(user: UserCreationAttributes): Promise<User> {
    return this.create(user);
  }
}
