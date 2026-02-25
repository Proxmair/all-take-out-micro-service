import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";

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
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }
      const { adminId, productId } = fields;
      if (!productId) return res.status(400).json({ error: "Product id is required" });
      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can edit products" });
      }
      // Handle image upload
      let image = fields.image;
      if (files.image) {
        image = files.image.filepath || files.image.path;
      }
      // Build productData from fields
      const allowedFields = [
        "categoryId", "subCategoryId", "name", "materials", "sizes", "shapes", "qualities",
        "imageSize", "variants", "templateDragSize"
      ];
      const productData = {};
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          try {
            productData[key] = JSON.parse(fields[key]);
          } catch {
            productData[key] = fields[key];
          }
        }
      }
      productData.image = image;
      const updated = await Products.findByIdAndUpdate(productId, productData, { new: true });
      if (!updated) return res.status(404).json({ error: "Product not found" });
      res.status(200).json({ product: updated });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
