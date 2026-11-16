"use client"

import React, { useState, useEffect } from "react"

export interface NavItem {
  label: string
  href: string
  active?: boolean
  external?: boolean
}

export interface FloatingNavbarProps {
  wordmark?: string
  subWordmark?: string
  verifiedCount?: number | string
  navItems?: NavItem[]
  onSearchClick?: () => void
  githubUrl?: string
  className?: string
}

export function FloatingNavbar({
  wordmark = "aidentity",
  subWordmark = "/ index",
  verifiedCount = 526,
  navItems = [
    { label: "Setup", href: "/setup" },
    { label: "Browse", href: "/skills" },
    { label: "Playbooks", href: "/playbooks" },
    { label: "Guides", href: "/guides" },
    { label: "Sources", href: "/sources" },
    { label: "Agents", href: "/for-agents" },
    { label: "About", href: "/about" },
  ],
  onSearchClick,
  githubUrl = "https://github.com/AkshatNaruka/aidentity",
  className = "",
}: FloatingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "border-neutral-200/80 bg-stone-50/95 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-stone-950/90 py-2.5"
          : "border-neutral-200 bg-stone-50/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-stone-950/80 py-3.5"
      } ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Live Beacon */}
        <div className="flex items-center gap-3.5">
          <a
            href="/"
            className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-neutral-900 transition-colors hover:text-[#b0341d] dark:text-neutral-100"
          >
            <span className="inline-block h-2.5 w-2.5 bg-[#b0341d] shadow-[0_0_10px_rgba(176,52,29,0.5)]" />
            <span>{wordmark}</span>
            {subWordmark && <span className="font-normal text-neutral-400">{subWordmark}</span>}
          </a>

          {verifiedCount && (
            <span className="hidden items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/60 px-2.5 py-0.5 font-mono text-[11px] text-neutral-600 sm:inline-flex dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              {verifiedCount} verified
            </span>
          )}
        </div>

        {/* Primary Navigation & Tools */}
        <div className="flex items-center gap-4">
          <nav
            aria-label="Primary"
            className={`${
              isMobileOpen
                ? "absolute left-0 right-0 top-full flex flex-col border-b border-neutral-200 bg-stone-50 p-4 shadow-lg dark:border-neutral-800 dark:bg-stone-950"
                : "hidden md:flex"
            } items-center gap-1 text-[13.5px]`}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded px-2.5 py-1 text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${
                  item.active ? "bg-[#b0341d]/10 font-medium text-[#b0341d] dark:text-[#f87171]" : ""
                }`}
              >
                {item.label}
              </a>
            ))}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                GitHub <span className="text-[11px] opacity-60">↗</span>
              </a>
            )}
          </nav>

          {/* Quick Search Shortcut Button */}
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Quick Search"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100/70 px-2.5 py-1 font-mono text-xs text-neutral-600 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span className="text-sm">⌕</span>
            <span className="hidden sm:inline">Search</span>
            <kbd className="rounded border border-neutral-200 bg-neutral-200/60 px-1 text-[10px] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
              /
            </kbd>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle Navigation"
            aria-expanded={isMobileOpen}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded border border-neutral-200 p-1 md:hidden dark:border-neutral-800"
          >
            <span className={`h-0.5 w-4 bg-neutral-900 transition-transform dark:bg-neutral-100 ${isMobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`h-0.5 w-4 bg-neutral-900 transition-opacity dark:bg-neutral-100 ${isMobileOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-4 bg-neutral-900 transition-transform dark:bg-neutral-100 ${isMobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  )
}
