"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("group flex gap-2 sm:gap-4 px-2 sm:px-4 py-3 sm:py-6 justify-start", className)}>
      {/* AI Avatar - same as ChatMessage */}
      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden">
        <Image
          src="/avatar-ai.png"
          alt="NezarAI"
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typing dots */}
      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[75%]">
        <div className="space-y-3">
          <div className="text-[var(--foreground)]">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
