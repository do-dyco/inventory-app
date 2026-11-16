import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-gray-300 bg-white file:text-foreground placeholder:text-gray-400 selection:bg-brand-500 selection:text-white flex h-11 w-full min-w-0 rounded-[10px] border px-4 py-2.5 text-sm font-normal text-gray-800 shadow-theme-xs transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500",
        "focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:focus:border-brand-500/40",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
