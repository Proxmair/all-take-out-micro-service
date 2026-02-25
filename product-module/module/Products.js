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
  scale: Number,
  misc: mongoose.Schema.Types.Mixed,
}, { _id: false });

const ProductsSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
  subCategoryId: { type: String },
  name: { type: String, required: true },
  image: { type: String },
  material: [
    {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
      misc: mongoose.Schema.Types.Mixed,
    }
  ],
  size: [
    {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
      misc: mongoose.Schema.Types.Mixed,
    }
  ],
  shape: [
    {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
      misc: mongoose.Schema.Types.Mixed,
    }
  ],
  template: [
    {
      name: String,
      priceChangeFactor: Number,
      priceChangeType: String,
      misc: mongoose.Schema.Types.Mixed,
    }
  ],
  templateDragSize: [TemplateDragSizeSchema],
  quantity: { type: Number, default: 1 },
  misc: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.models.Products || mongoose.model("Products", ProductsSchema);

