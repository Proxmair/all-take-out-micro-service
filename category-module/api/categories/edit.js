import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
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
