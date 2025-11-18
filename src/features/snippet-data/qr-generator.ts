import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "qr-generator",
  "title": "二维码生成器",
  "excerpt": "支持常用预设、容错率与配色调节的二维码生成面板。",
  "keywords": [
    "二维码",
    "工具",
    "分享"
  ],
  "detail": {
    "overview": "围绕营销推广与办公分享场景，提供网站跳转、Wi-Fi 配网、应用下载与联系人 vCard 等常见场景预设，并允许输入任意文本实时渲染。",
    "implementation": [
      "预设场景以配置数组驱动，每项包含内容、尺寸、容错等级与配色，便于扩展更多业务案例。",
      "使用 Tabs 切换“场景预设”和“自定义”两种模式，自定义面板支持文本输入、尺寸快捷按钮、颜色拾取与容错率选择。",
      "基于 react-qr-code 组件实时生成二维码，任何参数调整都会立即更新预览。",
      "附带最佳实践提示，帮助设计/运营在落地物料时控制对比度与留白，提升识别率。"
    ],
    "notes": [
      "如需在二维码中央嵌入 LOGO，可选用容错率 Q/H，并在生成后通过 canvas 叠加图像。",
      "可以配合表单生成 Wi-Fi、短信、邮件等格式，进一步实现低代码配置。"
    ]
  },
  "codeExamples": [
    {
      "name": "基础生成",
      "language": "tsx",
      "code": "<QRCode value={content} size={192} fgColor={foreground} bgColor={background} level={errorLevel} />"
    },
    {
      "name": "Wi-Fi 配网字符串",
      "language": "text",
      "code": "WIFI:T:WPA;S:libra-guest;P:welcome123;;"
    },
    {
      "name": "vCard 信息",
      "language": "text",
      "code": "BEGIN:VCARD\nVERSION:3.0\nFN:Libra 客服\nTEL:+86-400-123-4567\nEMAIL:service@libra.dev\nEND:VCARD"
    }
  ],
  "resources": [
    {
      "title": "react-qr-code",
      "url": "https://github.com/rosskhanas/react-qr-code"
    },
    {
      "title": "二维码设计最佳实践",
      "url": "https://design.google/library/qr-code-best-practices/"
    }
  ]
};
