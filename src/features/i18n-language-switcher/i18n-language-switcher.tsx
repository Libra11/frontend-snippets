/**
 * Author: Libra
 * Date: 2025-11-10 12:20:00
 * LastEditors: Libra
 * Description: 国际化语言切换器示例，结合 i18next 与 Intl API 展示语言包加载、日期/数字格式化与回退策略
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { createInstance } from "i18next";
import {
  initReactI18next,
  I18nextProvider,
  useTranslation,
} from "react-i18next";
import {
  BadgeCheck,
  CheckCircle2,
  Globe2,
  LoaderCircle,
  MessagesSquare,
  Orbit,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const SUPPORTED_LANGUAGES = [
  {
    value: "zh-CN",
    label: "简体中文",
    nativeLabel: "简体中文",
    region: "中国大陆",
    currency: "CNY",
  },
  {
    value: "en-US",
    label: "English (US)",
    nativeLabel: "English",
    region: "United States",
    currency: "USD",
  },
  {
    value: "ja-JP",
    label: "日本語",
    nativeLabel: "日本語",
    region: "日本",
    currency: "JPY",
  },
] as const;

type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["value"];

type LanguagePack = {
  translation: Record<string, unknown>;
};

const LANGUAGE_PACKS: Record<LanguageCode, LanguagePack> = {
  "en-US": {
    translation: {
      hero: {
        title: "Localization control panel",
        subtitle:
          "Switch between locales and watch text, dates, and numbers adapt instantly with fallbacks that keep the UI usable.",
      },
      controls: {
        selectLabel: "Interface language",
        loading: "Loading language pack…",
        preloadButton: "Preload all",
        preloadDone: "All language packs cached",
      },
      cards: {
        dateTitle: "Localized date & time",
        numberTitle: "Localized currency",
        fallbackTitle: "Fallback messaging",
      },
      metrics: {
        resolved: "Resolved locale",
        timezone: "Time zone",
        relative: "Relative time",
        currency: "Currency",
        fallbackActive: "Using fallback message",
        fallbackInactive: "Native translation applied",
      },
      support: {
        contact: "Need help? Contact support.",
      },
      notes: {
        fallback: "Missing keys gracefully fall back to English.",
      },
    },
  },
  "zh-CN": {
    translation: {
      hero: {
        title: "国际化语言切换器",
        subtitle:
          "实时切换多语言界面，观察文案、日期与数字的本地化效果与回退逻辑。",
      },
      controls: {
        selectLabel: "界面语言",
        loading: "正在加载语言包…",
        preloadButton: "预加载全部语言",
        preloadDone: "全部语言包已缓存",
      },
      cards: {
        dateTitle: "本地化日期与时间",
        numberTitle: "货币格式示例",
        fallbackTitle: "回退文案",
      },
      metrics: {
        resolved: "当前生效语言",
        timezone: "系统时区",
        relative: "相对时间",
        currency: "货币单位",
        fallbackActive: "正在使用英文回退",
        fallbackInactive: "已加载该语言文案",
      },
      support: {
        contact: "需要帮助？请联系支持团队。",
      },
      notes: {
        fallback: "缺失的条目会自动回退至英文，保证界面可用性。",
      },
    },
  },
  "ja-JP": {
    translation: {
      hero: {
        title: "多言語スイッチャー",
        subtitle:
          "言語を切り替えて、テキスト・日付・数値のローカライズをリアルタイムに確認しましょう。",
      },
      controls: {
        selectLabel: "表示言語",
        loading: "言語パックを読み込み中…",
        preloadButton: "すべての言語をプリロード",
        preloadDone: "全ての言語パックがキャッシュされました",
      },
      cards: {
        dateTitle: "ローカライズされた日付と時刻",
        numberTitle: "通貨フォーマット例",
        fallbackTitle: "フォールバックメッセージ",
      },
      metrics: {
        resolved: "適用中のロケール",
        timezone: "タイムゾーン",
        relative: "相対時間",
        currency: "通貨コード",
        fallbackActive: "フォールバック文言を使用中",
        fallbackInactive: "ネイティブ翻訳を使用しています",
      },
      notes: {
        fallback: "翻訳が見つからない場合は英語にフォールバックします。",
      },
      // 故意保留 support.contact 缺失，以演示回退到英文的行为
    },
  },
};

const DEFAULT_LANGUAGE: LanguageCode = "zh-CN";

const sampleDate = new Date("2025-11-10T09:30:00Z");
const sampleRevenue = 1234567.89;

function LanguageContent({
  selectedLanguage,
  onLanguageChange,
  isLoading,
}: {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  isLoading: boolean;
}) {
  const { t, i18n } = useTranslation();
  const languageMeta = SUPPORTED_LANGUAGES.find(
    (item) => item.value === selectedLanguage
  )!;
  const resolvedLanguage = i18n.resolvedLanguage ?? selectedLanguage;
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const [prefetched, setPrefetched] = useState(false);

  const localizedDate = useMemo(() => {
    return new Intl.DateTimeFormat(resolvedLanguage, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(sampleDate);
  }, [resolvedLanguage]);

  const localizedCurrency = useMemo(() => {
    return new Intl.NumberFormat(resolvedLanguage, {
      style: "currency",
      currency: languageMeta.currency,
      maximumFractionDigits: languageMeta.currency === "JPY" ? 0 : 2,
    }).format(sampleRevenue);
  }, [languageMeta.currency, resolvedLanguage]);

  const relativeTime = useMemo(() => {
    return new Intl.RelativeTimeFormat(resolvedLanguage, {
      numeric: "auto",
    }).format(-2, "day");
  }, [resolvedLanguage]);

  const fallbackActive = useMemo(() => {
    if (!i18n.isInitialized) {
      return false;
    }
    const resource = i18n.getResource(
      selectedLanguage,
      "translation",
      "support.contact"
    );
    return typeof resource === "undefined";
  }, [i18n, selectedLanguage]);

  const preloadAll = useCallback(() => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      if (!i18n.hasResourceBundle(lang.value, "translation")) {
        i18n.addResourceBundle(
          lang.value,
          "translation",
          LANGUAGE_PACKS[lang.value].translation,
          true,
          true
        );
      }
    });
    setPrefetched(true);
  }, [i18n]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border/60 bg-muted/10 p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("controls.selectLabel")}
          </Label>
          <Select
            value={selectedLanguage}
            onValueChange={(value) => onLanguageChange(value as LanguageCode)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/95">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border/60">
              {SUPPORTED_LANGUAGES.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {language.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language.nativeLabel}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-3 animate-spin text-primary" />
              <span>{t("controls.loading")}</span>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {languageMeta.region} · {languageMeta.currency}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-border/60 bg-background/95 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Globe2 className="size-4 text-primary" />
            <span className="font-medium text-foreground">
              {t("metrics.resolved")}: {resolvedLanguage}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>
              {t("metrics.timezone")}: {timeZone}
            </p>
            <p>
              {t("metrics.currency")}: {languageMeta.currency}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {fallbackActive ? (
              <>
                <BadgeCheck className="size-4 text-amber-500" />
                <span>{t("metrics.fallbackActive")}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>{t("metrics.fallbackInactive")}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 bg-background/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              {t("cards.dateTitle")}
            </CardTitle>
            <Orbit className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{localizedDate}</p>
            <p>
              {t("metrics.relative")}: {relativeTime}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-background/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              {t("cards.numberTitle")}
            </CardTitle>
            <MessagesSquare className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{localizedCurrency}</p>
            <p>
              {t("metrics.currency")}: {languageMeta.currency}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-background/95">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              {t("cards.fallbackTitle")}
            </CardTitle>
            <Badge className="bg-primary/10 text-primary">fallback</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t("support.contact")}</p>
            <p>{t("notes.fallback")}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t("hero.title")}
          </CardTitle>
          <CardDescription>{t("hero.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{resolvedLanguage}</Badge>
            <Badge variant="outline">{languageMeta.region}</Badge>
            <Badge variant="outline">{languageMeta.nativeLabel}</Badge>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-3 border-t border-border/60 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={preloadAll}
            disabled={isLoading}
          >
            {prefetched ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : (
              <LoaderCircle
                className={
                  isLoading
                    ? "size-4 animate-spin text-primary"
                    : "size-4 text-primary"
                }
              />
            )}
            {prefetched
              ? t("controls.preloadDone")
              : t("controls.preloadButton")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {prefetched ? t("controls.preloadDone") : t("notes.fallback")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export function I18nLanguageSwitcherSnippet() {
  const [i18nInstance] = useState(() => {
    const instance = createInstance();
    instance.use(initReactI18next);
    return instance;
  });
  const [ready, setReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadLanguagePack = useCallback(
    async (nextLanguage: LanguageCode) => {
      if (!i18nInstance.isInitialized) {
        return;
      }
      if (
        i18nInstance.language === nextLanguage &&
        i18nInstance.hasResourceBundle(nextLanguage, "translation")
      ) {
        return;
      }
      setIsLoading(true);
      try {
        if (!i18nInstance.hasResourceBundle(nextLanguage, "translation")) {
          await new Promise((resolve) => setTimeout(resolve, 420));
          const pack = LANGUAGE_PACKS[nextLanguage];
          if (pack) {
            i18nInstance.addResourceBundle(
              nextLanguage,
              "translation",
              pack.translation,
              true,
              true
            );
          }
        }
        await i18nInstance.changeLanguage(nextLanguage);
      } finally {
        setIsLoading(false);
      }
    },
    [i18nInstance]
  );

  useEffect(() => {
    if (i18nInstance.isInitialized) {
      return;
    }
    void i18nInstance
      .init({
        lng: "en-US",
        fallbackLng: "en-US",
        resources: {
          "en-US": LANGUAGE_PACKS["en-US"],
        },
        defaultNS: "translation",
        returnEmptyString: false,
        returnNull: false,
        interpolation: { escapeValue: false },
        react: {
          useSuspense: false,
        },
      })
      .then(() => {
        setReady(true);
      });
  }, [i18nInstance]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    void loadLanguagePack(selectedLanguage);
  }, [ready, loadLanguagePack, selectedLanguage]);

  const handleLanguageChange = useCallback((language: LanguageCode) => {
    setSelectedLanguage(language);
  }, []);

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          通过 i18next 管理多语言文案，结合
          Intl.DateTimeFormat、Intl.NumberFormat 等原生
          API，可以稳定地处理日期、数字与货币格式。
          当语言包缺失时，将自动回退到英文，确保界面内容完整。
        </div>
        <LanguageContent
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          isLoading={isLoading}
        />
      </div>
    </I18nextProvider>
  );
}
