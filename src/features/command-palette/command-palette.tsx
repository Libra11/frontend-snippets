/**
 * Author: Libra
 * Date: 2025-11-09 14:05:12
 * LastEditors: Libra
 * Description: 命令面板示例，演示如何通过 cmdk + shadcn 构建全局搜索跳转体验
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileCode,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LinkIcon,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Users,
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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type RouteItem = {
  id: string;
  label: string;
  description: string;
  shortcut: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ActionItem = {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ProjectItem = {
  id: string;
  name: string;
  type: "Web" | "Mobile" | "Marketing";
  lastVisited: string;
  icon: React.ComponentType<{ className?: string }>;
};

const APP_ROUTES: RouteItem[] = [
  {
    id: "overview",
    label: "仪表盘",
    description: "查看关键指标与实时数据动态",
    shortcut: "G D",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "projects",
    label: "项目中心",
    description: "管理团队项目与协作进度",
    shortcut: "G P",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    id: "reports",
    label: "分析报表",
    description: "导出统计报表与分享链接",
    shortcut: "G R",
    href: "/reports",
    icon: FileText,
  },
  {
    id: "team",
    label: "成员管理",
    description: "邀请成员、配置角色与权限",
    shortcut: "G T",
    href: "/team",
    icon: Users,
  },
  {
    id: "settings",
    label: "系统设置",
    description: "全局偏好、通知与集成配置",
    shortcut: "G S",
    href: "/settings",
    icon: Settings,
  },
];

const QUICK_ACTIONS: ActionItem[] = [
  {
    id: "create-project",
    label: "新建项目",
    description: "快速创建一个空白项目并邀请成员",
    shortcut: "N P",
    icon: Sparkles,
  },
  {
    id: "import-template",
    label: "从模板导入",
    description: "基于项目模板初始化结构",
    shortcut: "N T",
    icon: FileCode,
  },
  {
    id: "open-changelog",
    label: "查看更新日志",
    description: "了解本周产品更新内容",
    icon: BookOpen,
  },
  {
    id: "command-shortcuts",
    label: "查看快捷键列表",
    description: "熟悉常用命令面板操作方式",
    icon: Search,
  },
  {
    id: "logout",
    label: "退出登录",
    description: "安全退出当前账号",
    shortcut: "⇧⌘Q",
    icon: LogOut,
  },
];

const INITIAL_RECENTS: ProjectItem[] = [
  {
    id: "fs-dashboard",
    name: "Frontend Snippets Dashboard",
    type: "Web",
    lastVisited: "5 分钟前",
    icon: LayoutDashboard,
  },
  {
    id: "mobile-app",
    name: "Libra Mobile App",
    type: "Mobile",
    lastVisited: "1 小时前",
    icon: LinkIcon,
  },
  {
    id: "landing-redesign",
    name: "Landing Page Redesign",
    type: "Marketing",
    lastVisited: "昨天",
    icon: Sparkles,
  },
];

export function CommandPaletteSnippet() {
  const [open, setOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>(INITIAL_RECENTS);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const projectBadges = useMemo(
    () => ({
      Web: { label: "Web 应用", variant: "outline" as const },
      Mobile: { label: "移动端", variant: "secondary" as const },
      Marketing: { label: "营销活动", variant: "secondary" as const },
    }),
    [],
  );

  const handleRouteSelect = useCallback((route: RouteItem) => {
    toast.success(`已跳转到 ${route.label}`, {
      description: `模拟访问 ${route.href}，可在实际项目中替换为路由跳转。`,
    });
    setOpen(false);
  }, []);

  const handleActionSelect = useCallback((action: ActionItem) => {
    toast.info(action.label, {
      description: action.description,
    });
    setOpen(false);
  }, []);

  const handleProjectSelect = useCallback((project: ProjectItem) => {
    toast.success(`打开 ${project.name}`, {
      description: "命令面板可以快速回访最近项目。",
    });
    setRecentProjects((prev) => {
      const existing = prev.filter((item) => item.id !== project.id);
      return [project, ...existing].slice(0, 5);
    });
    setOpen(false);
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        通过命令面板，将全局搜索、导航与快捷操作整合在一起，类似于 Linear / Vercel 等产品的
        <kbd className="ml-1 rounded bg-muted px-2 py-1 text-xs font-medium text-foreground">
          ⌘K
        </kbd>{" "}
        体验。
      </div>

      <Card className="space-y-6">
        <CardHeader className="px-6 pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">命令面板</CardTitle>
              <CardDescription>
                使用 cmdk + shadcn/ui 的 Command 组件实现，支持路由导航、快捷操作与最近项目回访。
              </CardDescription>
            </div>
            <Badge variant="secondary">按下 ⌘K / Ctrl+K</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4">
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-border/70 bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                ⌘
              </kbd>
              <span className="text-sm text-muted-foreground">+</span>
              <kbd className="rounded border border-border/70 bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                K
              </kbd>
            </div>
            <p className="text-sm text-muted-foreground">
              或者点击右侧按钮快速唤起命令面板，支持模糊搜索、Shortcut 提示与键盘操作。
            </p>
            <div className="flex-1" />
            <Button type="button" onClick={() => setOpen(true)} className="gap-2">
              <Search className="size-4" />
              打开命令面板
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => {
              const badge = projectBadges[project.type];
              const Icon = project.icon;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleProjectSelect(project)}
                  className="group flex flex-col items-start gap-2 rounded-2xl border border-border/60 bg-background/95 p-4 text-left shadow-sm transition hover:border-primary/50 hover:bg-muted/20 hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="size-4 text-primary" />
                    {project.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span>上次访问 · {project.lastVisited}</span>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs text-primary/80">
                    从命令面板打开
                    <ArrowUpRight className="size-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="输入以搜索页面、操作或项目…" />
        <CommandList>
          <CommandEmpty>未找到匹配的命令</CommandEmpty>
          <CommandGroup heading="应用路由">
            {APP_ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <CommandItem
                  key={route.id}
                  value={route.id}
                  onSelect={() => handleRouteSelect(route)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{route.label}</span>
                      <span className="text-xs text-muted-foreground/80">{route.description}</span>
                    </div>
                  </div>
                  <CommandShortcut>{route.shortcut}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="快捷操作">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <CommandItem
                  key={action.id}
                  value={action.id}
                  onSelect={() => handleActionSelect(action)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{action.label}</span>
                      <span className="text-xs text-muted-foreground/80">{action.description}</span>
                    </div>
                  </div>
                  {action.shortcut ? <CommandShortcut>{action.shortcut}</CommandShortcut> : null}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="最近项目">
            {recentProjects.map((project) => {
              const Icon = project.icon;
              const badge = projectBadges[project.type];
              return (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={() => handleProjectSelect(project)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{project.name}</span>
                      <span className="text-xs text-muted-foreground/80">
                        {badge.label} · {project.lastVisited}
                      </span>
                    </div>
                  </div>
                  <CommandShortcut>回车</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

