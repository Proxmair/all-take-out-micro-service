import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Cart from "../../module/Cart.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }

      const getSingle = (field, fallback = "") => {
        if (field === undefined || field === null) return fallback;
        return Array.isArray(field) ? field[0] : field;
      };

      const userId = getSingle(fields.userId);
      const sessionId = getSingle(fields.sessionId);
      const sessionID = getSingle(fields.sessionID);
      const itemId = getSingle(fields.itemId);
      const activeSessionId = sessionId || sessionID || "";

      if ((!userId && !activeSessionId) || !itemId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const cart = await Cart.findOne({
        status: "active",
        ...(userId ? { userId } : { sessionId: activeSessionId }),
      });
      if (!cart) return res.status(404).json({ error: "Cart not found" });

      const item = cart.items.id(itemId);
      if (!item) return res.status(404).json({ error: "Cart item not found" });

      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;

      cart.totalItems = Math.max(0, cart.totalItems - quantity);
      cart.totalPrice = Math.max(0, cart.totalPrice - quantity * unitPrice);

      cart.items.pull(itemId);
      await cart.save();

      res.json(cart);
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
