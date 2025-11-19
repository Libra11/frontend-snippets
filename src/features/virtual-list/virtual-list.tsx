import { useCallback, useMemo, useRef, useState } from "react";
import { List } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type VirtualListProps<T> = {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
};

function VirtualList<T>({ items, height, itemHeight, renderItem }: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight);
  // Render a few extra items for smoother scrolling (buffer)
  const buffer = 5;
  const endIndex = Math.min(items.length, startIndex + visibleCount + buffer);
  const visibleItems = items.slice(Math.max(0, startIndex - buffer), endIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const offsetY = Math.max(0, startIndex - buffer) * itemHeight;

  return (
    <div
      ref={containerRef}
      className="overflow-auto border rounded-xl bg-background relative"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          {visibleItems.map((item, index) => {
            const realIndex = Math.max(0, startIndex - buffer) + index;
            return (
              <div key={realIndex} style={{ height: itemHeight }}>
                {renderItem(item, realIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Demo Component ---

export function VirtualListSnippet() {
  const [count, setCount] = useState(10000);
  const [itemHeight, setItemHeight] = useState(60);
  const [showImages, setShowImages] = useState(true);

  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      title: `Item #${i + 1}`,
      description: `This is the description for item number ${i + 1}. It contains some dummy text to simulate content.`,
      color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
    }));
  }, [count]);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Controls */}
      <div className="space-y-6">
        <div className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-6 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">列表设置</h3>
              <List className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">数据量 (条)</Label>
              <div className="flex gap-2">
                {[1000, 10000, 100000].map((num) => (
                  <Button
                    key={num}
                    variant={count === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCount(num)}
                    className="flex-1 text-xs"
                  >
                    {num >= 10000 ? `${num / 10000}w` : num}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">行高 (px)</Label>
              <Input
                type="number"
                value={itemHeight}
                onChange={(e) => setItemHeight(Number(e.target.value))}
                min={40}
                max={200}
                className="bg-background/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-images" className="text-xs text-muted-foreground">显示头像</Label>
              <Switch
                id="show-images"
                checked={showImages}
                onCheckedChange={setShowImages}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
            <p>当前渲染节点数: <span className="text-primary font-mono font-bold">{Math.ceil(500 / itemHeight) + 10}</span></p>
            <p>实际数据总量: <span className="text-primary font-mono font-bold">{count}</span></p>
            <p>DOM 节点数恒定，滚动流畅不卡顿。</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-foreground">虚拟列表预览</h3>
          <Badge variant="secondary" className="font-mono text-xs">
            Height: 500px
          </Badge>
        </div>
        
        <VirtualList
          items={items}
          height={500}
          itemHeight={itemHeight}
          renderItem={(item, index) => (
            <div className="flex items-center gap-4 px-4 h-full border-b border-border/40 hover:bg-muted/50 transition-colors">
              <div className="w-8 text-xs font-mono text-muted-foreground text-right shrink-0">
                {index + 1}
              </div>
              
              {showImages && (
                <div 
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  {item.title.charAt(0)}
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>

              <Button variant="ghost" size="sm" className="shrink-0 h-8 text-xs">
                操作
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
