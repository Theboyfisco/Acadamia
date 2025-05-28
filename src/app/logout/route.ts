import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Redirect to sign-in page after logout
  return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL));
} 