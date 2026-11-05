
"use client";

import { useEffect, useState } from "react";

interface Alert {
  alert_id: number;
  canteen_id: number;
  observation_id: number | null;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  is_resolved: number;
}

export default function AlertsClient() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await fetch("/api/alerts");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load alerts.");
        }

        setAlerts(data);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    loadAlerts();
  }, []);

  function severityStyle(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Crowd Alerts
        </h1>

        <p className="mb-8 text-gray-600">
          Monitor congestion alerts reported by the system.
        </p>

        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!error && alerts.length === 0 && (
          <div className="rounded-xl bg-white p-6 shadow">
            No alerts available.
          </div>
        )}

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-800">
                  {alert.alert_type.replaceAll("_", " ")}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${severityStyle(alert.severity)}`}
                >
                  {alert.severity}
                </span>
              </div>

              <p className="mb-3 text-gray-700">{alert.message}</p>

              <div className="text-sm text-gray-500">
                <p>Alert ID: {alert.alert_id}</p>
                <p>Observation ID: {alert.observation_id ?? "N/A"}</p>
                <p>
                  Created: {new Date(alert.created_at).toLocaleString()}
                </p>
                <p>
                  Status: {alert.is_resolved ? "Resolved" : "Unresolved"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
