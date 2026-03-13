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
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
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

      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Only admin can add products" });
      }

      let imageUrl;
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: "products",
        });
        imageUrl = result.secure_url;
      }

      const productData = {
        categoryId: getSingle(fields.categoryId),
        subCategoryId: getSingle(fields.subCategoryId),
        name: JSON.stringify(fields.name || fields["name[]"]),
        image: imageUrl,
        material: JSON.stringify(fields.material || fields["material[]"]),
        sizes: JSON.stringify(fields.sizes || fields["sizes[]"]),
        shapes: JSON.stringify(fields.shapes || fields["shapes[]"]),
        qualities: Number(getSingle(fields.qualities || fields["qualities[]"])),
        originalSize: JSON.stringify(fields.originalSize || fields["originalSize[]"]),
        dimentions: JSON.stringify(fields.dimentions || fields["dimentions[]"]),
        variants: JSON.stringify(fields.variants || fields["variants[]"]),
        misc: fields.misc || {},
      };

      const product = await Products.create(productData);

      res.status(201).json({ product });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}