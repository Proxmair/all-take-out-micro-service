import mongoose from "mongoose";

const CategoriesSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        link: { type: String },
        subCategories: [
            {
                image: { type: String },
                title: { type: String },
                description: { type: String },
                link: { type: String },
                misc: { type: mongoose.Schema.Types.Mixed },
            }
        ],
        misc: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.models.Categories || mongoose.model("Categories", CategoriesSchema);
