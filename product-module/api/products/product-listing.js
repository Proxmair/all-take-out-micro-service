import formidable from "formidable";
import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_SORT_FIELDS = [
    "createdAt",
    "updatedAt",
    "name"
];

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
    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }
      // Filters for listing
      const { materials, sizes, shapes, qualities, sortBy, sortOrder, page, limit } = fields;
      const filter = {};
      if (materials) filter.materials = { $in: JSON.parse(materials) };
      if (sizes) filter.sizes = { $in: JSON.parse(sizes) };
      if (shapes) filter.shapes = { $in: JSON.parse(shapes) };
      if (qualities) filter.qualities = { $in: JSON.parse(qualities) };
      const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
      const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
      const pageNum = Math.max(parseInt(page || 1), 1);
      const limitNum = Math.max(parseInt(limit || 20), 1);
      const skip = (pageNum - 1) * limitNum;
      const [products, total] = await Promise.all([
        Products.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Products.countDocuments(filter)
      ]);
      res.status(200).json({
        products,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
