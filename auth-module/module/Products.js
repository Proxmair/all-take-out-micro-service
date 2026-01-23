import mongoose from "mongoose";

const ProductsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        material: [
            {
                name: { type: String },
                priceChangeFactor: { type: Number },
                priceChangeType: { type: String, enum: ["fixed", "percentage"] },
                misc: { type: mongoose.Schema.Types.Mixed },
            }
        ],
        size: [
            {
                name: { type: String },
                priceChangeFactor: { type: Number },
                priceChangeType: { type: String, enum: ["fixed", "percentage"] },
                misc: { type: mongoose.Schema.Types.Mixed },
            }
        ],
        shape: [
            {
                name: { type: String },
                priceChangeFactor: { type: Number },
                priceChangeType: { type: String, enum: ["fixed", "percentage"] },
                misc: { type: mongoose.Schema.Types.Mixed },
            }
        ],
        template: [
            {
                name: { type: String },
                priceChangeFactor: { type: Number },
                priceChangeType: { type: String, enum: ["fixed", "percentage"] },
                misc: { type: mongoose.Schema.Types.Mixed },
            }
        ],
        templateDragSize: [{
            xCordination: { type: Number },
            yCordination: { type: Number },
            scale: { type: Number  },
            misc: { type: mongoose.Schema.Types.Mixed },
        }],
        quantity: { type: Number, default: 1 },
        misc: { type: mongoose.Schema.Types.Mixed },
        basePrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
    },
    { timestamps: true }
);
export default mongoose.models.Products || mongoose.model("Products", ProductsSchema);

