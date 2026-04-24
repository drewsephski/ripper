"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TypingIndicatorProps {
  status?: string;
}

export default function TypingIndicator({ status }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex justify-start"
    >
      <div className="bg-white border border-[#e8e6e3] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Animated icon with glow */}
        <div className="relative">
          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-0 bg-[#8b7355]/20 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Icon container */}
          <div className="relative w-10 h-10 bg-gradient-to-br from-[#8b7355] to-[#6b5a45] rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          {/* Animated dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-[#8b7355]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Status text */}
          {status && (
            <motion.span 
              className="text-sm text-[#6b6b6b] font-medium"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {status}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
