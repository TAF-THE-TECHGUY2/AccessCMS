import fs from "fs";
import path from "path";
import { connectDb } from "../config/db.js";
import { FAQ } from "../models/FAQ.js";
async function main() {
    await connectDb();
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 }).lean();
    const out = path.resolve(process.cwd(), "faq-export.json");
    fs.writeFileSync(out, JSON.stringify(faqs, null, 2), "utf-8");
    console.log(`Exported ${faqs.length} faqs to ${out}`);
    process.exit(0);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
