import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
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
    const { categoryId, adminId } = req.body;

    await connectDB();
    
    const adminUser = await User.findById(adminId);
    
    if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can delete category" });
    }

    if (!categoryId) return res.status(400).json({ error: "Category id is required" });
    
    const deleted = await Categories.findByIdAndDelete(categoryId);
    
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    
    res.status(200).json({
        message: "Category deleted"
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
