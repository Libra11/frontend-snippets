import type { ImgHTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RootMargin = `${number}px` | `${number}%`;

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> & {
  placeholderSrc?: string;
  rootMargin?: `${RootMargin}`;
  wrapperClassName?: string;
  transitionDuration?: number;
};

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  rootMargin = "160px",
  wrapperClassName,
  transitionDuration = 600,
  className,
  style,
  onLoad,
  onError,
  ...imgProps
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsVisible(true);
      return;
    }

    const target = containerRef.current;
    if (!target || isVisible) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  const handleImageLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleImageError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setIsLoaded(false);
    onError?.(event);
  };

  const displaySrc = isVisible ? src : placeholderSrc ?? undefined;
  const overlayVisible = Boolean(placeholderSrc) && !isLoaded;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted/30",
        wrapperClassName
      )}
    >
      {placeholderSrc ? (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover blur-lg transition",
            overlayVisible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDuration: `${transitionDuration}ms` }}
        />
      ) : null}

      <img
        ref={imageRef}
        src={displaySrc}
        alt={alt}
        loading="lazy"
        {...imgProps}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          "relative z-[1] h-full w-full object-cover transition ease-out",
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-[1.02]",
          className
        )}
        style={{
          transitionDuration: `${transitionDuration}ms`,
          ...style,
        }}
      />
    </div>
  );
}
