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
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    await connectDB();
    const { adminId, productId, productData } = req.body;
    if (!productId) return res.status(400).json({ error: "Product id is required" });
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Only admin can edit products" });
    }
    // Only allow fields from the new schema
    const allowedFields = [
      "categoryId", "subCategoryId", "name", "materials", "sizes", "shapes", "qualities",
      "image", "imageSize", "variants", "templateDragSize"
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (productData[key] !== undefined) updateData[key] = productData[key];
    }
    const updated = await Products.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
