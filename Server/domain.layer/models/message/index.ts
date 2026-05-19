import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import IMessage from "../../interfaces/message";
import { Optional } from "sequelize";
import { User } from "../user";

type MessageCreationAttributes = Optional<IMessage, "id" | "createdAt" | "updatedAt" | "order_id" | "product_id" | "is_read">;

@Table({
  tableName: "messages",
  timestamps: true,
  paranoid: false,
})
export class Message extends Model<IMessage, MessageCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare sender_id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare receiver_id: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare order_id: number | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare product_id: number | null;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare content: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_read: boolean;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => User, 'sender_id')
  declare sender: User;

  @BelongsTo(() => User, 'receiver_id')
  declare receiver: User;
}
