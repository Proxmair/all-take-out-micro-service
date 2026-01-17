import { connectDB } from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    res.status(200).json({ success: true, message: "MongoDB connected 🚀" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
