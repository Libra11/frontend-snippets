import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "stepper-form-draft-v1";

const StepOneSchema = z.object({
  projectName: z.string().min(2, "请输入至少 2 个字符的项目名称"),
  projectUrl: z
    .string()
    .url("请输入合法的网址，例如 https://example.com")
    .max(120, "网址过长"),
  industry: z.string().min(1, "请选择行业"),
  teamSize: z.string().min(1, "请选择团队规模"),
});

const StepTwoSchema = z.object({
  contactName: z.string().min(2, "请输入联系人姓名"),
  contactEmail: z.string().email("请输入正确的邮箱地址"),
  contactRole: z.string().min(2, "请输入联系人角色/职位"),
});

const StepThreeSchema = z.object({
  usageScenario: z.string().min(10, "请至少描述 10 个字符"),
  marketingChannels: z.array(z.string()).min(1, "至少选择一个渠道"),
  enableNotifications: z.boolean(),
  launchPlan: z.string().min(1, "请选择计划上线时间"),
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, "提交前需确认使用条款"),
});

const FormSchema = StepOneSchema.merge(StepTwoSchema).merge(StepThreeSchema);

type FormValues = z.infer<typeof FormSchema>;
type StepKey = keyof FormValues;

type StepDefinition = {
  id: string;
  title: string;
  description: string;
  fields: StepKey[];
  schema?: z.ZodTypeAny;
};

const DEFAULT_VALUES: FormValues = {
  projectName: "",
  projectUrl: "",
  industry: "",
  teamSize: "",
  contactName: "",
  contactEmail: "",
  contactRole: "",
  usageScenario: "",
  marketingChannels: [],
  enableNotifications: true,
  launchPlan: "",
  acceptTerms: false,
};

const STEPS: StepDefinition[] = [
  {
    id: "project",
    title: "项目信息",
    description: "定义项目基础信息与团队规模，帮助系统提供合适的模板。",
    fields: ["projectName", "projectUrl", "industry", "teamSize"],
    schema: StepOneSchema,
  },
  {
    id: "contact",
    title: "联系人",
    description: "填写主要对接人信息，方便后续审批与通知对接。",
    fields: ["contactName", "contactEmail", "contactRole"],
    schema: StepTwoSchema,
  },
  {
    id: "preferences",
    title: "上线偏好",
    description: "配置目标场景、通知与营销渠道，确保上线节奏一致。",
    fields: ["usageScenario", "marketingChannels", "enableNotifications", "launchPlan", "acceptTerms"],
    schema: StepThreeSchema,
  },
  {
    id: "review",
    title: "确认提交",
    description: "检查配置信息，确认无误后提交上线申请。",
    fields: [],
  },
];

const INDUSTRIES = [
  { value: "saas", label: "SaaS / 企业服务" },
  { value: "ecommerce", label: "电商零售" },
  { value: "education", label: "教育培训" },
  { value: "gaming", label: "游戏娱乐" },
  { value: "finance", label: "金融科技" },
  { value: "other", label: "其他行业" },
];

const TEAM_SIZES = [
  { value: "1-5", label: "1 - 5 人" },
  { value: "6-20", label: "6 - 20 人" },
  { value: "21-50", label: "21 - 50 人" },
  { value: "51-200", label: "51 - 200 人" },
  { value: "200+", label: "200 人以上" },
];

const LAUNCH_PLAN = [
  { value: "within-2weeks", label: "2 周内上线" },
  { value: "within-1month", label: "1 个月内上线" },
  { value: "within-3months", label: "3 个月内上线" },
  { value: "no-plan", label: "暂未确定时间" },
];

const CHANNEL_OPTIONS = [
  { value: "newsletter", label: "订阅邮件" },
  { value: "blog", label: "博客文章" },
  { value: "community", label: "社区/论坛" },
  { value: "paid-ads", label: "付费广告" },
  { value: "partner", label: "渠道合作" },
];

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function validateStep(step: StepDefinition, values: FormValues, setError: ReturnType<typeof useForm<FormValues>>["setError"], clearErrors: ReturnType<typeof useForm<FormValues>>["clearErrors"]) {
  if (!step.schema) {
    return true;
  }
  const payload = step.fields.reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = values[key];
    return acc;
  }, {});
  const result = (step.schema as z.ZodTypeAny).safeParse(payload);
  if (result.success) {
    step.fields.forEach((field) => clearErrors(field));
    return true;
  }
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as StepKey;
    setError(field, { type: "manual", message: issue.message });
  });
  return false;
}

export function StepperFormSnippet() {
  const [activeStep, setActiveStep] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<FormValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const currentStep = STEPS[activeStep];
  const progressPercent = Math.round(((activeStep + 1) / STEPS.length) * 100);

  const resumeDraft = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<FormValues> & { activeStep?: number; lastSavedAt?: number };
      const { activeStep: savedStep, lastSavedAt: savedAt, ...values } = parsed;
      form.reset({ ...DEFAULT_VALUES, ...values });
      if (typeof savedStep === "number") {
        setActiveStep(Math.min(savedStep, STEPS.length - 1));
      }
      if (typeof savedAt === "number") {
        setLastSavedAt(savedAt);
      }
      setRestoredDraft(true);
      toast.info("已从草稿恢复内容，可继续填写。");
    } catch (error) {
      console.warn("Failed to parse draft", error);
    }
  }, [form]);

  const persistDraft = useCallback(
    (values: FormValues, stepIndex: number) => {
      if (typeof window === "undefined") {
        return;
      }
      const payload = {
        ...values,
        activeStep: stepIndex,
        lastSavedAt: Date.now(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(payload.lastSavedAt);
    },
    [],
  );

  useEffect(() => {
    resumeDraft();
  }, [resumeDraft]);

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (!name) {
        return;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        persistDraft(form.getValues(), activeStep);
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [form, activeStep, persistDraft]);

  const handleNext = useCallback(async () => {
    if (activeStep >= STEPS.length - 1) {
      return;
    }
    const isValid = validateStep(currentStep, form.getValues(), form.setError, form.clearErrors);
    if (!isValid) {
      toast.error("请先完善当前步骤信息");
      return;
    }
    const nextStep = Math.min(activeStep + 1, STEPS.length - 1);
    setActiveStep(nextStep);
    persistDraft(form.getValues(), nextStep);
  }, [activeStep, currentStep, form, persistDraft]);

  const handlePrev = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleDiscardDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    form.reset(DEFAULT_VALUES);
    setActiveStep(0);
    setLastSavedAt(null);
    setRestoredDraft(false);
    toast.success("已清空草稿，返回第一步。");
  };

  const onSubmit = (values: FormValues) => {
    const result = FormSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as StepKey;
        form.setError(field, { type: "manual", message: issue.message });
      });
      const firstIssue = result.error.issues[0];
      if (firstIssue?.path?.[0]) {
        const firstField = firstIssue.path[0] as StepKey;
        const targetStepIndex = STEPS.findIndex((step) => step.fields.includes(firstField));
        if (targetStepIndex >= 0) {
          setActiveStep(targetStepIndex);
        }
      }
      toast.error("还有信息未完善，请检查提示。");
      return;
    }
    persistDraft(values, activeStep);
    toast.success("上线向导提交成功，我们会尽快联系您。");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const watchValues = form.watch();

  const summaryData = useMemo(() => {
    return [
      {
        title: "项目概览",
        items: [
          { label: "项目名称", value: watchValues.projectName || "未填写" },
          { label: "项目网址", value: watchValues.projectUrl || "未填写" },
          {
            label: "行业 & 团队规模",
            value:
              [
                INDUSTRIES.find((item) => item.value === watchValues.industry)?.label ?? "未选择行业",
                TEAM_SIZES.find((item) => item.value === watchValues.teamSize)?.label ?? "未选择团队规模",
              ]
                .filter(Boolean)
                .join(" · ") || "未选择",
          },
        ],
      },
      {
        title: "主要联系人",
        items: [
          { label: "姓名", value: watchValues.contactName || "未填写" },
          { label: "邮箱", value: watchValues.contactEmail || "未填写" },
          { label: "角色", value: watchValues.contactRole || "未填写" },
        ],
      },
      {
        title: "上线偏好",
        items: [
          {
            label: "目标场景",
            value: watchValues.usageScenario ? `${watchValues.usageScenario}` : "未填写",
          },
          {
            label: "计划上线",
            value:
              LAUNCH_PLAN.find((item) => item.value === watchValues.launchPlan)?.label ?? "未选择",
          },
          {
            label: "营销渠道",
            value:
              watchValues.marketingChannels.length > 0
                ? watchValues.marketingChannels
                    .map((value) => CHANNEL_OPTIONS.find((item) => item.value === value)?.label ?? value)
                    .join(" / ")
                : "未选择",
          },
          {
            label: "通知开关",
            value: watchValues.enableNotifications ? "已开启" : "关闭",
          },
        ],
      },
    ];
  }, [watchValues]);

  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <Card className="border border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">多步骤上线向导</CardTitle>
              <CardDescription>
                拆解复杂表单流程，支持草稿保存、进度反馈与最终确认，适用于账号注册或上线配置。
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="bg-muted px-3 py-1 text-xs">
                步骤 {activeStep + 1} / {STEPS.length}
              </Badge>
              {lastSavedAt ? (
                <span className="text-xs text-muted-foreground">
                  最近保存：{formatTimestamp(lastSavedAt)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">自动保存草稿已开启</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Progress value={progressPercent} aria-label="当前完成进度" />
            <div className="grid gap-2 sm:grid-cols-4">
              {STEPS.map((step, index) => {
                const status =
                  index < activeStep ? "done" : index === activeStep ? "current" : "upcoming";
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (index <= activeStep) {
                        setActiveStep(index);
                      }
                    }}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
                      status === "done" &&
                        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
                      status === "current" &&
                        "border-primary/40 bg-primary/10 text-primary dark:border-primary/60 dark:bg-primary/15 dark:text-primary/90",
                      status === "upcoming" &&
                        "border-border/60 bg-muted/20 text-muted-foreground dark:border-border/40 dark:bg-muted/10",
                      index > activeStep && "cursor-default",
                    )}
                    disabled={index > activeStep}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-full border text-sm font-semibold transition",
                        "h-8 min-w-[2rem] px-1",
                        status === "done" &&
                          "border-emerald-600 bg-emerald-600 text-emerald-50 dark:border-emerald-500 dark:bg-emerald-700/70 dark:text-emerald-100",
                        status === "current" &&
                          "border-primary bg-primary text-primary-foreground dark:border-primary/80 dark:bg-primary/80",
                        status === "upcoming" &&
                          "border-border/60 bg-background text-muted-foreground dark:border-border/40 dark:bg-muted/20",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-none">{step.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {restoredDraft ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200">
                已从草稿恢复，可继续填写
              </span>
            ) : (
              <span>系统会在编辑时自动保存草稿，支持跨步骤跳转。</span>
            )}
            <Button type="button" variant="link" className="px-0 text-destructive" onClick={handleDiscardDraft}>
              清空草稿
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 rounded-2xl border border-border/60 bg-background/95 p-6 shadow-sm"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              </div>

              {currentStep.id === "project" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>项目名称</FormLabel>
                        <FormControl>
                          <Input placeholder="如：Libra Insight" {...field} />
                        </FormControl>
                        <FormDescription>向用户展示的产品或服务名称。</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>项目网址</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>填写产品官网或落地页，用于审核。</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>所属行业</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择行业" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDUSTRIES.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>团队规模</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择团队规模" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEAM_SIZES.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {currentStep.id === "contact" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>联系人姓名</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入联系人" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>联系邮箱</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="name@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactRole"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>联系人角色</FormLabel>
                        <FormControl>
                          <Input placeholder="如：产品经理 / 运营负责人" {...field} />
                        </FormControl>
                        <FormDescription>用于判断审批权限与后续沟通人。</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {currentStep.id === "preferences" ? (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="usageScenario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>主要使用场景</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="简要描述业务痛点、目标用户与预期成果..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="launchPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>计划上线时间</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择上线周期" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LAUNCH_PLAN.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marketingChannels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>计划使用的营销渠道</FormLabel>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {CHANNEL_OPTIONS.map((option) => {
                            const checked = field.value?.includes(option.value) ?? false;
                            return (
                              <FormItem
                                key={option.value}
                                className="flex items-center space-x-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      if (isChecked) {
                                        field.onChange([...(field.value ?? []), option.value]);
                                      } else {
                                        field.onChange(
                                          (field.value ?? []).filter((value: string) => value !== option.value),
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="leading-tight">
                                  <FormLabel className="font-normal">{option.label}</FormLabel>
                                </div>
                              </FormItem>
                            );
                          })}
                        </div>
                        <FormDescription>至少选择一个渠道，用于分配资源与评估预算。</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="enableNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                          <div className="space-y-1">
                            <FormLabel>上线提醒通知</FormLabel>
                            <FormDescription>开启后将在上线前一天发送邮件提醒。</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-center rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                            />
                          </FormControl>
                          <div className="ml-3 space-y-1">
                            <FormLabel className="font-medium">
                              我已阅读并同意《上线服务条款》
                            </FormLabel>
                            <FormDescription>提交前需确认已知晓 SLA、数据与安全规范。</FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ) : null}

              {currentStep.id === "review" ? (
                <div className="space-y-4">
                  {summaryData.map((section) => (
                    <div key={section.title} className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                      <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                      <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {section.items.map((item) => (
                          <div key={item.label} className="flex items-start justify-between gap-3">
                            <span className="font-medium text-foreground">{item.label}</span>
                            <span className="text-right text-muted-foreground/90">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    提交后将同步给审批同学，可在「项目设置」中继续修改。确认无误后点击提交上线。
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="outline" disabled={activeStep === 0} onClick={handlePrev}>
                  上一步
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                  {!isLastStep ? (
                    <Button type="button" onClick={handleNext}>
                      下一步
                    </Button>
                  ) : (
                    <Button type="submit">提交上线申请</Button>
                  )}
                </div>
              </div>
            </form>
          </Form>

          <div className="space-y-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">填写进度</h4>
              <p className="text-xs text-muted-foreground">
                已完成 {activeStep} / {STEPS.length - 1} 个必填步骤。
              </p>
            </div>
            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>自动保存</span>
                <span>{lastSavedAt ? formatTimestamp(lastSavedAt) : "实时保存中"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>邮箱通知</span>
                  <span>{watchValues.enableNotifications ? "开启" : "关闭"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>营销渠道</span>
                  <span>{watchValues.marketingChannels.length} 个已选择</span>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border/60 bg-background p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">小贴士</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>支持跨页面保存草稿，可随时关闭浏览器。</li>
                <li>若需多人协作，可分享草稿链接给同事继续填写。</li>
                <li>提交后仍可在后台对各项配置进行微调。</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

