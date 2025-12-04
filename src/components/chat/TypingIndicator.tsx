"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("group flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 justify-start", className)}>
      {/* AI Avatar - same as ChatMessage */}
      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden">
        <Image
          src="/avatar-ai.png"
          alt="NezarAI"
          width={36}
          height={36}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typing dots */}
      <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[70%]">
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
