
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";
import { getSession } from "@/lib/auth";

function getRoleBasedMessage(severity: string, role: string) {
  const messages: Record<string, Record<string, string>> = {
    STUDENT: {
      LOW: "Good news! This canteen is not crowded. It's a good time to visit!",
      MEDIUM:
        "This canteen has a moderate crowd. You can visit, but expect some waiting.",
      HIGH:
        "This canteen is very crowded. We recommend visiting another canteen to avoid long waiting times.",
      CRITICAL:
        "This canteen is extremely crowded. Please avoid visiting it for now and choose another canteen.",
    },
    ADMIN: {
      LOW: "Crowd levels are low. Normal canteen operations can continue.",
      MEDIUM: "Moderate crowd detected. Please monitor the situation.",
      HIGH: "High crowd congestion detected. Please monitor the canteen.",
      CRITICAL:
        "Critical crowd congestion detected! Immediate attention is required.",
    },
  };

  return messages[role]?.[severity] ?? "Crowd alert information is unavailable.";
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to view alerts." },
        { status: 401 }
      );
    }

    const role = session.role.toUpperCase();

    if (role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.json(
        { message: "You are not authorized to view alerts." },
        { status: 403 }
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

    const roleBasedAlerts = (alerts as RowDataPacket[]).map((alert) => ({
      ...alert,
      message:
        alert.alert_type === "CROWD_CONGESTION"
          ? getRoleBasedMessage(alert.severity, role)
          : alert.message,
    }));

    return NextResponse.json(roleBasedAlerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);

    return NextResponse.json(
      { message: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
