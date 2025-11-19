/**
 * Author: Libra
 * Date: 2025-11-02 20:55:02
 * LastEditors: Libra
 * Description:
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SnippetDefinition } from "@/features/types";

type SnippetCardProps = {
  snippet: SnippetDefinition;
};

export function SnippetCard({ snippet }: SnippetCardProps) {
  const { Component } = snippet;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <article className="group relative flex h-full cursor-pointer flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-muted/50 to-muted/10 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-muted/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]">
          {/* Hover Gradient Effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {snippet.title}
                </h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                  {snippet.excerpt}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {snippet.keywords.slice(0, 3).map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="bg-background/50 px-2.5 py-0.5 text-xs font-normal text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                >
                  {keyword}
                </Badge>
              ))}
              {snippet.keywords.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-background/50 px-2.5 py-0.5 text-xs font-normal text-muted-foreground"
                >
                  +{snippet.keywords.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <span className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary/80">
              查看详情
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </div>
        </article>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh]  overflow-y-auto rounded-3xl border-border/60 bg-background/95 p-0 backdrop-blur-xl sm:max-h-[85vh]">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/80 px-8 py-5 backdrop-blur-md">
          <div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {snippet.title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-base">
              {snippet.detail.overview}
            </DialogDescription>
          </div>
          {/* Close button is automatically added by DialogContent, but we can add custom actions here if needed */}
        </div>

        <div className="space-y-10 px-8 py-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px]">
                01
              </span>
              Live Demo
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm">
              <div className="border-b border-border/40 bg-muted/50 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/20" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                  <div className="h-3 w-3 rounded-full bg-green-500/20" />
                </div>
              </div>
              <div className="p-6 md:p-10">
                <Component />
              </div>
            </div>
          </section>

          {snippet.detail.implementation.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px]">
                  02
                </span>
                Implementation
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {snippet.detail.implementation.map((item, index) => (
                  <li
                    key={`${snippet.id}-impl-${index}`}
                    className="flex gap-3 rounded-xl border border-border/50 bg-card/50 p-4 text-sm leading-relaxed text-muted-foreground transition-colors hover:border-primary/20 hover:bg-card"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {snippet.codeExamples && snippet.codeExamples.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px]">
                  03
                </span>
                Code
              </div>
              <div className="space-y-6">
                {snippet.codeExamples.map((example, index) => (
                  <div
                    key={`${snippet.id}-code-${index}`}
                    className="overflow-hidden rounded-2xl border border-border/60 shadow-sm"
                  >
                    {example.name && (
                      <div className="border-b border-border/40 bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                        {example.name}
                      </div>
                    )}
                    <CodeBlock
                      code={example.code}
                      language={example.language ?? "tsx"}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {(snippet.detail.notes?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                Notes
              </h4>
              <ul className="space-y-2">
                {snippet.detail.notes!.map((note, index) => (
                  <li
                    key={`${snippet.id}-note-${index}`}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/60" />
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(snippet.resources?.length ?? 0) > 0 && (
            <section className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Resources
              </h4>
              <div className="flex flex-wrap gap-3">
                {snippet.resources!.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {resource.title}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                    >
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <DialogFooter className="border-t border-border/40 bg-muted/10 px-8 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-full px-6">
              关闭
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
