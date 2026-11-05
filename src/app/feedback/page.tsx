
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import FeedbackClient from "./FeedbackClient";

export default async function FeedbackPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "STUDENT") {
    redirect("/");
  }

  return <FeedbackClient />;
}
