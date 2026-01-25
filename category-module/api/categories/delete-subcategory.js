import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
    try {
        await connectDB();
        const { categoryId, subCategoryId, adminId } = req.body;

        const adminUser = await User.findById(adminId);

        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only admin can delete subcategories" });
        }

        if (!categoryId || !subCategoryId) {
            return res.status(400).json({ error: "categoryId and subCategoryId are required" });
        }
        const updated = await Categories.findByIdAndUpdate(
            categoryId,
            { $pull: { subCategories: { _id: subCategoryId } } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Category or subcategory not found" });
        res.status(200).json({ message: "Subcategory deleted", category: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
