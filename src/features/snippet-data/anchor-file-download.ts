import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "anchor-file-download",
  "title": "a 标签下载文件",
  "excerpt": "在浏览器里生成 JSON/CSV/Markdown 三种导出格式，通过 Blob → ObjectURL → <a download> 串联即可保存文件。",
  "keywords": [
    "下载",
    "Blob",
    "a 标签",
    "文件导出"
  ],
  "detail": {
    "overview": "展示纯前端导出流程：根据面板的开关把数据做匿名化或追加洞察，随后把字符串封装为 Blob，创建临时 URL 赋给 anchor 标签并配上 download 属性，用户点击即可触发浏览器的保存面板。",
    "implementation": [
      "准备数据集（产品、负责人、指标等）并提供“包含洞察/匿名化负责人”的开关，让导出内容存在实际差异，便于验证下载结果。",
      "useMemo 根据当前配置生成 JSON、CSV、Markdown 三种字符串，并立刻转成 `new Blob([...], { type })`，同时保留文件名、描述和大小元数据。",
      "useEffect 遍历生成的 Blob，调用 `URL.createObjectURL` 得到临时链接，存入本地状态并在 cleanup 中统一 revoke，避免内存泄漏。",
      "Button 通过 `asChild` 包裹 `<a download>`，href 直接指向对象 URL，hover/click 时浏览器会遵循 download 属性弹出保存对话框。"
    ],
    "notes": [
      "download 属性仅在同源资源或 `blob:`/`data:` URL 生效；跨域文件若未设置响应头，浏览器可能直接导航。",
      "Safari < 13 对 download 支持不佳，可在点击时 fallback 到 `fetch -> FileReader -> window.open` 方案。",
      "记得在组件卸载或文件重新生成时 revoke 不再使用的 ObjectURL，长期保留会占用内存。"
    ]
  },
  "codeExamples": [
    {
      "name": "生成 Blob 与文件名",
      "language": "ts",
      "code": "const csvContent = [\n  [\"产品\", \"负责人\", \"营收\"].join(\",\"),\n  ...records.map((item) => [\n    item.product,\n    maskOwner ? \"Team\" : item.owner,\n    item.revenue,\n  ].join(\",\")),\n].join(\"\\n\")\n\nconst exportFiles = [\n  {\n    id: \"csv\",\n    fileName: `growth-report-${Date.now()}.csv`,\n    blob: new Blob([csvContent], { type: \"text/csv;charset=utf-8\" }),\n  },\n]"
    },
    {
      "name": "a 标签触发下载",
      "language": "tsx",
      "code": "useEffect(() => {\n  const urls: Record<string, string> = {}\n  exportFiles.forEach((file) => {\n    urls[file.id] = URL.createObjectURL(file.blob)\n  })\n  setFileUrls(urls)\n  return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url))\n}, [exportFiles])\n\nreturn (\n  <Button asChild>\n    <a href={fileUrls.csv} download={exportFiles[0].fileName}>\n      下载 CSV\n    </a>\n  </Button>\n)"
    }
  ],
  "resources": [
    {
      "title": "MDN: HTMLAnchorElement.download",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLAnchorElement/download"
    },
    {
      "title": "MDN: URL.createObjectURL()",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL"
    },
    {
      "title": "MDN: Blob",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Blob"
    }
  ]
};
