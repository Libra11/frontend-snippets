import { useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

const DEFAULT_MARKDOWN = [
  "# Markdown 即时预览",
  "在 React 中把 Markdown 文本渲染成组件，同时保留常见的排版样式。",
  "",
  "## 快速上手",
  "",
  "- 编辑左侧的 Markdown 文本",
  "- 右侧实时更新渲染结果",
  "- 支持 **粗体**、*斜体*、`行内代码`",
  "",
  "> 你也可以直接粘贴已有的 Markdown 内容，看看效果如何。",
  "",
  "---",
  "",
  "```tsx",
  "function Greeting({ name }: { name: string }) {",
  "  return <span>你好，{name}</span>;",
  "}",
  "```",
  "",
  "1. 支持有序列表",
  "2. 会自动渲染成 HTML 结构",
  "",
  "| 语法 | 用途 |",
  "| ---- | ---- |",
  "| **粗体** | 强调内容 |",
  "| *斜体* | 表示术语 |",
  "| `code` | 显示命令 |",
  "",
  "[Markdown 基础语法](https://www.markdownguide.org/basic-syntax/)",
].join("\n");

const markdownComponents: Components = {
  h1: ({ className, children, ...props }) => (
    <h1
      {...props}
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight",
        className,
      )}
    >
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }) => (
    <h2
      {...props}
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight",
        className,
      )}
    >
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }) => (
    <h3
      {...props}
      className={cn(
        "text-lg font-semibold leading-tight tracking-tight",
        className,
      )}
    >
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }) => (
    <p
      {...props}
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    >
      {children}
    </p>
  ),
  ul: ({ className, children, ...props }) => (
    <ul
      {...props}
      className={cn(
        "list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }) => (
    <ol
      {...props}
      className={cn(
        "list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }) => (
    <li {...props} className={cn("marker:text-muted-foreground", className)}>
      {children}
    </li>
  ),
  blockquote: ({ className, children, ...props }) => (
    <blockquote
      {...props}
      className={cn(
        "space-y-2 rounded-xl border-l-4 border-primary/50 bg-primary/10 px-4 py-3 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </blockquote>
  ),
  hr: ({ className, ...props }) => (
    <hr
      {...props}
      className={cn("my-6 border-t border-border/60", className)}
    />
  ),
  table: ({ className, children, ...props }) => (
    <div className="overflow-x-auto">
      <table
        {...props}
        className={cn(
          "w-full border-collapse text-sm text-muted-foreground",
          className,
        )}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ className, children, ...props }) => (
    <th
      {...props}
      className={cn(
        "border border-border/60 bg-muted/40 px-3 py-2 text-left font-semibold text-foreground",
        className,
      )}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }) => (
    <td
      {...props}
      className={cn("border border-border/50 px-3 py-2", className)}
    >
      {children}
    </td>
  ),
  a: ({ className, children, href, ...props }) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "text-primary underline underline-offset-4 transition hover:text-primary/80",
        className,
      )}
    >
      {children}
    </a>
  ),
  code({ inline, className, children, ...props }: any) {
    const codeValue = String(children).replace(/\n$/, "");
    const language = /language-(\w+)/.exec(className ?? "")?.[1];

    if (inline) {
      return (
        <code
          {...props}
          className={cn(
            "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
            className,
          )}
        >
          {children}
        </code>
      );
    }

    return (
      <CodeBlock
        code={codeValue}
        language={language ?? "tsx"}
        className="border border-border/50 bg-background/40"
      />
    );
  },
};

export function MarkdownPreviewSnippet() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const characterCount = markdown.length;
  const blockCount = useMemo(() => {
    return markdown
      .split(/\n{2,}/)
      .map((segment) => segment.trim())
      .filter(Boolean).length;
  }, [markdown]);

  const hasContent = markdown.trim().length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Markdown 源文本</h3>
            <p className="text-xs text-muted-foreground">
              支持 GFM 扩展：表格、引用、列表、代码块等。
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {characterCount} 字符
          </span>
        </header>

        <textarea
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
          spellCheck={false}
          className="min-h-[320px] w-full resize-y rounded-2xl border border-border/60 bg-background/80 p-4 font-mono text-sm leading-6 text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>估算 {blockCount} 个 Markdown 区块</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setMarkdown(DEFAULT_MARKDOWN)}
          >
            重置内容
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">实时预览</h3>
            <p className="text-xs text-muted-foreground">
              通过 react-markdown 和 remark-gfm 渲染。
            </p>
          </div>
        </header>

        <div className="space-y-5 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
          {hasContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">暂无内容</p>
          )}
        </div>
      </div>
    </div>
  );
}
