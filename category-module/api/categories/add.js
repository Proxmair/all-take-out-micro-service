import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });
    try {
        const { title, link, misc, adminId } = req.body || {};
        await connectDB();
        const adminUser = await User.findById(adminId);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only admin can create categories" });
        }
        if (!title) return res.status(400).json({ error: "Title is required" });
        const category = await Categories.create({ title, link, misc });
        res.status(201).json({ category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
