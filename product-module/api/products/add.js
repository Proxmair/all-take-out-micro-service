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
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }
      const { adminId } = fields;
      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can add products" });
      }
      // Handle image upload
      let image = fields.image;
      if (files.image) {
        // Save file and set image path (implement as needed)
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
      const product = await Products.create(productData);
      res.status(201).json({ product });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
