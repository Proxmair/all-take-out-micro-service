import { connectDB } from "../../../lib/mongodb.js";
import User from "../../../module/User.js";
import jwt from "jsonwebtoken";

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
    const { adminId, email, password } = req.body;
    if (!adminId || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    // Check if adminId is a valid admin
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Only admin can create VIP users" });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }
    // Create VIP user (password will be hashed by pre-save hook)
    const vipUser = await User.create({
      email,
      password,
      role: "vip-user"
    });
    if (!vipUser) {
      return res.status(500).json({ error: "VIP user creation failed" });
    }
    // Generate JWT token for new VIP user
    const token = jwt.sign(
      { id: vipUser._id },
      process.env.JWT_SECRET || "dev_secret_key",
      { expiresIn: "7d" }
    );
    res.status(201).json({
      id: vipUser._id,
      email: vipUser.email,
      role: vipUser.role,
      isGuest: false,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
