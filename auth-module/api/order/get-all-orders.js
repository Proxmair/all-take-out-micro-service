import mongoose from "mongoose";
import { connectDB } from "../../lib/mongodb.js";
import Order from "../../module/Order.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

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

    const { adminId, task } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Missing adminId field",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adminId",
      });
    }

    // 🔐 Admin validation
    const adminUser = await User.findById(adminId);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can access all orders",
      });
    }

    if (task === 'getAllOrders') {
      const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    }
    else if (task === 'updateOrderStatus') {
      const {orderId,newStatus} = req.body;

      if (!orderId || !newStatus) {
        return res.status(400).json({
          success: false,
          message: "Missing orderId or newStatus field",
        });
      }

      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order: updatedOrder,
      });
    }
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid task",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}