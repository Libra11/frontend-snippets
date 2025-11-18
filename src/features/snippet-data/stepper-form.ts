import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "stepper-form",
  "title": "多步骤向导",
  "excerpt": "将复杂提交流程拆分成多步骤向导，支持自动保存草稿、进度条、前后导航与总结确认。",
  "keywords": [
    "表单",
    "向导",
    "多步骤",
    "草稿"
  ],
  "detail": {
    "overview": "利用 react-hook-form 管理全局表单状态，结合步骤配置与校验逻辑构建多步骤引导流程。示例展示了项目信息、联系人、上线偏好与最终确认四个阶段，并支持自动保存草稿、跨步骤跳转和摘要预览。",
    "implementation": [
      "定义步骤数组（title、description、fields、schema），通过 validateStep 仅校验当前步骤字段，保持每一步的反馈清晰。",
      "使用 Progress + 自定义 Stepper 展示整体进度，状态（完成/当前/未开始）一目了然，可返回之前步骤修正。",
      "表单数据通过 form.watch + localStorage 自动保存草稿，恢复时还原步骤编号与最后更新时间，支持跨页面继续填写。",
      "最终步骤展示摘要面板，调用 FormSchema.safeParse 再次校验所有字段，通过后清理草稿并触发 toast 成功提示。"
    ],
    "notes": [
      "真实项目可将草稿持久化到后端或多端同步；向导流程也可根据权限动态增减步骤。",
      "搭配动画/过渡（如 Framer Motion）可提升切换体验；按钮权限可结合审批状态动态控制。"
    ]
  },
  "codeExamples": [
    {
      "name": "步骤配置",
      "language": "ts",
      "code": "const STEPS = [\n  {\n    id: \"project\",\n    title: \"项目信息\",\n    description: \"定义项目基础信息\",\n    fields: [\"projectName\", \"projectUrl\", \"industry\", \"teamSize\"],\n    schema: StepOneSchema,\n  },\n  {\n    id: \"contact\",\n    title: \"联系人\",\n    fields: [\"contactName\", \"contactEmail\", \"contactRole\"],\n    schema: StepTwoSchema,\n  },\n  {\n    id: \"preferences\",\n    title: \"上线偏好\",\n    fields: [\"usageScenario\", \"marketingChannels\", \"enableNotifications\", \"launchPlan\", \"acceptTerms\"],\n    schema: StepThreeSchema,\n  },\n]"
    },
    {
      "name": "步骤校验逻辑",
      "language": "ts",
      "code": "function validateStep(step: StepDefinition, values: FormValues) {\n  if (!step.schema) return true\n  const data = step.fields.reduce((acc, field) => {\n    acc[field] = values[field]\n    return acc\n  }, {} as Record<string, unknown>)\n  const result = step.schema.safeParse(data)\n  if (!result.success) {\n    result.error.issues.forEach((issue) =>\n      form.setError(issue.path[0] as StepKey, { message: issue.message })\n    )\n    return false\n  }\n  step.fields.forEach((field) => form.clearErrors(field))\n  return true\n}"
    }
  ],
  "resources": [
    {
      "title": "react-hook-form 文档",
      "url": "https://react-hook-form.com/"
    },
    {
      "title": "Zod Schema",
      "url": "https://zod.dev/"
    },
    {
      "title": "shadcn/ui Progress 组件",
      "url": "https://ui.shadcn.com/docs/components/progress"
    }
  ]
};
