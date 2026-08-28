/**
 * Audit event model.
 * Append-only table for security and compliance-relevant events.
 * UPDATE and DELETE are blocked at the database level by migration trigger.
 */

import {
  Model,
  Table,
  Column,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
} from "sequelize-typescript";
import { Optional } from "sequelize";

export type ActorType = "user" | "system" | "service";
export type AuditStatus = "success" | "failure";

export interface AuditEventContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
}

export interface IAuditEvent {
  id: string;
  actorId: number | null;
  actorType: ActorType;
  action: string;
  resource: string;
  resourceId: string | null;
  status: AuditStatus;
  context: AuditEventContext;
  diff: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

type AuditEventCreationAttributes = Optional<
  IAuditEvent,
  "id" | "createdAt" | "diff" | "metadata"
>;

@Table({
  tableName: "audit_events",
  timestamps: true,
  updatedAt: false,
  paranoid: false,
})
export class AuditEvent extends Model<IAuditEvent, AuditEventCreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare actorId: number | null;

  @AllowNull(false)
  @Column(DataType.ENUM("user", "system", "service"))
  declare actorType: ActorType;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare action: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare resource: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare resourceId: string | null;

  @AllowNull(false)
  @Column(DataType.ENUM("success", "failure"))
  declare status: AuditStatus;

  @AllowNull(false)
  @Column(DataType.JSONB)
  declare context: AuditEventContext;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare diff: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare metadata: Record<string, unknown> | null;

  @Column(DataType.DATE)
  declare createdAt: Date;
}
