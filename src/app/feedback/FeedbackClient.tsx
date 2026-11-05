
"use client";

import { useState } from "react";

interface Canteen {
  canteen_id: number;
  name: string;
}

export default function FeedbackClient() {
  const [canteens] = useState<Canteen[]>([
    { canteen_id: 1, name: "Main Canteen" },
    { canteen_id: 2, name: "Food Court" },
    { canteen_id: 3, name: "North Canteen" },
  ]);

  const [canteenId, setCanteenId] = useState("");
  const [rating, setRating] = useState("5");
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canteen_id: Number(canteenId),
          rating: Number(rating),
          comments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Feedback submission failed.");
      }

      setMessage("Feedback submitted successfully!");
      setCanteenId("");
      setRating("5");
      setComments("");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Canteen Feedback
        </h1>

        <p className="mb-6 text-gray-600">
          Share your experience and help improve our canteen services.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">Select Canteen</label>
            <select
              required
              value={canteenId}
              onChange={(e) => setCanteenId(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Choose a canteen</option>
              {canteens.map((canteen) => (
                <option key={canteen.canteen_id} value={canteen.canteen_id}>
                  {canteen.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Very Poor</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your experience..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !canteenId}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-4 text-gray-800">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
