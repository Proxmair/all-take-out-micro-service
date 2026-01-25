import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ error: "Category id is required" });
    const category = await Categories.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
