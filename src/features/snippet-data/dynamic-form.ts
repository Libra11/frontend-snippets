import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "dynamic-form",
  "title": "动态配置表单",
  "excerpt": "用配置驱动字段与校验逻辑，结合 shadcn/ui 构建可联动的动态表单界面。",
  "keywords": [
    "表单",
    "动态配置",
    "shadcn"
  ],
  "detail": {
    "overview": "通过字段定义数组描述表单结构，每个字段可以携带类型、占位、依赖条件与提示信息。借助 react-hook-form 的 resolver 与 zod superRefine，校验逻辑可以随可见字段即时更新，实现真正可扩展的动态表单。",
    "implementation": [
      "使用 DynamicFieldDefinition 描述字段元数据（类型、占位、选项、联动条件、校验规则等），统一驱动渲染与校验。",
      "useWatch 监听表单值变化，实时筛选需要展示的字段，并在右侧面板同步当前结构。",
      "自定义 resolver 在每次校验前生成 schema，隐藏字段自动跳过校验，已显示字段则执行邮箱、正则、长度等约束。",
      "提交时仅收集当前可见字段的值，便于传递给后端或保存配置，同时提供快速重置能力。"
    ],
    "notes": [
      "可继续扩展 showIf，支持多条件、范围比较或自定义函数，满足复杂的业务联动需求。",
      "字段定义可由后端或 CMS 下发，实现低代码表单搭建；前端只需渲染与校验。"
    ]
  },
  "codeExamples": [
    {
      "name": "字段配置示例",
      "language": "ts",
      "code": "const fieldDefinitions: DynamicFieldDefinition[] = [\n  {\n    id: \"projectName\",\n    label: \"项目名称\",\n    type: \"text\",\n    required: true,\n    minLength: 3,\n    maxLength: 48,\n  },\n  {\n    id: \"budgetRange\",\n    label: \"预算区间\",\n    type: \"select\",\n    options: [\n      { value: \"lt-50k\", label: \"小于 5 万\" },\n      { value: \"50-100k\", label: \"5 万 - 10 万\" },\n    ],\n    showIf: { field: \"hasBudget\", equals: true },\n    required: true,\n  },\n]"
    },
    {
      "name": "动态校验逻辑",
      "language": "ts",
      "code": "const resolver: Resolver<DynamicFormValues> = (values, ctx, options) => {\n  const schema = buildSchema(values)\n  return zodResolver(schema)(values, ctx, options)\n}\n\nfunction buildSchema(currentValues: DynamicFormValues) {\n  return z.object(schemaShape).superRefine((parsed, ctx) => {\n    fieldDefinitions.forEach((field) => {\n      if (!shouldShowField(currentValues, field)) return\n\n      const value = (parsed[field.id] as string)?.trim?.() ?? \"\"\n      if (field.required && !value) {\n        ctx.addIssue({\n          code: \"custom\",\n          path: [field.id],\n          message: field.label + \" 为必填项\",\n        })\n      }\n    })\n  })\n}"
    }
  ],
  "resources": [
    {
      "title": "react-hook-form Resolver",
      "url": "https://react-hook-form.com/docs/useform/resolvers"
    },
    {
      "title": "Zod 文档",
      "url": "https://zod.dev/"
    },
    {
      "title": "shadcn/ui Form 组件",
      "url": "https://ui.shadcn.com/docs/components/form"
    }
  ]
};
