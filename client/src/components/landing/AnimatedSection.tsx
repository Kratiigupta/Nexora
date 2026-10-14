"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (isVisible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    // Safety fallback: ensure content becomes visible even if observer fails to trigger
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(fallbackTimer);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "60px" }
    );

    observer.observe(el);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: "500ms",
        transitionDelay: delay ? `${Math.round(delay * 1000)}ms` : "0ms",
      }}
      className={cn(
        "transition-all ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none transform-gpu will-change-[transform,opacity]",
        className
      )}
    >
      {children}
    </div>
  );
}
