import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SnippetDefinition } from "@/features/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SnippetCard } from "./snippet-card";

type SnippetGalleryProps = {
  snippets: SnippetDefinition[];
};

const LOAD_STEP = 6;

export function SnippetGallery({ snippets }: SnippetGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(LOAD_STEP, snippets.length)
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const featuredKeywords = useMemo(
    () =>
      Array.from(new Set(snippets.flatMap((snippet) => snippet.keywords))).slice(
        0,
        6
      ),
    [snippets]
  );

  useEffect(() => {
    setVisibleCount(Math.min(LOAD_STEP, snippets.length));
  }, [snippets.length]);

  const visibleSnippets = useMemo(
    () => snippets.slice(0, visibleCount),
    [snippets, visibleCount]
  );

  const hasMore = visibleCount < snippets.length;
  const progress = snippets.length
    ? Math.round((visibleCount / snippets.length) * 100)
    : 0;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_STEP, snippets.length)
    );
  }, [snippets.length]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "160px",
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore, visibleSnippets.length]);

  if (snippets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
        <h3 className="text-lg font-semibold">功能库建设中</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          敬请期待更多高频小功能，我们正在持续补充。
        </p>
      </div>
    );
  }

  return (
    <section id="snippets" className="space-y-6">
      <div className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 to-muted/20 px-8 py-10 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between dark:border-border/40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50" />
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            精选小功能合集
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            所有组件均基于 Tailwind 与 shadcn/ui 打造，覆盖输入、反馈、展示、媒体等常用场景，结合实现思路与代码片段即刻复用。
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-end gap-2 sm:max-w-xs">
          {featuredKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-primary/10 hover:text-primary dark:bg-foreground/5 dark:text-foreground/80"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div id="fresh" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleSnippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center"
      >
        {hasMore ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              滚动即可加载更多
            </p>
            <p className="text-xs text-muted-foreground">
              已展示 {visibleCount}/{snippets.length} · {progress}%
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={loadMore}
            >
              继续加载
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">
              已展示全部 {snippets.length} 个功能
            </p>
            <p className="text-xs text-muted-foreground">
              欢迎提出新的组件需求～
            </p>
          </>
        )}
      </div>
    </section>
  );
}
