
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";
import { calculateChaosScore } from "@/lib/chaos-score";
import { getSession } from "@/lib/auth";

// GET: Retrieve all crowd observations
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to view observations." },
        { status: 401 }
      );
    }

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
      { message: "Failed to fetch observations." },
      { status: 500 }
    );
  }
}

// POST: Submit a new crowd observation
export async function POST(request: NextRequest) {
  try {
    // Identify the logged-in student from the session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in before submitting a report." },
        { status: 401 }
      );
    }

    const reported_by = session.userId;
    const body = await request.json();

    const {
      canteen_id,
      counter_id,
      people_count,
      queue_length,
      wait_time_minutes,
    } = body;

    // Validate required IDs
    if (
      !Number.isInteger(canteen_id) ||
      (counter_id != null && !Number.isInteger(counter_id))
    ) {
      return NextResponse.json(
        { message: "Invalid canteen or counter ID." },
        { status: 400 }
      );
    }

    // Validate crowd values
    if (
      !Number.isFinite(people_count) ||
      !Number.isFinite(queue_length) ||
      !Number.isFinite(wait_time_minutes) ||
      people_count < 0 ||
      queue_length < 0 ||
      wait_time_minutes < 0
    ) {
      return NextResponse.json(
        { message: "Crowd values must be valid non-negative numbers." },
        { status: 400 }
      );
    }

    // Get canteen capacity
    const [canteens] = await pool.query<RowDataPacket[]>(
      "SELECT capacity FROM canteens WHERE canteen_id = ?",
      [canteen_id]
    );

    if (canteens.length === 0) {
      return NextResponse.json(
        { message: "Canteen not found." },
        { status: 404 }
      );
    }

    const capacity = Number(canteens[0].capacity);

    // Verify counter belongs to the selected canteen
    if (counter_id != null) {
      const [counters] = await pool.query<RowDataPacket[]>(
        "SELECT counter_id FROM counters WHERE counter_id = ? AND canteen_id = ?",
        [counter_id, canteen_id]
      );

      if (counters.length === 0) {
        return NextResponse.json(
          { message: "Counter not found for this canteen." },
          { status: 404 }
        );
      }
    }

    // Calculate Chaos Score
    const chaosScore = calculateChaosScore(
      people_count,
      queue_length,
      wait_time_minutes,
      capacity
    );

    // Save observation using the authenticated user's ID
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO observations
        (canteen_id, counter_id, reported_by, people_count,
         queue_length, wait_time_minutes, chaos_score)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        canteen_id,
        counter_id ?? null,
        reported_by,
        people_count,
        queue_length,
        wait_time_minutes,
        chaosScore,
      ]
    );

    // Generate an alert for serious crowd conditions
    if (chaosScore >= 51) {
      const severity = chaosScore >= 76 ? "CRITICAL" : "HIGH";

      const message =
        severity === "CRITICAL"
          ? "Critical crowd congestion detected! Immediate attention required."
          : "High crowd congestion detected. Please monitor the canteen.";

      await pool.execute(
        `INSERT INTO alerts
          (canteen_id, observation_id, alert_type, severity, message)
         VALUES (?, ?, ?, ?, ?)`,
        [
          canteen_id,
          result.insertId,
          "CROWD_CONGESTION",
          severity,
          message,
        ]
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Crowd observation submitted successfully.",
        data: {
          observation_id: result.insertId,
          reported_by,
          chaos_score: chaosScore,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting observation:", error);

    return NextResponse.json(
      { message: "Failed to submit crowd observation." },
      { status: 500 }
    );
  }
}
