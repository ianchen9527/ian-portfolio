import { getTranslations } from "@/lib/getTranslations"

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations(params, "about")

  return (
    <>
      <section className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">{t.contact.title}</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>{t.contact.name}</li>
            <li>{t.contact.phone}</li>
            <li>
              LinkedIn：
              <a
                href="https://www.linkedin.com/in/ian-chen-b8b458140"
                className="underline break-all"
              >
                {t.contact.linkedin}
              </a>
            </li>
            <li>
              GitHub：
              <a
                href="https://github.com/ianchen9527"
                className="underline break-all"
              >
                {t.contact.github}
              </a>
            </li>
          </ul>
        </section>

        {/* 技能列表 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t.skills.title}</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {t.skills.items.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </section>

        {/* 學歷 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t.education.title}</h2>
          <ul className="space-y-2 text-sm">
            {t.education.items.map((edu, i) => (
              <li key={i}>
                <strong>{edu.school}</strong> - {edu.desc}
              </li>
            ))}
          </ul>
        </section>

        {/* 經歷 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">{t.experience.title}</h2>

          {t.experience.jobs.map((job, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-500">
                {job.period} ｜{" "}
                <a href={job.url} className="underline">
                  {job.domain}
                </a>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {job.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </section>
    </>
  )
}
