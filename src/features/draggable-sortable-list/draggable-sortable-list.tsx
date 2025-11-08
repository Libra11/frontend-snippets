import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import {
  CSS,
  type Transform,
} from "@dnd-kit/utilities";
import {
  Archive,
  Edit3,
  GripVertical,
  Lock,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SortableItemState = "normal" | "locked" | "disabled";

type SortableItem = {
  id: string;
  title: string;
  description: string;
  state: SortableItemState;
};

const INITIAL_ITEMS: SortableItem[] = [
  {
    id: "hero",
    title: "头图 Hero",
    description: "展示核心视觉与 CTA 按钮。",
    state: "normal",
  },
  {
    id: "feature",
    title: "功能亮点",
    description: "突出产品 3-4 个关键卖点，支持图标与配图。",
    state: "normal",
  },
  {
    id: "case",
    title: "客户案例",
    description: "引用头部客户证言或 Logo 墙提升信任度。",
    state: "locked",
  },
  {
    id: "pricing",
    title: "套餐价格",
    description: "提供价格梯度与对比表，支持按钮跳转购买。",
    state: "normal",
  },
  {
    id: "faq",
    title: "常见问题",
    description: "预先解答高频疑问，减少咨询成本。",
    state: "disabled",
  },
];

type SortableListItemProps = {
  item: SortableItem;
  onEdit: (id: string) => void;
  onToggleDisable: (id: string) => void;
  onRemove: (id: string) => void;
};

function SortableListItem({
  item,
  onEdit,
  onToggleDisable,
  onRemove,
}: SortableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: item.id,
      disabled: item.state !== "normal",
      transition: {
        duration: 200,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    });

  const style = useMemo(() => {
    const merged: Transform = transform ?? {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    };
    return {
      transform: CSS.Transform.toString(merged),
      transition,
      zIndex: isDragging ? 20 : undefined,
    };
  }, [transform, transition, isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border/60 bg-background/95 px-4 py-3 shadow-sm transition focus-visible:ring-2 focus-visible:ring-ring",
        item.state === "disabled"
          ? "opacity-50 grayscale"
          : item.state === "locked"
            ? "border-dashed border-border/80 bg-muted/40"
            : undefined,
        isDragging && "border-primary/60 shadow-lg",
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "size-9 cursor-grab touch-none rounded-full text-muted-foreground transition hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring active:cursor-grabbing",
          item.state !== "normal" && "cursor-not-allowed opacity-40",
        )}
        {...listeners}
        {...attributes}
        disabled={item.state !== "normal"}
      >
        <GripVertical className="size-4" />
      </Button>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-foreground">{item.title}</span>
          {item.state === "locked" && (
            <Badge variant="outline" className="gap-1 border-dashed text-xs text-muted-foreground">
              <Lock className="size-3" />
              已锁定
            </Badge>
          )}
          {item.state === "disabled" && (
            <Badge variant="secondary" className="bg-muted text-xs text-muted-foreground">
              已禁用
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={item.state === "locked"}
              onClick={() => onEdit(item.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>编辑配置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={item.state === "locked"}
              onClick={() => onToggleDisable(item.id)}
              className={cn(
                "text-muted-foreground hover:text-foreground",
                item.state === "disabled" && "text-amber-500 hover:text-amber-500",
              )}
            >
              <Archive className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {item.state === "disabled" ? "恢复可用" : "设为禁用"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={item.state === "locked"}
              onClick={() => onRemove(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>删除模块</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function DraggableSortableListSnippet() {
  const [items, setItems] = useState<SortableItem[]>(INITIAL_ITEMS);
  const [withAxisLock, setWithAxisLock] = useState<boolean>(true);
  const [lastAction, setLastAction] = useState<string>("拖拽或使用操作按钮体验排序逻辑。");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const draggableCount = useMemo(
    () => items.filter((item) => item.state === "normal").length,
    [items],
  );

  const restrictToVertical: Modifier = useCallback(
    ({ transform }) => ({
      ...transform,
      x: 0,
    }),
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }
      let movedTitle = "";
      let targetIndex = 0;
      setItems((prev) => {
        const activeIndex = prev.findIndex((item) => item.id === active.id);
        const overIndex = prev.findIndex((item) => item.id === over.id);
        if (activeIndex === -1 || overIndex === -1) {
          return prev;
        }
        const activeItem = prev[activeIndex];
        const overItem = prev[overIndex];
        if (activeItem.state !== "normal" || overItem.state !== "normal") {
          return prev;
        }
        movedTitle = activeItem.title;
        targetIndex = overIndex;
        return arrayMove(prev, activeIndex, overIndex);
      });
      if (movedTitle) {
        setLastAction(`已调整顺序：「${movedTitle}」现在位于第 ${targetIndex + 1} 位。`);
      }
    },
    [setLastAction],
  );

  const handleEdit = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) {
      return;
    }
    setLastAction(`准备编辑「${target.title}」，可打开右侧表单或在侧栏展示配置。`);
  };

  const handleToggleDisable = (id: string) => {
    let targetTitle = "";
    let nextState: SortableItemState | null = null;
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        targetTitle = item.title;
        nextState = item.state === "disabled" ? "normal" : "disabled";
        return { ...item, state: nextState };
      });
      return next;
    });
    if (targetTitle && nextState) {
      setLastAction(
        nextState === "disabled"
          ? `已将「${targetTitle}」标记为禁用，暂不参与排序。`
          : `已恢复「${targetTitle}」为可用模块。`,
      );
    }
  };

  const handleRemove = (id: string) => {
    let removedTitle = "";
    setItems((prev) =>
      prev.filter((item) => {
        if (item.id === id) {
          removedTitle = item.title;
          return false;
        }
        return true;
      }),
    );
    if (removedTitle) {
      setLastAction(`已删除模块「${removedTitle}」，可稍后从模板库重新添加。`);
    }
  };

  const handleReset = () => {
    setItems(INITIAL_ITEMS);
    setLastAction("列表已重置为初始顺序。");
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">拖拽排序列表</CardTitle>
              <CardDescription>
                基于 @dnd-kit 的 SortableContext 构建卡片式排序，内置锁定、禁用与删除状态，适用于栏目配置或菜单管理。
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-muted">
              {draggableCount} 个可拖拽项
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Switch
                id="axis-lock"
                checked={withAxisLock}
                onCheckedChange={setWithAxisLock}
              />
              <label htmlFor="axis-lock" className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                限制垂直方向拖拽
              </label>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              恢复初始排序
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={
              withAxisLock
                ? [restrictToVertical]
                : undefined
            }
          >
            <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
              <div className="space-y-3">
                {items.map((item) => (
                  <SortableListItem
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onToggleDisable={handleToggleDisable}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            {lastAction}
          </div>
          <p className="text-xs text-muted-foreground">
            · 拖拽条目即可重新排序；锁定项无法拖拽或删除。<br />
            · 禁用项会保留在列表中但不参与排序，可随时恢复。<br />
            · 演示了如何在同一组件内处理多种状态而不干扰核心的拖拽逻辑。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

