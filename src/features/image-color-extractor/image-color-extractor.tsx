import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Droplet, Image as ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


export function ImageColorExtractorSnippet() {
  const [image, setImage] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setSelectedColors([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      // Fit image to container while maintaining aspect ratio
      const containerWidth = container.clientWidth;
      const containerHeight = 500; // Max height
      
      const scale = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      );
      
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
    };
  }, [image]);

  useEffect(() => {
    drawImage();
    window.addEventListener("resize", drawImage);
    return () => window.removeEventListener("resize", drawImage);
  }, [drawImage]);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const getPixelColor = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Get pixel data
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    
    setHoverColor(hex);
    setMagnifierPosition({ x, y });
  }, []);

  const handleCanvasClick = () => {
    if (hoverColor && !selectedColors.includes(hoverColor)) {
      setSelectedColors(prev => [hoverColor, ...prev].slice(0, 10)); // Keep last 10
      toast.success(`已复制颜色: ${hoverColor}`);
      navigator.clipboard.writeText(hoverColor);
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`已复制颜色: ${color}`);
  };

  const clearImage = () => {
    setImage(null);
    setSelectedColors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Image Area */}
      <div 
        ref={containerRef}
        className="relative min-h-[500px] rounded-3xl border border-border/60 bg-muted/10 flex items-center justify-center overflow-hidden p-4 group"
      >
        {!image ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">图片取色器</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                上传图片，移动鼠标即可实时取色。点击即可复制颜色代码。
              </p>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full px-8"
            >
              <Upload className="w-4 h-4 mr-2" />
              选择图片
            </Button>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="cursor-crosshair rounded-lg shadow-lg"
              onMouseMove={getPixelColor}
              onMouseEnter={() => setShowMagnifier(true)}
              onMouseLeave={() => setShowMagnifier(false)}
              onClick={handleCanvasClick}
            />
            
            {/* Magnifier */}
            {showMagnifier && hoverColor && (
              <div
                className="pointer-events-none absolute z-50 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-xl"
                style={{
                  left: magnifierPosition.x + 20,
                  top: magnifierPosition.y - 100,
                  backgroundColor: hoverColor,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="font-mono text-xs font-bold text-white drop-shadow-md">
                    {hoverColor}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-none"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="p-5 space-y-6 border-border/60 bg-card/50 backdrop-blur-sm h-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">已选颜色</h3>
              <Droplet className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {selectedColors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <p className="text-xs">点击图片任意位置</p>
                <p className="text-xs">记录并复制颜色</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {selectedColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => copyColor(color)}
                    className="group relative flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2 text-left transition hover:border-primary/50 hover:bg-muted"
                  >
                    <div 
                      className="h-8 w-8 rounded-md shadow-sm shrink-0 border border-border/20"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-medium truncate text-foreground">{color}</p>
                    </div>
                    <Copy className="w-3 h-3 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {image && (
            <div className="pt-4 border-t border-border/40">
               <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                更换图片
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
