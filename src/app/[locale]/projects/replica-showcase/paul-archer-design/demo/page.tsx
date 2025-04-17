export default function PaulArcherDesignDemoPage() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen bg-black text-white flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Architecture. Design. Urbanism.
        </h1>
        <p className="mt-6 text-lg max-w-xl">
          An award-winning London-based architecture and design practice.
        </p>
      </section>

      {/* About Section */}
      <section className="py-24 max-w-3xl mx-auto px-6 text-center space-y-6">
        {/* 這裡之後放 Who We Are 介紹 */}
      </section>

      {/* Projects Section */}
      <section className="py-24 space-y-24">
        {/* 這裡之後放交錯排列的 Project Cards */}
      </section>

      {/* Clients Section */}
      <section className="py-24 max-w-6xl mx-auto px-6 text-center space-y-8">
        {/* 這裡之後放 client logo 排列 */}
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white py-12 text-center text-sm">
        &copy; {new Date().getFullYear()} Paul Archer Design (Replica)
      </footer>
    </main>
  )
}
