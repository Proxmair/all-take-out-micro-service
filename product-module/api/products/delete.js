import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  try {
    await connectDB();
    const { adminId, productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Product id is required" });
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Only admin can delete products" });
    }
    const deleted = await Products.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
