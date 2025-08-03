import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import path from "path";

const router = express.Router();

// GET all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET single product by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST create product (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, price, imageUrl, category, occasion, description } = req.body;
    const newProduct = new Product({
      title,
      price,
      imageUrl,
      category,
      occasion,
      description,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT update product (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});
// POST /api/products/upload - Upload image
router.post("/upload", upload.single("image"), (req, res) => {
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});


export default router;
