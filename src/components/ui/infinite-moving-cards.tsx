// FILE: components/ui/aceternity/infinite-moving-cards.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type InfiniteMovingCardsProps = {
  items: {
    id: string;
    content: React.ReactNode;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
};

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth animation start
    const timer = setTimeout(() => {
      setStart(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Map speed to actual CSS values
  const speedMap = {
    fast: "40s",
    normal: "60s",
    slow: "80s",
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full overflow-hidden mask-gradient",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4",
          start && "animate-infinite-scroll",
          pauseOnHover && "hover:animation-play-state-paused"
        )}
        style={{
          animationDuration: speedMap[speed],
          animationDirection: direction === "left" ? "normal" : "reverse",
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="w-64 flex-shrink-0">
            {item.content}
          </div>
        ))}
      </div>
      <div
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4",
          start && "animate-infinite-scroll",
          pauseOnHover && "hover:animation-play-state-paused"
        )}
        style={{
          animationDuration: speedMap[speed],
          animationDirection: direction === "left" ? "normal" : "reverse",
        }}
      >
        {items.map((item) => (
          <div key={item.id + "-copy"} className="w-64 flex-shrink-0">
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}