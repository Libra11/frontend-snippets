import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  id: "virtual-list",
  title: "虚拟列表",
  excerpt: "高性能长列表渲染方案，支持十万级数据流畅滚动，DOM 节点数恒定。",
  keywords: ["性能优化", "虚拟滚动", "大数据", "列表"],
  detail: {
    overview: "通过计算可视区域内的索引范围，只渲染当前可见的列表项，从而在处理海量数据时保持极低的 DOM 节点数量和内存占用，实现丝滑的滚动体验。",
    implementation: [
      "监听容器 scroll 事件，获取 scrollTop。",
      "根据 scrollTop 和 itemHeight 计算当前可视区域的 startIndex 和 endIndex。",
      "使用 absolute 定位或 transform 将渲染的列表项偏移到正确位置。",
      "添加 buffer（缓冲区）预渲染上下部分节点，防止快速滚动时出现白屏。",
      "外层容器设置 overflow-auto，内部撑开一个 totalHeight 的空 div 以产生滚动条。"
    ],
    notes: [
      "本示例实现的是定高虚拟列表（每行高度固定）。",
      "若需支持不定高，需要预估高度并缓存真实高度，逻辑会更复杂。",
      "滚动过快时可能会有短暂的空白，调整 buffer 大小可缓解。"
    ]
  },
  codeExamples: [
    {
      name: "核心计算逻辑",
      language: "typescript",
      code: `const startIndex = Math.floor(scrollTop / itemHeight);
const endIndex = Math.min(items.length, startIndex + visibleCount + buffer);
const visibleItems = items.slice(startIndex, endIndex);
const offsetY = startIndex * itemHeight;

return (
  <div style={{ height: totalHeight }}>
    <div style={{ transform: \`translateY(\${offsetY}px)\` }}>
      {visibleItems.map(renderItem)}
    </div>
  </div>
);`
    }
  ],
};
