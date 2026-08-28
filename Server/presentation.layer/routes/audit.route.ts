/**
 * Dev-only audit event inspection route.
 * Protected by authentication and restricted to non-production environments.
 */

import { Router } from "express";
import { AuditEvent } from "../../domain.layer/models/audit-event";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";

const router = Router();

router.get("/", authenticateJWT, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  const where: Record<string, unknown> = {};
  if (req.query.actorId) where.actorId = parseInt(req.query.actorId as string, 10);
  if (req.query.action) where.action = req.query.action;
  if (req.query.resource) where.resource = req.query.resource;

  const { count, rows } = await AuditEvent.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    data: rows,
    meta: { total: count, limit, offset },
  });
});

export default router;
