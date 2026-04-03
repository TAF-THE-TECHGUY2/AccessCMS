import mongoose, { Schema } from "mongoose";
const TeamMemberSchema = new Schema({
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
}, { timestamps: true });
export const TeamMember = mongoose.model("TeamMember", TeamMemberSchema);
