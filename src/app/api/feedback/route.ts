
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(
      process.env.MONGODB_DB || "canteen_apocalypse"
    );

    const feedback = await db
      .collection("feedback")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback fetch error:", error);

    return NextResponse.json(
      { message: "Failed to fetch feedback." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user_id, canteen_id, rating, comments } = body;

    if (
      !Number.isInteger(user_id) ||
      !Number.isInteger(canteen_id) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      (comments !== undefined && typeof comments !== "string")
    ) {
      return NextResponse.json(
        { message: "Invalid feedback details." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(
      process.env.MONGODB_DB || "canteen_apocalypse"
    );

    const result = await db.collection("feedback").insertOne({
      user_id,
      canteen_id,
      rating,
      comments: comments?.trim() || "",
      created_at: new Date(),
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Feedback submitted successfully.",
        feedback_id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback submission error:", error);

    return NextResponse.json(
      { message: "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
/*
It provides GET and POST endpoints for MongoDB feedback. Students can submit a 1–5 star rating 
with comments, and the API stores and retrieves feedback
*/
