/*
 * @Author: Libra
 * @Date: 2025-11-18 18:09:11
 * @LastEditTime: 2025-11-19 14:42:09
 * @LastEditors: Libra
 * @Description: 
 */
import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  id: "file-preview",
  title: "PDF/Word/Excel 预览",
  excerpt:
    "结合 @js-preview/pdf · docx · excel，把用户选择的 PDF/Word/Excel 直接渲染在浏览器中，无需自研解析。",
  keywords: ["PDF", "DOCX", "XLSX", "文件预览"],
  detail: {
    overview:
      "给产品演示台或后台列表提供一站式文件预览面板：用户从本地选择文件后，分别交给 @js-preview/pdf、@js-preview/docx、@js-preview/excel 渲染，前端只要提供容器即可，适合作为“文件详情/审阅”组件。",
    implementation: [
      "提供三个文件类型选项（PDF/Word/Excel），切换后更新 input 的 accept，并提示需要的格式。",
      "读取 File -> ArrayBuffer 后调用 `jsPreview***.init(container).preview(buffer)` 即可完成渲染，同时监听 onError/onRendered 提示状态。",
      "在类型切换或重新选择文件时调用 `destroy()` 清理实例，防止堆积 DOM；并给出当前文件名 / 加载状态提示。",
      "Excel 预览可以配置 minRowLength/minColLength，Word 预览可传 className/inWrapper 控制样式，PDF 则可根据容器宽度自动铺满。",
    ],
    notes: [
      "预览和上传可复用同一个流程：上传前通过 FileReader 先预览，上传成功后可改传后端 URL。",
      "若需要支持接口返回的二进制流，可直接把 ArrayBuffer/Blob 传给 preview，库内部会处理。",
      "Excel/PDF 大文件可按需分页、懒加载或提示用户等待，避免一次性渲染太多内容。",
    ],
  },
  codeExamples: [
    {
      name: "js-preview/pdf",
      language: "ts",
      code: `import jsPreviewPdf from "@js-preview/pdf"

const pdfPreview = jsPreviewPdf.init(pdfContainerRef.current!, {
  width: pdfContainerRef.current?.clientWidth,
  onError: (err) => console.error(err),
})
await pdfPreview.preview(fileBuffer)`,
    },
    {
      name: "js-preview/docx / excel",
      language: "ts",
      code: `import jsPreviewDocx from "@js-preview/docx"
import jsPreviewExcel from "@js-preview/excel"
import "@js-preview/docx/lib/index.css"
import "@js-preview/excel/lib/index.css"

const docxPreview = jsPreviewDocx.init(docxContainer.current!, { inWrapper: false })
await docxPreview.preview(docxBuffer)

const excelPreview = jsPreviewExcel.init(excelContainer.current!, { minRowLength: 30 })
await excelPreview.preview(xlsxBuffer)`,
    },
  ],
  resources: [
    {
      title: "@js-preview 文档",
      url: "https://501351981.github.io/vue-office/examples/docs/guide/js-preview.html",
    },
    { title: "@js-preview/docx", url: "https://www.npmjs.com/package/@js-preview/docx" },
    { title: "@js-preview/excel", url: "https://www.npmjs.com/package/@js-preview/excel" },
    { title: "@js-preview/pdf", url: "https://www.npmjs.com/package/@js-preview/pdf" },
  ],
};
