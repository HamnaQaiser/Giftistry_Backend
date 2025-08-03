// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ POST Create Order (Guest or Authenticated User)
router.post("/", async (req, res) => {
  try {
    const { products, guestInfo } = req.body;

    // Validate products
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Products are required." });
    }

    // Step 1: Enrich product data (get prices from DB)
    const enrichedProducts = [];
    let calculatedTotal = 0;

    for (const item of products) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({ error: "Each product must include product ID and quantity." });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ error: `Product not found: ${item.product}` });
      }

      const itemTotal = dbProduct.price * item.quantity;
      calculatedTotal += itemTotal;

      enrichedProducts.push({
        product: dbProduct._id,
        quantity: item.quantity,
        customMessage: item.customMessage || "",
        customImageFileName: item.customImageUrl?.split("/uploads/")[1] || "", // ✅ extract only filename
      });
    }

    const newOrder = new Order({
      products: enrichedProducts,
      total: calculatedTotal,
      status: "Pending",
    });

    // Step 2: Attach user if logged in
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        newOrder.user = decoded.id;
      } catch (err) {
        console.warn("⚠️ Invalid token, continuing as guest.");
      }
    }

    // Step 3: Attach guest info if not logged in
    if (!newOrder.user && guestInfo) {
      newOrder.guestInfo = {
        name: guestInfo.name || "Guest",
        email: guestInfo.email || "unknown@guest.com",
        phone: guestInfo.phone || "N/A",
        address: guestInfo.address || "N/A",
      };
    }

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// ✅ GET All Orders (Admin Only)
// ✅ GET All Orders (Admin Only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "email")
      .populate("products.product", "title price imageUrl"); // 👈 FIXED here

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});



// ✅ PUT: Update Order Status
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = req.body.status || order.status;
    await order.save();

    res.json({ message: "Status updated", status: order.status });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});


// ✅ DELETE Order
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
