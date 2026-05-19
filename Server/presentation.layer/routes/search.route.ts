import express from "express";
import { unifiedSearch } from "../../application.layer/controllers/product.ctrl";

const router = express.Router();

router.get("/", unifiedSearch);

export default router;
