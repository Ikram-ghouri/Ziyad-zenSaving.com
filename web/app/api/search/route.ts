import { NextRequest, NextResponse } from "next/server";
import { getEditorialCatalog } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "")
    .toLowerCase()
    .slice(0, 100);
  const { posts } = await getEditorialCatalog();
  return NextResponse.json({
    posts: posts
      .filter((post) =>
        `${post.title} ${post.excerpt} ${post.category}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8),
  });
}
