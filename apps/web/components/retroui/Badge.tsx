import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const badgeVariants = cva("font-semibold rounded-sm border", {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground border-transparent",
      outline: "bg-transparent border-[#1a1a1a]/20 text-[#1a1a1a]",
      solid: "bg-foreground text-background border-transparent",
      surface: "bg-primary text-primary-foreground border-transparent",
    },
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-2.5 py-1.5 text-sm",
      lg: "px-3 py-2 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface ButtonProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  children,
  size = "md",
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
