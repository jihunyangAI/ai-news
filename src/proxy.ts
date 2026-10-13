import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// "/" renders the sign-in modal for signed-out users, so it must stay reachable.
const isPublicRoute = createRouteMatcher(["/"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId } = await auth();
  if (userId) return;

  if (isApiRoute(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/", req.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
