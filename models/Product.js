import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: String,
    category: String,
    occasion: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
