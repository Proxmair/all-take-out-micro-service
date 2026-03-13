import mongoose from "mongoose";

const ProductsSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
  subCategoryId: String,
  image: String,
  material: String,
  sizes: String,
  shapes: String,
  qualities: String,
  name: String,
  originalSize: String,      
  dimentions: String,
  variants: String,
  misc: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.models.Products ||
  mongoose.model("Products", ProductsSchema);