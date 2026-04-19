import { connectDB } from "../../lib/mongodb.js";
import Order from "../../module/Order.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET || "");

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const { id, customer, shipping, payment, order } = req.body;

    if (!id || !customer?.email || !order?.total) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: "usd",
      receipt_email: customer.email,
      payment_method_types: ["card"],
      payment_method: "pm_card_visa",
      confirm: true,
      metadata: {
        userId: id,
        productId: order.productId,
        productName: order.name,
      },
    });

    const newOrder = await Order.create({
      userId: id,
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

    return res.status(200).json({
      success: true,
      paymentId: paymentIntent.id,
      orderId: newOrder._id,
      status: paymentIntent.status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}