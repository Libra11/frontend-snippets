import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "draggable-sortable-list",
  "title": "拖拽排序列表",
  "excerpt": "使用 @dnd-kit 构建卡片式列表拖拽，支持锁定、禁用与删除状态，用于栏目、菜单或模块配置。",
  "keywords": [
    "拖拽",
    "排序",
    "列表",
    "dnd-kit"
  ],
  "detail": {
    "overview": "基于 @dnd-kit 的 DndContext + SortableContext，实现可拖拽排序的卡片列表。示例展示了如何在同一组件中处理锁定项（不可拖拽/删除）、禁用项（保留但置灰）以及正常项，同时提供重置和轴向限制等实用功能。",
    "implementation": [
      "维护包含 state 状态的列表数据，区分 normal / locked / disabled 三种行为，并通过 useState 管理。",
      "使用 useSensors 注册 PointerSensor + KeyboardSensor，配合 activationConstraint、axis lock 等能力优化拖拽体验。",
      "在 SortableListItem 中调用 useSortable 注入排序行为，并根据拖拽中状态动态调整 transform / transition / z-index。",
      "通过 Tooltip + 右侧图标按钮统一提供编辑、禁用与删除操作；当条目处于 locked/disabled 状态时自动屏蔽不合法的交互。"
    ],
    "notes": [
      "真实项目可将数据源接入后端接口；拖拽结果可通过 onDragEnd 的 arrayMove 直接同步到服务端。",
      "若需要跨列/网格拖拽，可切换至 rectSortingStrategy 或自定义策略；列表项内部也可作为 Portal 渲染，避免剪裁问题。"
    ]
  },
  "codeExamples": [
    {
      "name": "拖拽结束处理",
      "language": "ts",
      "code": "const handleDragEnd = ({ active, over }: DragEndEvent) => {\n  if (!over || active.id === over.id) return\n\n  setItems((prev) => {\n    const activeIndex = prev.findIndex((item) => item.id === active.id)\n    const overIndex = prev.findIndex((item) => item.id === over.id)\n    if (activeIndex === -1 || overIndex === -1) return prev\n    if (prev[activeIndex].state === \"locked\" || prev[overIndex].state === \"locked\") return prev\n    return arrayMove(prev, activeIndex, overIndex)\n  })\n}"
    },
    {
      "name": "SortableListItem 使用 useSortable",
      "language": "tsx",
      "code": "const { attributes, listeners, setNodeRef, transform, transition } = useSortable({\n  id: item.id,\n  disabled: item.state === \"locked\",\n  transition: { duration: 200, easing: \"cubic-bezier(0.22, 1, 0.36, 1)\" },\n})\n\nconst style = {\n  transform: CSS.Transform.toString(transform ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 }),\n  transition,\n}\n\nreturn (\n  <div ref={setNodeRef} style={style} {...attributes} {...listeners}>\n    {/* ...卡片内容... */}\n  </div>\n)"
    }
  ],
  "resources": [
    {
      "title": "dnd-kit 官方文档",
      "url": "https://docs.dndkit.com/"
    },
    {
      "title": "dnd-kit Sortable 指南",
      "url": "https://docs.dndkit.com/presets/sortable"
    },
    {
      "title": "shadcn/ui Dropdown Menu 组件",
      "url": "https://ui.shadcn.com/docs/components/dropdown-menu"
    }
  ]
};
