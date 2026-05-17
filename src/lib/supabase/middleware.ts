import { type NextRequest, NextResponse } from "next/server";

const protectedPathPrefixes = [
  "/availability",
  "/dashboard",
  "/deadlines",
  "/files",
  "/flashcards",
  "/plan",
  "/practice",
  "/quizzes",
  "/sessions",
  "/subjects",
];

function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthPath = pathname === "/login" || pathname === "/signup";
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

  if (!isProtectedPath(pathname) && !isAuthPath) {
    return NextResponse.next({ request });
  }

  if (!hasAuthCookie && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasAuthCookie && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
