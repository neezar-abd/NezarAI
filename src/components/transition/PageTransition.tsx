"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // When pathname changes, trigger transition
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={`page-transition ${isTransitioning ? "page-exit" : "page-enter"}`}
    >
      {displayChildren}
    </div>
  );
}
