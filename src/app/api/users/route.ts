import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getSession } from "@/lib/auth";

// GET: Retrieve all users (Admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to view users." },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only admins can access user information." },
        { status: 403 }
      );
    }

    const [users] = await pool.query(
      "SELECT user_id, name, email, role, created_at FROM users"
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
