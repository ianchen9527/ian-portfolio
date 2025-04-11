"use client"

import { usePathname, useRouter } from "next/navigation"

export default function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.startsWith("/zh") ? "zh" : "en"
  const nextLocale = currentLocale === "zh" ? "en" : "zh"

  const switchLocale = () => {
    const newPath = pathname.replace(/^\/(zh|en)/, `/${nextLocale}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={switchLocale}
      className="text-sm underline absolute top-4 right-4 cursor-pointer"
    >
      {nextLocale === "zh" ? "中文" : "English"}
    </button>
  )
}
