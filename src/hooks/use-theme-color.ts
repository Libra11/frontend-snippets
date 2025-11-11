import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "libra-theme-accent";

const isBrowser = () => typeof window !== "undefined";

const THEME_COLOR_VARS = [
  "--primary",
  "--primary-foreground",
  "--accent",
  "--accent-foreground",
  "--ring",
] as const;

type ThemeColorCssVar = (typeof THEME_COLOR_VARS)[number];

export type ThemeColorOption = {
  id: string;
  label: string;
  description: string;
  preview: string[];
  cssVars: Record<ThemeColorCssVar, string>;
  darkCssVars?: Partial<Record<ThemeColorCssVar, string>>;
};

export const themeColorOptions = [
  {
    id: "classic",
    label: "默认中性色",
    description: "保持与当前设计系统一致的沉稳基色。",
    preview: ["#0f172a", "#475569", "#e2e8f0"],
    cssVars: {
      "--primary": "oklch(0.205 0 0)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.97 0 0)",
      "--accent-foreground": "oklch(0.205 0 0)",
      "--ring": "oklch(0.708 0 0)",
    },
    darkCssVars: {
      "--primary": "oklch(0.922 0 0)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--accent": "oklch(0.269 0 0)",
      "--accent-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.556 0 0)",
    },
  },
  {
    id: "aurora",
    label: "极光蓝",
    description: "冷色调渐变，适合科技或效率工具。",
    preview: ["#60a5fa", "#22d3ee", "#34d399"],
    cssVars: {
      "--primary": "hsl(217 90% 61%)",
      "--primary-foreground": "hsl(214 100% 97%)",
      "--accent": "hsl(190 90% 65%)",
      "--accent-foreground": "hsl(200 85% 18%)",
      "--ring": "hsl(199 88% 60%)",
    },
    darkCssVars: {
      "--primary-foreground": "hsl(214 100% 97%)",
      "--accent-foreground": "hsl(203 92% 96%)",
      "--ring": "hsl(199 84% 70%)",
    },
  },
  {
    id: "sunset",
    label: "暮色橙",
    description: "橙粉过渡更具活力，突出重点操作。",
    preview: ["#fb923c", "#f472b6", "#fca5a5"],
    cssVars: {
      "--primary": "hsl(19 96% 55%)",
      "--primary-foreground": "hsl(20 95% 96%)",
      "--accent": "hsl(340 82% 70%)",
      "--accent-foreground": "hsl(334 70% 18%)",
      "--ring": "hsl(23 92% 64%)",
    },
    darkCssVars: {
      "--primary-foreground": "hsl(20 95% 96%)",
      "--accent-foreground": "hsl(22 100% 97%)",
      "--ring": "hsl(20 80% 60%)",
    },
  },
  {
    id: "mint",
    label: "薄荷绿",
    description: "清爽配色，适合健康或效率场景。",
    preview: ["#34d399", "#2dd4bf", "#6ee7b7"],
    cssVars: {
      "--primary": "hsl(158 64% 52%)",
      "--primary-foreground": "hsl(166 76% 97%)",
      "--accent": "hsl(172 66% 55%)",
      "--accent-foreground": "hsl(174 60% 16%)",
      "--ring": "hsl(164 71% 48%)",
    },
    darkCssVars: {
      "--primary-foreground": "hsl(166 76% 97%)",
      "--accent-foreground": "hsl(160 100% 95%)",
      "--ring": "hsl(162 68% 58%)",
    },
  },
  {
    id: "orchid",
    label: "霓虹紫",
    description: "紫色调更具未来感，适合创意产品。",
    preview: ["#c084fc", "#a855f7", "#6366f1"],
    cssVars: {
      "--primary": "hsl(268 83% 67%)",
      "--primary-foreground": "hsl(270 100% 98%)",
      "--accent": "hsl(260 83% 72%)",
      "--accent-foreground": "hsl(258 60% 16%)",
      "--ring": "hsl(261 83% 63%)",
    },
    darkCssVars: {
      "--primary-foreground": "hsl(270 100% 98%)",
      "--accent-foreground": "hsl(268 100% 97%)",
      "--ring": "hsl(261 80% 70%)",
    },
  },
  {
    id: "rose",
    label: "玫瑰粉",
    description: "高饱和粉色，适合活动或营销页面。",
    preview: ["#fb7185", "#f472b6", "#f9a8d4"],
    cssVars: {
      "--primary": "hsl(350 88% 67%)",
      "--primary-foreground": "hsl(332 100% 98%)",
      "--accent": "hsl(327 73% 72%)",
      "--accent-foreground": "hsl(330 64% 16%)",
      "--ring": "hsl(346 86% 63%)",
    },
    darkCssVars: {
      "--primary-foreground": "hsl(332 100% 98%)",
      "--accent-foreground": "hsl(335 90% 96%)",
      "--ring": "hsl(344 78% 70%)",
    },
  },
] satisfies ThemeColorOption[];

export type ThemeColorId = (typeof themeColorOptions)[number]["id"];

const getDefaultOption = () => themeColorOptions[0];

const getOptionById = (colorId: string) =>
  themeColorOptions.find((option) => option.id === colorId) ?? getDefaultOption();

const subscribers = new Set<() => void>();
let initialized = false;
let currentColorId: ThemeColorId = getDefaultOption().id;

const notify = () => subscribers.forEach((callback) => callback());

const applyThemeColor = (colorId: ThemeColorId) => {
  if (!isBrowser()) {
    return;
  }

  const option = getOptionById(colorId);
  const root = document.documentElement;
  const isDarkMode = root.classList.contains("dark");

  THEME_COLOR_VARS.forEach((variable) => {
    const targetValue = isDarkMode
      ? option.darkCssVars?.[variable] ?? option.cssVars[variable]
      : option.cssVars[variable];
    root.style.setProperty(variable, targetValue);
  });

  root.dataset.themeAccent = option.id;
};

let themeClassObserver: MutationObserver | null = null;

const ensureThemeClassObserver = () => {
  if (!isBrowser() || themeClassObserver) {
    return;
  }

  themeClassObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === "attributes")) {
      applyThemeColor(currentColorId);
    }
  });

  themeClassObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
};

const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  if (!isBrowser()) {
    return;
  }

  ensureThemeClassObserver();

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeColorId | null;
  const nextId = stored ? getOptionById(stored).id : getDefaultOption().id;
  currentColorId = nextId;
  applyThemeColor(nextId);
};

const setThemeColorValue = (nextColorId: ThemeColorId) => {
  ensureInitialized();

  if (nextColorId === currentColorId) {
    return;
  }

  currentColorId = nextColorId;
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, nextColorId);
  }
  applyThemeColor(nextColorId);
  notify();
};

const subscribe = (callback: () => void) => {
  ensureInitialized();
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

const getSnapshot = () => {
  ensureInitialized();
  return currentColorId;
};

export function useThemeColor() {
  const colorId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => getDefaultOption().id
  );

  const setThemeColor = useCallback((nextColorId: ThemeColorId) => {
    setThemeColorValue(nextColorId);
  }, []);

  const activeOption = useMemo(
    () => getOptionById(colorId),
    [colorId]
  );

  return useMemo(
    () => ({
      colorId,
      option: activeOption,
      options: themeColorOptions,
      setThemeColor,
    }),
    [colorId, activeOption, setThemeColor]
  );
}

if (isBrowser()) {
  ensureInitialized();
}
