import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    // Check whether the student is logged in
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to view analytics." },
        { status: 401 }
      );
    }

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

    // Canteen-wise daily statistics
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
