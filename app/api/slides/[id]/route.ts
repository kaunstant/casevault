import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Slide from "@/lib/models/Slide";

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

  if (slideDeckFile && slideDeckFile.size > 0) {
    // A new deck replaces the document pointers but leaves the record id intact.
    const deckBuffer = Buffer.from(await slideDeckFile.arrayBuffer());
    const deckMime = slideDeckFile.type || "application/pdf";
    const inlineDeckData = `data:${deckMime};base64,${deckBuffer.toString("base64")}`;
    
    updateFields.documentUrl = inlineDeckData;
    updateFields.slideUrl = inlineDeckData;
  }

  if (previewImageFile && previewImageFile.size > 0) {
    // Thumbnail replacement is optional and independent from deck replacement.
    const previewBuffer = Buffer.from(await previewImageFile.arrayBuffer());
    const previewMime = previewImageFile.type || "image/png";
    
    updateFields.previewImageUrl = `data:${previewMime};base64,${previewBuffer.toString("base64")}`;
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
  const { response } = await getOwnedSlide(id, userId);
  if (response) return response;

  await Slide.findByIdAndDelete(id);
  return NextResponse.json({ deleted: true });
}