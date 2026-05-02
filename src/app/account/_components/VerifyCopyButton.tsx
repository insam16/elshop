"use client";

import { useState } from "react";

export default function VerifyCopyButton({ nickname }: { nickname: string }) {
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
  const text = `${today} ${nickname}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <code className="bg-yellow-100 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-mono">
        {text}
      </code>
      <button
        onClick={handleCopy}
        className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded hover:bg-yellow-600 transition-colors"
      >
        {copied ? "복사됨!" : "복사"}
      </button>
    </span>
  );
}
