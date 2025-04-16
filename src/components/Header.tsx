// src/components/Header.tsx
"use client"

import Link from "next/link"
import LocaleSwitcher from "@/components/LocaleSwitcher"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  const params = pathname.split("/").filter(Boolean)
  const locale = params[0] || "zh"
  const homeLink = `/${locale}`
  const aboutLink = `/${locale}/about`

  return (
    <header className="border-b border-black/10 py-6 mb-12">
      <nav className="max-w-3xl mx-auto px-4 flex justify-between items-center">
        <Link
          href={homeLink}
          className="text-3xl font-bold tracking-tight hover:opacity-80 transition"
        >
          Ian Chen
        </Link>
        <ul className="flex gap-6 text-xl font-medium">
          <li>
            <Link href={aboutLink} className="hover:underline">
              About
            </Link>
          </li>
          {/* more page here */}
        </ul>
        <LocaleSwitcher />
      </nav>
    </header>
  )
}
