"use client"

import * as React from "react"

interface CodeSnippetProps {
  title: string
  badge?: string
  code: string
  language?: string
  className?: string
}

export function CodeSnippet({
  title,
  badge = "CURL",
  code,
  language = "bash",
  className = "",
}: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error("Failed to copy code snippet:", err)
    }
  }

  return (
    <div
      className={`rounded-lg border border-neutral-800 bg-[#14130f] text-neutral-200 overflow-hidden shadow-xl transition-all duration-200 hover:border-neutral-700 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 bg-[#1c1a16] px-3.5 py-2">
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded bg-neutral-800/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
              {badge}
            </span>
          )}
          <span className="text-xs font-medium text-neutral-300">{title}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] transition-all duration-150 select-none ${
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-neutral-700/80 bg-neutral-800/60 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
          }`}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied ✓</span>
            </>
          ) : (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#efeade]">
        <code>{code}</code>
      </pre>
    </div>
  )
}
