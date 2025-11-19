import { Palette, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ThemeColorSwitcherSnippet() {
  const { colorId, option, options, setThemeColor } = useThemeColor();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.75)] transition-colors dark:border-border/40 dark:bg-muted/30 sm:p-10">
      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Colors
            <Palette className="size-3" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
              动态主题色切换
            </h3>
            <p className="text-sm text-muted-foreground">
              通过 useThemeColor 钩子在运行时调整 CSS 变量，实时刷新 Tailwind
              token 映射，并将选择持久化至 localStorage。
            </p>
          </div>

          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 text-primary" />
              <span>
                统一管理 --primary / --accent / --ring，自适应所有使用颜色 token
                的组件。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Wand2 className="mt-0.5 size-4 text-primary" />
              <span>
                选择被保存至浏览器，刷新或在其它页面也能保持一致的品牌色。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Palette className="mt-0.5 size-4 text-primary" />
              <span>
                可无缝新增更多色板，只需扩展 themeColorOptions 数组即可。
              </span>
            </li>
          </ul>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 text-sm shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-muted-foreground">当前方案</p>
                <p className="text-lg font-semibold text-foreground">
                  {option.label}
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                Live
              </Badge>
            </div>
            <p className="mt-3 text-muted-foreground">{option.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
                <p>主色背景</p>
                <p className="text-xs font-normal text-primary/80">
                  Tailwind 的 bg-primary 派生
                </p>
              </div>
              <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm font-medium text-accent-foreground">
                <p>强调按钮</p>
                <Button size="sm" className="mt-2 w-full">
                  实时同步
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                主题色板
              </p>
              <h4 className="text-lg font-semibold text-foreground">
                选择喜欢的配色
              </h4>
            </div>
            <span className="text-xs text-muted-foreground">
              已选：{option.label}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((color) => {
              const isActive = color.id === colorId;

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setThemeColor(color.id)}
                  className={cn(
                    "group flex h-full flex-col gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    isActive
                      ? "border-primary/80 bg-primary/5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.8)]"
                      : "border-border/60 hover:border-primary/60 hover:bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between text-sm font-medium text-foreground">
                    <span>{color.label}</span>
                    {isActive ? (
                      <Badge className="bg-primary text-primary-foreground">
                        使用中
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {color.description}
                  </p>
                  <div className="flex h-10 items-center gap-1">
                    {color.preview.map((swatch, index) => (
                      <span
                        key={`${color.id}-${index}`}
                        className="h-full flex-1 rounded-full"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute -left-24 top-10 size-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />
    </div>
  );
}
