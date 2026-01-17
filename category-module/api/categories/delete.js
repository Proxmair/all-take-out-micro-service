import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
    if (req.method !== "DELETE")
        return res.status(405).json({ error: "Method not allowed" });
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
