/**
 * Audit event service.
 * Writes security and compliance-relevant events to the append-only audit_events table.
 * Inserts are fire-and-forget to avoid slowing down request handling.
 */

import { Request } from "express";
import { AuditEvent, ActorType, AuditStatus, AuditEventContext } from "../../domain.layer/models/audit-event";
import { getLogContext, logger } from "../../infrastructure.layer/utils/logger.util";

export interface RecordAuditEventInput {
  actorId?: number | null;
  actorType?: ActorType;
  action: string;
  resource: string;
  resourceId?: string | number | null;
  status: AuditStatus;
  context?: Partial<AuditEventContext>;
  diff?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

function maskIp(ip: string | undefined): string | undefined {
  if (!ip || ip === "unknown") return undefined;
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":x:x:x:x";
  }
  return ip;
}

function buildContext(req?: Request, extra?: Partial<AuditEventContext>): AuditEventContext {
  const logContext = getLogContext();
  return {
    requestId: logContext?.requestId || extra?.requestId || "unknown",
    ip: maskIp(req?.ip || extra?.ip),
    userAgent: req?.headers["user-agent"] || extra?.userAgent,
  };
}

/**
 * Record an audit event. This is fire-and-forget: it will not block the caller.
 */
export function recordAuditEvent(input: RecordAuditEventInput, req?: Request): void {
  const {
    actorId = null,
    actorType = "user",
    action,
    resource,
    resourceId = null,
    status,
    context,
    diff,
    metadata,
  } = input;

  const safeResourceId = resourceId !== null ? String(resourceId) : null;
  const safeDiff = diff ? (logger.redact(diff) as Record<string, unknown>) : null;
  const safeMetadata = metadata
    ? (logger.redact(metadata) as Record<string, unknown>)
    : null;

  AuditEvent.create({
    actorId: actorId ?? null,
    actorType,
    action,
    resource,
    resourceId: safeResourceId,
    status,
    context: buildContext(req, context),
    diff: safeDiff,
    metadata: safeMetadata,
  }).catch((err) => {
    logger.error("AUDIT", "Failed to persist audit event", err, { action, resource });
  });
}

/**
 * Record a successful user action.
 */
export function recordSuccess(
  input: Omit<RecordAuditEventInput, "status">,
  req?: Request
): void {
  recordAuditEvent({ ...input, status: "success" }, req);
}

/**
 * Record a failed user action.
 */
export function recordFailure(
  input: Omit<RecordAuditEventInput, "status">,
  req?: Request
): void {
  recordAuditEvent({ ...input, status: "failure" }, req);
}

/**
 * Wrap a function with an audit event. On success records success; on failure records failure.
 * Useful for mutation operations where you want to capture the outcome.
 */
export async function withAudit<T>(
  input: Omit<RecordAuditEventInput, "status">,
  fn: () => Promise<T>,
  req?: Request
): Promise<T> {
  try {
    const result = await fn();
    recordSuccess(input, req);
    return result;
  } catch (error) {
    recordFailure(input, req);
    throw error;
  }
}
