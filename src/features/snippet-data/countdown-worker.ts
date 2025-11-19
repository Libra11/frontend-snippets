import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "countdown-worker",
  "title": "Web Worker 倒计时",
  "excerpt": "将倒计时逻辑移入 Web Worker，保持主线程繁忙时依然准确的计时体验。",
  "keywords": [
    "倒计时",
    "Web Worker",
    "性能"
  ],
  "detail": {
    "overview": "倒计时状态完全交由 Web Worker 管理，主线程只负责渲染 UI。当页面执行动画、网络请求或重渲染时，计时仍然精确，适合番茄钟、抢购倒计时等高可靠场景。",
    "implementation": [
      "Worker 中以 setInterval 维护剩余秒数，所有状态变化统一通过 postMessage 推送至主线程。",
      "主线程以消息驱动的方式同步倒计时状态、总时长与时间戳，并根据状态变化生成操作日志。",
      "React 组件提供滑块与预设快捷键控制目标时长，并在运行时禁用可修改项防止状态错乱。",
      "控制按钮会向 Worker 发送 start/pause/resume/reset 指令，保持操作与计时逻辑解耦。"
    ],
    "notes": [
      "若需要声音提醒或通知，可在收到 Worker 的 finished 状态时触发，避免在 Worker 内直接操作 DOM。",
      "在页面卸载或组件销毁时记得 terminate Worker，避免后台持续计时造成资源浪费。"
    ]
  },
  "codeExamples": [
    {
      "name": "Worker 端计时循环",
      "language": "ts",
      "code": "ctx.addEventListener(\"message\", (event) => {\n  if (event.data.type === \"start\") {\n    totalSeconds = Math.floor(event.data.payload.duration)\n    remainingSeconds = totalSeconds\n    status = totalSeconds > 0 ? \"running\" : \"finished\"\n    ctx.postMessage({ type: \"update\", payload: { status, total: totalSeconds, remaining: remainingSeconds, timestamp: Date.now() } })\n    scheduleTick()\n  }\n})\n\nconst scheduleTick = () => {\n  clearInterval(timer)\n  if (status !== \"running\") return\n\n  timer = ctx.setInterval(() => {\n    remainingSeconds = Math.max(remainingSeconds - 1, 0)\n    const nextStatus = remainingSeconds === 0 ? \"finished\" : \"running\"\n    if (nextStatus !== status) status = nextStatus\n    ctx.postMessage({ type: \"update\", payload: { status, total: totalSeconds, remaining: remainingSeconds, timestamp: Date.now() } })\n    if (remainingSeconds === 0) clearInterval(timer)\n  }, 1000)\n}"
    },
    {
      "name": "组件内接收 Worker 状态",
      "language": "tsx",
      "code": "useEffect(() => {\n  const worker = new Worker(new URL(\"./countdown.worker.ts\", import.meta.url), { type: \"module\" })\n  workerRef.current = worker\n\n  const handleMessage = (event: MessageEvent<CountdownWorkerMessage>) => {\n    if (event.data.type !== \"update\") return\n    const { status, remaining, total } = event.data.payload\n    setStatus(status)\n    setRemainingSeconds(remaining)\n    setTotalSeconds(total)\n  }\n\n  worker.addEventListener(\"message\", handleMessage)\n  return () => {\n    worker.removeEventListener(\"message\", handleMessage)\n    worker.terminate()\n  }\n}, [])\n\nconst postCommand = (command: CountdownWorkerCommand) => {\n  workerRef.current?.postMessage(command)\n}"
    }
  ],
  "resources": [
    {
      "title": "MDN: Web Workers API",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers"
    },
    {
      "title": "Vite 官方文档：Web Workers",
      "url": "https://cn.vitejs.dev/guide/features.html#web-workers"
    }
  ]
};
