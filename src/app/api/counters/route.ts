
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

// GET: Retrieve all counters
export async function GET() {
  try {
    const [counters] = await pool.query(
      `SELECT counter_id, canteen_id, counter_name,
              service_type, status
       FROM counters
       ORDER BY canteen_id, counter_id`
    );

    return NextResponse.json(counters);
  } catch (error) {
    console.error("Error fetching counters:", error);

    return NextResponse.json(
      { message: "Failed to fetch counters" },
      { status: 500 }
    );
  }
}
