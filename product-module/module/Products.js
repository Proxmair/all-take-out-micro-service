import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  material: String,
  size: String,
  shape: String,
  quality: Number,
  price: Number,
}, { _id: false });

const TemplateDragSizeSchema = new mongoose.Schema({
  xCordination: Number,
  yCordination: Number,
  width: Number,
  height: Number,
  rotate: Number,
}, { _id: false });

const ImageSizeSchema = new mongoose.Schema({
  renderedWidth: Number,
  renderedHeight: Number,
}, { _id: false });

const ProductsSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
  subCategoryId: { type: String },
  name: { type: String, required: true },
  materials: [String],
  sizes: [String],
  shapes: [String],
  qualities: [Number],
  image: { type: String }, // store file path or URL
  imageSize: ImageSizeSchema,
  variants: [VariantSchema],
  templateDragSize: [TemplateDragSizeSchema],
}, { timestamps: true });

export default mongoose.models.Products || mongoose.model("Products", ProductsSchema);

