"use client"

import { useCallback, useEffect, useState } from "react"
import { Type, Bold } from "lucide-react"

import { cn } from "@/lib/utils"

interface FontToggleProps extends React.ComponentPropsWithoutRef<"button"> {
  showLabel?: boolean
}

export const FontToggle = ({
  className,
  showLabel = false,
  ...props
}: FontToggleProps) => {
  const [isAltFont, setIsAltFont] = useState(false)

  useEffect(() => {
    const updateFont = () => {
      setIsAltFont(document.documentElement.classList.contains("font-alt"))
    }

    updateFont()

    const observer = new MutationObserver(updateFont)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const toggleFont = useCallback(() => {
    const newFont = !isAltFont
    setIsAltFont(newFont)
    document.documentElement.classList.toggle("font-alt")
    localStorage.setItem("font", newFont ? "alt" : "default")
  }, [isAltFont])

  return (
    <button
      type="button"
      onClick={toggleFont}
      className={cn(
        "relative p-2 rounded-md hover:bg-[#1a1a1a]/5 dark:hover:bg-white/10 transition-colors duration-200",
        "text-[#1a1a1a] dark:text-[#f5f3ef]",
        "flex items-center gap-2",
        className
      )}
      {...props}
    >
      <div className="relative w-5 h-5">
        <Type 
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-300",
            isAltFont ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          )} 
        />
        <Bold 
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-300",
            isAltFont ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          )} 
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium">
          {isAltFont ? "Space" : "DM Sans"}
        </span>
      )}
      <span className="sr-only">Toggle font</span>
    </button>
  )
}
