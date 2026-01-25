import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    const { adminId, productId, productData } = req.body;
    if (!productId) return res.status(400).json({ error: "Product id is required" });
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Only admin can edit products" });
    }
    const updated = await Products.findByIdAndUpdate(productId, productData, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
