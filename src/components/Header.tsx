// src/components/Header.tsx
"use client"

import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-black/10 py-6 mb-12">
      <nav className="max-w-3xl mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-7xl font-bold tracking-tight hover:opacity-80 transition"
        >
          Ian Chen
        </Link>
        <ul className="flex gap-6 text-6xl font-medium">
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
          {/* 之後可以加更多頁面 */}
        </ul>
      </nav>
    </header>
  )
}
