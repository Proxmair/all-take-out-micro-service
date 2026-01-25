import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";

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
    const categories = await Categories.find({}, "title link misc");
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
