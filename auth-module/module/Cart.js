import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    name: String,
    thumbnail: String,
    dimensions: String,
    price: String,
    quantity: {
      type: String,
      default: "1",
    },
    customization: String,
    variant: String,
    couponCode: String,
    editedImage: String,
  },
  { _id: true }
);

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: String,
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
