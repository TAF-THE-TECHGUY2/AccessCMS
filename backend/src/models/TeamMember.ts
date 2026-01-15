import mongoose, { Schema, Document } from "mongoose";

export interface TeamMemberDoc extends Document {
  name: string;
  role: string;
  photoUrl?: string;
  bio?: string;
  socials: { label: string; url: string }[];
  order: number;
}

const TeamMemberSchema = new Schema<TeamMemberDoc>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    photoUrl: String,
    bio: String,
    socials: {
      type: [
        {
          label: String,
          url: String,
        },
      ],
      default: [],
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TeamMember = mongoose.model<TeamMemberDoc>(
  "TeamMember",
  TeamMemberSchema
);
