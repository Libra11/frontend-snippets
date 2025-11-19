/**
 * Author: Libra
 * Date: 2025-11-10 10:42:00
 * LastEditors: Libra
 * Description: 代码编辑器示例，展示如何使用 Monaco Editor 构建可配置的在线编辑体验
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  Braces,
  ClipboardCopy,
  Code2,
  ListOrdered,
  RotateCcw,
  Sparkles,
  WrapText,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

type EditorSnippet = {
  id: string;
  label: string;
  description: string;
  hint: string;
  language: "typescript" | "json" | "markdown";
  value: string;
};

const MONACO_SNIPPETS: EditorSnippet[] = [
  {
    id: "typescript-service",
    label: "TypeScript 数据服务",
    description: "结合 fetch 与 zod，封装带类型校验与重试的用户资料请求。",
    hint: "演示类型安全与错误处理策略。",
    language: "typescript",
    value: `import { z } from "zod";

const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  plan: z.enum(["free", "pro", "enterprise"]),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export async function fetchUserProfile(id: string, signal?: AbortSignal) {
  const response = await fetch(\`/api/users/\${id}\`, { signal });
  if (!response.ok) {
    throw new Error("无法加载用户信息");
  }
  const json = await response.json();
  return userProfileSchema.parse(json);
}

export async function retry<T>(operation: () => Promise<T>, attempts = 3) {
  let lastError: unknown;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (index + 1)));
    }
  }
  throw lastError;
}

export async function loadUserProfile(id: string) {
  return retry(() => fetchUserProfile(id));
}
`,
  },
  {
    id: "json-dashboard",
    label: "JSON 仪表盘配置",
    description: "通过声明式配置模块、权限与数据源，用于低代码场景自定义布局。",
    hint: "展示 JSON Schema 与多环境配置写法。",
    language: "json",
    value: `{
  "version": "1.3.0",
  "name": "analytics-dashboard",
  "environment": {
    "default": "production",
    "available": ["development", "staging", "production"]
  },
  "widgets": [
    {
      "id": "traffic-overview",
      "type": "chart.line",
      "title": "访客趋势",
      "dataset": "pageViews",
      "range": "last_7_days"
    },
    {
      "id": "revenue-breakdown",
      "type": "table",
      "title": "营收分布",
      "dataset": "revenue",
      "columns": ["channel", "region", "mrr", "growth"]
    }
  ],
  "permissions": {
    "@role/analyst": ["traffic-overview", "revenue-breakdown"],
    "@role/guest": ["traffic-overview"]
  }
}
`,
  },
  {
    id: "markdown-checklist",
    label: "Markdown 发布检查单",
    description: "编写产品版本发布前的检查清单，适合内网知识库或上线流程。",
    hint: "支持待办、代码块与额外备注。",
    language: "markdown",
    value: `# 发布前检查清单

> 在发布新版本前，请确保以下事项全部完成。

## ✅ 功能验证

- [x] 关键路径冒烟测试
- [x] 回归高优先级缺陷
- [ ] 核对埋点事件是否覆盖

## 🧪 环境巡检

1. 检查 staging 环境配置
2. 对比 \`.env.production\` 与 \`.env.example\` 差异
3. 验证灰度开关是否正常

## 🧾 附件

\`\`\`json
{
  "release": "2025.11.10",
  "owner": "Libra",
  "notes": ["完成性能压测", "QA 已签字"]
}
\`\`\`

---

如需回滚，请在命令面板执行 \`rollback release\` 动作。`,
  },
];

type EditorThemeMode = "system" | "light" | "dark";

const FONT_RANGE = {
  min: 12,
  max: 22,
};

export function CodeEditorSnippet() {
  const { isDark } = useTheme();
  const [activeSnippetId, setActiveSnippetId] = useState<string>(
    MONACO_SNIPPETS[0]?.id ?? ""
  );
  const [snippetCodes, setSnippetCodes] = useState<Record<string, string>>(
    () => {
      const initialEntries = MONACO_SNIPPETS.map(
        (snippet) => [snippet.id, snippet.value] as const
      );
      return Object.fromEntries(initialEntries);
    }
  );
  const [fontSize, setFontSize] = useState<number>(16);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [editorThemeMode, setEditorThemeMode] =
    useState<EditorThemeMode>("system");

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const activeSnippet = useMemo(() => {
    return (
      MONACO_SNIPPETS.find((snippet) => snippet.id === activeSnippetId) ??
      MONACO_SNIPPETS[0]
    );
  }, [activeSnippetId]);

  const activeCode = snippetCodes[activeSnippet.id] ?? activeSnippet.value;

  const resolvedTheme = useMemo(() => {
    if (editorThemeMode === "light") return "vs-light";
    if (editorThemeMode === "dark") return "vs-dark";
    return isDark ? "vs-dark" : "vs-light";
  }, [editorThemeMode, isDark]);

  const editorOptions = useMemo(() => {
    const lineNumbersMode: editor.LineNumbersType = showLineNumbers
      ? "on"
      : "off";
    const wordWrapMode: editor.IStandaloneEditorConstructionOptions["wordWrap"] =
      wordWrap ? "on" : "off";
    return {
      automaticLayout: true,
      fontSize,
      fontLigatures: true,
      minimap: { enabled: showMinimap },
      wordWrap: wordWrapMode,
      lineNumbers: lineNumbersMode,
      smoothScrolling: true,
      renderLineHighlight: "all" as const,
      scrollBeyondLastLine: false,
      tabSize: 2,
      padding: { top: 16, bottom: 16 },
    };
  }, [fontSize, showLineNumbers, showMinimap, wordWrap]);

  const handleEditorMount = useCallback<OnMount>((editor) => {
    editorRef.current = editor;
  }, []);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      setSnippetCodes((prev) => ({
        ...prev,
        [activeSnippet.id]: value ?? "",
      }));
    },
    [activeSnippet.id]
  );

  const handleFormat = useCallback(async () => {
    if (!editorRef.current) {
      return;
    }
    const action = editorRef.current.getAction("editor.action.formatDocument");
    if (!action) {
      toast.info("当前语言不支持自动格式化");
      return;
    }
    await action.run();
    toast.success("已格式化当前代码");
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeCode);
      } else {
        throw new Error("Clipboard API 不可用");
      }
      toast.success("代码已复制到剪贴板");
    } catch (error) {
      console.error(error);
      toast.error("复制失败，请手动选择代码");
    }
  }, [activeCode]);

  const handleReset = useCallback(() => {
    setSnippetCodes((prev) => ({
      ...prev,
      [activeSnippet.id]: activeSnippet.value,
    }));
    toast.success("已恢复为示例内容");
  }, [activeSnippet]);

  useEffect(() => {
    editorRef.current?.focus();
  }, [activeSnippet.id]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        Monaco Editor 是 VS Code
        内核的在线版本，适合在应用内提供实时编辑、配置、脚本或 A/B
        测试规则的编辑体验。
        通过结合主题、语言与编辑器选项，可以快速构建出既好用又安全的代码输入界面。
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <Card className="h-fit">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">代码编辑器面板</CardTitle>
            <CardDescription>
              左侧根据业务场景挑选预设示例，右侧编辑区支持切换主题、字体、行号、Minimap
              与自动换行等常见设置。
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  示例场景
                </Label>
                <Badge
                  variant="outline"
                  className="bg-muted/40 text-muted-foreground"
                >
                  {MONACO_SNIPPETS.length} 个模板
                </Badge>
              </div>
              <div className="space-y-3">
                {MONACO_SNIPPETS.map((snippet) => {
                  const isActive = snippet.id === activeSnippet.id;
                  return (
                    <button
                      key={snippet.id}
                      type="button"
                      onClick={() => setActiveSnippetId(snippet.id)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3 text-left transition",
                        "hover:border-primary/60 hover:bg-primary/5",
                        isActive
                          ? "border-primary/70 bg-primary/5 shadow-sm"
                          : "border-border/60 bg-background/95"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Code2 className="size-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {snippet.label}
                          </span>
                        </div>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {snippet.language}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {snippet.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {snippet.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                主题与显示
              </Label>
              <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="editor-theme"
                    className="text-xs text-muted-foreground"
                  >
                    编辑器主题
                  </Label>
                  <Select
                    value={editorThemeMode}
                    onValueChange={(value) =>
                      setEditorThemeMode(value as EditorThemeMode)
                    }
                  >
                    <SelectTrigger id="editor-theme" className="h-9">
                      <SelectValue placeholder="跟随页面主题" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">同步页面主题</SelectItem>
                      <SelectItem value="light">始终浅色</SelectItem>
                      <SelectItem value="dark">始终深色</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background/80 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Braces className="size-4 text-muted-foreground" />
                    <div className="text-xs leading-tight text-muted-foreground">
                      <p className="font-medium text-foreground">
                        显示迷你地图
                      </p>
                      <p>快速浏览文件结构</p>
                    </div>
                  </div>
                  <Switch
                    id="editor-minimap"
                    checked={showMinimap}
                    onCheckedChange={(checked) =>
                      setShowMinimap(Boolean(checked))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background/80 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="size-4 text-muted-foreground" />
                    <div className="text-xs leading-tight text-muted-foreground">
                      <p className="font-medium text-foreground">显示行号</p>
                      <p>适合调试与协作对齐</p>
                    </div>
                  </div>
                  <Switch
                    id="editor-line-numbers"
                    checked={showLineNumbers}
                    onCheckedChange={(checked) =>
                      setShowLineNumbers(Boolean(checked))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background/80 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <WrapText className="size-4 text-muted-foreground" />
                    <div className="text-xs leading-tight text-muted-foreground">
                      <p className="font-medium text-foreground">自动换行</p>
                      <p>适合展示配置或长行 JSON</p>
                    </div>
                  </div>
                  <Switch
                    id="editor-wrap"
                    checked={wordWrap}
                    onCheckedChange={(checked) => setWordWrap(Boolean(checked))}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                字体大小
              </Label>
              <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{FONT_RANGE.min}px</span>
                  <span className="font-semibold text-foreground">
                    {fontSize}px
                  </span>
                  <span>{FONT_RANGE.max}px</span>
                </div>
                <Slider
                  className="mt-3"
                  min={FONT_RANGE.min}
                  max={FONT_RANGE.max}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0] ?? fontSize)}
                />
              </div>
            </section>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-2 border-b border-border/60 bg-muted/10 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{activeSnippet.label}</CardTitle>
                <CardDescription>{activeSnippet.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="uppercase tracking-wide">
                {activeSnippet.language}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSnippet.hint}
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative h-[520px] w-full overflow-hidden bg-background">
              <Editor
                theme={resolvedTheme}
                language={activeSnippet.language}
                value={activeCode}
                onChange={handleCodeChange}
                options={editorOptions}
                onMount={handleEditorMount}
                loading={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    正在加载 Monaco 编辑器…
                  </div>
                }
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/10 px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>支持格式化、复制、恢复默认等常见操作。</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFormat}
              >
                <Code2 className="mr-1.5 size-4" />
                格式化
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <ClipboardCopy className="mr-1.5 size-4" />
                复制
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="mr-1.5 size-4" />
                重置
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
