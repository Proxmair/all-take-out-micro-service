
import { connectDB } from "../../lib/mongodb.js";
import Cart from "../../module/Cart.js";

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
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { userId, sessionId, sessionID } = req.body;
    const activeSessionId = sessionId || sessionID || "";

    if (!userId && !activeSessionId) {
      return res.status(400).json({ error: "Missing userId or sessionId field" });
    }

    const cart = await Cart.findOne({
      status: "active",
      ...(userId ? { userId } : { sessionId: activeSessionId }),
    });
    if (!cart || !cart.items.length)
      return res.status(400).json({ error: "Cart empty" });

    cart.status = "checked_out";
    await cart.save();

    res.json({
      message: "Checkout successful",
      cartId: cart._id,
      amount: cart.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
