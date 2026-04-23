"use client";

import { useState } from "react";
import Link from "next/link";

const LANGUAGES = ["TypeScript", "Node.js", "Git", "React", "Python", "Prisma"];

interface DebugResult {
  what: string;
  why: string;
  fix: string[];
  codeExample: string;
}

export default function DebugPage() {
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [result, setResult] = useState<DebugResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit() {
    if (!error.trim()) return;
    setLoading(true);
    setResult(null);
    setErr("");

    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, language }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold mt-4">Debug my error</h1>
          <p className="text-gray-400 mt-1">
            Paste your error below and get an instant explanation.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                language === lang
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          value={error}
          onChange={(e) => setError(e.target.value)}
          placeholder={`Paste your ${language} error here...`}
          rows={6}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !error.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 rounded-lg"
        >
          {loading ? "Analyzing..." : "Explain this error →"}
        </button>

        {/* Error message */}
        {err && <p className="text-red-400 text-sm">{err}</p>}

        {/* Result */}
        {result && (
          <div className="space-y-4">

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-1">
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
                What it means
              </p>
              <p className="text-gray-200 text-sm leading-relaxed">{result.what}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-1">
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
                Why it happens
              </p>
              <p className="text-gray-200 text-sm leading-relaxed">{result.why}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                How to fix it
              </p>
              <ol className="space-y-2">
                {result.fix.map((step, i) => (
                  <li key={i} className="text-gray-200 text-sm flex gap-3">
                    <span className="text-green-500 font-bold shrink-0">{i + 1}.</span>
                    <span>{step.replace(/^Step \d+:\s*/i, "")}</span>
                  </li>
                ))}
              </ol>
            </div>

            {result.codeExample && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-2">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider">
                  Code example
                </p>
                <pre className="text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap">
                  {result.codeExample}
                </pre>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}