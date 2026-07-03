import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const privatePrefixes = ["/app"];
const authPrefixes = ["/login", "/cadastro"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (!hasSupabaseEnv()) {
    return response;
  }

  const path = request.nextUrl.pathname;
  const isAuthenticated = Boolean(user);
  const isPrivateRoute = privatePrefixes.some((prefix) => path.startsWith(prefix));
  const isAuthRoute = authPrefixes.some((prefix) => path.startsWith(prefix));

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
