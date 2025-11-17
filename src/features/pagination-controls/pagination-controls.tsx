import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

type PaginationPreset = {
  id: string;
  total: number;
  label: string;
};

const paginationPresets: PaginationPreset[] = [
  { id: "dataset-1", total: 84, label: "增长项目库" },
  { id: "dataset-2", total: 356, label: "订单列表" },
  { id: "dataset-3", total: 1280, label: "活动报名" },
];

const pageSizeOptions = [8, 12, 24];

function getPageRange(current: number, totalPages: number) {
  const delta = 1;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(totalPages - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push("...");
  }
  rangeWithDots.push(...range);
  if (current + delta < totalPages - 1) {
    rangeWithDots.push("...");
  }

  return [1, ...rangeWithDots, totalPages].filter((item, index, array) => {
    if (typeof item === "string") {
      return (
        index === 0 ||
        typeof array[index - 1] !== "string" ||
        array[index - 1] !== "..."
      );
    }
    if (index === 0 || index === array.length - 1) {
      return true;
    }
    return array[index - 1] !== item;
  });
}

export function PaginationControlsSnippet() {
  const [presetId, setPresetId] = useState(paginationPresets[0].id);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showQuickJump, setShowQuickJump] = useState(true);
  const [jumpValue, setJumpValue] = useState("");

  const preset = paginationPresets.find((item) => item.id === presetId)!;
  const totalPages = Math.max(1, Math.ceil(preset.total / pageSize));
  const displayRange = useMemo(
    () => getPageRange(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handlePageChange = (page: number) => {
    const safePage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(safePage);
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(preset.total, currentPage * pageSize);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground/90">
              Pagination Control
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              支持页码、省略号、每页数量切换与快速跳转的分页组件，可切换不同数据集模拟真实列表。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {paginationPresets.map((option) => (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={presetId === option.id ? "default" : "outline"}
                className={cn(
                  "rounded-full px-3 text-xs",
                  presetId !== option.id &&
                    "bg-background/40 text-muted-foreground hover:text-foreground",
                )}
                onClick={() => {
                  setPresetId(option.id);
                  setCurrentPage(1);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              总记录数
            </p>
            <p className="text-2xl font-semibold text-foreground">{preset.total}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              当前范围
            </p>
            <p className="text-sm font-semibold text-foreground">
              {start} - {end}
            </p>
            <p className="text-xs text-muted-foreground">第 {currentPage} 页</p>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <span>显示快速跳转</span>
            <Switch checked={showQuickJump} onCheckedChange={setShowQuickJump} />
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>每页：</span>
          {pageSizeOptions.map((size) => {
            const active = pageSize === size;
            return (
              <Button
                key={size}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className={cn(
                  "rounded-full border border-border/60 px-3 text-xs",
                  !active &&
                    "bg-background/40 text-muted-foreground hover:text-foreground",
                )}
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              >
                {size}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
              第 {currentPage}/{totalPages} 页
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
              共 {preset.total} 条
            </span>
          </div>

          {showQuickJump && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>快捷跳转：</span>
              {[1, Math.ceil(totalPages / 2), totalPages].map((target) => (
                <Button
                  key={target}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handlePageChange(target)}
                >
                  第 {target} 页
                </Button>
              ))}
              <form
                className="flex items-center gap-1 text-xs"
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = Number(jumpValue);
                  if (!Number.isNaN(value) && value >= 1) {
                    handlePageChange(value);
                    setJumpValue("");
                  }
                }}
              >
                <Input
                  value={jumpValue}
                  onChange={(event) => setJumpValue(event.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="页码"
                  className="h-8 w-16 text-center text-xs"
                  inputMode="numeric"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  disabled={!jumpValue}
                >
                  跳转
                </Button>
              </form>
            </div>
          )}
        </div>

        <Pagination className="w-full justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                size="default"
                className={cn(
                  "gap-1 px-3",
                  currentPage === 1 && "pointer-events-none opacity-40",
                )}
                aria-disabled={currentPage === 1}
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">上一页</span>
              </PaginationLink>
            </PaginationItem>

            {displayRange.map((item, index) =>
              typeof item === "number" ? (
                <PaginationItem key={`${item}-${index}`}>
                  <PaginationLink
                    href="#"
                    isActive={item === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationItem key={`${item}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationLink
                href="#"
                size="default"
                className={cn(
                  "gap-1 px-3",
                  currentPage === totalPages && "pointer-events-none opacity-40",
                )}
                aria-disabled={currentPage === totalPages}
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
              >
                <span className="hidden sm:inline">下一页</span>
                <ChevronRight className="size-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="text-center text-xs text-muted-foreground">
          当前使用 shadcn/ui Pagination 组件
        </p>
      </div>
    </section>
  );
}
