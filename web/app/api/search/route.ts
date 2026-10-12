import { NextRequest, NextResponse } from "next/server";
import { getPosts, getStores } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (query.length < 2) return NextResponse.json({ posts: [], stores: [] });
  try {
    const [posts, stores] = await Promise.all([
      getPosts({ search: query, perPage: 4 }),
      getStores({ search: query, perPage: 4 }),
    ]);
    return NextResponse.json({
      stores: stores.items.map(({ id, slug, name }) => ({ id, slug, name })),
      posts: posts.items.map(({ id, slug, title, category }) => ({
        id,
        slug,
        title,
        category,
      })),
    });
  } catch {
    return NextResponse.json({ posts: [], stores: [] }, { status: 502 });
  }
}
