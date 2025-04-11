// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-black/10 py-6 mt-12 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Ian Chen. All rights reserved.
    </footer>
  )
}
