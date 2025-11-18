import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "camera-capture",
  "title": "摄像头捕获与拍照",
  "excerpt": "调用 `navigator.mediaDevices.getUserMedia` 打开摄像头，实时预览并生成 PNG 快照，附带分辨率/前后摄选择与相册管理。",
  "keywords": [
    "摄像头",
    "拍照",
    "WebRTC",
    "Canvas"
  ],
  "detail": {
    "overview": "通过 getUserMedia 获取 MediaStream，渲染到 video 元素中，并结合 canvas 将当前帧导出为图片存入相册，可自定义分辨率、镜像效果与前/后摄，同时处理权限异常与资源释放。",
    "implementation": [
      "检测浏览器对 getUserMedia 的支持情况并维护 `CameraStatus`，在“开启摄像头”按钮点击后，根据分辨率和 facingMode 组装约束发起请求。",
      "成功获取流后将其赋值给 video.srcObject 并播放，用户可以切换镜像效果以匹配前置摄像头的体验；停止时调用 track.stop() 释放资源。",
      "拍照按钮通过 canvas.drawImage(video) 抓取当前帧并转成 `canvas.toDataURL()` 存入相册，记录捕获时间与分辨率，提供下载/删除/清空操作。",
      "组件卸载或重新请求时及时停止旧流，避免摄像头持续占用；错误提示区展示权限拒绝、设备被占用等异常信息。"
    ],
    "notes": [
      "摄像头访问需 HTTPS 或 localhost 环境，且必须在用户交互后触发 getUserMedia。",
      "若设备不存在后置摄像头（例如桌面），facingMode=environment 可能会忽略，可在实际项目中通过 enumerateDevices 做更细粒度判断。",
      "持续抓帧需关注内存占用，可以限制相册数量或使用 URL.createObjectURL + revokeObjectURL。"
    ]
  },
  "codeExamples": [
    {
      "name": "开启摄像头",
      "language": "ts",
      "code": "const startCamera = async () => {\n  setStatus(\"requesting\")\n  const constraints: MediaStreamConstraints = {\n    video: {\n      width: { ideal: preset.width },\n      height: { ideal: preset.height },\n      facingMode,\n    },\n    audio: false,\n  }\n  try {\n    const stream = await navigator.mediaDevices.getUserMedia(constraints)\n    setStream(stream)\n    setStatus(\"streaming\")\n  } catch (error) {\n    setStatus(\"idle\")\n    setError(\"用户拒绝或设备被占用\")\n  }\n}"
    },
    {
      "name": "抓取当前帧生成 PNG",
      "language": "ts",
      "code": "const capturePhoto = () => {\n  if (!videoRef.current) return\n  const canvas = document.createElement(\"canvas\")\n  canvas.width = videoRef.current.videoWidth\n  canvas.height = videoRef.current.videoHeight\n  const ctx = canvas.getContext(\"2d\")\n  ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)\n  const dataUrl = canvas.toDataURL(\"image/png\")\n  setShots((prev) => [{ id: crypto.randomUUID(), dataUrl }, ...prev])\n}"
    }
  ],
  "resources": [
    {
      "title": "MDN: MediaDevices.getUserMedia()",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia"
    },
    {
      "title": "MDN: CanvasRenderingContext2D.drawImage()",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage"
    },
    {
      "title": "web.dev: Camera capture",
      "url": "https://web.dev/articles/media-capturing-images"
    }
  ]
};
