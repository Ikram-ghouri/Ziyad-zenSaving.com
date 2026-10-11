import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (query.length < 2) return NextResponse.json({ posts: [] });
  try {
    const { items } = await getPosts({ search: query, perPage: 5 });
    return NextResponse.json({
      posts: items.map(({ id, slug, title, category }) => ({
        id,
        slug,
        title,
        category,
      })),
    });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 502 });
  }
}
