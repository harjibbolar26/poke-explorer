import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const cfStatus = request.headers.get("cf-cache-status");
  response.headers.set("x-cache-status", cfStatus === "HIT" ? "HIT" : "MISS");

  if (request.nextUrl.pathname === "/" && request.method === "GET") {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
