import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  id: "watermark",
  title: "图片水印工具",
  excerpt: "在浏览器端直接为图片添加自定义文字水印，支持旋转、平铺、透明度调整，安全无上传。",
  keywords: ["图片处理", "水印", "Canvas", "安全"],
  detail: {
    overview: "使用 HTML5 Canvas API 在本地处理图片，实现实时的水印预览与生成。支持自定义水印文字、颜色、大小、透明度、旋转角度以及平铺模式。",
    implementation: [
      "使用 FileReader 读取本地图片文件为 Data URL。",
      "利用 Canvas 2D Context 绘制原图及水印文字。",
      "通过 Canvas 坐标变换（translate, rotate）实现水印旋转。",
      "计算对角线覆盖范围以实现全图平铺水印。",
      "使用 canvas.toDataURL 导出处理后的图片。"
    ],
    notes: [
      "图片处理完全在本地进行，不会上传服务器，保证隐私安全。",
      "大尺寸图片可能会有性能影响，建议适当压缩。",
      "目前仅支持文字水印，未来可扩展图片水印。"
    ]
  },
  codeExamples: [
    {
      name: "Canvas 绘制旋转文字",
      language: "typescript",
      code: `ctx.save();
ctx.translate(x, y);
ctx.rotate((angle * Math.PI) / 180);
ctx.fillText(text, 0, 0);
ctx.restore();`
    }
  ]
};
