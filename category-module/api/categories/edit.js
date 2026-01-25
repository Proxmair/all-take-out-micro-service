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
  try {
    await connectDB();

    const { categoryId, title, link, misc, adminId } = req.body;

    if (!categoryId) return res.status(400).json({ error: "Category id is required" });

    const adminUser = await User.findById(adminId);
    
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Only admin can edit categories" });
    }

    const updated = await Categories.findByIdAndUpdate(
      categoryId,
      { title, link, misc },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Category not found" });
    
    res.status(200).json({ category: updated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
