"use client";

import React, { useEffect, useRef, useMemo } from "react";

export default function AsciiAnimation({
  className = "",
  color = "#1a1a1a",
}: {
  className?: string;
  color?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const asciiFrames = useMemo(() => [
    "◐░░░░░░░░░░░░░░░",
    "◑░░░░░░░░░░░░░░░",
    "◒░░░░░░░░░░░░░░░",
    "◓░░░░░░░░░░░░░░░",
    "░◐░░░░░░░░░░░░░░",
    "░◑░░░░░░░░░░░░░░",
    "░◒░░░░░░░░░░░░░░",
    "░◓░░░░░░░░░░░░░░",
    "░░◐░░░░░░░░░░░░░",
    "░░◑░░░░░░░░░░░░░",
    "░░◒░░░░░░░░░░░░░",
    "░░◓░░░░░░░░░░░░░",
    "░░░◐░░░░░░░░░░░░",
    "░░░◑░░░░░░░░░░░░",
    "░░░◒░░░░░░░░░░░░",
    "░░░◓░░░░░░░░░░░░",
    "░░░░◐░░░░░░░░░░░",
    "░░░░◑░░░░░░░░░░░",
    "░░░░◒░░░░░░░░░░░",
    "░░░░◓░░░░░░░░░░░",
  ], []);

  useEffect(() => {
    let frameIndex = 0;
    let animationId: NodeJS.Timeout;

    const animateAscii = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = asciiFrames[frameIndex];
        frameIndex = (frameIndex + 1) % asciiFrames.length;
      }
    };

    animateAscii();
    animationId = setInterval(animateAscii, 120);

    return () => {
      clearInterval(animationId);
    };
  }, [asciiFrames]);

  return (
    <div
      ref={containerRef}
      className={`font-mono whitespace-pre select-none pointer-events-none ${className}`}
      style={{
        fontSize: "12px",
        lineHeight: "1",
        letterSpacing: "0.1em",
        color: color,
        opacity: 0.15,
      }}
    />
  );
}
