import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    passwordHash: { type: String, required: true },
}, { timestamps: true });
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};
export const User = mongoose.model("User", UserSchema);
