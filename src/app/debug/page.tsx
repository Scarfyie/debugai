"use client";

import { useState } from "react";
import Link from "next/link";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";

SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);

const LANGUAGES = ["TypeScript", "Node.js", "Git", "React", "Python", "Prisma"];

const LANG_SYNTAX_MAP: Record<string, string> = {
  TypeScript: "typescript",
  React: "typescript",
  "Node.js": "bash",
  Git: "bash",
  Python: "python",
  Prisma: "typescript",
};

interface DebugResult {
  what: string;
  why: string;
  fix: string[];
  codeExample: string;
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
          <div className="h-3 w-24 bg-gray-700 rounded-full" />
          <div className="h-4 w-full bg-gray-800 rounded" />
          <div className="h-4 w-4/5 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
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
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
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
        <div className="relative">
          <textarea
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder={`Paste your ${language} error here...`}
            rows={6}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
          />
          {error && (
            <div className="absolute top-2 right-2">
              <CopyButton text={error} />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !error.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            "Explain this error →"
          )}
        </button>

        {/* Error message */}
        {err && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {err}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && <Skeleton />}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4">

            {/* What it means */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  What it means
                </p>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">{result.what}</p>
            </div>

            {/* Why it happens */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
                  Why it happens
                </p>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">{result.why}</p>
            </div>

            {/* How to fix it */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span>🛠️</span>
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                  How to fix it
                </p>
              </div>
              <ol className="space-y-3">
                {result.fix.map((step, i) => (
                  <li key={i} className="text-gray-200 text-sm flex gap-3">
                    <span className="bg-green-500/20 text-green-400 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">
                      {step.replace(/^Step \d+:\s*/i, "")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Code Example */}
            {result.codeExample && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span>💡</span>
                    <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider">
                      Code Example
                    </p>
                  </div>
                  <CopyButton text={result.codeExample} />
                </div>
                <SyntaxHighlighter
                  language={LANG_SYNTAX_MAP[language] ?? "typescript"}
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    background: "transparent",
                    fontSize: "0.8rem",
                  }}
                >
                  {result.codeExample}
                </SyntaxHighlighter>
              </div>
            )}

            {/* Try another */}
            <button
              onClick={() => { setResult(null); setError(""); }}
              className="w-full border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-gray-200 transition-colors py-3 rounded-lg text-sm"
            >
              ← Debug another error
            </button>

          </div>
        )}
      </div>
    </main>
  );
}