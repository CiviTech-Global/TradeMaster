import express from "express";
import { getAllUsers } from "../../application.layer/controllers/user.ctrl";
const router = express.Router();

router.get("/", getAllUsers);

router.post("/", (req, res) => {
  res.send("Hello World");
});

router.put("/:id", (req, res) => {
  res.send("Hello World");
});

router.delete("/:id", (req, res) => {
  res.send("Hello World");
});

router.get("/:id", (req, res) => {
  res.send("Hello World");
});

export default router;
