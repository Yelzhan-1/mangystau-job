import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const role = request.cookies.get("mj_role")?.value;
  const admin = request.cookies.get("mj_admin")?.value;

  const hasAdminAccess = role === "admin" && admin === "true";

  if (hasAdminAccess) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json(
      {
        error: "Admin access required.",
      },
      { status: 401 }
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("admin", "1");

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};