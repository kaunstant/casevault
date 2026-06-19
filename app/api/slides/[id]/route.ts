import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Slide from "@/lib/models/Slide";
import fs from "fs";
import path from "path";

type SlideRouteContext = {
  params: Promise<{ id: string }>;
};

type SessionWithUserId = {
  user?: {
    id?: string;
  };
};

type OwnedSlide = {
  uploadedBy: {
    toString: () => string;
  };
  previewImageUrl?: string;
  documentUrl?: string;
  slideUrl?: string;
};

type OwnedSlideResult = {
  slide?: OwnedSlide;
  response?: NextResponse;
};

async function getOwnedSlide(id: string, userId: string): Promise<OwnedSlideResult> {
  await connectDB();
  const slide = await Slide.findById(id) as OwnedSlide | null;

  if (!slide) {
    return { response: NextResponse.json({ error: "Slide document not found" }, { status: 404 }) };
  }

  // Every mutation on this route is owner-scoped.
  if (slide.uploadedBy.toString() !== userId) {
    return { response: NextResponse.json({ error: "Unauthorized access path blocked" }, { status: 403 }) };
  }

  return { slide };
}

function deleteLocalUpload(assetUrl?: string) {
  // Only delete files the app created under public/uploads.
  if (!assetUrl || !assetUrl.startsWith("/uploads/")) return;

  const filePath = path.join(process.cwd(), "public", assetUrl.replace(/^\/+/, ""));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function GET(_req: Request, context: SlideRouteContext) {
  // The update page uses this endpoint to hydrate editable form fields.
  const session = await getServerSession(authOptions) as SessionWithUserId | null;
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Access Denied" }, { status: 401 });
  }

  const { id } = await context.params;
  const { slide, response } = await getOwnedSlide(id, userId);
  if (response) return response;

  return NextResponse.json(slide);
}

export async function PUT(req: Request, context: SlideRouteContext) {
  // Updates preserve locked fields like category, team, and ownership.
  const session = await getServerSession(authOptions) as SessionWithUserId | null;
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Access Denied" }, { status: 401 });
  }

  const { id } = await context.params;
  const { response } = await getOwnedSlide(id, userId);
  if (response) return response;

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const year = Number(formData.get("year"));
  const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];

  const slideDeckFile = formData.get("slideDeck") as File | null;
  const previewImageFile = formData.get("previewImage") as File | null;

  // Only editable metadata is patched here.
  const updateFields: Record<string, unknown> = { title, summary, year, tags };

  if (slideDeckFile) {
    // A new deck replaces the document pointers but leaves the record id intact.
    const deckDir = path.join(process.cwd(), "public", "uploads", "decks");
    fs.mkdirSync(deckDir, { recursive: true });
    const deckFileName = `${Date.now()}_${slideDeckFile.name.replace(/\s+/g, "_")}`;
    fs.writeFileSync(path.join(deckDir, deckFileName), Buffer.from(await slideDeckFile.arrayBuffer()));
    
    updateFields.documentUrl = `/uploads/decks/${deckFileName}`;
    updateFields.slideUrl = `/uploads/decks/${deckFileName}`;
  }

  if (previewImageFile) {
    // Thumbnail replacement is optional and independent from deck replacement.
    const previewDir = path.join(process.cwd(), "public", "uploads", "previews");
    fs.mkdirSync(previewDir, { recursive: true });
    const previewFileName = `${Date.now()}_${previewImageFile.name.replace(/\s+/g, "_")}`;
    fs.writeFileSync(path.join(previewDir, previewFileName), Buffer.from(await previewImageFile.arrayBuffer()));
    
    updateFields.previewImageUrl = `/uploads/previews/${previewFileName}`;
  }

  const updated = await Slide.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: SlideRouteContext) {
  // Deleting removes the database record and any local upload files we own.
  const session = await getServerSession(authOptions) as SessionWithUserId | null;
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Access Denied" }, { status: 401 });
  }

  const { id } = await context.params;
  const { slide, response } = await getOwnedSlide(id, userId);
  if (response) return response;

  deleteLocalUpload(slide?.previewImageUrl);
  deleteLocalUpload(slide?.documentUrl || slide?.slideUrl);

  await Slide.findByIdAndDelete(id);
  return NextResponse.json({ deleted: true });
}
