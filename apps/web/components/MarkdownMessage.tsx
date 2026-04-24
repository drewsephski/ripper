"use client";

import React from "react";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown renderer that supports:
 * - **bold** text
 * - Line breaks (\n\n)
 * - Basic paragraphs
 */
export function MarkdownMessage({ content, className = "" }: MarkdownMessageProps) {
  // Split by double newlines to create paragraphs
  const paragraphs = content.split(/\n\n/);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => {
        // Process bold text: **text**
        const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);

        return (
          <p key={index} className={index > 0 ? "mt-3" : ""}>
            {parts.map((part, partIndex) => {
              // Check if this part is bold
              if (part.startsWith("**") && part.endsWith("**")) {
                const boldText = part.slice(2, -2);
                return (
                  <strong key={partIndex} className="font-semibold">
                    {boldText}
                  </strong>
                );
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}
