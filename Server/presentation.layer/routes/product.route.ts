import express from "express";
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

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/nearby", getNearbyProducts);
router.get("/business/:businessId", getProductsByBusiness);
router.get("/:id", getProductById);
router.get("/:id/variants", getVariants);

// Protected routes
router.post("/", authenticateJWT, createProduct);
router.patch("/:id", authenticateJWT, updateProduct);
router.delete("/:id", authenticateJWT, deleteProduct);

// Product Images
router.post("/:id/images", authenticateJWT, upload.array('images', 5), uploadProductImages);
router.delete("/:id/images/:imageId", authenticateJWT, deleteProductImage);
router.patch("/:id/images/:imageId", authenticateJWT, updateProductImage);

// Product Variants
router.post("/:id/variants", authenticateJWT, createVariant);
router.patch("/:id/variants/:variantId", authenticateJWT, updateVariant);
router.delete("/:id/variants/:variantId", authenticateJWT, deleteVariant);

export default router;
