import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-[3px] focus-visible:outline-hidden active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 focus-visible:ring-brand-500/20 dark:bg-brand-500 dark:hover:bg-brand-600",
        destructive:
          "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 focus-visible:ring-red-500/20 dark:bg-red-500 dark:hover:bg-red-600",
        outline:
          "border border-gray-300 bg-transparent text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 focus-visible:ring-gray-300/50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        ghost: "text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
        link: "text-brand-500 underline-offset-4 hover:underline dark:text-brand-400",
      },
      size: {
        default: "h-11 px-4 py-2.5 has-[>svg]:px-3",
        sm: "h-9 rounded-[10px] px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-[10px] px-6 has-[>svg]:px-4",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
