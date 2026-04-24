"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", onClick, size = "md" }: LogoProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <motion.button
      onClick={handleClick}
      className="flex items-center gap-2.5 group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.svg
        width={size === "sm" ? "24" : size === "md" ? "28" : "32"}
        height={size === "sm" ? "24" : size === "md" ? "28" : "32"}
        viewBox="0 0 28 28"
        fill="none"
        className="text-[#1a1a1a] dark:text-[#f5f3ef] transition-colors duration-300"
        whileHover="hover"
        initial="initial"
      >
        {/* Outer square with rotation */}
        <motion.rect
          x="3"
          y="3"
          width="22"
          height="22"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          rx="2"
          style={{ transformOrigin: "14px 14px" }}
          variants={{
            initial: { rotate: 0, fill: "rgba(26, 26, 26, 0)" },
            hover: { rotate: 90, fill: "rgba(26, 26, 26, 0.08)" }
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0 }}
        />
        
        {/* Inner circle with scale */}
        <motion.circle
          cx="14"
          cy="14"
          r="5"
          fill="currentColor"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.25 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
        />
        
        {/* Outer ring with opacity */}
        <motion.circle
          cx="14"
          cy="14"
          r="8"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0"
          variants={{
            initial: { opacity: 0, scale: 0.8 },
            hover: { opacity: 0.15, scale: 1 }
          }}
          transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 }}
        />
        
        {/* Decorative dots for visual interest */}
        <motion.circle
          cx="7"
          cy="7"
          r="1.5"
          fill="currentColor"
          opacity="0"
          variants={{
            initial: { opacity: 0, scale: 0 },
            hover: { opacity: 0.4, scale: 1 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
        />
        <motion.circle
          cx="21"
          cy="21"
          r="1.5"
          fill="currentColor"
          opacity="0"
          variants={{
            initial: { opacity: 0, scale: 0 },
            hover: { opacity: 0.4, scale: 1 }
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
        />
      </motion.svg>
      
      <motion.span
        className={`font-display font-semibold ${textSizes[size]} tracking-tight`}
        variants={{
          initial: { x: 0 },
          hover: { x: 2 }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        NovaFlow
      </motion.span>
    </motion.button>
  );
}
