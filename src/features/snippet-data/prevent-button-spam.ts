import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "prevent-button-spam",
  "title": "按钮冷却防连击",
  "excerpt": "为关键操作按钮加上冷却时间与全局/单项模式选择，防止用户短时间内重复触发接口。",
  "keywords": [
    "按钮",
    "防抖",
    "冷却",
    "交互反馈"
  ],
  "detail": {
    "overview": "用局部状态维护按钮的剩余冷却秒数，点击后启动 `setInterval` 递减并禁用按钮，支持单个动作与全局共用两种模式，同时可以切换冷却结束后的恢复方式，适合需要防止连点的敏感操作。",
    "implementation": [
      "定义 `cooldowns` 字典记录每个按钮（或全局）的 `remaining` 与 `status`，点击按钮时检查当前状态是否仍在冷却中。",
      "启动冷却时创建定时器，每秒递减剩余时间，归零后依据 autoReset 决定恢复到 idle 还是 success（提示需要再次确认）。",
      "支持“强制全局冷却”开关：启用后所有按钮共用同一冷却状态，方便演示不同策略对交互的影响。",
      "组件卸载或冷却结束时及时清理 timer，防止内存泄漏；UI 通过 Badge、文案、倒计时与 Loader 状态反馈避免用户误操作。"
    ],
    "notes": [
      "冷却逻辑适合放在前端保证体验，但关键接口仍应在服务端去重（如请求幂等键或乐观锁）。",
      "如果按钮会触发路由跳转，记得在离开页面前清理定时器。",
      "可以把冷却信息持久化到 localStorage 或后端，以跨标签页共享状态。"
    ]
  },
  "codeExamples": [
    {
      "name": "启动冷却并更新状态",
      "language": "ts",
      "code": "const startCooldown = (id: string, duration: number) => {\n  setCooldowns((prev) => ({\n    ...prev,\n    [id]: { remaining: duration, status: \"cooling\" },\n  }))\n  const timer = window.setInterval(() => {\n    setCooldowns((prev) => {\n      const next = prev[id]\n      if (!next) return prev\n      if (next.remaining <= 1) {\n        clearInterval(timer)\n        return { ...prev, [id]: { remaining: 0, status: \"idle\" } }\n      }\n      return { ...prev, [id]: { remaining: next.remaining - 1, status: \"cooling\" } }\n    })\n  }, 1000)\n}"
    },
    {
      "name": "按钮点击时检查冷却",
      "language": "ts",
      "code": "const handleClick = (variant: ButtonVariant) => {\n  const state = cooldowns[variant.id] ?? { remaining: 0, status: \"idle\" }\n  if (state.status === \"cooling\") {\n    return\n  }\n  startCooldown(variant.id, variant.cooldown)\n  // 执行业务逻辑\n}"
    }
  ],
  "resources": [
    {
      "title": "React Docs: State and Effects",
      "url": "https://react.dev/learn/state-a-components-memory"
    },
    {
      "title": "MDN: setInterval/clearInterval",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/setInterval"
    },
    {
      "title": "Designing for failure: preventing duplicate submissions",
      "url": "https://uxdesign.cc/preventing-duplicate-form-submissions"
    }
  ]
};
