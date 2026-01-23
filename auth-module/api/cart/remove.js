

import { connectDB } from "../../lib/mongodb.js";
import Cart from "../../module/Cart.js";


/**
 * Remove from cart route
 * - Validates request method
 * - Handles errors with try/catch
 * - Returns error responses with status codes
 */
export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    await connectDB();

    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Cart item not found" });

    cart.totalItems -= item.quantity;
    cart.totalPrice -= item.finalPrice;

    cart.items.pull(itemId);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
