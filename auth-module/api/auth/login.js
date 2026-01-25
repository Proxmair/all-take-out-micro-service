import { connectDB } from "../../lib/mongodb.js";
import User from "../../module/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password using bcrypt
    console.log("Comparing passwords:", password, user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token with only user id
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret_key",
      { expiresIn: "7d" }
    );

    // Set token in cookie
    res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=604800`);

    res.status(200).json({
      id: user._id,
      email: user.email,
      isGuest: false,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
