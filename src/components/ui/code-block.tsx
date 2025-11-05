import { useEffect, useMemo, useRef, useState } from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import { Check, Clipboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

type CodeBlockProps = {
  code: string;
  language?: Language | (string & {});
  showLineNumbers?: boolean;
  className?: string;
};

type CopyStatus = "idle" | "success" | "error";

export function CodeBlock({
  code,
  language = "tsx",
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const formattedCode = code.replace(/\s+$/, "");
  const highlightLanguage = language as Language;
  const { isDark } = useTheme();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const languageLabel = String(highlightLanguage).toUpperCase();

  const codeTheme = useMemo(
    () => (isDark ? themes.nightOwl : themes.github),
    [isDark]
  );

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const copyWithFallback = (value: string) => {
    if (typeof document === "undefined") {
      return false;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const selected =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (selected) {
      selection?.removeAllRanges();
      selection?.addRange(selected);
    }

    return success;
  };

  const handleCopy = async () => {
    let success = false;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formattedCode);
        success = true;
      } else {
        success = copyWithFallback(formattedCode);
      }
    } catch {
      success = false;
    }

    setCopyStatus(success ? "success" : "error");

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => {
      setCopyStatus("idle");
    }, 1800);
  };

  const tooltipLabel =
    copyStatus === "success"
      ? "已复制"
      : copyStatus === "error"
        ? "复制失败"
        : "复制代码";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-lg transition-colors",
        "dark:border-border/40 dark:bg-muted/20",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/25 px-4 py-2 dark:border-border/40 dark:bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f56]" aria-hidden />
          <span className="size-3 rounded-full bg-[#ffbd2e]" aria-hidden />
          <span className="size-3 rounded-full bg-[#27c93f]" aria-hidden />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex dark:bg-foreground/10 dark:text-muted-foreground">
            {languageLabel}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={
                  copyStatus === "success"
                    ? "已复制代码"
                    : copyStatus === "error"
                      ? "复制失败"
                      : "复制代码"
                }
                className="text-muted-foreground transition hover:text-foreground"
                onClick={() => {
                  void handleCopy();
                }}
              >
                {copyStatus === "success" ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{tooltipLabel}</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Highlight theme={codeTheme} code={formattedCode} language={highlightLanguage}>
        {({
          className: highlightClassName,
          style,
          tokens,
          getLineProps,
          getTokenProps,
        }) => (
          <pre
            className={cn(
              "flex overflow-auto bg-transparent font-mono text-[12px] py-3 transition-colors",
              "text-foreground/90 dark:text-foreground/80",
              highlightClassName
            )}
            style={{
              ...style,
              backgroundColor: "transparent",
            }}
          >
            <code className="min-w-full">
              {tokens.map((line, lineIndex) => {
                const lineProps = getLineProps({ line, key: lineIndex });
                const lineClassName = lineProps.className;
                const lineStyle = lineProps.style;
                return (
                  <div
                    key={`line-${lineIndex}`}
                    className={cn(
                      "group flex w-full min-w-full gap-3 px-4 py-1",
                      "text-foreground/90 dark:text-foreground/80",
                      lineClassName
                    )}
                    style={lineStyle}
                  >
                    {showLineNumbers && (
                      <span className="w-8 select-none text-right font-mono text-[11px] text-muted-foreground/60 dark:text-muted-foreground/45">
                        {lineIndex + 1}
                      </span>
                    )}
                    <span className="flex-1 whitespace-pre text-[12px]">
                      {line.map((token, tokenIndex) => {
                        const tokenProps = getTokenProps({
                          token,
                          key: tokenIndex,
                        });
                        const tokenClassName = tokenProps.className;
                        const tokenStyle = tokenProps.style;
                        const tokenChildren = tokenProps.children;
                        return (
                          <span
                            key={`token-${lineIndex}-${tokenIndex}`}
                            className={cn(tokenClassName)}
                            style={tokenStyle}
                          >
                            {tokenChildren}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
