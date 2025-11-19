import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import jsPreviewDocx, {
  type JsDocxPreview,
  type Options as DocxOptions,
} from "@js-preview/docx";
import "@js-preview/docx/lib/index.css";
import jsPreviewExcel, {
  type JsExcelPreview,
  type Options as ExcelOptions,
} from "@js-preview/excel";
import "@js-preview/excel/lib/index.css";
import jsPreviewPdf, {
  type JsPdfPreview,
  type Options as PdfOptions,
} from "@js-preview/pdf";
import { FileText, Layout, Rows, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PreviewType = "pdf" | "docx" | "xlsx";
type LoadStatus = "idle" | "loading" | "error";

const previewOptions: {
  id: PreviewType;
  label: string;
  description: string;
  accept: string;
  icon: typeof Layout;
}[] = [
  {
    id: "pdf",
    label: "PDF",
    description: "@js-preview/pdf · 基于 pdf.js",
    accept: ".pdf",
    icon: Layout,
  },
  {
    id: "docx",
    label: "Word (.docx)",
    description: "@js-preview/docx · docx-preview",
    accept: ".docx",
    icon: FileText,
  },
  {
    id: "xlsx",
    label: "Excel (.xlsx/.xls)",
    description: "@js-preview/excel · ExcelJS + x-data-spreadsheet",
    accept: ".xlsx,.xls",
    icon: Rows,
  },
];

export function FilePreviewSnippet() {
  const [activeType, setActiveType] = useState<PreviewType>("pdf");
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const docxContainerRef = useRef<HTMLDivElement | null>(null);
  const excelContainerRef = useRef<HTMLDivElement | null>(null);

  const pdfInstanceRef = useRef<JsPdfPreview | null>(null);
  const docxInstanceRef = useRef<JsDocxPreview | null>(null);
  const excelInstanceRef = useRef<JsExcelPreview | null>(null);

  const latestActiveTypeRef = useRef(activeType);

  // Update ref when activeType changes
  useEffect(() => {
    latestActiveTypeRef.current = activeType;
  }, [activeType]);

  const statusText = useMemo(() => {
    if (status === "loading") {
      return "解析文件中...";
    }
    if (status === "error") {
      return error ?? "解析失败";
    }
    return null;
  }, [status, error]);

  const destroyInstances = useCallback(() => {
    pdfInstanceRef.current?.destroy();
    pdfInstanceRef.current = null;
    docxInstanceRef.current?.destroy();
    docxInstanceRef.current = null;
    excelInstanceRef.current?.destroy();
    excelInstanceRef.current = null;

    if (pdfContainerRef.current) {
      pdfContainerRef.current.innerHTML = "";
    }
    if (docxContainerRef.current) {
      docxContainerRef.current.innerHTML = "";
    }
    if (excelContainerRef.current) {
      excelContainerRef.current.innerHTML = "";
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyInstances();
    };
  }, [destroyInstances]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      destroyInstances();
      setFileName(file.name);
      setStatus("loading");
      setError(null);

      try {
        const buffer = await file.arrayBuffer();

        // Check if the user switched tabs while reading the file
        if (activeType !== latestActiveTypeRef.current) {
          return;
        }

        if (activeType === "pdf") {
          const container = pdfContainerRef.current;
          if (!container) {
            throw new Error("PDF 容器未就绪");
          }
          pdfInstanceRef.current = jsPreviewPdf.init(
            container,
            {
              width: container.clientWidth || undefined,
              onError: (err) => setError(err?.message ?? "PDF 预览失败"),
            } satisfies PdfOptions,
          );
          await pdfInstanceRef.current.preview(buffer);
        } else if (activeType === "docx") {
          const container = docxContainerRef.current;
          if (!container) {
            throw new Error("DOCX 容器未就绪");
          }
          docxInstanceRef.current = jsPreviewDocx.init(
            container,
            {
              className: "docx-preview",
              inWrapper: false,
            } satisfies DocxOptions,
          );
          await docxInstanceRef.current.preview(buffer);
        } else {
          const container = excelContainerRef.current;
          if (!container) {
            throw new Error("Excel 容器未就绪");
          }
          excelInstanceRef.current = jsPreviewExcel.init(
            container,
            {
              minRowLength: 30,
              minColLength: 8,
            } satisfies ExcelOptions,
          );
          await excelInstanceRef.current.preview(buffer);
        }

        setStatus("idle");
      } catch (err) {
        // If the error is due to tab switching (container missing), we might want to ignore it,
        // but the check above (activeType !== latestActiveTypeRef.current) handles most cases.
        // If we are here, it's likely a real parsing error or the container was lost unexpectedly.
        if (activeType === latestActiveTypeRef.current) {
          setStatus("error");
          setError((err as Error).message ?? "文件解析失败");
        }
      } finally {
        event.target.value = "";
      }
    },
    [activeType, destroyInstances],
  );

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground/90">多格式文件预览</p>
            <p className="mt-1 text-sm text-muted-foreground">
              使用 @js-preview/pdf · docx · excel 直接解析本地文件，省去手写解析逻辑。
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]">
            PREVIEW
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {fileName ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              当前文件：{fileName}
            </span>
          ) : (
            <span>请选择 {previewOptions.find((item) => item.id === activeType)?.label} 文件</span>
          )}
          {statusText ? <span className="text-primary">{statusText}</span> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {previewOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.id === activeType;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setActiveType(option.id);
                setFileName(null);
                setStatus("idle");
                setError(null);
                destroyInstances();
              }}
              className={cn(
                "flex flex-col gap-2 rounded-3xl border border-border/60 bg-card/70 p-4 text-left transition hover:border-primary/60",
                isActive && "border-primary/60 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.55)]",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full p-2 text-primary",
                    isActive ? "bg-primary/10" : "bg-muted/50",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                {isActive ? (
                  <Badge className="ml-auto rounded-full bg-primary/10 text-[10px] text-primary">
                    当前
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          );
        })}
      </div>

      <label className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/10 px-6 py-10 text-center text-sm text-muted-foreground transition hover:bg-muted/20 cursor-pointer">
        <UploadCloud className="size-6 text-primary" />
        <span>
          {fileName ? "重新选择文件" : `选择 ${previewOptions.find((item) => item.id === activeType)?.label} 文件`}
        </span>
        <Input
          type="file"
          accept={previewOptions.find((item) => item.id === activeType)?.accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-[0_20px_65px_-32px_rgba(15,23,42,0.55)]">
        {activeType === "pdf" ? (
          <div
            ref={pdfContainerRef}
            className="min-h-[360px] overflow-auto rounded-2xl border border-border/70 bg-background/95 p-3"
          />
        ) : null}

        {activeType === "docx" ? (
          <div
            ref={docxContainerRef}
            className={cn(
              "prose prose-sm max-w-none min-h-[360px] rounded-2xl border border-border/70 p-5",
              fileName ? "bg-white text-black" : "bg-background/95 text-muted-foreground",
            )}
          />
        ) : null}

        {activeType === "xlsx" ? (
          <div
            ref={excelContainerRef}
            className="h-[600px] w-full overflow-hidden rounded-2xl border border-border/70 bg-background/95"
          />
        ) : null}

        {status === "error" && error ? (
          <p className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : fileName ? null : (
          <p className="text-center text-sm text-muted-foreground">
            暂未选择文件，请先选择 {previewOptions.find((item) => item.id === activeType)?.label} 文件进行预览。
          </p>
        )}
      </div>
    </section>
  );
}
