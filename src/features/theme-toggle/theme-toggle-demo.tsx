import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/hooks/use-theme";

const themeDescriptions: Record<string, string> = {
  light: "明亮模式适合绝大多数阅读场景，保持轻快通透。",
  dark: "暗黑模式在夜间或弱光环境下减少眩光，突出内容。",
};

export function ThemeToggleSnippet() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.55)] transition-colors dark:border-border/40 dark:bg-muted/30">
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Theme
          </div>
          <div>
            <h4 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              一键切换 {theme === "dark" ? "暗黑" : "亮色"} 模式
            </h4>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              调用共享的 useTheme 状态，保持页面级 color-scheme 与 Tailwind dark class 同步。组件内部封装了本地存储与系统偏好的监听逻辑。
            </p>
          </div>
          <dl className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              <span>
                当前主题：<span className="font-medium text-foreground">{theme}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-2 shrink-0 rounded-full bg-secondary" aria-hidden />
              <span>{themeDescriptions[theme]}</span>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="inline-flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-4 py-3 transition-colors dark:border-border/40 dark:bg-muted/20">
            <span className="text-sm font-medium text-muted-foreground">切换主题</span>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="text-xs font-medium text-primary underline-offset-4 transition hover:underline"
          >
            通过代码调用 toggleTheme()
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-24 -top-24 size-52 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-36 bottom-[-160px] size-64 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
    </div>
  );
}

