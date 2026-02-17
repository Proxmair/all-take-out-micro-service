import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";

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
  try {
    await connectDB();
    // Optionally support query by id
    const { productId } = req.query;
    if (productId) {
      const product = await Products.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json({ product });
    }
    const products = await Products.find();
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
