import { connectDB } from "../../lib/mongodb.js";
import Products from "../../module/Products.js";

const ALLOWED_SORT_FIELDS = [
    "createdAt",
    "updatedAt",
    "basePrice",
    "name",
    "quantity"
];

export default async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
    try {
        await connectDB();

        const {
            materialName,
            sizeName,
            shapeName,
            templateName,
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            limit = 20
        } = req.body;

        const andFilters = [];

        // MATERIAL (OR inside, AND outside)
        if (materialName?.length) {
            andFilters.push({
                material: {
                    $elemMatch: {
                        name: { $in: Array.isArray(materialName) ? materialName : [materialName] }
                    }
                }
            });
        }

        // SIZE
        if (sizeName?.length) {
            andFilters.push({
                size: {
                    $elemMatch: {
                        name: { $in: Array.isArray(sizeName) ? sizeName : [sizeName] }
                    }
                }
            });
        }

        // SHAPE
        if (shapeName?.length) {
            andFilters.push({
                shape: {
                    $elemMatch: {
                        name: { $in: Array.isArray(shapeName) ? shapeName : [shapeName] }
                    }
                }
            });
        }

        // TEMPLATE
        if (templateName?.length) {
            andFilters.push({
                template: {
                    $elemMatch: {
                        name: { $in: Array.isArray(templateName) ? templateName : [templateName] }
                    }
                }
            });
        }

        const filterQuery = andFilters.length ? { $and: andFilters } : {};

        // SAFE SORTING
        const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
        const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

        // PAGINATION
        const pageNum = Math.max(parseInt(page), 1);
        const limitNum = Math.max(parseInt(limit), 1);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Products.find(filterQuery)
                .sort(sort)
                .skip(skip)
                .limit(limitNum),
            Products.countDocuments(filterQuery)
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
