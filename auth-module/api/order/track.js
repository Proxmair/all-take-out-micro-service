import mongoose from "mongoose";
import { connectDB } from "../../lib/mongodb.js";
import Order from "../../module/Order.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const { orderId, trackingNumber } = req.body;

    if (!orderId && !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "orderId or trackingNumber is required",
      });
    }

    if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId",
      });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      order = await Order.findOne({ trackingNumber });
    }

    return res.status(200).json({
      success: true,
      count: order.length,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}