"use client";

import { useState } from "react";

interface Debug {
  id: string;
  language: string;
  error: string;
  what: string;
  createdAt: Date;
}

export default function HistoryList({ debugs }: { debugs: Debug[] }) {
  const [list, setList] = useState(debugs);

  async function handleDelete(id: string) {
    await fetch(`/api/debug/${id}`, { method: "DELETE" });
    setList((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-3">
      {list.map((debug) => (
        <div
          key={debug.id}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {debug.language}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-xs">
                {new Date(debug.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(debug.id)}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <p className="text-gray-500 text-xs font-mono truncate">
            {debug.error}
          </p>
          <p className="text-gray-300 text-sm">{debug.what}</p>
        </div>
      ))}
    </div>
  );
}