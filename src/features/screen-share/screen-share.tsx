import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, MonitorDown, TvMinimalPlay } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ShareStatus = "idle" | "requesting" | "sharing";

type ShareCapability = {
  supported: boolean;
  reason?: string;
};

const FALLBACK_CAPABILITY: ShareCapability = {
  supported: false,
  reason: "当前浏览器不支持 `navigator.mediaDevices.getDisplayMedia`。",
};

const shareStatusMeta: Record<
  ShareStatus,
  { label: string; desc: string; className: string }
> = {
  idle: {
    label: "等待共享",
    desc: "点击开始按钮或自定义参数后再启动。",
    className: "text-muted-foreground",
  },
  requesting: {
    label: "授权中...",
    desc: "浏览器正在弹出屏幕选择面板。",
    className: "text-primary",
  },
  sharing: {
    label: "分享中",
    desc: "已捕获屏幕画面，可通过按钮手动结束。",
    className: "text-emerald-600",
  },
};

export function ScreenShareSnippet() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [preferTab, setPreferTab] = useState(false);

  const capability: ShareCapability = useMemo(() => {
    if (typeof window === "undefined") {
      return FALLBACK_CAPABILITY;
    }
    const supported = Boolean(window.navigator?.mediaDevices?.getDisplayMedia);
    return supported
      ? { supported }
      : {
          supported,
          reason: "当前环境缺少屏幕共享 API，可以尝试切换至 Chrome / Edge 等桌面浏览器。",
        };
  }, []);

  const stopShare = useCallback(
    (reason?: string) => {
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop());
        return null;
      });
      setStatus("idle");
      if (reason) {
        setError(reason);
      }
    },
    [],
  );

  const startShare = useCallback(async () => {
    if (!capability.supported || status === "requesting") {
      return;
    }
    setStatus("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: preferTab ? "browser" : "monitor",
          height: 1080,
          frameRate: 30,
        },
        audio: includeAudio,
        surfaceSwitching: "include",
        selfBrowserSurface: "include",
        systemAudio: includeAudio ? "include" : "exclude",
      } as DisplayMediaStreamOptions);

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) {
        videoTrack.addEventListener("ended", () =>
          stopShare("已从系统面板停止共享。"),
        );
      }

      setStream(stream);
      setStatus("sharing");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "浏览器阻止了屏幕共享，请检查权限。";
      setStatus("idle");
      setError(
        /Permission|denied/i.test(message)
          ? "用户取消或浏览器阻止了共享。"
          : message,
      );
    }
  }, [capability.supported, includeAudio, preferTab, status, stopShare]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (stream) {
      video.srcObject = stream;
      const play = async () => {
        try {
          await video.play();
        } catch (err) {
          console.error("无法播放共享流", err);
        }
      };
      void play();
    } else {
      video.pause();
      video.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const videoSettings = useMemo(() => {
    const track = stream?.getVideoTracks()[0];
    return track?.getSettings();
  }, [stream]);

  const audioActive = Boolean(stream?.getAudioTracks().length);
  const statusCopy = shareStatusMeta[status];

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground/90">
              屏幕共享控制台
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              通过 `navigator.mediaDevices.getDisplayMedia` 捕获桌面、浏览器标签页或应用窗口，并实时预览。
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {statusCopy.label}
          </Badge>
        </div>
        <p className={cn("mt-3 text-xs", statusCopy.className)}>
          {statusCopy.desc}
        </p>
        {error ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">共享预览</p>
              <p className="text-xs text-muted-foreground">
                浏览器会在屏幕选择完成后出画面
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={startShare}
                disabled={!capability.supported || status === "requesting" || status === "sharing"}
              >
                <TvMinimalPlay className="size-4" />
                开始共享
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={() => stopShare("已手动结束共享。")}
                disabled={status !== "sharing"}
              >
                <MonitorDown className="size-4" />
                结束
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80">
            <div
              className={cn(
                "absolute inset-0 grid place-items-center text-center text-sm text-muted-foreground transition-opacity",
                stream ? "opacity-0" : "opacity-100",
              )}
            >
              <p>
                {capability.supported
                  ? "尚未开始共享，点击“开始共享”体验。"
                  : capability.reason}
              </p>
            </div>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted={!audioActive}
              className="relative z-10 aspect-video w-full rounded-2xl object-cover"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
          <div>
            <p className="text-sm font-semibold text-foreground">共享选项</p>
            <p className="text-xs text-muted-foreground">
              调整参数后重新开始共享即可生效
            </p>
          </div>
            <div className="space-y-4 text-sm">
              <label className="flex items-center justify-between text-muted-foreground">
                <span>捕获系统音频</span>
                <Switch checked={includeAudio} onCheckedChange={setIncludeAudio} />
              </label>
              <label className="flex items-center justify-between text-muted-foreground">
                <span>优先当前浏览器标签页</span>
                <Switch checked={preferTab} onCheckedChange={setPreferTab} />
              </label>
            </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-3 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              实时参数
            </p>
            <ul className="mt-2 space-y-1 font-mono text-[12px]">
              <li>
                分辨率：{" "}
                {videoSettings
                  ? `${videoSettings.width ?? "?"} x ${videoSettings.height ?? "?"}`
                  : "—"}
              </li>
              <li>帧率： {videoSettings?.frameRate ?? "—"} fps</li>
              <li>
                音频：{" "}
                {status === "sharing"
                  ? audioActive
                    ? "捕获系统/标签页音频"
                    : "未捕获"
                  : "—"}
              </li>
              <li>DisplaySurface： {videoSettings?.displaySurface ?? (preferTab ? "browser" : "monitor")}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
