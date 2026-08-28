import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Optional } from "sequelize";
import { User } from "../user";

interface IRefreshToken {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  replaced_by_token_hash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type RefreshTokenCreationAttributes = Optional<IRefreshToken, "id" | "createdAt" | "updatedAt" | "revoked" | "replaced_by_token_hash">;

@Table({
  tableName: "refresh_tokens",
  timestamps: true,
})
export class RefreshToken extends Model<IRefreshToken, RefreshTokenCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare user_id: number;

  @AllowNull(false)
  @Column(DataType.STRING(128))
  declare token_hash: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expires_at: Date;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare revoked: boolean;

  @AllowNull(true)
  @Column(DataType.STRING(128))
  declare replaced_by_token_hash: string | null;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => User)
  declare user: User;
}
