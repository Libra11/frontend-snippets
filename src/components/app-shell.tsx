import type { PropsWithChildren } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={250}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="fixed inset-x-0 top-0 z-10 border-b border-border/80 bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <header className="mx-auto flex w-full items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-primary/10 font-semibold tracking-tight text-primary shadow-sm">
                FS
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight sm:text-xl">
                  前端小组件库
                </h1>
                <p className="text-sm text-muted-foreground">
                  可复用的微交互与常用片段，开箱即用。
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-3 text-sm text-muted-foreground md:flex">
              <span className="rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1 font-medium">
                优选组件
              </span>
              <span className="rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1 font-medium">
                Tailwind + shadcn/ui
              </span>
            </div>
          </header>
        </div>
        <main className="flex flex-1 justify-center px-4 pb-16 pt-28 sm:px-8 lg:px-16">
          <div className="flex w-full flex-1 flex-col gap-6 pb-4">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
