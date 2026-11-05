
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

const modules = [
  {
    title: "Crowd Reporting",
    description: "Report current crowd levels, queue length and waiting time.",
    icon: "📊",
    href: "/report",
    color: "bg-blue-100",
  },
  {
    title: "Analytics",
    description: "Explore crowd statistics and canteen activity.",
    icon: "📈",
    href: "/analytics",
    color: "bg-purple-100",
  },
  {
    title: "Feedback",
    description: "Share your experience and suggestions.",
    icon: "💬",
    href: "/feedback",
    color: "bg-orange-100",
  },
  {
    title: "Notifications",
    description: "Check the latest canteen crowd alerts.",
    icon: "🔔",
    href: "/alerts",
    color: "bg-green-100",
  },
];

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="font-semibold tracking-wider text-blue-600">
            CANTEEN APOCALYPSE
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Student Dashboard
          </h1>

          <p className="mt-3 text-gray-600">
            Welcome, {session.name}! Stay informed about campus canteen
            crowd conditions and make smarter dining decisions.
          </p>
        </header>

        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Explore Services
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${module.color}`}
                >
                  {module.icon}
                </div>

                <h3 className="text-lg font-bold">
                  {module.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {module.description}
                </p>

                <p className="mt-5 font-semibold text-blue-600">
                  Open Module →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          Canteen Apocalypse — Campus Crowd Monitoring System
        </footer>
      </div>
    </main>
  );
}
