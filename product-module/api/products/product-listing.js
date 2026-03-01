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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

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

      const getSingle = (field) =>
        Array.isArray(field) ? field[0] : field;

      const materialName = getSingle(fields.materialName);
      const sizeName = getSingle(fields.sizeName);
      const shapeName = getSingle(fields.shapeName);
      const templateName = getSingle(fields.templateName);

      const filter = {};

      const parseComma = (value) =>
        value.split(",").map((v) => v.trim()).filter(Boolean);

      if (materialName) {
        filter.material = { $in: parseComma(materialName) };
      }

      if (sizeName) {
        filter.sizes = { $in: parseComma(sizeName) };
      }

      if (shapeName) {
        filter.shapes = { $in: parseComma(shapeName) };
      }

      if (templateName) {
        filter.template = { $in: parseComma(templateName) };
      }

      const products = await Products.find(filter);

      res.status(200).json({ products });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}