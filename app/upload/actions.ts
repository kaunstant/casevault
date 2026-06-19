"use server";

import connectDB from "@/lib/db";
import Slide from "@/lib/models/Slide";
import User from "@/lib/models/User";
import { redirect } from "next/navigation";

export async function createCaseStudy(formData: FormData) {
  await connectDB();

  // This action is kept for server-action experiments and uses the first seeded user.
  const defaultUser = await User.findOne({});
  if (!defaultUser) {
    throw new Error("No users found in database. Please seed the database first.");
  }

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const category = formData.get("category") as string;
  const yearStr = formData.get("year") as string;
  const competitionName = formData.get("competitionName") as string;
  const teamName = formData.get("teamName") as string;
  const tagsRaw = formData.get("tags") as string;
  
  // Server actions can read File objects directly from form data.
  const imageFile = formData.get("previewImage") as File;
  let previewImageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60";

  if (imageFile && imageFile.size > 0) {
    // Store a compact inline preview for the legacy action path.
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    previewImageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
  }

  // The main upload API stores JSON tags; this action accepts the older comma string.
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(t => t.length > 0) : [];

  if (!title || !summary || !category || !yearStr) {
    throw new Error("Please complete all required fields.");
  }

  await Slide.create({
    title,
    summary,
    category,
    year: parseInt(yearStr, 10),
    competitionName: competitionName || "Global Challenge",
    teamName: teamName || "Team Alpha",
    tags,
    previewImageUrl,
    slideUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    uploadedBy: defaultUser._id,
  });

  redirect("/");
}
