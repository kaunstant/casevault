import { Schema, model, models } from "mongoose";

// OAuth users are mirrored locally so uploaded decks can reference a stable owner id.
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

// Re-registering the model keeps Next.js hot reload from throwing overwrite errors.
if (models.User) {
  delete (models as any).User;
}

const User = model("User", UserSchema);
export default User;
