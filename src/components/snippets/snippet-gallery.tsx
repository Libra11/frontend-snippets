import type { SnippetDefinition } from "@/features/types";
import { SnippetCard } from "./snippet-card";

type SnippetGalleryProps = {
  snippets: SnippetDefinition[];
};

export function SnippetGallery({ snippets }: SnippetGalleryProps) {
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
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      {snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}
    </div>
  );
}
