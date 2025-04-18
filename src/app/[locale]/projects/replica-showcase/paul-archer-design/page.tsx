import { getTranslations } from "@/lib/getTranslations"
import Link from "next/link"
import Image from "next/image"

export default async function PaulArcherDesignPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations(
    params,
    "projects/replica-showcase/paul-archer-design"
  )

  const demoButton = () => {
    return (
      <Link href={t.demoLink} target="_blank">
        <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer">
          {t.demoButton}
        </button>
      </Link>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 space-y-12">
      <div className="text-center mb-8">{demoButton()}</div>
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-gray-600">{t.desc}</p>
        <div className="relative w-full">
          <Image
            src={t.coverImage}
            alt="Paul Archer Cover"
            width={800}
            height={0}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t.skillTitle}</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {t.skills.map((skill: string, idx: number) => (
            <li key={idx} className="text-sm">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t.originalTitle}</h2>
        <p className="text-gray-700 text-sm">{t.originalDesc}</p>
        <a
          href={t.originalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 underline break-words"
        >
          {t.originalLink}
        </a>
      </section>

      <section className="space-y-2 text-gray-700 text-sm">
        <p className="text-gray-500">{t.disclaimer}</p>
      </section>

      <div className="text-center mt-8">{demoButton()}</div>
    </main>
  )
}
