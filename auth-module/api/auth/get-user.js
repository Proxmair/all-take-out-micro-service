import User from "../../module/User.js";
import { connectDB } from "../../lib/mongodb.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  try {
    const { id } = req.body;
    const userId = id;
    await connectDB();
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      email: user.email,
      isGuest: false,
      role: user.role,
    });
  } catch (err) {
    console.log('error', err)
    res.status(401).json({ error: "Invalid token" });
  }
}
