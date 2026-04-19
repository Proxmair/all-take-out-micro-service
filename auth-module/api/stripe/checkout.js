import { generateGuestUser } from "../../lib/generate-guest.js";
import { connectDB } from "../../lib/mongodb.js";
import Order from "../../module/Order.js";
import Stripe from "stripe";
import User from "../../module/User.js";

console.log("🚀 API LOADED");

const STRIPE_KEY = process.env.STRIPE_SECRET;

console.log("🔑 STRIPE KEY EXISTS:", !!STRIPE_KEY);

if (!STRIPE_KEY) {
  console.error("❌ STRIPE SECRET IS MISSING IN ENV");
}

const stripe = new Stripe(STRIPE_KEY || "");

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCors(res);

  console.log("📩 REQUEST METHOD:", req.method);

  if (req.method === "OPTIONS") {
    console.log("⚡ OPTIONS request handled");
    return res.status(200).json({});
  }

  if (req.method !== "POST") {
    console.log("❌ Invalid method:", req.method);
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    console.log("📦 Connecting DB...");
    await connectDB();
    console.log("✅ DB Connected");

    const { id, customer, shipping, payment, order } = req.body;

    console.log("📊 Payload received:", {
      id,
      email: customer?.email,
      total: order?.total,
    });

    if (!customer?.email || !order?.total) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    let userId = id;

    if(!userId) {
      const {email,password,name,phone} = generateGuestUser();
      const newUser = await User.create({
            email,
            password,
            phone, 
            name
      });
      userId = newUser._id;
    }

    console.log("💳 Creating Stripe PaymentIntent...");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "usd",
      receipt_email: customer.email,
      payment_method_types: ["card"],
      payment_method: "pm_card_visa",
      confirm: true,
      metadata: {
        userId: userId,
        productId: order.productId,
        productName: order.name,
      },
    });

    console.log("✅ Stripe Payment Success:", paymentIntent.id);

    console.log("📝 Creating Order in DB...");

    const newOrder = await Order.create({
      userId: userId,
      customer,
      shipping,
      payment: {
        method: "stripe",
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      },
      order,
      status: paymentIntent.status === "succeeded" ? "paid" : "pending",
    });

    console.log("🎉 Order Created:", newOrder._id);

    return res.status(200).json({
      success: true,
      paymentId: paymentIntent.id,
      orderId: newOrder._id,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("🔥 ERROR OCCURRED:", error);

    return res.status(500).json({
      success: false,
      message: error?.raw?.message || error.message || "Payment failed",
    });
  }
}