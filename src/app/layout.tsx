// src/app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Ian Chen | Portfolio",
  description: "Frontend engineer and product thinker.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="text-base text-black bg-white font-medium leading-relaxed">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
