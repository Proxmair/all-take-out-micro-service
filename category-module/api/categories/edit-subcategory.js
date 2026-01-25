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
        await connectDB();
        const { categoryId, subCategoryId, subCategoryData, adminId } = req.body;
        if (!categoryId || !subCategoryId || !subCategoryData)
            return res.status(400).json({ error: "categoryId, subCategoryId, and subCategoryData are required" });
        const adminUser = await User.findById(adminId);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only admin can edit subcategories" });
        }
        // Update the subcategory in the array
        const updated = await Categories.findOneAndUpdate(
            { _id: categoryId, "subCategories._id": subCategoryId },
            { $set: { "subCategories.$": { _id: subCategoryId, ...subCategoryData } } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Category or subcategory not found" });
        res.status(200).json({ category: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
