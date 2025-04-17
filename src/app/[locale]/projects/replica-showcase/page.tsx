import { getTranslations } from "@/lib/getTranslations"
import Link from "next/link"
import Image from "next/image"

type Demo = {
  title: string
  desc: string
  coverImage: string
  link: string
}

export default async function ReplicaShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations(params, "projects/replica-showcase")

  return (
    <main className="px-4 py-16 max-w-5xl mx-auto space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {t.demos.map((demo: Demo, idx: number) => (
          <Link key={idx} href={demo.link}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer py-3">
              <div className="relative w-full h-56">
                <Image
                  src={demo.coverImage}
                  alt={demo.title}
                  width={800}
                  height={0}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{demo.title}</h3>
                <p className="text-sm text-gray-600">{demo.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
