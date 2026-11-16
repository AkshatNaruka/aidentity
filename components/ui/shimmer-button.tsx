import React from "react"

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerDuration?: string
  borderRadius?: string
  children: React.ReactNode
  variant?: "primary" | "ghost" | "outline"
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "rgba(255, 255, 255, 0.2)",
      shimmerDuration = "3.5s",
      borderRadius = "4px",
      children,
      variant = "primary",
      className = "",
      ...props
    },
    ref
  ) => {
    const isPrimary = variant === "primary"

    return (
      <button
        ref={ref}
        style={{ borderRadius }}
        className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
          isPrimary
            ? "border border-neutral-700/60 bg-[#181614] text-[#f4f1e8] shadow-md hover:bg-[#b0341d] hover:text-white hover:shadow-[0_4px_16px_rgba(176,52,29,0.35)]"
            : "border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        } ${className}`}
        {...props}
      >
        {/* Specular Shimmer Sweep */}
        {isPrimary && (
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:animate-none"
            style={{
              animation: `shimmer ${shimmerDuration} infinite cubic-bezier(0.4, 0, 0.6, 1)`,
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
