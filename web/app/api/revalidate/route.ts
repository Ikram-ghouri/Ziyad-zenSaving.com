import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TAG = /^(wordpress|posts|pages|categories|site|stores|coupon-categories|post:[a-z0-9-]+|store:[a-z0-9-]+|coupon-category:[a-z0-9-]+)$/;

function secretMatches(provided: string | null) {
  const expected = process.env.WP_REVALIDATE_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!secretMatches(req.headers.get("x-revalidate-secret")))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let body: { tag?: unknown; tags?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // An empty body just revalidates everything.
  }
  const requested = [
    ...(typeof body.tag === "string" ? [body.tag] : []),
    ...(Array.isArray(body.tags) ? body.tags : []),
  ].filter((t): t is string => typeof t === "string" && ALLOWED_TAG.test(t));
  const tags = [...new Set(["wordpress", ...requested])];
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tags, now: Date.now() });
}
