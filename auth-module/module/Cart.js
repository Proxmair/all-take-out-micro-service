import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    productName: String,
    basePrice: Number,
    material: {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
    },
    size: {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
    },
    shape: {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
    },
    template: {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [CartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "checked_out"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
