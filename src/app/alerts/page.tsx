
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AlertsClient from "./AlertsClient";

export default async function AlertsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <AlertsClient />;
}
