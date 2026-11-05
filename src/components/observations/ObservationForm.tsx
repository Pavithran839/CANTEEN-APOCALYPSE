
"use client";

import { useEffect, useState } from "react";

interface Canteen {
  canteen_id: number;
  name: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
}

interface Counter {
  counter_id: number;
  canteen_id: number;
  counter_name: string;
  service_type: string;
  status: "OPEN" | "CLOSED";
}

export default function ObservationForm() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);

  const [canteenId, setCanteenId] = useState("");
  const [counterId, setCounterId] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [queueLength, setQueueLength] = useState("");
  const [waitTime, setWaitTime] = useState("");

  const [message, setMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load canteens and counters
  useEffect(() => {
    async function loadData() {
      try {
        const [canteensResponse, countersResponse] = await Promise.all([
          fetch("/api/canteens"),
          fetch("/api/counters"),
        ]);

        if (!canteensResponse.ok || !countersResponse.ok) {
          throw new Error("Unable to load form information.");
        }

        const canteensData = await canteensResponse.json();
        const countersData = await countersResponse.json();

        setCanteens(canteensData);
        setCounters(countersData);
      } catch (error) {
        setMessage((error as Error).message);
      }
    }

    loadData();
  }, []);

  // Get open counters belonging to the selected canteen
  const availableCounters = counters.filter(
    (counter) =>
      counter.canteen_id === Number(canteenId) &&
      counter.status === "OPEN"
  );

  // Submit crowd report
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setScore(null);

    try {
      const response = await fetch("/api/observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canteen_id: Number(canteenId),
          counter_id: Number(counterId),
          people_count: Number(peopleCount),
          queue_length: Number(queueLength),
          wait_time_minutes: Number(waitTime),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Report submission failed.");
      }

      setMessage("Crowd report submitted successfully!");
      setScore(Number(result.data.chaos_score));

      setCounterId("");
      setPeopleCount("");
      setQueueLength("");
      setWaitTime("");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function getStatus(value: number) {
    if (value <= 25) return "LOW";
    if (value <= 50) return "MODERATE";
    if (value <= 75) return "HIGH";
    return "CRITICAL";
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        Report Canteen Crowd
      </h1>

      <p className="mb-6 text-gray-600">
        Submit the current crowd and queue information.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Select Canteen
          </label>

          <select
            required
            value={canteenId}
            onChange={(e) => {
              setCanteenId(e.target.value);
              setCounterId("");
            }}
            className="w-full rounded-lg border border-gray-300 p-3"
          >
            <option value="">Choose a canteen</option>

            {canteens.map((canteen) => (
              <option key={canteen.canteen_id} value={canteen.canteen_id}>
                {canteen.name} (Capacity: {canteen.capacity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Select Counter
          </label>

          <select
            required
            value={counterId}
            onChange={(e) => setCounterId(e.target.value)}
            disabled={!canteenId || availableCounters.length === 0}
            className="w-full rounded-lg border border-gray-300 p-3 disabled:bg-gray-100"
          >
            <option value="">
              {!canteenId
                ? "Select a canteen first"
                : availableCounters.length === 0
                  ? "No open counters available"
                  : "Choose a counter"}
            </option>

            {availableCounters.map((counter) => (
              <option key={counter.counter_id} value={counter.counter_id}>
                {counter.counter_name} ({counter.service_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Current People Count
          </label>

          <input
            type="number"
            min="0"
            required
            value={peopleCount}
            onChange={(e) => setPeopleCount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Example: 50"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Queue Length
          </label>

          <input
            type="number"
            min="0"
            required
            value={queueLength}
            onChange={(e) => setQueueLength(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Example: 20"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Estimated Waiting Time (minutes)
          </label>

          <input
            type="number"
            min="0"
            required
            value={waitTime}
            onChange={(e) => setWaitTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Example: 10"
          />
        </div>

        <button
          type="submit"
          disabled={loading || canteens.length === 0 || !counterId}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Crowd Report"}
        </button>
      </form>

      {message && (
        <div className="mt-5 rounded-lg bg-gray-100 p-4 text-gray-800">
          {message}
        </div>
      )}

      {score !== null && (
        <div className="mt-4 rounded-lg border p-5 text-center">
          <p className="text-gray-600">Calculated Chaos Score</p>

          <p className="my-2 text-4xl font-bold text-blue-600">
            {score} / 100
          </p>

          <p className="font-semibold">
            Crowd Status: {getStatus(score)}
          </p>
        </div>
      )}
    </div>
  );
}
