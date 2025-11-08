import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { nanoid } from "nanoid";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Info,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UploadStatus = "uploading" | "success" | "error";
type UploadCategory = "images" | "documents" | "archives" | "others";

type UploadTask = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  category: UploadCategory;
  error?: string;
  createdAt: number;
};

type StatusMeta = {
  label: string;
  className: string;
};

type CategoryMeta = {
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
};

const MAX_FILES = 12;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ACCEPTED_FILE_TYPES: Accept = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/svg+xml": [],
  "application/pdf": [],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
  "application/zip": [],
};

const STATUS_META: Record<UploadStatus, StatusMeta> = {
  uploading: {
    label: "上传中",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/30 dark:text-sky-200",
  },
  success: {
    label: "已完成",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  error: {
    label: "上传失败",
    className:
      "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive/60 dark:bg-destructive/15",
  },
};

const CATEGORY_META: Record<UploadCategory, CategoryMeta> = {
  images: {
    label: "图片素材",
    hint: "JPG · PNG · WebP · SVG",
    icon: (props) => <ImageIcon {...props} />,
  },
  documents: {
    label: "文档",
    hint: "PDF · PPTX · XLSX",
    icon: (props) => <FileText {...props} />,
  },
  archives: {
    label: "压缩包",
    hint: "ZIP",
    icon: (props) => <FileArchive {...props} />,
  },
  others: {
    label: "其他格式",
    hint: "未在白名单的类型",
    icon: (props) => <Info {...props} />,
  },
};

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function getCategory(file: File): UploadCategory {
  if (file.type.startsWith("image/")) {
    return "images";
  }
  if (
    file.type === "application/pdf" ||
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "documents";
  }
  if (file.type === "application/zip") {
    return "archives";
  }
  return "others";
}

export function FileUploadPanelSnippet() {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [lastAction, setLastAction] = useState<string>("拖拽文件或点击右侧按钮，体验多文件上传流程。");
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const clearTimer = useCallback((taskId: string) => {
    const timer = timersRef.current.get(taskId);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(taskId);
    }
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearInterval(timer));
      timersRef.current.clear();
    };
  }, []);

  const startUpload = useCallback(
    (taskId: string, file: File) => {
      clearTimer(taskId);
      const timer = setInterval(() => {
        let outcomeStatus: UploadStatus | null = null;
        let outcomeMessage = "";
        setTasks((prev) =>
          prev.map((task) => {
            if (task.id !== taskId || task.status !== "uploading") {
              return task;
            }

            const increment = Math.min(25, Math.max(7, Math.round(Math.random() * 18)));
            const nextProgress = Math.min(task.progress + increment, 100);
            const shouldFail = nextProgress > 60 && Math.random() < 0.07;

            if (shouldFail) {
              outcomeStatus = "error";
              outcomeMessage = `「${file.name}」上传失败，请检查网络后重试。`;
              return {
                ...task,
                progress: nextProgress,
                status: "error",
                error: "网络波动导致上传中断，可稍后重试。",
              };
            }

            if (nextProgress >= 100) {
              outcomeStatus = "success";
              outcomeMessage = `「${file.name}」已上传完成。`;
              return {
                ...task,
                progress: 100,
                status: "success",
                error: undefined,
              };
            }

            return {
              ...task,
              progress: nextProgress,
            };
          }),
        );

        if (outcomeStatus) {
          clearTimer(taskId);
          if (outcomeStatus === "success") {
            toast.success(outcomeMessage);
            setLastAction(outcomeMessage);
          } else {
            toast.error(outcomeMessage);
            setLastAction(outcomeMessage);
          }
        }
      }, 480 + Math.random() * 260);

      timersRef.current.set(taskId, timer);
    },
    [clearTimer],
  );

  const stopUpload = useCallback(
    (taskId: string) => {
      clearTimer(taskId);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId && task.status === "uploading"
            ? {
                ...task,
                status: "error",
                error: "已取消上传。",
              }
            : task,
        ),
      );
    },
    [clearTimer],
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const remainingSlots = MAX_FILES - tasks.length;
      if (remainingSlots <= 0) {
        toast.warning(`最多仅支持上传 ${MAX_FILES} 个文件，可先删除旧文件。`);
        return;
      }

      const existsKey = new Set(tasks.map((task) => `${task.file.name}-${task.file.size}`));
      const filtered = acceptedFiles.filter((file) => {
        const key = `${file.name}-${file.size}`;
        if (existsKey.has(key)) {
          toast.info(`已忽略重复文件「${file.name}」。`);
          return false;
        }
        existsKey.add(key);
        return true;
      });

      if (filtered.length === 0) {
        return;
      }
      const filesToUse = filtered.slice(0, remainingSlots);
      const newTasks: UploadTask[] = filesToUse.map((file) => ({
        id: nanoid(),
        file,
        status: "uploading",
        progress: Math.min(12, Math.round(Math.random() * 10)),
        category: getCategory(file),
        createdAt: Date.now(),
      }));

      setTasks((prev) => [...newTasks, ...prev]);
      newTasks.forEach((task) => startUpload(task.id, task.file));
      setLastAction(`已加入 ${newTasks.length} 个文件到上传队列。`);
      toast.success(`已加入 ${newTasks.length} 个文件到上传队列。`);
    },
    [startUpload, tasks],
  );

  const handleDropRejected = useCallback((rejections: FileRejection[]) => {
    rejections.forEach(({ file, errors }) => {
      errors.forEach((error) => {
        switch (error.code) {
          case "file-too-large":
            toast.error(`「${file.name}」超过 ${formatBytes(MAX_FILE_SIZE)} 的限制。`);
            break;
          case "file-invalid-type":
            toast.error(`「${file.name}」类型不在允许范围内。`);
            break;
          case "too-many-files":
            toast.error("文件数量超过限制，请分批上传。");
            break;
          default:
            toast.error(`上传「${file.name}」时出现未知错误。`);
            break;
        }
      });
    });
  }, []);

  const handleRemove = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);
      stopUpload(taskId);
      setTasks((prev) => prev.filter((item) => item.id !== taskId));
      if (task) {
        setLastAction(`已移除文件「${task.file.name}」。`);
      }
    },
    [stopUpload, tasks],
  );

  const handleRetry = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId
            ? {
                ...item,
                status: "uploading",
                progress: 0,
                error: undefined,
              }
            : item,
        ),
      );
      startUpload(taskId, task.file);
      setLastAction(`重新上传「${task.file.name}」，请稍候...`);
    },
    [startUpload, tasks],
  );

  const handleClearCompleted = useCallback(() => {
    const successItems = tasks.filter((item) => item.status === "success");
    if (successItems.length === 0) {
      toast.info("当前没有已完成的文件。");
      return;
    }
    successItems.forEach((item) => clearTimer(item.id));
    setTasks((prev) => prev.filter((item) => item.status !== "success"));
    setLastAction(`已清理 ${successItems.length} 个已完成的文件。`);
  }, [clearTimer, tasks]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const uploading = tasks.filter((task) => task.status === "uploading").length;
    const success = tasks.filter((task) => task.status === "success").length;
    const failed = tasks.filter((task) => task.status === "error").length;
    const totalSize = tasks.reduce((acc, task) => acc + task.file.size, 0);
    return {
      total,
      uploading,
      success,
      failed,
      totalSize,
    };
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    return (Object.keys(CATEGORY_META) as UploadCategory[]).map((category) => ({
      category,
      items: tasks.filter((task) => task.category === category),
    }));
  }, [tasks]);

  const { getRootProps, getInputProps, isDragActive, open: openPicker } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    noClick: true,
    onDrop: handleDrop,
    onDropRejected: handleDropRejected,
  });

  return (
    <div className="space-y-6">
      <Card className="border border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">文件上传面板</CardTitle>
              <CardDescription>
                支持拖拽、批量、进度反馈与状态通知的上传流程，适用于后台素材管理场景。
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-muted px-3 py-1 text-sm">
              已加入 {summary.total} / {MAX_FILES} 个文件
            </Badge>
          </div>
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
              <Loader2 className="size-3.5 text-sky-500" />
              正在上传 {summary.uploading}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-200">
              <CheckCircle2 className="size-3.5" />
              已完成 {summary.success}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive">
              <AlertCircle className="size-3.5" />
              失败 {summary.failed}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
              <Archive className="size-3.5 text-muted-foreground" />
              总体积 {formatBytes(summary.totalSize)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            {...getRootProps({
              className: cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center transition",
                isDragActive && "border-primary/60 bg-primary/5",
              ),
            })}
          >
            <input {...getInputProps()} />
            <UploadCloud className="size-10 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                拖拽文件到此区域，或
                <Button
                  type="button"
                  variant="link"
                  className="px-1 text-primary"
                  onClick={(event) => {
                    event.preventDefault();
                    openPicker();
                  }}
                >
                  点击选择
                </Button>
              </p>
              <p className="text-xs text-muted-foreground">
                单个文件不超过 {formatBytes(MAX_FILE_SIZE)}，支持 {Object.values(CATEGORY_META)
                  .map((meta) => meta.hint)
                  .join("、")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              最近操作：<span className="text-foreground">{lastAction}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClearCompleted}>
                清理已完成
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={tasks.length === 0}
                onClick={() => {
                  timersRef.current.forEach((_, taskId) => clearTimer(taskId));
                  setTasks([]);
                  setLastAction("已清空当前队列。");
                }}
              >
                清空队列
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            {groupedTasks.map(({ category, items }) => {
              if (items.length === 0) {
                return null;
              }
              const meta = CATEGORY_META[category];
              return (
                <div
                  key={category}
                  className="rounded-2xl border border-border/60 bg-background/95 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <meta.icon className="size-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {meta.label}（{items.length}）
                        </p>
                        <p className="text-xs text-muted-foreground">{meta.hint}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-3">
                    {items.map((task) => (
                      <div
                        key={task.id}
                        className="grid gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_160px]"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{task.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {task.file.type || "未识别类型"} · {formatBytes(task.file.size)}
                              </p>
                            </div>
                            <Badge className={cn("border px-2 py-0.5 text-xs", STATUS_META[task.status].className)}>
                              {STATUS_META[task.status].label}
                            </Badge>
                          </div>
                          <div>
                            <Progress
                              value={task.progress}
                              className={cn(
                                "h-2 overflow-hidden rounded-full",
                                task.status === "error" && "bg-destructive/20",
                              )}
                            />
                            {task.error ? (
                              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="size-3.5" />
                                {task.error}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {task.status === "error" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetry(task.id)}
                            >
                              <RotateCcw className="mr-2 size-4" />
                              重新上传
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemove(task.id)}
                            >
                              {task.status === "uploading" ? (
                                <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />
                              ) : (
                                <X className="mr-2 size-4" />
                              )}
                              {task.status === "uploading" ? "取消" : "移除"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
                当前暂无上传任务，拖拽文件或点击上方按钮添加素材。
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

