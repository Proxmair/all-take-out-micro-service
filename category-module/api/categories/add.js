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
