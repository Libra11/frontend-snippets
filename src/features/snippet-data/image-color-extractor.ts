import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  id: "image-color-extractor",
  title: "图片取色器",
  excerpt: "上传图片，通过放大镜精准提取像素颜色，支持点击复制与历史记录。",
  keywords: ["图片处理", "取色器", "Canvas", "工具"],
  detail: {
    overview: "利用 Canvas API 读取图片像素数据，实现浏览器端的实时取色功能。配备放大镜效果，方便用户精准定位像素点，并自动记录点击选取的颜色历史。",
    implementation: [
      "使用 FileReader 读取用户上传的图片并绘制到 Canvas 上。",
      "监听 Canvas 的 onMouseMove 事件，通过 ctx.getImageData(x, y, 1, 1) 获取当前坐标的像素数据。",
      "将 RGB 数据转换为 Hex 格式并实时更新状态。",
      "实现放大镜效果：在鼠标附近显示一个跟随的浮层，展示当前颜色及 Hex 值。",
      "点击 Canvas 时将颜色写入剪贴板 (navigator.clipboard) 并存入历史记录数组。"
    ],
    notes: [
      "图片需支持跨域 (crossOrigin='anonymous')，本地上传的图片通常没问题。",
      "为了性能考虑，getImageData 应配合 willReadFrequently: true 参数使用。",
      "Canvas 大小需根据容器自适应，同时保持图片比例。"
    ]
  },
  codeExamples: [
    {
      name: "获取像素颜色",
      language: "typescript",
      code: `const getPixelColor = (e: React.MouseEvent) => {
  const ctx = canvas.getContext("2d");
  const { left, top } = canvas.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;
  
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
  return hex;
};`
    }
  ],
};
