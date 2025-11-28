"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, ReactNode, MouseEvent } from "react";

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function TransitionLink({ href, children, className }: TransitionLinkProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Don't transition for same page or anchor links
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsTransitioning(true);

    // Add exit animation class to body
    document.body.classList.add('page-transitioning');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.innerHTML = `
      <div class="transition-spinner">
        <div class="spinner-ring"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Trigger overlay animation
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Navigate after animation
    setTimeout(() => {
      router.push(href);
      
      // Remove overlay after navigation
      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.remove();
          document.body.classList.remove('page-transitioning');
          setIsTransitioning(false);
        }, 300);
      }, 100);
    }, 400);
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`${className} ${isTransitioning ? 'pointer-events-none' : ''}`}
    >
      {children}
    </Link>
  );
}
