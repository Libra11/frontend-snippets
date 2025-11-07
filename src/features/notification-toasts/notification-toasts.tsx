import { useCallback, useMemo } from "react";
import type { ComponentType } from "react";
import {
  AlarmClock,
  CheckCircle,
  Info,
  Network,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ToastPreset = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  invoke: () => void;
};

const TOAST_DURATION = 3800;

export function NotificationToastsSnippet() {
  const presets = useMemo<ToastPreset[]>(
    () => [
      {
        id: "success",
        label: "成功提示",
        description: "业务处理顺利完成，展示成功反馈。",
        icon: CheckCircle,
        invoke: () =>
          toast.success("发布成功", {
            description: "内容已同步至所有渠道。",
            duration: TOAST_DURATION,
          }),
      },
      {
        id: "info",
        label: "信息通知",
        description: "提示用户查看新消息或更新。",
        icon: Info,
        invoke: () =>
          toast("有新的版本更新", {
            description: "v1.9.2 修复了若干性能问题。",
            duration: TOAST_DURATION,
            action: {
              label: "查看",
              onClick: () => console.info("preview changelog"),
            },
          }),
      },
      {
        id: "warning",
        label: "警告提醒",
        description: "展示需要谨慎处理的状态。",
        icon: TriangleAlert,
        invoke: () =>
          toast.warning("配置存在风险", {
            description: "CDN 缓存过期时间低于 30 分钟。",
            duration: TOAST_DURATION,
          }),
      },
      {
        id: "error",
        label: "错误提示",
        description: "告知用户操作失败并引导下一步。",
        icon: XCircle,
        invoke: () =>
          toast.error("提交失败", {
            description: "请检查网络连接或稍后重试。",
            duration: TOAST_DURATION,
          }),
      },
    ],
    [],
  );

  const handleLoading = useCallback(() => {
    const toastId = toast.loading("正在同步资源...", {
      description: "预计 10 秒完成预热。",
      duration: 10000,
    });

    setTimeout(() => {
      toast.success("同步完成", {
        description: "静态资源已在全球节点生效。",
        duration: TOAST_DURATION,
      });
      toast.dismiss(toastId);
    }, 2600);
  }, []);

  const handlePromise = useCallback(() => {
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      }),
      {
        loading: "正在校验数据...",
        success: "校验通过，可继续发布",
        error: "校验失败，请检查配置",
      },
    );
  }, []);

  const handleCustomLayout = useCallback(() => {
    toast(
      (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">磁盘空间不足</p>
          <p className="text-xs text-muted-foreground">
            仅剩 2.1 GB 可用空间，建议立即释放以免影响日志写入。
          </p>
        </div>
      ),
      {
        description: "在 30 分钟内我们将再次检测。",
        duration: TOAST_DURATION + 2000,
        icon: <AlarmClock className="size-4" />,
        action: {
          label: "打开设置",
          onClick: () => console.info("open settings"),
        },
      },
    );
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        使用 sonner 构建通知中心，支持不同语义等级、异步任务状态与自定义布局，保持一致的视觉风格与交互节奏。
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="space-y-6">
          <CardHeader className="px-6 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">通知触发器</CardTitle>
                <CardDescription>
                  快速触发不同语义的通知，演示文案、描述、动作按钮与自动关闭时间的配置方式。
                </CardDescription>
              </div>
              <Badge variant="secondary">丰富态 · 7 种示例</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  variant="outline"
                  className="justify-start gap-2 text-left"
                  onClick={preset.invoke}
                >
                  <preset.icon className="size-4" />
                  <span className="font-medium text-foreground">{preset.label}</span>
                  <span className="sr-only">{preset.description}</span>
                </Button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Button
                type="button"
                variant="secondary"
                className="justify-start gap-2"
                onClick={handleLoading}
              >
                <Network className="size-4" />
                <span>加载态 + 成功</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="justify-start gap-2"
                onClick={handlePromise}
              >
                <Sparkles className="size-4" />
                <span>Promise 自动切换</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="justify-start gap-2"
                onClick={handleCustomLayout}
              >
                <AlarmClock className="size-4" />
                <span>自定义内容 + 操作</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">最佳实践速览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="font-medium text-foreground">语义 + 行为搭配</p>
              <p className="mt-1 text-xs text-muted-foreground">
                成功/失败使用主色调表达，信息/警告强调辅助说明；必要时附带行动按钮帮助用户立即处理。
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="font-medium text-foreground">异步任务观察</p>
              <p className="mt-1 text-xs text-muted-foreground">
                `toast.promise` 可在请求链路中复用，自动串联加载、成功与失败状态，保证反馈连续性。
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="font-medium text-foreground">自定义图标与时长</p>
              <p className="mt-1 text-xs text-muted-foreground">
                sonner 支持传入自定义图标、持续时间与 action，确保兼顾品牌视觉与可访问性。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

