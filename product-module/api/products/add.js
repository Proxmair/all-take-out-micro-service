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
    const { adminId, productData } = req.body;
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Only admin can add products" });
    }
    // Only allow fields from the new schema
    const allowedFields = [
      "categoryId", "subCategoryId", "name", "materials", "sizes", "shapes", "qualities",
      "image", "imageSize", "variants", "templateDragSize"
    ];
    const newProductData = {};
    for (const key of allowedFields) {
      if (productData && productData[key] !== undefined) newProductData[key] = productData[key];
    }
    const product = await Products.create(newProductData);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
