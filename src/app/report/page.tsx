import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ObservationForm from "@/components/observations/ObservationForm";

export default async function ReportPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <ObservationForm />
    </main>
  );
}
