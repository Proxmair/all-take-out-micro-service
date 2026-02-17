import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";

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
    const {
      materials,
      sizes,
      shapes,
      qualities,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20
    } = req.body;

    const filter = {};
    if (materials?.length) filter.materials = { $in: materials };
    if (sizes?.length) filter.sizes = { $in: sizes };
    if (shapes?.length) filter.shapes = { $in: shapes };
    if (qualities?.length) filter.qualities = { $in: qualities };

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
