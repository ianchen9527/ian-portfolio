import { getTranslations } from "@/lib/getTranslations"
import Link from "next/link"

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations(params, "projects")

  return (
    <main className="px-4 py-16 max-w-3xl mx-auto space-y-16">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </section>

      <section className="space-y-6">
        <ul className="space-y-4">
          {t.projects.map((project, i) => (
            <li
              key={i}
              className="border p-4 rounded hover:bg-gray-50 hover:shadow-md transition"
            >
              <Link href={project.link}>
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-gray-500">{project.desc}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
