import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/lib/twitch";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || typeof q !== "string" || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid query parameter q" },
      { status: 400 }
    );
  }

  try {
    const result = await searchUsers(q.trim());
    return NextResponse.json(result);
  } catch (err) {
    console.error("Twitch search error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
