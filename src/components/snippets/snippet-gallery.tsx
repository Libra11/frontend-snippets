import type { SnippetDefinition } from "@/features/types";
import { Badge } from "@/components/ui/badge";
import { SnippetCard } from "./snippet-card";

type SnippetGalleryProps = {
  snippets: SnippetDefinition[];
};

export function SnippetGallery({ snippets }: SnippetGalleryProps) {
  const featuredKeywords = Array.from(
    new Set(snippets.flatMap((snippet) => snippet.keywords))
  ).slice(0, 6);

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
      <div className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card/70 px-6 py-6 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between dark:border-border/40 dark:bg-muted/20">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            精选小功能合集
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            所有组件均基于 Tailwind 与 shadcn/ui 打造，覆盖输入、反馈、展示、媒体等常用场景，结合实现思路与代码片段即刻复用。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {featuredKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="px-3 py-1 text-xs dark:bg-foreground/10 dark:text-foreground"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div id="fresh" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>
    </section>
  );
}
