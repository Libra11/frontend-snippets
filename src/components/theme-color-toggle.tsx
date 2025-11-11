import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ThemeColorToggle() {
  const { colorId, options, option, setThemeColor } = useThemeColor();

  const handleNext = () => {
    const currentIndex = options.findIndex((item) => item.id === colorId);
    const nextOption = options[(currentIndex + 1) % options.length];
    setThemeColor(nextOption.id);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`切换主题色：${option.label}`}
          onClick={handleNext}
          className="relative text-muted-foreground transition hover:text-foreground"
        >
          <Palette className="size-4" />
          <span className="pointer-events-none absolute inset-x-2 bottom-1 flex h-1.5 overflow-hidden rounded-full">
            {option.preview.map((color, index) => (
              <span
                key={`${option.id}-${index}`}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        <p className="text-xs font-medium text-background">
          当前主题色：{option.label}
        </p>
        <p className="text-[11px] text-background/80">点击循环切换</p>
      </TooltipContent>
    </Tooltip>
  );
}

