import type { SnippetDefinition } from "./types";
import { CopyToClipboardSnippet } from "./copy-to-clipboard";

export const snippets: SnippetDefinition[] = [
  {
    id: "copy-to-clipboard",
    title: "复制到剪贴板",
    excerpt: "一键复制文本、代码、链接，包含复制成功提示气泡。",
    keywords: ["复制", "交互反馈", "工具函数"],
    Component: CopyToClipboardSnippet,
    detail: {
      overview:
        "提供统一的复制按钮并处理跨浏览器兼容，支持文本、命令和链接等不同类型的内容，同时通过 Tooltip 实时展示拷贝结果反馈。",
      implementation: [
        "维护预置的复制目标数组，区分文本、代码、链接三种展示形式，便于扩展更多场景。",
        "优先调用 `navigator.clipboard.writeText` 完成复制操作，遇到不支持的浏览器时回退到 `document.execCommand('copy')`。",
        "使用局部状态记录复制结果并在 2 秒后自动清除，结合 Tooltip 呈现成功或失败的即时反馈。",
        "结合 Tailwind + shadcn Button 构建一致的交互样式，保持桌面和移动端的可用性。",
      ],
      notes: [
        "可根据业务需要将 copyTargets 改为从接口或配置文件加载，保持复用性。",
        "如需在 SSR 环境使用，记得条件判断 `window` 与 `navigator` 可用性。",
      ],
    },
    codeExamples: [
      {
        name: "核心复制逻辑",
        language: "ts",
        code: `const handleCopy = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "")
  textarea.style.position = "absolute"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)

  const selection = document.getSelection()
  const selected = selection?.rangeCount ? selection.getRangeAt(0) : null

  textarea.select()
  const success = document.execCommand("copy")
  document.body.removeChild(textarea)

  if (selected) {
    selection?.removeAllRanges()
    selection?.addRange(selected)
  }

  return success
}`,
      },
      {
        name: "反馈提示逻辑",
        language: "ts",
        code: `setFeedback({ id: targetId, status: "success" })
resetTimer.current = setTimeout(() => setFeedback(null), 2000)

const message = feedback?.status === "success" ? "复制成功" : "复制失败"`,
      },
    ],
    resources: [
      {
        title: "MDN: Clipboard API",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard",
      },
      {
        title: "shadcn/ui Tooltip 组件",
        url: "https://ui.shadcn.com/docs/components/tooltip",
      },
    ],
  },
];
