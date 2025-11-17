import { useEffect, useMemo, useState } from "react";
import { FileDown, FileJson, FileSpreadsheet, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type GrowthRecord = {
  product: string;
  owner: string;
  weeklyActive: number;
  retention: number;
  revenue: number;
  sentiment: "up" | "flat" | "down";
};

const growthRecords: GrowthRecord[] = [
  {
    product: "Teamspace 协同套件",
    owner: "Collab Squad",
    weeklyActive: 4286,
    retention: 0.67,
    revenue: 74800,
    sentiment: "up",
  },
  {
    product: "Pulse 运营驾驶舱",
    owner: "Ops Garden",
    weeklyActive: 3110,
    retention: 0.59,
    revenue: 53210,
    sentiment: "flat",
  },
  {
    product: "FlowBoard 自动化",
    owner: "Automation Core",
    weeklyActive: 1974,
    retention: 0.52,
    revenue: 41880,
    sentiment: "up",
  },
  {
    product: "Insight Studio",
    owner: "BI Studio",
    weeklyActive: 1480,
    retention: 0.44,
    revenue: 23640,
    sentiment: "down",
  },
];

type ExportFile = {
  id: string;
  label: string;
  description: string;
  fileName: string;
  mime: string;
  blob: Blob;
  icon: typeof FileDown;
};

const sentimentMeta: Record<GrowthRecord["sentiment"], string> = {
  up: "📈 明显增长",
  flat: "➖ 稳定",
  down: "📉 需复盘",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);

export function AnchorFileDownloadSnippet() {
  const [includeInsights, setIncludeInsights] = useState(true);
  const [maskOwner, setMaskOwner] = useState(false);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});

  const sanitizedRecords = useMemo(() => {
    if (!maskOwner) {
      return growthRecords;
    }
    return growthRecords.map((record, index) => ({
      ...record,
      owner: `Team-${index + 1}`,
    }));
  }, [maskOwner]);

  const exportFiles = useMemo<ExportFile[]>(() => {
    const generatedAt = new Date().toISOString();

    const basePayload = {
      generatedAt,
      includeInsights,
      maskOwner,
      records: sanitizedRecords,
      insights: includeInsights
        ? sanitizedRecords.map((record) => ({
            product: record.product,
            sentiment: sentimentMeta[record.sentiment],
            reminder:
              record.sentiment === "down"
                ? "流失率升高，建议排查漏斗。"
                : "保持现有节奏即可。",
          }))
        : undefined,
    };

    const jsonBlob = new Blob([JSON.stringify(basePayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const csvHeader = ["产品", "负责人", "周活", "留存", "本月营收", "趋势"];
    const csvRows = sanitizedRecords.map((record) =>
      [
        record.product,
        record.owner,
        record.weeklyActive,
        `${(record.retention * 100).toFixed(1)}%`,
        record.revenue,
        sentimentMeta[record.sentiment],
      ].join(","),
    );
    const csvBlob = new Blob([[csvHeader.join(","), ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });

    const markdownSections = sanitizedRecords.map((record) => {
      const sentimentText =
        record.sentiment === "up"
          ? "表现优于预期 ✅"
          : record.sentiment === "down"
            ? "有下滑风险 ⚠️"
            : "保持稳定 🔁";

      const detail = includeInsights
        ? `> 负责人 ${record.owner}：${sentimentMeta[record.sentiment]}`
        : `> 负责人 ${record.owner}`;

      return [
        `### ${record.product}`,
        `- 周活用户：${record.weeklyActive}`,
        `- 月营收：${formatCurrency(record.revenue)}`,
        `- 留存率：${(record.retention * 100).toFixed(1)}%`,
        `- 趋势：${sentimentText}`,
        detail,
      ].join("\n");
    });
    const markdownContent = [
      `# Growth Radar 导出`,
      `> 生成时间：${new Date(generatedAt).toLocaleString("zh-CN")}`,
      "",
      ...markdownSections,
    ].join("\n\n");
    const markdownBlob = new Blob([markdownContent], {
      type: "text/markdown;charset=utf-8",
    });

    return [
      {
        id: "json",
        label: "JSON 数据包",
        description: "完整保留结构化字段，适合再次导入或联动 BI。",
        fileName: `growth-report${maskOwner ? "-masked" : ""}.json`,
        mime: "application/json",
        blob: jsonBlob,
        icon: FileJson,
      },
      {
        id: "csv",
        label: "CSV 表格",
        description: "可直接在 Excel / Numbers 打开，附带基础指标。",
        fileName: `growth-report-${includeInsights ? "full" : "lite"}.csv`,
        mime: "text/csv",
        blob: csvBlob,
        icon: FileSpreadsheet,
      },
      {
        id: "md",
        label: "Markdown 摘要",
        description: "输出轻量说明稿，可粘贴到周报或飞书文档。",
        fileName: `growth-report-${generatedAt.slice(0, 10)}.md`,
        mime: "text/markdown",
        blob: markdownBlob,
        icon: FileText,
      },
    ];
  }, [includeInsights, maskOwner, sanitizedRecords]);

  useEffect(() => {
    const urls: Record<string, string> = {};
    exportFiles.forEach((file) => {
      urls[file.id] = URL.createObjectURL(file.blob);
    });
    setFileUrls(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [exportFiles]);

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              点击 a 标签即触发下载
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              每个导出项都通过 Blob → ObjectURL → &lt;a download&gt; 串联，纯前端即可生成文件，不依赖后端接口。
            </p>
          </div>
          <div className="grid gap-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1">
              <Switch checked={includeInsights} onCheckedChange={setIncludeInsights} />
              包含洞察段落
            </label>
            <label className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1">
              <Switch checked={maskOwner} onCheckedChange={setMaskOwner} />
              匿名化负责人
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {exportFiles.map((file) => {
          const Icon = file.icon ?? FileDown;
          const sizeInfo = (file.blob.size / 1024).toFixed(1);
          return (
            <article
              key={file.id}
              className="flex flex-col justify-between rounded-3xl border border-border/60 bg-card/70 p-5 shadow-[0_15px_40px_-28px_rgba(15,23,42,0.55)]"
            >
              <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className="w-fit gap-1 rounded-full border border-border/60 bg-background/70"
                >
                  <Icon className="size-3.5" />
                  {file.mime}
                </Badge>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{file.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {file.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                  <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted-foreground/80">
                    {file.fileName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{sizeInfo} KB</span>
                    <span className="size-1 rounded-full bg-border/70" />
                    <span>Blob URL 已就绪</span>
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="mt-6 w-full justify-center border-dashed bg-background/70 text-sm font-semibold"
              >
                <a
                  href={fileUrls[file.id]}
                  download={file.fileName}
                  className={cn(
                    "flex w-full items-center justify-center gap-2",
                    !fileUrls[file.id] && "pointer-events-none opacity-60",
                  )}
                >
                  <FileDown className="size-4" />
                  下载
                </a>
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
