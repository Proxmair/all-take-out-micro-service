import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: 'proxmaircloud',
  api_key: '643536941871954',
  api_secret: 'rA1Tc-OoID6r9Jve3qTFRvP8SRY',
});

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
      console.log('fields', fields);
      const { adminId } = fields;
      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can add products" });
      }
      // Handle image upload via form-data (not part of productData)
      let imageUrl = undefined;
      if (files.image) {
        try {

          const file = Array.isArray(files.image)
            ? files.image[0]
            : files.image;

          const result = await cloudinary.uploader.upload(
            file.filepath,
            {
              folder: "products",
            }
          );

          imageUrl = result.secure_url;

        } catch (e) {
          return res.status(500).json({
            error: "Image upload failed",
            details: e.message,
          });
        }
      }
      // Support productData as a single JSON string field
      let parsedProductData = {};
      if (fields.productData !== undefined) {
        let value = Array.isArray(fields.productData) ? fields.productData[0] : fields.productData;
        // Remove extra quotes and unescape if present
        if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        // Replace escaped quotes
        value = value.replace(/\\"/g, '"');
        try {
          parsedProductData = JSON.parse(value);
        } catch (e) {
          console.error('JSON parse error:', e, value);
          parsedProductData = {};
        }
      }
      // Build productData from fields
      const allowedFields = [
        "categoryId", "subCategoryId", "name", "materials", "sizes", "shapes", "qualities",
        "imageSize", "variants", "templateDragSize", "material", "size", "shape", "template", "quantity", "misc"
      ];
      const productData = { ...parsedProductData };
      console.log('initial productData', productData);
      for (const key of allowedFields) {
        if (fields[key] !== undefined && productData[key] === undefined) {
          let value = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
          try {
            productData[key] = JSON.parse(value);
          } catch {
            productData[key] = value;
          }
        }
      }
      // Map productData fields to match schema
      if (productData.material) productData.material = productData.material;
      if (productData.size) productData.size = productData.size;
      if (productData.shape) productData.shape = productData.shape;
      if (productData.template) productData.template = productData.template;
      if (productData.quantity) productData.quantity = Number(productData.quantity);
      if (productData.misc) productData.misc = productData.misc;
      // Remove plural fields if present
      delete productData.materials;
      delete productData.sizes;
      delete productData.shapes;
      delete productData.qualities;
      // Ensure 'name' is present and valid
      if (!productData.name || typeof productData.name !== "string" || !productData.name.trim()) {
        return res.status(400).json({ error: "Product name is required." });
      }
      if (imageUrl) productData.image = imageUrl;
      const product = await Products.create(productData);
      res.status(201).json({ product });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
