import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });
    try {
        await connectDB();
        const { adminId, productData } = req.body;
        const adminUser = await User.findById(adminId);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only admin can add products" });
        }
        const product = await Products.create(productData);
        res.status(201).json({ product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
