import { NextRequest, NextResponse } from "next/server";
import { getStreams } from "@/lib/twitch";

export async function POST(request: NextRequest) {
  let body: { logins?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const logins = body.logins;
  if (!Array.isArray(logins)) {
    return NextResponse.json(
      { error: "Body must contain 'logins' array" },
      { status: 400 }
    );
  }

  const validLogins = logins
    .filter((l): l is string => typeof l === "string")
    .map((l) => l.trim())
    .filter(Boolean);

  try {
    const { live, offline, liveCount } = await getStreams(validLogins);
    return NextResponse.json({ live, offline, liveCount });
  } catch (err) {
    console.error("Twitch streams error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Streams fetch failed" },
      { status: 500 }
    );
  }
}
