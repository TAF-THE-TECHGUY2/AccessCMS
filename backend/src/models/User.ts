import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserDoc extends Document {
  email: string;
  name: string;
  role: "admin" | "editor";
  passwordHash: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<UserDoc>("User", UserSchema);
