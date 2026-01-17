import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    await connectDB();
    const categories = await Categories.find({}, "title link misc");
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
