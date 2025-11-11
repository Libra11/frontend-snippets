/**
 * Author: Libra
 * Date: 2025-11-02 20:54:46
 * LastEditors: Libra
 * Description:
 */
import type { PropsWithChildren } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeColorToggle } from "@/components/theme-color-toggle";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={250}>
      <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
        <div
          className="pointer-events-none absolute inset-x-0 -top-52 z-0 mx-auto h-[520px] max-w-[920px] rounded-full bg-linear-to-br from-primary/25 via-primary/15 to-transparent blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-[-180px] z-0 h-[480px] w-[480px] rounded-full bg-linear-to-tr from-accent/40 via-secondary/20 to-transparent blur-3xl"
          aria-hidden
        />

        <div className="fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-background/70 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.65)] backdrop-blur supports-backdrop-filter:bg-background/50">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-primary/15 font-semibold tracking-tight text-primary shadow-sm">
                FS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground/70">
                  Libra Snippets
                </span>
                <p className="text-base font-semibold leading-tight sm:text-lg">
                  前端小功能工作台
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <ThemeColorToggle />
                <ThemeToggle />
                <Badge
                  variant="secondary"
                  className="hidden px-3 py-1 text-xs sm:inline-flex"
                >
                  Tailwind + shadcn/ui
                </Badge>
              </div>
            </div>
          </header>
        </div>

        <main className="relative z-10 flex flex-1 justify-center px-4 pb-16 pt-32 sm:px-8 lg:px-16">
          <div className="flex w-full max-w-6xl flex-1 flex-col gap-10 pb-6">
            {children}
          </div>
        </main>

        <ScrollToTopButton />
      </div>
    </TooltipProvider>
  );
}
