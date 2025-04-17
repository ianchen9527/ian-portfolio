// src/components/Footer.tsx
"use client"
import { usePathname } from "next/navigation"
import getIsDemo from "@/lib/getIsDemo"

export default function Footer() {
  const pathname = usePathname()
  const isDemo = getIsDemo(pathname)

  if (isDemo) return <></>

  return (
    <footer className="border-t border-black/10 py-6 mt-12 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Ian Chen. All rights reserved.
    </footer>
  )
}
