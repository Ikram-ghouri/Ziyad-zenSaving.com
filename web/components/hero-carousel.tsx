"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/lib/types";

/**
 * Homepage banner carousel. Auto-advances every `intervalMs` (3 s by default),
 * pauses while hovered/focused or when the tab is hidden, supports swipe,
 * arrow keys and dots, and stays still for users who prefer reduced motion.
 */
export function HeroCarousel({
  slides,
  intervalMs = 3000,
}: {
  slides: Slide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div
        className="hero-carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const image = (
            // eslint-disable-next-line @next/next/no-img-element -- banner hosts come from WordPress
            <img
              src={slide.image.url}
              alt={slide.image.alt || slide.title || `Featured offer ${i + 1}`}
              width={slide.image.width || undefined}
              height={slide.image.height || undefined}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
            />
          );
          const external = /^https?:\/\//.test(slide.href);
          return (
            <div
              className="hero-carousel-slide"
              key={`${slide.image.url}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
            >
              {slide.href ? (
                external ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    tabIndex={i === index ? 0 : -1}
                  >
                    {image}
                  </a>
                ) : (
                  <Link href={slide.href} tabIndex={i === index ? 0 : -1}>
                    {image}
                  </Link>
                )
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>
      {count > 1 && (
        <>
          <button
            type="button"
            className="hero-carousel-arrow prev"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="hero-carousel-arrow next"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
          >
            <ChevronRight />
          </button>
          <div className="hero-carousel-dots">
            {slides.map((_, i) => (
              <button
                type="button"
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={i === index ? "active" : ""}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
