"use client"
import { usePathname } from "next/navigation"
import getIsDemo from "@/lib/getIsDemo"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDemoPage = getIsDemo(pathname)

  return (
    <>
      {isDemoPage ? (
        <main>{children}</main>
      ) : (
        <main className="max-w-3xl mx-auto px-4 py-10">{children}</main>
      )}
    </>
  )
}
