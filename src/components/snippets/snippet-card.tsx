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
  DialogHeader,
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
      <article className="group relative flex flex-col gap-6 rounded-2xl border border-border/70 bg-card/60 p-6 shadow-[0_10px_38px_-18px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold leading-tight tracking-tight">
                {snippet.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {snippet.excerpt}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {snippet.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogTrigger asChild>
          <Button className="self-start" variant="outline" size="sm">
            查看详情
          </Button>
        </DialogTrigger>
      </article>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{snippet.title}</DialogTitle>
          <DialogDescription>{snippet.detail.overview}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Demo
            </h4>
            <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              <Component />
            </div>
          </section>

          {snippet.detail.implementation.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                实现思路
              </h4>
              <ul className="mt-3 list-disc space-y-2 rounded-xl border border-border/60 bg-muted/10 p-4 pl-6 text-sm leading-relaxed text-muted-foreground">
                {snippet.detail.implementation.map((item, index) => (
                  <li key={`${snippet.id}-implementation-${index}`}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {snippet.codeExamples && snippet.codeExamples.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                代码示例
              </h4>
              <div className="mt-3 space-y-5">
                {snippet.codeExamples.map((example, index) => (
                  <div
                    key={`${snippet.id}-code-${index}`}
                    className="space-y-2"
                  >
                    {example.name && (
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {example.name}
                      </p>
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

          {snippet.detail.notes && snippet.detail.notes.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                备注
              </h4>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                {snippet.detail.notes.map((note, index) => (
                  <li key={`${snippet.id}-note-${index}`}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          {snippet.resources && snippet.resources.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                延伸阅读
              </h4>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-primary">
                {snippet.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <DialogFooter className="mt-8">
          <DialogClose asChild>
            <Button variant="secondary">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
