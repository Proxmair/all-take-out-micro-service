import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";
import User from "../../module/User.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "proxmaircloud",
  api_key: "643536941871954",
  api_secret: "rA1Tc-OoID6r9Jve3qTFRvP8SRY",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: "Form parse error" });

      const getSingle = (field) =>
        Array.isArray(field) ? field[0] : field;

      const adminId = getSingle(fields.adminId);
      const productId = getSingle(fields.productId);
      const name = getSingle(fields.name);

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can edit products" });
      }

      const existingProduct = await Products.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // ✅ IMAGE (optional)
      let imageUrl = existingProduct.image;

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

      // ✅ ARRAY NORMALIZER
      const normalizeArray = (field) => {
        if (!field) return [];
        return Array.isArray(field) ? field : [field];
      };

      const material = normalizeArray(fields["material[]"]);
      const sizes = normalizeArray(fields["sizes[]"]);
      const shapes = normalizeArray(fields["shapes[]"]);
      const originalSize = normalizeArray(fields["originalSize[]"]);

      const qualities = normalizeArray(fields["qualities[]"]).map((q) =>
        Number(q)
      );

      // ✅ DIMENSIONS
      let dimentions = [];
      const rawDims = normalizeArray(fields["dimentions[]"]);

      dimentions = rawDims
        .map((d) => {
          try {
            const parsed = JSON.parse(d);
            return {
              xCordination: Number(parsed.xCordination) || 0,
              yCordination: Number(parsed.yCordination) || 0,
              scale: Number(parsed.scale) || 1,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      // ✅ VARIANTS
      let variants = [];
      const rawVariants = normalizeArray(fields["variants[]"]);

      variants = rawVariants
        .map((v) => {
          try {
            const parsed = JSON.parse(v);
            return {
              material: parsed.material,
              size: parsed.size,
              shape: parsed.shape,
              quality: Number(parsed.quality),
              price: Number(parsed.price),
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const updatedProduct = await Products.findByIdAndUpdate(
        productId,
        {
          name,
          image: imageUrl,
          material,
          sizes,
          shapes,
          qualities,
          originalSize,
          dimentions,
          variants,
        },
        { new: true }
      );

      res.status(200).json({ product: updatedProduct });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}