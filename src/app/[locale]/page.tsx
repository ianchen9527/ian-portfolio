import { getTranslations } from "@/lib/getTranslations"
import Link from "next/link"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations(params, "home")

  return (
    <main className="px-4 py-16 max-w-3xl mx-auto space-y-16">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">{t.projectsTitle}</h2>
        <ul className="space-y-4">
          {t.projects.map((project, i) => (
            <li
              key={i}
              className={`border p-4 rounded ${
                project.link
                  ? "hover:bg-gray-50 transition"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {project.link ? (
                <Link href={project.link}>
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-gray-500">{project.desc}</div>
                </Link>
              ) : (
                <>
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-gray-500">{project.desc}</div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
