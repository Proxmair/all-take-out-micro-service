
import { connectDB } from "../../lib/mongodb.js";
import Cart from "../../module/Cart.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId field" });
    }

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart || !cart.items.length)
      return res.status(400).json({ error: "Cart empty" });

    // OPTIONAL: revalidate prices here

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
