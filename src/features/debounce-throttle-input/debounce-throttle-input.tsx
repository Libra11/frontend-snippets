import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Loader2, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const DEBOUNCE_DELAY = 450;
const THROTTLE_DELAY = 800;
const MAX_LOG_ITEMS = 4;

const suggestionPool = [
  {
    id: "api-shield",
    title: "接口防刷策略",
    description: "将接口调用放在 800ms 节流之后，只保留稳定的请求节奏。",
    tags: ["节流", "接口"],
  },
  {
    id: "search-panel",
    title: "全局搜索面板",
    description: "输入停止 450ms 后再拉取候选数据，减少无效请求。",
    tags: ["防抖", "搜索"],
  },
  {
    id: "live-analytics",
    title: "实时统计上报",
    description: "节流点击统计，确保秒级合并，防止海量埋点。",
    tags: ["节流", "埋点"],
  },
  {
    id: "address-lookup",
    title: "地址自动补全",
    description: "等待用户停顿后再请求地图服务，体验更顺滑。",
    tags: ["防抖"],
  },
  {
    id: "logistics",
    title: "物流单号校验",
    description: "结合节流限制，防止机器人批量尝试运单状态。",
    tags: ["接口", "安全"],
  },
];

const formatTime = (timestamp: number | null) => {
  if (!timestamp) {
    return "—";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(timestamp);
};

export function DebounceThrottleInputSnippet() {
  const [query, setQuery] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [throttledValue, setThrottledValue] = useState("");
  const [debouncedUpdatedAt, setDebouncedUpdatedAt] = useState<number | null>(null);
  const [throttledUpdatedAt, setThrottledUpdatedAt] = useState<number | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isThrottling, setIsThrottling] = useState(false);
  const [debounceLog, setDebounceLog] = useState<string[]>([]);
  const [throttleLog, setThrottleLog] = useState<string[]>([]);

  const throttleState = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    lastExecuted: number;
    trailingValue: string | null;
  }>({
    timer: null,
    lastExecuted: 0,
    trailingValue: null,
  });

  useEffect(() => {
    setIsDebouncing(true);
    const timer = window.setTimeout(() => {
      setDebouncedValue(query);
      const timestamp = Date.now();
      setDebouncedUpdatedAt(timestamp);
      setIsDebouncing(false);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const state = throttleState.current;
    const now = Date.now();
    const timeSinceLast = now - state.lastExecuted;

    const run = (value: string) => {
      const timestamp = Date.now();
      state.lastExecuted = timestamp;
      setThrottledValue(value);
      setThrottledUpdatedAt(timestamp);
      setIsThrottling(false);
    };

    if (timeSinceLast >= THROTTLE_DELAY) {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
        state.trailingValue = null;
      }
      run(query);
    } else {
      setIsThrottling(true);
      state.trailingValue = query;
      if (state.timer) {
        clearTimeout(state.timer);
      }
      const delay = THROTTLE_DELAY - timeSinceLast;
      state.timer = window.setTimeout(() => {
        run(state.trailingValue ?? query);
        state.timer = null;
        state.trailingValue = null;
      }, delay);
    }
  }, [query]);

  useEffect(() => {
    return () => {
      if (throttleState.current.timer) {
        clearTimeout(throttleState.current.timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!debouncedUpdatedAt) {
      return;
    }
    setDebounceLog((previous) => {
      const entry = `${formatTime(debouncedUpdatedAt)} · 搜索「${debouncedValue || "全部"}」`;
      return [entry, ...previous].slice(0, MAX_LOG_ITEMS);
    });
  }, [debouncedUpdatedAt, debouncedValue]);

  useEffect(() => {
    if (!throttledUpdatedAt) {
      return;
    }
    setThrottleLog((previous) => {
      const entry = `${formatTime(throttledUpdatedAt)} · 节流上报「${throttledValue || "全部"}」`;
      return [entry, ...previous].slice(0, MAX_LOG_ITEMS);
    });
  }, [throttledUpdatedAt, throttledValue]);

  const filteredSuggestions = useMemo(() => {
    const normalized = debouncedValue.trim().toLowerCase();
    if (!normalized) {
      return suggestionPool.slice(0, 4);
    }

    return suggestionPool
      .filter((item) => {
        const inTitle = item.title.toLowerCase().includes(normalized);
        const inDescription = item.description.toLowerCase().includes(normalized);
        const inTags = item.tags.some((tag) => tag.toLowerCase().includes(normalized));
        return inTitle || inDescription || inTags;
      })
      .slice(0, 4);
  }, [debouncedValue]);

  const createLogList = useCallback((title: string, logs: string[], emptyText: string) => {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {logs.length === 0 ? (
            <li className="text-muted-foreground/70">{emptyText}</li>
          ) : (
            logs.map((log, index) => (
              <li key={`${title}-log-${index}`}>{log}</li>
            ))
          )}
        </ul>
      </div>
    );
  }, []);

  const statCards = [
    {
      label: "即时输入",
      value: query,
      helper: "本地渲染、输入提示等即时需求。",
      icon: Activity,
      timestamp: null,
      isPending: false,
    },
    {
      label: `防抖 ${DEBOUNCE_DELAY}ms`,
      value: debouncedValue,
      helper: "用于搜索/接口防刷，等待停顿再触发。",
      icon: Loader2,
      timestamp: debouncedUpdatedAt,
      isPending: isDebouncing,
    },
    {
      label: `节流 ${THROTTLE_DELAY}ms`,
      value: throttledValue,
      helper: "限制高频调用，适合埋点与安全策略。",
      icon: Zap,
      timestamp: throttledUpdatedAt,
      isPending: isThrottling,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        在输入层同时实现防抖与节流：防抖值用于触发接口请求，节流值作为安全/统计上报，两者共享同一输入框，适用于搜索建议或接口防刷场景。
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
          <div>
            <label htmlFor="debounce-input" className="text-sm font-medium text-muted-foreground">
              模拟搜索输入
            </label>
            <div className="mt-2 rounded-2xl border border-border/60 bg-muted/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  id="debounce-input"
                  type="search"
                  maxLength={48}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="输入关键字，例如“接口防刷”"
                  className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground/70">{query.length}/48</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{card.label}</span>
                  <card.icon className="size-4" />
                </div>
                <p className="mt-2 line-clamp-2 text-lg font-semibold text-foreground">
                  {card.value ? card.value : "（空字符串）"}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground/80">
                  {card.helper}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {card.timestamp ? `同步于 ${formatTime(card.timestamp)}` : "等待触发"}
                  {card.isPending ? (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Loader2 className="size-3 animate-spin" />
                      排队中
                    </span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {createLogList("防抖请求记录", debounceLog, "等待用户停顿...")}
            {createLogList("节流上报记录", throttleLog, "节流队列空闲中")}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border/60 bg-muted/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                模拟推荐
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                基于防抖值的接口返回
              </h3>
              <p className="text-sm text-muted-foreground">
                当前关键字：{debouncedValue ? `「${debouncedValue}」` : "全部"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredSuggestions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredSuggestions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 px-4 py-6 text-center text-sm text-muted-foreground">
                暂无匹配结果，试试新的关键字。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
