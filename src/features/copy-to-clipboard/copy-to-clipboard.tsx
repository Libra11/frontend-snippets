import { useEffect, useRef, useState } from "react";
import { Check, Clipboard, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CopyTarget = {
  id: string;
  title: string;
  description: string;
  value: string;
  type: "text" | "code" | "link";
  language?: string;
};

const copyTargets: CopyTarget[] = [
  {
    id: "text",
    title: "常用提示语",
    description: "适合同事沟通或复制到弹窗的基础文案。",
    value: "欢迎体验 Libra 前端小功能库 👋",
    type: "text",
  },
  {
    id: "code",
    title: "命令行片段",
    description: "快速复制常用指令或代码块，避免手敲出错。",
    value: "pnpm dlx shadcn@latest add button tooltip",
    type: "code",
    language: "bash",
  },
  {
    id: "link",
    title: "常用链接",
    description: "复制带描述的链接以便粘贴到文档或 IM。",
    value: "https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard",
    type: "link",
  },
];

type CopyFeedback = {
  id: string;
  status: "success" | "error";
};

export function CopyToClipboardSnippet() {
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleCopy = async (target: CopyTarget) => {
    const write = async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(target.value);
        return true;
      }

      const textarea = document.createElement("textarea");
      textarea.value = target.value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      const selection = document.getSelection();
      const selected = selection ? selection.rangeCount > 0 ? selection.getRangeAt(0) : null : null;
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (selected) {
        selection?.removeAllRanges();
        selection?.addRange(selected);
      }
      return success;
    };

    try {
      const success = await write();
      setFeedback({ id: target.id, status: success ? "success" : "error" });
    } catch {
      setFeedback({ id: target.id, status: "error" });
    } finally {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      resetTimer.current = setTimeout(() => {
        setFeedback(null);
      }, 2000);
    }
  };

  const renderPreview = (target: CopyTarget) => {
    switch (target.type) {
      case "code":
        return <CodeBlock code={target.value} language={target.language ?? "tsx"} />;
      case "link":
        return (
          <a
            href={target.value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-primary/5 px-3 py-2 text-sm text-primary transition hover:border-primary/40 hover:bg-primary/10"
          >
            <Globe className="size-4" />
            <span className="truncate">{target.value}</span>
          </a>
        );
      default:
        return (
          <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-foreground">
            {target.value}
          </p>
        );
    }
  };

  const getTooltipMessage = (target: CopyTarget) => {
    if (feedback?.id !== target.id) {
      return "点击复制";
    }
    return feedback.status === "success" ? "复制成功" : "复制失败";
  };

  const handleButtonClick = (target: CopyTarget) => {
    void handleCopy(target);
  };

  return (
    <div className="flex flex-col gap-4">
      {copyTargets.map((target) => {
        const isSuccess = feedback?.id === target.id && feedback.status === "success";
        const isError = feedback?.id === target.id && feedback.status === "error";

        return (
          <div
            key={target.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-base font-semibold">{target.title}</h4>
                <p className="text-sm text-muted-foreground">{target.description}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSuccess ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleButtonClick(target)}
                    className="w-full md:w-auto"
                  >
                    {isSuccess ? (
                      <Check className="mr-2 size-4" />
                    ) : (
                      <Clipboard className="mr-2 size-4" />
                    )}
                    {isSuccess ? "已复制" : "复制到剪贴板"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{getTooltipMessage(target)}</TooltipContent>
              </Tooltip>
            </div>
            {renderPreview(target)}
            {isError && (
              <p className="text-xs text-destructive">
                浏览器暂不支持剪贴板写入，请手动复制。
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
