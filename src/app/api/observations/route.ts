
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

// GET: Retrieve all crowd observations
export async function GET() {
  try {
    const [observations] = await pool.query(
      `SELECT
        observation_id,
        canteen_id,
        counter_id,
        reported_by,
        people_count,
        queue_length,
        wait_time_minutes,
        chaos_score,
        observed_at
      FROM observations
      ORDER BY observed_at DESC`
    );

    return NextResponse.json(observations);
  } catch (error) {
    console.error("Error fetching observations:", error);

    return NextResponse.json(
      { message: "Failed to fetch observations" },
      { status: 500 }
    );
  }
}
