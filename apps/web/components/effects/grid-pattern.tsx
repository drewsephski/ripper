"use client";

import { cn } from "@/lib/utils";

export function GridPattern({
  className,
  size = 40,
  color = "#1a1a1a",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `
          linear-gradient(to right, ${color}08 1px, transparent 1px),
          linear-gradient(to bottom, ${color}08 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

export function DotPattern({
  className,
  size = 24,
  color = "#1a1a1a",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${color}10 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
