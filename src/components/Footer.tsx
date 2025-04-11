// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-black/10 py-12 mt-12 text-center text-5xl text-gray-500">
      © {new Date().getFullYear()} Ian Chen. All rights reserved.
    </footer>
  )
}
