import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, Download, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type CameraStatus = "idle" | "requesting" | "streaming";
type FacingMode = "user" | "environment";

type CaptureShot = {
  id: string;
  dataUrl: string;
  createdAt: string;
  resolution: string;
};

const resolutionPresets = [
  { id: "hd", label: "HD · 1280x720", width: 1280, height: 720 },
  { id: "full-hd", label: "Full HD · 1920x1080", width: 1920, height: 1080 },
  { id: "square", label: "Square · 1080x1080", width: 1080, height: 1080 },
] as const;

const capabilityFallback = {
  supported: false,
  reason: "当前浏览器不支持 `navigator.mediaDevices.getUserMedia`。",
};

const statusMeta: Record<
  CameraStatus,
  { label: string; desc: string; badgeClass: string }
> = {
  idle: {
    label: "闲置",
    desc: "点击“开启摄像头”以初始化视频流。",
    badgeClass: "bg-muted text-muted-foreground",
  },
  requesting: {
    label: "申请权限中",
    desc: "请在浏览器弹窗中授权摄像头访问。",
    badgeClass: "bg-amber-500/20 text-amber-700",
  },
  streaming: {
    label: "采集中",
    desc: "视频流已就绪，可点击拍照或停止采集。",
    badgeClass: "bg-emerald-500/20 text-emerald-600",
  },
};

export function CameraCaptureSnippet() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [shots, setShots] = useState<CaptureShot[]>([]);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [mirrorPreview, setMirrorPreview] = useState(true);
  const [resolutionId, setResolutionId] =
    useState<(typeof resolutionPresets)[number]["id"]>("hd");
  const [capturing, setCapturing] = useState(false);

  const capability = useMemo(() => {
    if (typeof window === "undefined") {
      return capabilityFallback;
    }
    const hasAccess = Boolean(window.navigator?.mediaDevices?.getUserMedia);
    return hasAccess
      ? { supported: true }
      : {
          supported: false,
          reason:
            "当前环境缺少摄像头访问能力，请在支持 WebRTC 的浏览器中体验。",
        };
  }, []);

  const stopCamera = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
    setStatus("idle");
  }, []);

  const startCamera = useCallback(async () => {
    if (!capability.supported || status === "requesting") {
      return;
    }
    setStatus("requesting");
    setError(null);

    const preset = resolutionPresets.find((item) => item.id === resolutionId)!;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: preset.width },
          height: { ideal: preset.height },
          facingMode,
        },
        audio: false,
      });
      setStream(stream);
      setStatus("streaming");
      if (facingMode === "environment") {
        setMirrorPreview(false);
      }
    } catch (err) {
      setStatus("idle");
      const message =
        err instanceof Error ? err.message : "摄像头开启失败，请检查权限。";
      setError(
        /Permission|denied/i.test(message)
          ? "用户拒绝了摄像头访问或设备被占用。"
          : message,
      );
    }
  }, [capability.supported, facingMode, resolutionId, status]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }
    if (capturing || status !== "streaming") {
      return;
    }

    setCapturing(true);
    const video = videoRef.current;
    const canvas =
      canvasRef.current ?? document.createElement("canvas");

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCapturing(false);
      return;
    }

    if (mirrorPreview) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    if (mirrorPreview) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    canvasRef.current = canvas;
    const dataUrl = canvas.toDataURL("image/png");
    const now = new Date();
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setShots((prev) => [
      {
        id,
        dataUrl,
        createdAt: now.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        resolution: `${width}x${height}`,
      },
      ...prev,
    ]);
    setCapturing(false);
  }, [capturing, mirrorPreview, status]);

  const clearShots = useCallback(() => {
    setShots([]);
  }, []);

  const removeShot = useCallback((id: string) => {
    setShots((prev) => prev.filter((shot) => shot.id !== id));
  }, []);

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
          console.error("无法播放摄像头流", err);
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

  const statusInfo = statusMeta[status];
  const activePreset = resolutionPresets.find(
    (item) => item.id === resolutionId,
  )!;

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground/90">
              Camera Capture Booth
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              通过 `navigator.mediaDevices.getUserMedia` 调用摄像头，实时预览并生成 PNG 截图。
            </p>
          </div>
          <Badge className={cn("rounded-full px-3 py-1 text-xs", statusInfo.badgeClass)}>
            {statusInfo.label}
          </Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{statusInfo.desc}</p>
        {error ? (
          <div className="mt-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">实时预览</p>
              <p className="text-xs text-muted-foreground">
                {stream ? "摄像头已就绪" : capability.reason ?? "等待开启摄像头"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={startCamera}
                disabled={!capability.supported || status === "requesting"}
              >
                <Camera className="size-4" />
                开启摄像头
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1 text-muted-foreground"
                disabled={status !== "streaming"}
                onClick={stopCamera}
              >
                <CameraOff className="size-4" />
                停止
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
                  ? "点击“开启摄像头”并允许浏览器访问。"
                  : capability.reason}
              </p>
            </div>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={cn(
                "relative z-10 aspect-video w-full object-cover transition-transform",
                mirrorPreview && "scale-x-[-1]",
              )}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm">
            <div className="space-y-1 text-xs">
              <p className="text-muted-foreground/80">
                分辨率：{activePreset.label}
              </p>
              <p className="text-muted-foreground/80">
                摄像头方向：{facingMode === "user" ? "前置" : "后置"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <span>镜像预览</span>
                <Switch
                  checked={mirrorPreview}
                  onCheckedChange={setMirrorPreview}
                  disabled={status !== "streaming"}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="gap-2"
              disabled={status !== "streaming" || capturing}
              onClick={capturePhoto}
            >
              <Camera className="size-4" />
              {capturing ? "处理中..." : "拍照"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearShots}
              disabled={shots.length === 0}
              className="gap-1 text-muted-foreground"
            >
              <RotateCcw className="size-4" />
              清空相册
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
          <div>
            <p className="text-sm font-semibold text-foreground">采集参数</p>
            <p className="text-xs text-muted-foreground">
              切换参数后重新开启摄像头生效
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                分辨率
              </p>
              <div className="flex flex-wrap gap-2">
                {resolutionPresets.map((preset) => {
                  const active = preset.id === resolutionId;
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-full border border-border/60 px-3 text-xs",
                        !active &&
                          "bg-background/40 text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setResolutionId(preset.id)}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                方向
              </p>
              <div className="flex flex-wrap gap-2">
                {(["user", "environment"] as FacingMode[]).map((mode) => {
                  const active = facingMode === mode;
                  return (
                    <Button
                      key={mode}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-full border border-border/60 px-3 text-xs",
                        !active &&
                          "bg-background/40 text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => {
                        setFacingMode(mode);
                        if (mode === "environment") {
                          setMirrorPreview(false);
                        }
                      }}
                    >
                      {mode === "user" ? "前置" : "后置"}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              已拍摄
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {shots.length}
            </p>
            <p className="text-xs text-muted-foreground">张照片</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-border/60 bg-card/70 p-4 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">快照相册</p>
          <p className="text-xs text-muted-foreground">
            点击下载可保存 PNG，默认只保留最近 6 张
          </p>
        </div>
        {shots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
            暂无快照，点击“拍照”按钮生成。
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {shots.slice(0, 6).map((shot) => (
              <div
                key={shot.id}
                className="space-y-2 rounded-2xl border border-border/60 bg-background/80 p-3"
              >
                <figure className="overflow-hidden rounded-xl border border-border/70">
                  <img
                    src={shot.dataUrl}
                    alt={`捕获于 ${shot.createdAt}`}
                    className="h-40 w-full object-cover"
                  />
                </figure>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{shot.createdAt}</span>
                  <span>{shot.resolution}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button asChild size="sm" variant="outline" className="gap-1 text-xs">
                    <a
                      href={shot.dataUrl}
                      download={`camera-shot-${shot.createdAt.replace(/[:\s]/g, "-")}.png`}
                    >
                      <Download className="size-4" />
                      下载
                    </a>
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeShot(shot.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
