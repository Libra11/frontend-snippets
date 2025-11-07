/**
 * Author: Libra
 * Date: 2025-11-07 16:58:16
 * LastEditors: Libra
 * Description:
 */
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import type { DynamicFieldDefinition, DynamicFormValues } from "./types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const fieldDefinitions: DynamicFieldDefinition[] = [
  {
    id: "projectName",
    label: "项目名称",
    description: "用于内部和客户沟通的显示名称。",
    type: "text",
    required: true,
    minLength: 3,
    maxLength: 48,
    placeholder: "Libra 新产品发布",
  },
  {
    id: "projectType",
    label: "项目类型",
    description: "不同类型会展示差异化的表单字段。",
    type: "select",
    required: true,
    options: [
      { value: "landing", label: "营销落地页" },
      { value: "webapp", label: "Web 应用" },
      { value: "mobile", label: "移动端应用" },
    ],
  },
  {
    id: "hasBudget",
    label: "已明确预算范围",
    helper: "切换后会展示预算区间选择。",
    type: "switch",
  },
  {
    id: "budgetRange",
    label: "预算区间",
    type: "select",
    required: true,
    placeholder: "请选择预算区间",
    options: [
      { value: "lt-50k", label: "小于 5 万" },
      { value: "50-100k", label: "5 万 - 10 万" },
      { value: "gt-100k", label: "大于 10 万" },
    ],
    showIf: {
      field: "hasBudget",
      equals: true,
    },
  },
  {
    id: "teamSize",
    label: "协作团队人数",
    helper: "请输入整数，例如 6。",
    type: "text",
    required: true,
    placeholder: "6",
    pattern: /^\d+$/,
    showIf: {
      field: "projectType",
      equals: "webapp",
    },
  },
  {
    id: "contactEmail",
    label: "主要联系人邮箱",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    id: "needNda",
    label: "需要签署 NDA",
    description: "我们会发送 NDA 模板供签署。",
    type: "checkbox",
  },
  {
    id: "ndaContact",
    label: "NDA 联系人邮箱",
    type: "email",
    placeholder: "privacy@example.com",
    required: true,
    showIf: {
      field: "needNda",
      equals: true,
    },
  },
  {
    id: "notes",
    label: "补充说明",
    type: "textarea",
    rows: 4,
    maxLength: 400,
    helper: "可填写里程碑、技术栈或上线时间等信息。",
  },
];

const defaultValues: DynamicFormValues = {
  projectName: "",
  projectType: "landing",
  hasBudget: false,
  budgetRange: "",
  teamSize: "",
  contactEmail: "",
  needNda: false,
  ndaContact: "",
  notes: "",
};

const shouldShowField = (
  values: DynamicFormValues | undefined,
  field: DynamicFieldDefinition
) => {
  if (!field.showIf) {
    return true;
  }

  const dependentValue = values?.[field.showIf.field];
  return dependentValue === field.showIf.equals;
};

const createSchemaShape = () => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fieldDefinitions.forEach((definition) => {
    if (definition.type === "checkbox" || definition.type === "switch") {
      shape[definition.id] = z.preprocess((value) => {
        if (typeof value === "boolean") {
          return value;
        }
        return false;
      }, z.boolean());
      return;
    }

    shape[definition.id] = z.preprocess((value) => {
      if (typeof value === "string") {
        return value;
      }
      if (value === undefined || value === null) {
        return "";
      }
      return String(value);
    }, z.string());
  });

  return shape;
};

const schemaShape = createSchemaShape();

const buildSchema = (currentValues: DynamicFormValues) => {
  return z.object(schemaShape).superRefine((parsed, ctx) => {
    fieldDefinitions.forEach((definition) => {
      const isVisible = shouldShowField(currentValues, definition);
      const rawValue = parsed[definition.id];

      if (!isVisible) {
        return;
      }

      if (definition.type === "checkbox" || definition.type === "switch") {
        if (definition.required && rawValue !== true) {
          ctx.addIssue({
            code: "custom",
            path: [definition.id],
            message: `${definition.label} 需要开启`,
          });
        }
        return;
      }

      const value = typeof rawValue === "string" ? rawValue.trim() : "";

      if (definition.required && value.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: [definition.id],
          message: `${definition.label} 为必填项`,
        });
        return;
      }

      if (!definition.required && value.length === 0) {
        return;
      }

      if ("minLength" in definition && definition.minLength) {
        if (value.length < definition.minLength) {
          ctx.addIssue({
            code: "custom",
            path: [definition.id],
            message: `${definition.label} 至少需要 ${definition.minLength} 个字符`,
          });
        }
      }

      if ("maxLength" in definition && definition.maxLength) {
        if (value.length > definition.maxLength) {
          ctx.addIssue({
            code: "custom",
            path: [definition.id],
            message: `${definition.label} 最多支持 ${definition.maxLength} 个字符`,
          });
        }
      }

      if (
        definition.type === "email" &&
        value.length > 0 &&
        !emailPattern.test(value)
      ) {
        ctx.addIssue({
          code: "custom",
          path: [definition.id],
          message: "请输入合法的邮箱地址",
        });
      }

      if (definition.type === "url" && value.length > 0) {
        try {
          new URL(value);
        } catch {
          ctx.addIssue({
            code: "custom",
            path: [definition.id],
            message: "请输入合法的链接地址",
          });
        }
      }

      if (definition.type === "number" && value.length > 0) {
        if (Number.isNaN(Number(value))) {
          ctx.addIssue({
            code: "custom",
            path: [definition.id],
            message: "请输入合法的数字",
          });
        }
      }

      if ("pattern" in definition && definition.pattern) {
        if (!definition.pattern.test(value)) {
          ctx.addIssue({
            code: "custom",
            path: [definition.id],
            message: `${definition.label} 格式不符合要求`,
          });
        }
      }
    });
  });
};

const typeBadgeMap: Record<string, string> = {
  text: "文本",
  email: "邮箱",
  number: "数字",
  url: "链接",
  password: "密码",
  textarea: "多行",
  select: "选择",
  checkbox: "复选",
  switch: "开关",
};

export function DynamicFormSnippet() {
  const resolver = useCallback<Resolver<DynamicFormValues>>(
    (values, context, options) => {
      const schema = buildSchema((values ?? {}) as DynamicFormValues);
      return zodResolver(schema)(values, context, options);
    },
    []
  );

  const form = useForm<DynamicFormValues>({
    defaultValues,
    mode: "onChange",
    resolver,
  });

  const watchedValues = useWatch({ control: form.control }) as
    | DynamicFormValues
    | undefined;
  const currentValues = useMemo<DynamicFormValues>(
    () => ({ ...defaultValues, ...(watchedValues ?? {}) }),
    [watchedValues]
  );

  const visibleFields = useMemo(
    () =>
      fieldDefinitions.filter((definition) =>
        shouldShowField(currentValues, definition)
      ),
    [currentValues]
  );

  const [submittedValues, setSubmittedValues] =
    useState<DynamicFormValues | null>(null);

  const handleSubmit = useCallback((values: DynamicFormValues) => {
    const filtered = Object.fromEntries(
      fieldDefinitions
        .filter((definition) => shouldShowField(values, definition))
        .map((definition) => [definition.id, values[definition.id]])
    ) as DynamicFormValues;

    setSubmittedValues(filtered);
  }, []);

  const resetForm = useCallback(() => {
    form.reset(defaultValues);
    setSubmittedValues(null);
  }, [form]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        将表单字段、依赖关系与校验规则抽象成配置，借助 shadcn/ui +
        react-hook-form + zod 实现可扩展的动态表单。
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <Card className="space-y-6">
          <CardHeader className="px-6 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">项目需求采集表</CardTitle>
                <CardDescription>
                  选择不同项目类型、开启预算或 NDA
                  等选项时，表单会即时切换字段。
                </CardDescription>
              </div>
              <Badge variant="secondary">
                动态字段 · {visibleFields.length} 项
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-6">
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div className="grid gap-5">
                  {visibleFields.map((definition) => (
                    <FormField
                      key={definition.id}
                      control={form.control}
                      name={definition.id}
                      render={({ field }) => {
                        if (definition.type === "checkbox") {
                          return (
                            <FormItem className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-muted/10 p-4">
                              <div className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-foreground">
                                  {definition.label}
                                </FormLabel>
                                {definition.description ? (
                                  <FormDescription>
                                    {definition.description}
                                  </FormDescription>
                                ) : null}
                              </div>
                              <FormControl>
                                <Checkbox
                                  checked={Boolean(field.value)}
                                  onCheckedChange={field.onChange}
                                  disabled={definition.disabled}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }

                        if (definition.type === "switch") {
                          return (
                            <FormItem className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-muted/10 p-4">
                              <div className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-foreground">
                                  {definition.label}
                                </FormLabel>
                                {definition.helper ? (
                                  <p className="text-xs text-muted-foreground/80">
                                    {definition.helper}
                                  </p>
                                ) : null}
                              </div>
                              <FormControl>
                                <Switch
                                  checked={Boolean(field.value)}
                                  onCheckedChange={field.onChange}
                                  disabled={definition.disabled}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }

                        if (definition.type === "select") {
                          return (
                            <FormItem className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <FormLabel>{definition.label}</FormLabel>
                                {definition.required ? (
                                  <Badge variant="outline" className="text-xs">
                                    必填
                                  </Badge>
                                ) : null}
                              </div>
                              {definition.description ? (
                                <FormDescription>
                                  {definition.description}
                                </FormDescription>
                              ) : null}
                              <FormControl>
                                <Select
                                  value={
                                    typeof field.value === "string"
                                      ? field.value
                                      : ""
                                  }
                                  onValueChange={field.onChange}
                                  disabled={definition.disabled}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        definition.placeholder ?? "请选择"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {definition.options.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              {definition.helper ? (
                                <p className="text-xs text-muted-foreground/80">
                                  {definition.helper}
                                </p>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          );
                        }

                        if (definition.type === "textarea") {
                          return (
                            <FormItem className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <FormLabel>{definition.label}</FormLabel>
                                {definition.required ? (
                                  <Badge variant="outline" className="text-xs">
                                    必填
                                  </Badge>
                                ) : null}
                              </div>
                              {definition.description ? (
                                <FormDescription>
                                  {definition.description}
                                </FormDescription>
                              ) : null}
                              <FormControl>
                                <Textarea
                                  rows={definition.rows ?? 4}
                                  placeholder={definition.placeholder}
                                  value={
                                    typeof field.value === "string"
                                      ? field.value
                                      : ""
                                  }
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  disabled={definition.disabled}
                                />
                              </FormControl>
                              {definition.helper ? (
                                <p className="text-xs text-muted-foreground/80">
                                  {definition.helper}
                                </p>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          );
                        }

                        return (
                          <FormItem className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <FormLabel>{definition.label}</FormLabel>
                              {definition.required ? (
                                <Badge variant="outline" className="text-xs">
                                  必填
                                </Badge>
                              ) : null}
                            </div>
                            {definition.description ? (
                              <FormDescription>
                                {definition.description}
                              </FormDescription>
                            ) : null}
                            <FormControl>
                              <Input
                                type={
                                  definition.type === "password"
                                    ? "password"
                                    : definition.type === "url"
                                    ? "url"
                                    : definition.type === "email"
                                    ? "email"
                                    : definition.type === "number"
                                    ? "number"
                                    : "text"
                                }
                                placeholder={definition.placeholder}
                                value={
                                  typeof field.value === "string"
                                    ? field.value
                                    : ""
                                }
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={definition.disabled}
                                inputMode={
                                  definition.type === "number"
                                    ? "numeric"
                                    : undefined
                                }
                              />
                            </FormControl>
                            {definition.helper ? (
                              <p className="text-xs text-muted-foreground/80">
                                {definition.helper}
                              </p>
                            ) : null}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    重置配置
                  </Button>
                  <Button type="submit">生成 JSON 结果</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">实时表单结构</CardTitle>
            <CardDescription>
              根据当前选项显示的字段会在这里同步更新，可用于生成配置或发送到后端。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div className="space-y-2">
              {visibleFields.map((definition) => (
                <div
                  key={`summary-${definition.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/10 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {definition.label}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      字段 ID：{definition.id}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {typeBadgeMap[definition.type] ?? definition.type}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">最近提交</CardTitle>
                {submittedValues ? (
                  <Badge variant="outline">
                    {new Date().toLocaleTimeString("zh-CN", { hour12: false })}
                  </Badge>
                ) : null}
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                <pre className="max-h-64 overflow-auto text-xs leading-relaxed text-muted-foreground">
                  {submittedValues
                    ? JSON.stringify(submittedValues, null, 2)
                    : "提交后会在此展示 JSON 结果"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
