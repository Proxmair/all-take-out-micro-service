import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";

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
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ error: "Category id is required" });
    const category = await Categories.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
