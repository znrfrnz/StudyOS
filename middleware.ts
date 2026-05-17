import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/availability/:path*",
    "/dashboard/:path*",
    "/deadlines/:path*",
    "/files/:path*",
    "/flashcards/:path*",
    "/login",
    "/plan/:path*",
    "/practice/:path*",
    "/quizzes/:path*",
    "/sessions/:path*",
    "/signup",
    "/subjects/:path*",
  ],
};
