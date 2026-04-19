// models/Order.js

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
    },

    shipping: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
    },

    payment: {
      method: {
        type: String,
        default: "stripe",
      },
      paymentIntentId: String,
      sessionId: String,
      status: {
        type: String,
        default: "pending",
      },
    },

    order: {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      thumbnail: String,
      quantity: Number,
      unitPrice: Number,
      subtotal: Number,
      discount: Number,
      total: Number,
      couponCode: String,
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);