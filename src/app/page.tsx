import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-6">

        <div className="inline-block bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm px-3 py-1 rounded-full">
          Free to try — no sign up needed
        </div>

        <h1 className="text-5xl font-bold tracking-tight">
          Debug errors in{" "}
          <span className="text-blue-400">seconds</span>
        </h1>

        <p className="text-gray-400 text-lg">
          Paste any TypeScript, Node.js, or Git error and get a plain-English
          explanation — what it means, why it happened, and how to fix it.
        </p>

        {/* ✨ NEW: Example error snippet for credibility */}
        <div className="text-left bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm font-mono">
          <p className="text-red-400">
            TypeError: Cannot read properties of undefined (reading
            &apos;map&apos;)
          </p>
          <p className="text-gray-600 mt-1 text-xs">
            → at ProductList (components/ProductList.tsx:24:18)
          </p>
          <p className="text-green-400 mt-3 text-xs">
            ✓ DebugAI explains this in plain English + shows the fix
          </p>
        </div>

        <Link
          href="/debug"
          className="inline-block bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-8 py-3 rounded-lg text-lg"
        >
          Debug my error →
        </Link>

        {/* Supported types */}
        <div className="pt-4">
          <p className="text-gray-600 text-sm mb-3">Supports</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["TypeScript", "Node.js", "Git", "React", "Python", "Prisma"].map(
              (lang) => (
                <span
                  key={lang}
                  className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full"
                >
                  {lang}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-gray-600 text-sm">
        DebugAI — Built for developers
      </footer>
    </main>
  );
}