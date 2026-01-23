import { connectDB } from "../../../lib/mongodb.js";
import Categories from "../../../module/Categories.js";
import Products from "../../../module/Products.js";
import User from "../../../module/User.js";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    try {
        await connectDB();
        const { adminId } = req.body;
        if (!adminId) {
            return res.status(400).json({ error: "Missing adminId field" });
        }
        // Check if adminId is a valid admin
        const adminUser = await User.findById(adminId);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only admin can clear the database" });
        }
        // Remove all documents from Categories and Products
        await Categories.deleteMany({});
        await Products.deleteMany({});
        // Remove all users except those with role 'admin'
        await User.deleteMany({ role: { $ne: "admin" } });
        res.status(200).json({ message: "Database cleared successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error clearing database.", error: error.message });
    }
}
