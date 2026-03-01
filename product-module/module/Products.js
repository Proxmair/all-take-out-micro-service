import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  material: String,
  size: String,
  shape: String,
  quality: Number,
  price: Number,
}, { _id: false });

const DimensionSchema = new mongoose.Schema({
  xCordination: Number,
  yCordination: Number,
  scale: Number,
}, { _id: false });

const ProductsSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
  subCategoryId: String,

  name: { type: String, required: true },
  image: String,

  material: [String],
  sizes: [String],
  shapes: [String],
  qualities: [Number],

  originalSize: [String],      // as sent
  dimentions: [DimensionSchema],

  variants: [VariantSchema],

  quantity: { type: Number, default: 1 },
  misc: mongoose.Schema.Types.Mixed,

}, { timestamps: true });

export default mongoose.models.Products ||
  mongoose.model("Products", ProductsSchema);