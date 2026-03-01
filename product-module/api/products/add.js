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
      if (err) return res.status(400).json({ error: "Form parse error" });

      const { adminId, name } = fields;

      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can add products" });
      }

      if (!name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      // -------- IMAGE UPLOAD --------
      let imageUrl;
      if (files.image) {
        const file = Array.isArray(files.image)
          ? files.image[0]
          : files.image;

        const result = await cloudinary.uploader.upload(
          file.filepath,
          { folder: "products" }
        );

        imageUrl = result.secure_url;
      }

      // -------- SIMPLE ARRAY FIELDS --------
      const material = fields["material[]"] || [];
      const sizes = fields["sizes[]"] || [];
      const shapes = fields["shapes[]"] || [];
      const qualitiesRaw = fields["qualities[]"] || [];

      const qualities = Array.isArray(qualitiesRaw)
        ? qualitiesRaw.map(q => Number(q))
        : [Number(qualitiesRaw)];

      const originalSize = fields["originalSize[]"] || [];

      // -------- DIMENSIONS (parse JSON-like string) --------
      let dimentions = [];
      if (fields["dimentions[]"]) {
        const dimArray = Array.isArray(fields["dimentions[]"])
          ? fields["dimentions[]"]
          : [fields["dimentions[]"]];

        dimentions = dimArray.map(d => {
          try {
            return JSON.parse(d);
          } catch {
            return {};
          }
        });
      }

      // -------- VARIANTS --------
      let variants = [];
      if (fields["variants[]"]) {
        const variantArray = Array.isArray(fields["variants[]"])
          ? fields["variants[]"]
          : [fields["variants[]"]];

        variants = variantArray.map(v => {
          try {
            const parsed = JSON.parse(v);
            return {
              ...parsed,
              price: Number(parsed.price),
              quality: Number(parsed.quality),
            };
          } catch {
            return {};
          }
        });
      }

      const product = await Products.create({
        name,
        image: imageUrl,
        material: Array.isArray(material) ? material : [material],
        sizes: Array.isArray(sizes) ? sizes : [sizes],
        shapes: Array.isArray(shapes) ? shapes : [shapes],
        qualities,
        originalSize: Array.isArray(originalSize)
          ? originalSize
          : [originalSize],
        dimentions,
        variants,
      });

      res.status(201).json({ product });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
