
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

// POST: Submit a new crowd observation and update its notification
export async function POST(request: NextRequest) {
  try {
    // Identify the logged-in student
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in before submitting a report." },
        { status: 401 }
      );
    }
    if (session.role !== "STUDENT") {
  return NextResponse.json(
    { message: "Only students can submit crowd reports." },
    { status: 403 }
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

    // Validate IDs
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
        `SELECT counter_id FROM counters
         WHERE counter_id = ? AND canteen_id = ?`,
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

    // Determine notification severity and message
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    let message: string;

   if (chaosScore <= 25) {
  severity = "LOW";
  message =
    "Good news! This canteen is currently not crowded. You can visit now.";
} else if (chaosScore <= 50) {
  severity = "MEDIUM";
  message =
    "This canteen has a moderate crowd. You can visit, but expect some waiting.";
} else if (chaosScore <= 75) {
  severity = "HIGH";
  message =
    "This canteen is very crowded. We recommend visiting another canteen to avoid long waiting times.";
} else {
  severity = "CRITICAL";
  message =
    "This canteen is extremely crowded. Please avoid visiting it for now and choose another canteen.";
}

    // Start transaction
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Lock the canteen to prevent simultaneous duplicate notifications
      await connection.query(
        `SELECT canteen_id
         FROM canteens
         WHERE canteen_id = ?
         FOR UPDATE`,
        [canteen_id]
      );

      // Insert the crowd observation
      const [result] = await connection.execute<ResultSetHeader>(
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

      // Find existing active crowd notifications
      const [activeAlerts] = await connection.query<RowDataPacket[]>(
        `SELECT alert_id
         FROM alerts
         WHERE canteen_id = ?
           AND alert_type = 'CROWD_CONGESTION'
           AND is_resolved = 0
         ORDER BY created_at DESC, alert_id DESC
         FOR UPDATE`,
        [canteen_id]
      );

      if (activeAlerts.length > 0) {
        // Update the latest existing active notification
        const existingAlertId = activeAlerts[0].alert_id;

        await connection.execute(
          `UPDATE alerts
           SET observation_id = ?,
               severity = ?,
               message = ?,
               is_resolved = 0
           WHERE alert_id = ?`,
          [
            result.insertId,
            severity,
            message,
            existingAlertId,
          ]
        );

        // Resolve older duplicate active notifications
        await connection.execute(
          `UPDATE alerts
           SET is_resolved = 1
           WHERE canteen_id = ?
             AND alert_type = 'CROWD_CONGESTION'
             AND is_resolved = 0
             AND alert_id != ?`,
          [canteen_id, existingAlertId]
        );
      } else {
        // Create a notification if none is currently active
        await connection.execute(
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

      await connection.commit();

      return NextResponse.json(
        {
          status: "success",
          message: "Crowd observation and notification updated successfully.",
          data: {
            observation_id: result.insertId,
            reported_by,
            chaos_score: chaosScore,
            severity:
              severity === "MEDIUM" ? "MODERATE" : severity,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error submitting observation:", error);

    return NextResponse.json(
      { message: "Failed to submit crowd observation." },
      { status: 500 }
    );
  }
}
