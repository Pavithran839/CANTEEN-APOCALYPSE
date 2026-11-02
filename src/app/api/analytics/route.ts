
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    // Overall crowd statistics
    const [summary]: any = await pool.query(`
      SELECT
        COUNT(*) AS total_observations,
        ROUND(AVG(people_count), 2) AS avg_people_count,
        ROUND(AVG(wait_time_minutes), 2) AS avg_wait_time,
        ROUND(AVG(chaos_score), 2) AS avg_chaos_score,
        MAX(people_count) AS max_people_count
      FROM observations
    `);

    // Canteen-wise daily statistics from the existing view
    const [canteenStats] = await pool.query(`
      SELECT *
      FROM canteen_daily_summary
      ORDER BY summary_date DESC, canteen_id
    `);

    return NextResponse.json({
      status: "success",
      overall: summary[0],
      canteen_statistics: canteenStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      { message: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
//This API uses your existing SQL view and calculates overall statistics directly from observations.
