import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../application.layer/controllers/category.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes
router.post("/", authenticateJWT, createCategory);
router.patch("/:id", authenticateJWT, updateCategory);
router.delete("/:id", authenticateJWT, deleteCategory);

export default router;
