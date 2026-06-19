import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Slide from "@/lib/models/Slide";
import fs from "fs";
import path from "path";

type SessionWithUserId = {
  user?: {
    id?: string;
  };
};

export async function POST(req: Request) {
  try {
    // Uploads must be attached to the signed-in user's Mongo record.
    const session = await getServerSession(authOptions) as SessionWithUserId | null;
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    await connectDB();
    const formData = await req.formData();

    // Metadata arrives from the client form while files are streamed separately.
    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const category = formData.get("category") as string;
    const year = Number(formData.get("year"));
    const competitionName = (formData.get("competitionName") as string) || "Case Competition";
    const teamName = formData.get("teamName") as string || "Team Alpha";
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];

    const previewImageFile = formData.get("previewImage") as File | null;
    const slideDeckFile = formData.get("slideDeck") as File | null;

    if (!previewImageFile || !slideDeckFile) {
      return NextResponse.json({ error: "Both a preview image and a slide deck file are required." }, { status: 400 });
    }

    // Local uploads are served from public/uploads during development.
    const previewDir = path.join(process.cwd(), "public", "uploads", "previews");
    const deckDir = path.join(process.cwd(), "public", "uploads", "decks");
    fs.mkdirSync(previewDir, { recursive: true });
    fs.mkdirSync(deckDir, { recursive: true });

    const previewFileName = `${Date.now()}_${previewImageFile.name.replace(/\s+/g, "_")}`;
    const previewBuffer = Buffer.from(await previewImageFile.arrayBuffer());
    fs.writeFileSync(path.join(previewDir, previewFileName), previewBuffer);

    const deckFileName = `${Date.now()}_${slideDeckFile.name.replace(/\s+/g, "_")}`;
    const deckBuffer = Buffer.from(await slideDeckFile.arrayBuffer());
    fs.writeFileSync(path.join(deckDir, deckFileName), deckBuffer);

    const previewImageUrl = `/uploads/previews/${previewFileName}`;
    const documentUrl = `/uploads/decks/${deckFileName}`;

    // Store both documentUrl and slideUrl so existing readers keep working.
    const newSlide = await Slide.create({
      title,
      summary,
      category,
      competitionName,
      year,
      previewImageUrl,
      slideUrl: documentUrl,
      documentUrl,
      teamName,
      tags,
      uploadedBy: userId,
    });

    return NextResponse.json(newSlide, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to upload slide.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
