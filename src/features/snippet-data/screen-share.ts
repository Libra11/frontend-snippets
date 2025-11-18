import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "screen-share",
  "title": "屏幕共享控制台",
  "excerpt": "调用 `navigator.mediaDevices.getDisplayMedia` 捕获桌面/窗口/浏览器标签页，提供实时预览、参数调整与异常处理。",
  "keywords": [
    "屏幕共享",
    "WebRTC",
    "媒体流"
  ],
  "detail": {
    "overview": "在纯前端环境演示屏幕共享流程：检测浏览器能力、配置音频捕获与优先共享的窗口类型，触发系统弹窗完成授权后在 video 里实时预览，并展示分辨率/帧率等元数据—若浏览器或用户中止共享会自动清理流。",
    "implementation": [
      "通过 capability 检测确保存在 `navigator.mediaDevices.getDisplayMedia`，并用 Badge 告知当前状态，缺失 API 时给出提示文案。",
      "点击“开始共享”时组装 DisplayMediaStreamOptions，可选择是否捕获系统音频、及优先使用浏览器标签页或全屏，方便演示不同 surface。",
      "把返回的 MediaStream 赋值给 video.srcObject 并立即播放，同时监听 videoTrack 的 `ended` 事件以侦测系统层面的终止操作。",
      "封装 stopShare 统一停止并释放 track，组件卸载时再次清理，避免占用摄像头/屏幕权限；实时把 track.getSettings() 映射到 UI，展示分辨率与帧率。"
    ],
    "notes": [
      "屏幕共享需运行在安全上下文（https 或 localhost）且通常只能在用户交互后调用。",
      "部分浏览器（如 Safari <= 16）仅支持捕获整个屏幕，且不允许同时采集系统音频，需要根据 UA 做兼容。",
      "捕获机密内容前须提示用户并提供显眼的结束按钮，防止长时间暴露。"
    ]
  },
  "codeExamples": [
    {
      "name": "发起共享",
      "language": "ts",
      "code": "const startShare = async () => {\n  setStatus(\"requesting\")\n  try {\n    const stream = await navigator.mediaDevices.getDisplayMedia({\n      video: {\n        displaySurface: preferTab ? \"browser\" : \"monitor\",\n      },\n      audio: includeAudio,\n    })\n    stream.getVideoTracks()[0]?.addEventListener(\"ended\", () =>\n      stopShare(\"已在系统面板停止共享\"),\n    )\n    setStream(stream)\n    setStatus(\"sharing\")\n  } catch (error) {\n    setStatus(\"idle\")\n    setError(\"用户取消或浏览器阻止了共享\")\n  }\n}"
    },
    {
      "name": "统一释放媒体流",
      "language": "ts",
      "code": "const stopShare = useCallback(() => {\n  setStream((current) => {\n    current?.getTracks().forEach((track) => track.stop())\n    return null\n  })\n  setStatus(\"idle\")\n}, [])\n\nuseEffect(() => {\n  return () => {\n    stream?.getTracks().forEach((track) => track.stop())\n  }\n}, [stream])"
    }
  ],
  "resources": [
    {
      "title": "MDN: Screen Capture API",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Screen_Capture_API"
    },
    {
      "title": "MDN: MediaDevices.getDisplayMedia()",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getDisplayMedia"
    },
    {
      "title": "web.dev: Capture screen content",
      "url": "https://web.dev/articles/getdisplaymedia"
    }
  ]
};
