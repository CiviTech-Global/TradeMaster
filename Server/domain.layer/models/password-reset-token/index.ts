import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Optional } from "sequelize";
import { User } from "../user";

interface IPasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type PasswordResetTokenCreationAttributes = Optional<IPasswordResetToken, "id" | "createdAt" | "updatedAt" | "used">;

@Table({
  tableName: "password_reset_tokens",
  timestamps: true,
})
export class PasswordResetToken extends Model<IPasswordResetToken, PasswordResetTokenCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare user_id: number;

  @AllowNull(false)
  @Column(DataType.STRING(64))
  declare token: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expires_at: Date;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare used: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => User)
  declare user: User;
}
