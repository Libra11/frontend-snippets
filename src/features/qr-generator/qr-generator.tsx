/**
 * Author: Libra
 * Date: 2025-11-08 01:34:31
 * LastEditors: Libra
 * Description:
 */
import { useState } from "react";
import QRCode from "react-qr-code";
import {
  AlignLeft,
  ArrowRight,
  Smartphone,
  UserPlus,
  Wifi,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import type { QrPreset } from "./types";

const DEFAULT_VALUE = "https://frontend-snippets.libra.dev";

const presets: QrPreset[] = [
  {
    id: "website",
    title: "产品官网",
    description: "适合在海报或桌卡上分发，自动带 UTM 参数。",
    value: "https://frontend-snippets.libra.dev?utm_source=qrcode",
    size: 196,
    level: "M",
    fgColor: "#1f2937",
  },
  {
    id: "wifi",
    title: "办公室 Wi-Fi",
    description: "统一生成 Wi-Fi 配网二维码，访客扫码即可加入网络。",
    value: "WIFI:T:WPA;S:libra-guest;P:welcome123;;",
    size: 196,
    level: "H",
    fgColor: "#0f172a",
    bgColor: "#f8fafc",
  },
  {
    id: "app",
    title: "移动应用下载",
    description: "引导用户访问 App 下载页，根据 UA 自动识别平台。",
    value: "https://frontend-snippets.libra.dev/app",
    size: 196,
    level: "Q",
    fgColor: "#7839ee",
  },
  {
    id: "contact",
    title: "客服联系卡",
    description: "嵌入 vCard 信息，一次扫码即可保存联系人。",
    value:
      "BEGIN:VCARD\nVERSION:3.0\nFN:Libra 客服\nTEL:+86-400-123-4567\nEMAIL:service@libra.dev\nEND:VCARD",
    size: 196,
    level: "H",
    fgColor: "#047857",
  },
];

type IconMap = Record<string, React.ComponentType<{ className?: string }>>;

const iconMap: IconMap = {
  website: ArrowRight,
  wifi: Wifi,
  app: Smartphone,
  contact: UserPlus,
};

const errorLevels: Array<{
  label: string;
  value: "L" | "M" | "Q" | "H";
  hint: string;
}> = [
  { label: "7% L", value: "L", hint: "容错率最低" },
  { label: "15% M", value: "M", hint: "默认值" },
  { label: "25% Q", value: "Q", hint: "适合内嵌徽标" },
  { label: "30% H", value: "H", hint: "容错率最高" },
];

const sizeOptions = [128, 160, 192, 224, 256];

export function QrGeneratorSnippet() {
  const [tab, setTab] = useState<string>("presets");
  const [customValue, setCustomValue] = useState<string>(DEFAULT_VALUE);
  const [customSize, setCustomSize] = useState<number>(192);
  const [customLevel, setCustomLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [customForeground, setCustomForeground] = useState<string>("#0f172a");
  const [customBackground, setCustomBackground] = useState<string>("#ffffff");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        集成 `react-qr-code`
        实现二维码生成，提供常见场景预设、容错率调节与颜色自定义，满足营销海报、Wi-Fi
        配网等使用需求。
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
      >
        <Card className="space-y-6">
          <CardHeader className="px-6 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">二维码展示</CardTitle>
                <CardDescription>
                  从常用预设或自定义内容生成二维码，支持容错率、前景色、背景色与大小调整。
                </CardDescription>
              </div>
              <Badge variant="secondary">实时预览</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">场景预设</TabsTrigger>
              <TabsTrigger value="custom">自定义内容</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {presets.map((preset) => {
                  const Icon = iconMap[preset.id] ?? AlignLeft;
                  return (
                    <Card
                      key={preset.id}
                      className="space-y-4 border border-border/70 bg-background/90 p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        <Icon className="size-4" />
                        <span>{preset.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground/80">
                        {preset.description}
                      </p>
                      <div className="flex justify-center rounded-2xl border border-border/60 bg-muted/10 p-4">
                        <QRCode
                          value={preset.value}
                          size={preset.size}
                          fgColor={preset.fgColor ?? "#1f2937"}
                          bgColor={preset.bgColor ?? "#ffffff"}
                          level={preset.level ?? "M"}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
                小贴士：在打印或制作海报时，建议保留 1cm
                以上的留白边距，确保扫码设备能准确识别。
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="space-y-6">
                <Card className="space-y-6 border border-border/70 bg-muted/10 p-6">
                  <CardHeader className="space-y-1 p-0">
                    <CardTitle className="text-lg">自定义内容</CardTitle>
                    <CardDescription>
                      输入任意文本、链接或 vCard 信息实时生成二维码。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 p-0">
                    <div className="space-y-3">
                      <Label
                        htmlFor="qr-value"
                        className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
                      >
                        内容
                      </Label>
                      <Textarea
                        id="qr-value"
                        rows={4}
                        value={customValue}
                        onChange={(event) => setCustomValue(event.target.value)}
                        placeholder={DEFAULT_VALUE}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          <span>大小</span>
                          <span>{customSize}px</span>
                        </div>
                        <Input
                          id="qr-size"
                          type="range"
                          min={96}
                          max={288}
                          step={16}
                          value={customSize}
                          onChange={(event) =>
                            setCustomSize(Number(event.target.value))
                          }
                        />
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {sizeOptions.map((size) => (
                            <Button
                              key={size}
                              type="button"
                              size="sm"
                              variant={
                                customSize === size ? "secondary" : "outline"
                              }
                              onClick={() => setCustomSize(size)}
                            >
                              {size}px
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          容错等级
                        </div>
                        <div className="grid gap-2">
                          {errorLevels.map((item) => (
                            <Button
                              key={item.value}
                              type="button"
                              size="sm"
                              className="justify-start gap-2"
                              variant={
                                customLevel === item.value
                                  ? "secondary"
                                  : "outline"
                              }
                              onClick={() => setCustomLevel(item.value)}
                            >
                              <span className="font-medium text-foreground">
                                {item.label}
                              </span>
                              <span className="text-xs text-muted-foreground/80">
                                {item.hint}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/80 p-4">
                        <Label
                          htmlFor="qr-foreground"
                          className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
                        >
                          前景色
                        </Label>
                        <Input
                          id="qr-foreground"
                          type="color"
                          value={customForeground}
                          onChange={(event) =>
                            setCustomForeground(event.target.value)
                          }
                          className="h-10 w-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/80 p-4">
                        <Label
                          htmlFor="qr-background"
                          className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
                        >
                          背景色
                        </Label>
                        <Input
                          id="qr-background"
                          type="color"
                          value={customBackground}
                          onChange={(event) =>
                            setCustomBackground(event.target.value)
                          }
                          className="h-10 w-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex flex-col items-center gap-5 border border-border/60 bg-background/95 p-6 text-center shadow-sm">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      实时预览
                    </p>
                    <p className="text-xs text-muted-foreground">
                      将二维码导出或嵌入到海报、着陆页等需要场景。
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/60 bg-muted/5 p-5">
                    <QRCode
                      value={customValue || DEFAULT_VALUE}
                      size={customSize}
                      fgColor={customForeground}
                      bgColor={customBackground}
                      level={customLevel}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/80">
                    建议保留足够留白并测试扫码距离，确保在不同光线环境下也能被识别。
                  </p>
                </Card>
              </div>
            </TabsContent>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="font-medium text-foreground">二维码容错率</p>
              <p className="mt-1 text-xs text-muted-foreground">
                容错等级越高，二维码容量越低，但在贴纸、雕刻等物理损耗场景下更易被识别。可根据使用环境选择合适等级。
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="font-medium text-foreground">颜色与对比度</p>
              <p className="mt-1 text-xs text-muted-foreground">
                建议保持前景色与背景色对比充分，避免纯透明色，否则摄像头难以识别。暗背景时可搭配浅色外边框。
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <p className="font-medium text-foreground">数据格式</p>
              <p className="mt-1 text-xs text-muted-foreground">
                除了普通文本/URL，还可以嵌入
                Wi-Fi、vCard、短信模板等格式，扫码后触发对应操作。
              </p>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
