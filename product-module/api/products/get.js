import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    const products = await Products.find();
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
