import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Cart from "../../module/Cart.js";
import Products from "../../module/Products.js";

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
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }

      const getSingle = (field, fallback = "") => {
        if (field === undefined || field === null) return fallback;
        return Array.isArray(field) ? field[0] : field;
      };

      const stringifyField = (value, fallback = "") => {
        if (value === undefined || value === null || value === "") return fallback;
        return typeof value === "string" ? value : JSON.stringify(value);
      };

      const userId = getSingle(fields.userId);
      const sessionId = getSingle(fields.sessionId);
      const sessionID = getSingle(fields.sessionID);
      const productId = getSingle(fields.productId);
      const name = getSingle(fields.name);
      const thumbnail = getSingle(fields.thumbnail);
      const dimensions = getSingle(fields.dimensions);
      const price = getSingle(fields.price, "0");
      const quantity = getSingle(fields.quantity, "1");
      const customization = getSingle(fields.customization);
      const variant = getSingle(fields.variant);
      const couponCode = getSingle(fields.couponCode);
      const editedImage = getSingle(fields.editedImage);

      const activeSessionId = sessionId || sessionID || "";

      if ((!userId && !activeSessionId) || !productId) {
        return res.status(400).json({
          error: "userId or sessionId and productId are required",
        });
      }

      const product = await Products.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const quantityString = stringifyField(quantity, "1");
      const priceString = stringifyField(price, "0");
      const quantityNumber = Number(quantityString) || 0;
      const unitPriceNumber = Number(priceString) || 0;
      const lineTotal = quantityNumber * unitPriceNumber;

      const query = {
        status: "active",
        ...(userId ? { userId } : { sessionId: activeSessionId }),
      };

      let cart = await Cart.findOne(query);
      if (!cart) {
        cart = await Cart.create({
          userId: userId || undefined,
          sessionId: activeSessionId,
          items: [],
        });
      } else if (!cart.sessionId && activeSessionId) {
        cart.sessionId = activeSessionId;
      }

      cart.items.push({
        productId,
        name: stringifyField(name, product.name || ""),
        thumbnail: stringifyField(thumbnail),
        dimensions: stringifyField(dimensions),
        price: priceString,
        quantity: quantityString,
        customization: stringifyField(customization),
        variant: stringifyField(variant),
        couponCode: stringifyField(couponCode),
        editedImage: stringifyField(editedImage),
      });

      cart.totalItems += quantityNumber;
      cart.totalPrice += lineTotal;

      await cart.save();
      res.status(201).json({
        message: "Product added to cart",
        cart,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
