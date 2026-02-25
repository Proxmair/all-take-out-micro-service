import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    await connectDB();
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }
      const { productId } = fields;
      if (!productId) {
        // Return all products if no productId is provided
        const products = await Products.find({});
        return res.status(200).json({ products });
      }
      const product = await Products.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.status(200).json({ product });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
