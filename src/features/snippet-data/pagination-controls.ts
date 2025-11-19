import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "pagination-controls",
  "title": "分页控制组件",
  "excerpt": "包含页码、快速跳转、每页数量切换与数据集预设的分页控制条，适配后台列表或数据集页面。",
  "keywords": [
    "分页",
    "列表",
    "页码",
    "UX"
  ],
  "detail": {
    "overview": "结合总数和每页数量计算页数，提供上一页/下一页、页码按钮、省略号以及快捷跳转入口；还能在多份数据集之间切换，以展示分页组件如何响应不同总量与设定。",
    "implementation": [
      "使用 `paginationPresets` 维护多个数据集（总条数 + 标签），切换时把当前页重置为 1。",
      "通过 `pageSizeOptions` 切换每页数量，重新计算总页数并更新当前页；`start ~ end` 提示当前范围。",
      "根据当前页计算页码渲染列表，边界使用 `getPageRange` 生成省略号结构，防止页码过长。",
      "提供 `showQuickJump` 开关以及“每页 xx 条”按钮，演示后台常见的分页交互细节。"
    ],
    "notes": [
      "真实项目中可把分页状态放入 URL（query string）或 Redux/URL state，确保刷新与分享链接时仍可定位到当前页。",
      "若总页数很大，可考虑输入跳页框或下拉选择分页范围。",
      "移动端可隐藏部分元素或改为上/下页按钮 + 当前页指示，以避免拥挤。"
    ]
  },
  "codeExamples": [
    {
      "name": "计算页码列表",
      "language": "ts",
      "code": "function getPageRange(current: number, totalPages: number) {\n  const delta = 1\n  const rangeWithDots: (number | string)[] = [1]\n  for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {\n    rangeWithDots.push(i)\n  }\n  if (current - delta > 2) rangeWithDots.splice(1, 0, \"...\")\n  if (current + delta < totalPages - 1) rangeWithDots.push(\"...\")\n  rangeWithDots.push(totalPages)\n  return rangeWithDots\n}"
    },
    {
      "name": "切换分页状态",
      "language": "ts",
      "code": "const totalPages = Math.ceil(total / pageSize)\nconst handlePageChange = (page: number) => {\n  setCurrentPage(Math.max(1, Math.min(totalPages, page)))\n}\nconst start = (currentPage - 1) * pageSize + 1\nconst end = Math.min(total, currentPage * pageSize)"
    }
  ],
  "resources": [
    {
      "title": "Nielsen Norman Group: Pagination vs. Infinite Scrolling",
      "url": "https://www.nngroup.com/articles/pagination-infinite-scrolling-load-more/"
    },
    {
      "title": "Smashing Magazine: Design better pagination",
      "url": "https://www.smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons/"
    },
    {
      "title": "Material Design: Pagination",
      "url": "https://m3.material.io/components/pagination/overview"
    }
  ]
};
