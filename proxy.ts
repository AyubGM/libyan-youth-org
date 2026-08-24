import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Skip middleware if not an admin route
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token =
    request.cookies.get("admin-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return respondUnauthorized(isAdminApi, request);
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    return respondUnauthorized(isAdminApi, request);
  }
}

function respondUnauthorized(isAdminApi: boolean, request: NextRequest) {
  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
