/**
 * Author: Libra
 * Date: 2025-11-07 16:24:51
 * LastEditors: Libra
 * Description:
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";

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
import { Slider } from "@/components/ui/slider";

import type {
  CountdownStatus,
  CountdownWorkerCommand,
  CountdownWorkerMessage,
  CountdownWorkerUpdate,
} from "./types";

const DEFAULT_DURATION = 150;
const MIN_DURATION = 10;
const MAX_DURATION = 900;
const LOG_LIMIT = 6;

const PRESET_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "25 秒番茄预热", value: 25 },
  { label: "1 分钟", value: 60 },
  { label: "2.5 分钟", value: 150 },
  { label: "5 分钟", value: 300 },
];

type LogEntry = {
  id: string;
  status: CountdownStatus;
  message: string;
  timestamp: number;
};

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const formatClock = (timestamp: number) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(timestamp);

const STATUS_META: Record<
  CountdownStatus,
  { label: string; className: string; helper: string }
> = {
  idle: {
    label: "待命",
    className: "bg-muted text-muted-foreground border-transparent",
    helper: "调整时长后点击开始",
  },
  running: {
    label: "进行中",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
    helper: "计时器通过 Web Worker 精准运行",
  },
  paused: {
    label: "已暂停",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/20",
    helper: "点击继续以恢复倒计时",
  },
  finished: {
    label: "已完成",
    className: "bg-primary/15 text-primary border-primary/20",
    helper: "重新开始会使用当前设置时长",
  },
};

const getLogMessage = (
  status: CountdownStatus,
  previous: CountdownStatus,
  payload: CountdownWorkerUpdate["payload"]
) => {
  switch (status) {
    case "running":
      if (previous === "paused") {
        return `继续倒计时，剩余 ${formatDuration(payload.remaining)}`;
      }
      return `启动 ${formatDuration(payload.total)} 计时`; // previous idle/finished
    case "paused":
      return `已暂停，剩余 ${formatDuration(payload.remaining)}`;
    case "finished":
      return "倒计时结束 🎉";
    case "idle":
      if (payload.total > 0) {
        return `已重置到 ${formatDuration(payload.total)}`;
      }
      return "计时器已清空";
    default:
      return "";
  }
};

export function CountdownTimerSnippet() {
  const workerRef = useRef<Worker | null>(null);
  const previousStatusRef = useRef<CountdownStatus>("idle");

  const [pickerSeconds, setPickerSeconds] = useState(DEFAULT_DURATION);
  const [status, setStatus] = useState<CountdownStatus>("idle");
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_DURATION);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATION);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const progress = useMemo(() => {
    if (totalSeconds <= 0) {
      return 0;
    }
    const ratio = (totalSeconds - remainingSeconds) / totalSeconds;
    if (!Number.isFinite(ratio)) {
      return 0;
    }
    return Math.min(1, Math.max(0, ratio));
  }, [remainingSeconds, totalSeconds]);

  const pushLog = useCallback((entry: Omit<LogEntry, "id">) => {
    setLogs((previous) => {
      const id = `${entry.timestamp}-${entry.status}-${previous.length}`;
      const nextEntry: LogEntry = { id, ...entry };
      return [nextEntry, ...previous].slice(0, LOG_LIMIT);
    });
  }, []);

  const postCommand = useCallback((command: CountdownWorkerCommand) => {
    workerRef.current?.postMessage(command);
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL("./countdown.worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    const handleMessage = (event: MessageEvent<CountdownWorkerMessage>) => {
      const message = event.data;
      if (!message || message.type !== "update") {
        return;
      }

      const {
        status: nextStatus,
        total,
        remaining,
        timestamp,
      } = message.payload;
      const previousStatus = previousStatusRef.current;

      setStatus(nextStatus);
      setTotalSeconds(total);
      setRemainingSeconds(remaining);

      if (nextStatus !== "running" && nextStatus !== "paused") {
        setPickerSeconds(total);
      }

      if (previousStatus !== nextStatus) {
        const logMessage = getLogMessage(
          nextStatus,
          previousStatus,
          message.payload
        );
        if (logMessage) {
          pushLog({
            message: logMessage,
            status: nextStatus,
            timestamp,
          });
        }
        previousStatusRef.current = nextStatus;
      }
    };

    workerRef.current = worker;
    worker.addEventListener("message", handleMessage);
    worker.postMessage({
      type: "set-duration",
      payload: { duration: DEFAULT_DURATION },
    } satisfies CountdownWorkerCommand);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, [pushLog]);

  const handleStart = useCallback(() => {
    const seconds = Math.min(
      MAX_DURATION,
      Math.max(MIN_DURATION, pickerSeconds)
    );
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    postCommand({ type: "start", payload: { duration: seconds } });
  }, [pickerSeconds, postCommand]);

  const handlePause = useCallback(() => {
    postCommand({ type: "pause" });
  }, [postCommand]);

  const handleResume = useCallback(() => {
    postCommand({ type: "resume" });
  }, [postCommand]);

  const handleReset = useCallback(() => {
    postCommand({ type: "reset" });
  }, [postCommand]);

  const syncDuration = useCallback(
    (value: number) => {
      const normalized = Math.min(MAX_DURATION, Math.max(MIN_DURATION, value));
      setPickerSeconds(normalized);
      if (status !== "running") {
        setTotalSeconds(normalized);
        setRemainingSeconds(normalized);
        postCommand({
          type: "set-duration",
          payload: { duration: normalized },
        });
      }
    },
    [postCommand, status]
  );

  const handlePresetClick = (value: number) => {
    syncDuration(value);
  };

  const handleSliderChange = (values: number[]) => {
    const [value] = values;
    if (typeof value !== "number") {
      return;
    }
    syncDuration(value);
  };

  const statusMeta = STATUS_META[status];
  const progressPercent = Math.round(progress * 100);

  const primaryAction = useMemo(() => {
    if (status === "running") {
      return {
        label: "暂停",
        icon: PauseCircle,
        handler: handlePause,
      } as const;
    }
    if (status === "paused") {
      return {
        label: "继续",
        icon: PlayCircle,
        handler: handleResume,
      } as const;
    }
    if (status === "finished") {
      return {
        label: "重新开始",
        icon: RotateCcw,
        handler: handleStart,
      } as const;
    }
    return {
      label: "开始倒计时",
      icon: PlayCircle,
      handler: handleStart,
    } as const;
  }, [handlePause, handleResume, handleStart, status]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        倒计时逻辑放在 Web Worker
        中执行，即使组件频繁重渲染或页面触发耗时任务，也能保持精确的计时节奏。
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <Card className="space-y-6">
          <CardHeader className="flex flex-col gap-4 px-6 pb-0 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <AlarmClock className="size-4" />
                <span>Countdown</span>
              </div>
              <CardTitle className="font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
                {formatDuration(remainingSeconds)}
              </CardTitle>
              <CardDescription>
                总时长 {formatDuration(totalSeconds)} · 完成度 {progressPercent}
                %
              </CardDescription>
            </div>
            <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pt-0">
            <Progress value={progressPercent} aria-label="倒计时完成度" />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <Card className="space-y-4 border border-border/60 bg-muted/10 shadow-none">
                <CardHeader className="space-y-2 px-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      目标时长
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatDuration(pickerSeconds)}
                    </span>
                  </div>
                  <CardDescription>
                    拖动滑块或者选择下方预设时长，倒计时重新开始时会取这里的数值。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6">
                  <Slider
                    min={MIN_DURATION}
                    max={MAX_DURATION}
                    step={5}
                    value={[pickerSeconds]}
                    onValueChange={handleSliderChange}
                    disabled={status === "running"}
                    aria-label="设置倒计时秒数"
                  />
                  <div className="flex flex-wrap gap-2">
                    {PRESET_OPTIONS.map((preset) => (
                      <Button
                        key={preset.value}
                        type="button"
                        size="sm"
                        variant={
                          preset.value === pickerSeconds
                            ? "secondary"
                            : "outline"
                        }
                        onClick={() => handlePresetClick(preset.value)}
                        disabled={
                          status === "running" && preset.value !== pickerSeconds
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="space-y-3 border border-border/60 bg-muted/10 shadow-none">
                <CardHeader className="px-6">
                  <CardTitle className="text-base font-medium text-foreground">
                    倒计时控制
                  </CardTitle>
                  <CardDescription>{statusMeta.helper}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-6">
                  <Button
                    type="button"
                    className="h-11 w-full text-base"
                    onClick={primaryAction.handler}
                  >
                    <primaryAction.icon className="size-5" />
                    {primaryAction.label}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                    disabled={
                      status === "idle" && remainingSeconds === totalSeconds
                    }
                  >
                    <RotateCcw className="size-4" />
                    重置到目标时长
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-6">
          <CardHeader className="p-0">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              事件记录
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-0 text-sm text-muted-foreground">
            {logs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 px-4 py-5 text-center text-sm text-muted-foreground/80">
                尚无状态变化，尝试启动倒计时看看效果。
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/50 bg-background/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{log.message}</p>
                    <p className="text-[11px] text-muted-foreground/80">
                      {formatClock(log.timestamp)}
                    </p>
                  </div>
                  <Badge className={STATUS_META[log.status].className}>
                    {STATUS_META[log.status].label}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
