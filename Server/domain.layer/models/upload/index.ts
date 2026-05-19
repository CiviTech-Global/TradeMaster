import { Model, Table, Column, DataType, PrimaryKey, AutoIncrement, AllowNull, ForeignKey, BelongsTo } from "sequelize-typescript";
import IUpload from "../../interfaces/upload";
import { Optional } from "sequelize";
import { User } from "../user";

type UploadCreationAttributes = Optional<IUpload, "id" | "createdAt" | "updatedAt" | "entity_type" | "entity_id">;

@Table({
  tableName: "uploads",
  timestamps: true,
})
export class Upload extends Model<IUpload, UploadCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare uploader_id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare filename: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare original_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare mimetype: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare size: number;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare url: string;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  declare entity_type: string | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare entity_id: number | null;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => User)
  declare uploader: User;
}
