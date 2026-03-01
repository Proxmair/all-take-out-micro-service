import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Categories from "../../module/Categories.js";
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }

      const getSingle = (field) =>
        Array.isArray(field) ? field[0] : field;

      const categoryId = getSingle(fields.categoryId);
      const subCategoryId = getSingle(fields.subCategoryId);
      const title = getSingle(fields.title);
      const description = getSingle(fields.description);
      const link = getSingle(fields.link);
      const adminId = getSingle(fields.adminId);

      if (!categoryId || !subCategoryId) {
        return res.status(400).json({
          error: "categoryId and subCategoryId are required",
        });
      }

      // ✅ Validate admin
      const adminUser = await User.findById(adminId);
      if (!adminUser || adminUser.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only admin can edit subcategories" });
      }

      // ✅ Handle image upload (optional)
      let imageUrl;

      if (files.image) {
        const file = Array.isArray(files.image)
          ? files.image[0]
          : files.image;

        const result = await cloudinary.uploader.upload(
          file.filepath,
          { folder: "subcategories" }
        );

        imageUrl = result.secure_url;
      }

      // ✅ Build update object dynamically
      const updateData = {};

      if (title) updateData["subCategories.$.title"] = title;
      if (description) updateData["subCategories.$.description"] = description;
      if (link) updateData["subCategories.$.link"] = link;
      if (imageUrl) updateData["subCategories.$.image"] = imageUrl;

      const updated = await Categories.findOneAndUpdate(
        { _id: categoryId, "subCategories._id": subCategoryId },
        { $set: updateData },
        { new: true }
      );

      if (!updated) {
        return res
          .status(404)
          .json({ error: "Category or subcategory not found" });
      }

      res.status(200).json({ category: updated });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}