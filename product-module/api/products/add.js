import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
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
