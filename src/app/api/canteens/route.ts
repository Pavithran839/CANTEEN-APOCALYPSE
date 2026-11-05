
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

// GET: Retrieve all canteens
export async function GET() {
  try {
    const [canteens] = await pool.query(
      `SELECT canteen_id, name, location, capacity, status,
              created_at, contact_number
       FROM canteens
       ORDER BY canteen_id`
    );

    return NextResponse.json(canteens);
  } catch (error) {
    console.error("Error fetching canteens:", error);

    return NextResponse.json(
      { message: "Failed to fetch canteens" },
      { status: 500 }
    );
  }
}
