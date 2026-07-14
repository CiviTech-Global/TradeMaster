import express from "express";

// [DISABLED] Products not shown in business directory mode
// All product routes are temporarily disabled.
// To re-enable, uncomment the imports and routes below.

/*
import multer from "multer";
import {
  getProducts,
  getProductById,
  getProductsByBusiness,
  getNearbyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  updateProductImage,
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../../application.layer/controllers/product.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
import { ensureUploadsDir, generateFilename } from "../../infrastructure.layer/utils/upload.util";
import { validate } from "../../infrastructure.layer/validation/middleware";
import { createProductSchema, updateProductSchema } from "../../infrastructure.layer/validation/schemas";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ensureUploadsDir());
  },
  filename: (_req, file, cb) => {
    cb(null, generateFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});
*/

const router = express.Router();

// All product routes disabled in business directory mode
// GET routes (read-only display)
// router.get("/", getProducts);
// router.get("/nearby", getNearbyProducts);
// router.get("/business/:businessId", getProductsByBusiness);
// router.get("/:id", getProductById);
// router.get("/:id/variants", getVariants);

// POST/PATCH/DELETE routes (CRUD operations)
// router.post("/", authenticateJWT, validate(createProductSchema), createProduct);
// router.patch("/:id", authenticateJWT, validate(updateProductSchema), updateProduct);
// router.delete("/:id", authenticateJWT, deleteProduct);
// router.post("/:id/images", authenticateJWT, upload.array('images', 5), uploadProductImages);
// router.delete("/:id/images/:imageId", authenticateJWT, deleteProductImage);
// router.patch("/:id/images/:imageId", authenticateJWT, updateProductImage);
// router.post("/:id/variants", authenticateJWT, createVariant);
// router.patch("/:id/variants/:variantId", authenticateJWT, updateVariant);
// router.delete("/:id/variants/:variantId", authenticateJWT, deleteVariant);

export default router;
