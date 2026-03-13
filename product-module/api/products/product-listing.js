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

      const parseValues = (value) => {
        if (!value) return [];

        let cleaned = value.trim();

        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
          cleaned = cleaned.slice(1, -1);
        }

        return cleaned
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      };

      const buildFilter = (field, value) => {
        const values = parseValues(value);
        if (!values.length) return;

        filter.$or = filter.$or || [];

        values.forEach((v) => {
          filter.$or.push({ [field]: v });
          filter.$or.push({ [field]: { $regex: `"${v}"`, $options: "i" } });
        });
      };

      if (materialName) buildFilter("material", materialName);
      if (sizeName) buildFilter("sizes", sizeName);
      if (shapeName) buildFilter("shapes", shapeName);
      if (templateName) buildFilter("template", templateName);

      const products = await Products.find(filter);

      res.status(200).json({ products });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}