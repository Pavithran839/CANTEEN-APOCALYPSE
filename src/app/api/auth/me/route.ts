import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      user_id: session.userId,
      name: session.name,
      role: session.role,
    },
  });
}
