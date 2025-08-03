// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      customMessage: String,
      customImageFileName: String,
    },
  ],
  total: Number,
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Order = mongoose.model("Order", orderSchema);
export default Order;
