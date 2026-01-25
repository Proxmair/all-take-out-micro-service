import jwt from "jsonwebtoken";
import User from "../../module/User.js";
import { connectDB } from "../../lib/mongodb.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // Try to get token from cookie or Authorization header
  const token = req.cookies?.token || req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_key");
    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      email: user.email,
      isGuest: false,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
