import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_SCROLL_THRESHOLD = 280;

type ScrollToTopButtonProps = {
  threshold?: number;
  className?: string;
  buttonClassName?: string;
  getScrollContainer?: () => HTMLElement | null;
};

export function ScrollToTopButton({
  threshold = DEFAULT_SCROLL_THRESHOLD,
  className,
  buttonClassName,
  getScrollContainer,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!getScrollContainer) {
      setScrollContainer(null);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    let animationFrame: number | null = null;

    const resolveContainer = () => {
      const element = getScrollContainer();
      if (element) {
        setScrollContainer(element);
        return;
      }

      animationFrame = requestAnimationFrame(resolveContainer);
    };

    resolveContainer();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [getScrollContainer]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const target: HTMLElement | Window = scrollContainer ?? window;

    const readOffset = () => {
      if (scrollContainer) {
        return scrollContainer.scrollTop;
      }

      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const handleScroll = () => {
      const shouldShow = readOffset() > threshold;
      setIsVisible((current) => (current === shouldShow ? current : shouldShow));
    };

    handleScroll();

    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainer, threshold]);

  const handleClick = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (scrollContainer) {
      if (typeof scrollContainer.scrollTo === "function") {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scrollContainer.scrollTop = 0;
      }
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 right-6 z-40 flex sm:bottom-8 sm:right-8",
        className,
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label="滚动至顶部"
        onClick={handleClick}
        className={cn(
          "pointer-events-auto rounded-full shadow-lg transition-all duration-300",
          "bg-background/90 text-foreground hover:bg-background",
          "dark:bg-muted/90 dark:hover:bg-muted",
          isVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
          buttonClassName,
        )}
      >
        <ArrowUp className="size-4" />
      </Button>
    </div>
  );
}
