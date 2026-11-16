"use client"

import * as React from "react"

interface PromptCardProps {
  num: string
  title: string
  description?: string
  prompt: string
  className?: string
}

export function PromptCard({
  num,
  title,
  description,
  prompt,
  className = "",
}: PromptCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error("Failed to copy prompt:", err)
    }
  }

  return (
    <div
      className={`rounded-lg border border-neutral-200 dark:border-neutral-800 border-l-4 border-l-[#b0341d] bg-white dark:bg-[#121210] overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1916] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded bg-[#b0341d]/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#b0341d]">
            {num}
          </span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] transition-all duration-150 select-none ${
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-[#b0341d] hover:text-[#b0341d]"
          }`}
          aria-label={copied ? "Copied" : "Copy prompt"}
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
              <span>Copy prompt</span>
            </>
          )}
        </button>
      </div>

      {description && (
        <p className="px-4.5 pt-3.5 pb-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      )}

      <div className="p-4">
        <pre className="overflow-x-auto rounded bg-[#14130f] p-3.5 font-mono text-xs leading-relaxed text-[#efeade] border border-neutral-800/80 whitespace-pre-wrap">
          <code>{prompt}</code>
        </pre>
      </div>
    </div>
  )
}
