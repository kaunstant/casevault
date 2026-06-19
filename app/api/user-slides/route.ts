import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Slide from "@/lib/models/Slide";

type SessionWithUserId = {
  user?: {
    id?: string;
  };
};

export async function GET() {
  // Profile only needs the decks owned by the current session user.
  const session = await getServerSession(authOptions) as SessionWithUserId | null;
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json([], { status: 401 });
  await connectDB();

  // Newest uploads appear first in the dashboard.
  const data = await Slide.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  return NextResponse.json(data);
}
