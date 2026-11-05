import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getSession } from "@/lib/auth";

// GET: Retrieve all alerts
export async function GET() {
  try {
    // Verify login session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to view alerts." },
        { status: 401 }
      );
    }

    const [alerts] = await pool.query(
      `SELECT
        alert_id,
        canteen_id,
        observation_id,
        alert_type,
        severity,
        message,
        created_at,
        is_resolved
      FROM alerts
      ORDER BY created_at DESC`
    );

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);

    return NextResponse.json(
      { message: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
