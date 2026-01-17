import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });
    try {
        await connectDB();
        const { categoryId, subCategory, adminId } = req.body;

        const adminUser = await User.findById(adminId);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only admin can create subcategories" });
        }

        if (!categoryId || !subCategory) return res.status(400).json({ error: "categoryId and subCategory are required" });
        
        const updated = await Categories.findByIdAndUpdate(
            categoryId,
            { $push: { subCategories: subCategory } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "Category not found" });
        res.status(200).json({ category: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
