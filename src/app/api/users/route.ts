
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

// GET: Retrieve all users
export async function GET() {
  try {
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
/*What this code does:
- Connects to MySQL.
- Retrieves all users from the users table.
- Returns the records as JSON.
- Excludes password_hash for security.
*/
