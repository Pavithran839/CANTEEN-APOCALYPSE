
"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  total_observations: number;
  avg_people_count: number | null;
  avg_wait_time: number | null;
  avg_chaos_score: number | null;
  max_people_count: number | null;
}

interface CanteenStat {
  canteen_id: number;
  canteen_name: string;
  summary_date: string;
  avg_people_count: number;
  avg_wait_time: number;
  max_people_count: number;
  avg_chaos_score: number;
}

export default function AnalyticsPage() {
  const [overall, setOverall] = useState<AnalyticsData | null>(null);
  const [canteens, setCanteens] = useState<CanteenStat[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load analytics.");
        }

        setOverall(result.overall);
        setCanteens(result.canteen_statistics);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    loadAnalytics();
  }, []);

  const cards = [
    { label: "Total Observations", value: overall?.total_observations ?? 0 },
    { label: "Average People", value: overall?.avg_people_count ?? 0 },
    { label: "Average Waiting Time", value: `${overall?.avg_wait_time ?? 0} min` },
    { label: "Average Chaos Score", value: overall?.avg_chaos_score ?? 0 },
    { label: "Maximum Crowd", value: overall?.max_people_count ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Canteen Analytics
        </h1>

        <p className="mb-8 text-gray-600">
          Overview of crowd observations and canteen statistics.
        </p>

        {error && (
          <p className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!overall && !error && <p>Loading analytics...</p>}

        {overall && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div key={card.label} className="rounded-xl bg-white p-6 shadow">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-10 rounded-xl bg-white p-6 shadow">
              <h2 className="mb-5 text-xl font-bold text-gray-800">
                Canteen-wise Daily Statistics
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">Canteen</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Avg People</th>
                      <th className="p-3">Avg Wait (min)</th>
                      <th className="p-3">Max People</th>
                      <th className="p-3">Avg Chaos Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canteens.map((item, index) => (
                      <tr key={`${item.canteen_id}-${item.summary_date}-${index}`} className="border-b">
                        <td className="p-3">{item.canteen_name}</td>
                        <td className="p-3">
                          {String(item.summary_date).slice(0, 10)}
                        </td>
                        <td className="p-3">{item.avg_people_count}</td>
                        <td className="p-3">{item.avg_wait_time}</td>
                        <td className="p-3">{item.max_people_count}</td>
                        <td className="p-3 font-semibold">{item.avg_chaos_score}</td>
                      </tr>
                    ))}

                    {canteens.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          No canteen statistics available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
