"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface CarouselProps {
  children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Left fade + button */}
      <div
        className={`absolute left-0 top-0 bottom-2 w-16 bg-linear-to-r from-black to-transparent z-10 pointer-events-none transition-opacity duration-200 ${canLeft ? "opacity-100" : "opacity-0"}`}
      />
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-800/90 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700 transition-all duration-200 ${canLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <HiChevronLeft size={16} />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto py-5 px-3 no-scrollbar"
        style={{
          maskImage: canLeft && canRight
            ? "linear-gradient(to right, transparent 0px, black 48px, black calc(100% - 48px), transparent 100%)"
            : canLeft
            ? "linear-gradient(to right, transparent 0px, black 48px)"
            : canRight
            ? "linear-gradient(to right, black calc(100% - 48px), transparent 100%)"
            : undefined,
        }}
      >
        {children}
      </div>

      {/* Right fade + button */}
      <div
        className={`absolute right-0 top-0 bottom-2 w-16 bg-linear-to-l from-black to-transparent z-10 pointer-events-none transition-opacity duration-200 ${canRight ? "opacity-100" : "opacity-0"}`}
      />
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-800/90 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700 transition-all duration-200 ${canRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <HiChevronRight size={16} />
      </button>
    </div>
  );
};

export default Carousel;
