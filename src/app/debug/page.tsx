"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
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
    <button onClick={copy} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function UsageBadge({ count, limit }: { count: number; limit: number }) {
  const limitReached = count >= limit;
  const almostOut = count >= limit - 1;

  const color = limitReached
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : almostOut
    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : "bg-green-500/20 text-green-400 border-green-500/30";

  return (
    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border w-fit ${color}`}>
      <span>⚡</span>
      <span>{count}/{limit} free debugs used today</span>
    </div>
  );
}

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [result, setResult] = useState<DebugResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit] = useState(3);
  const [limitReached, setLimitReached] = useState(false);
  const [usageLoading, setUsageLoading] = useState(true);

  // Fetch usage on load
  useEffect(() => {
    if (session) {
      setUsageLoading(true);
      fetch("/api/usage")
        .then((r) => r.json())
        .then((data) => {
          setUsageCount(data.usageCount ?? 0);
          setLimitReached(data.limitReached ?? false);
        })
        .catch(() => {})
        .finally(() => setUsageLoading(false));
    } else {
      setUsageLoading(false);
    }
  }, [session]);

  async function handleSubmit() {
    if (!error.trim() || limitReached) return;
    setLoading(true);
    setResult(null);
    setErr("");

    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, language }),
      });

      // Handle limit reached
      if (res.status === 429) {
        const data = await res.json();
        setErr(data.message ?? "Daily limit reached.");
        setLimitReached(true);
        setUsageCount(usageLimit);
        setLoading(false);
        return;
      }

      if (res.status === 401) {
        setErr("Please sign in to use DebugAI.");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setResult(data.result ?? data);

      // Update usage count
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      if (newCount >= usageLimit) setLimitReached(true);
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gray-950 text-white px-4 py-12 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Sign in to debug</h1>
          <p className="text-gray-400">You need a free account to use DebugAI.</p>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Back
          </Link>
          <div className="flex items-start justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold">Debug my error</h1>
              <p className="text-gray-400 mt-1">Paste your error and get an instant explanation.</p>
            </div>
            {/* Usage badge */}
            {session && !usageLoading && (
              <UsageBadge count={usageCount} limit={usageLimit} />
            )}
          </div>
        </div>

        {/* Limit reached banner */}
        {limitReached && (
          <div className="bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5 text-center space-y-3">
            <p className="text-2xl">🚀</p>
            <p className="text-white font-semibold">You&apos;ve hit today&apos;s free limit</p>
            <p className="text-gray-400 text-sm">
              Free accounts get 3 debugs per day. Resets at midnight UTC.
            </p>
            <button
              disabled
              className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold opacity-75 cursor-not-allowed"
            >
              Upgrade to Pro — Coming Soon
            </button>
          </div>
        )}

        {/* Language Selector */}
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              disabled={limitReached}
              className={`px-3 py-1 rounded-full text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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
            disabled={limitReached}
            placeholder={
              limitReached
                ? "Daily limit reached. Come back tomorrow!"
                : `Paste your ${language} error here...`
            }
            rows={6}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {error && !limitReached && (
            <div className="absolute top-2 right-2">
              <CopyButton text={error} />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !error.trim() || limitReached}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : limitReached ? (
            "Daily limit reached"
          ) : (
            "Explain this error →"
          )}
        </button>

        {/* Error message */}
        {err && !limitReached && (
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
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">What it means</p>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">{result.what}</p>
            </div>

            {/* Why it happens */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Why it happens</p>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">{result.why}</p>
            </div>

            {/* How to fix it */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span>🛠️</span>
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">How to fix it</p>
              </div>
              <ol className="space-y-3">
                {result.fix.map((step, i) => (
                  <li key={i} className="text-gray-200 text-sm flex gap-3">
                    <span className="bg-green-500/20 text-green-400 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step.replace(/^Step \d+:\s*/i, "")}</span>
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
                    <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Code Example</p>
                  </div>
                  <CopyButton text={result.codeExample} />
                </div>
                <SyntaxHighlighter
                  language={LANG_SYNTAX_MAP[language] ?? "typescript"}
                  style={atomOneDark}
                  customStyle={{ margin: 0, padding: "1.25rem", background: "transparent", fontSize: "0.8rem" }}
                >
                  {result.codeExample}
                </SyntaxHighlighter>
              </div>
            )}

            {/* Try another / usage reminder */}
            <div className="space-y-3">
              <button
                onClick={() => { setResult(null); setError(""); }}
                disabled={limitReached}
                className="w-full border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-gray-200 transition-colors py-3 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Debug another error
              </button>
              {!limitReached && (
                <p className="text-center text-gray-600 text-xs">
                  {usageLimit - usageCount} debug{usageLimit - usageCount !== 1 ? "s" : ""} remaining today
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}