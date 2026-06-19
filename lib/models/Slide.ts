import { Schema, model, models } from "mongoose";

// Slide documents store both the public metadata and local asset URLs for a case deck.
const SlideSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    category: { type: String, required: true },
    competitionName: { type: String, required: true },
    year: { type: Number, required: true },
    slideUrl: { type: String, required: true },
    documentUrl: { type: String, default: "" },
    previewImageUrl: { type: String, required: true },
    teamName: { type: String, default: "Team Alpha" },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Re-registering the model keeps Next.js hot reload from throwing overwrite errors.
if (models.Slide) { delete (models as any).Slide; }
const Slide = model("Slide", SlideSchema);
export default Slide;
