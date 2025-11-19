import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Image as ImageIcon, RotateCw, Type, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function WatermarkSnippet() {
  const [image, setImage] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(0.3);
  const [rotate, setRotate] = useState(-30);
  const [gap, setGap] = useState(100);
  const [isTiled, setIsTiled] = useState(true);
  const [color, setColor] = useState("#000000");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawWatermark = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      if (isTiled) {
        // Tiled watermark
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize; // Approximate height

        // Calculate diagonal distance for rotation coverage
        const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.translate(-diagonal, -diagonal);

        for (let y = 0; y < diagonal * 2; y += textHeight + gap) {
          for (let x = 0; x < diagonal * 2; x += textWidth + gap) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();
      } else {
        // Single centered watermark
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      }
    };
  }, [image, watermarkText, fontSize, opacity, rotate, gap, isTiled, color]);

  useEffect(() => {
    drawWatermark();
  }, [drawWatermark]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "watermarked-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Controls Sidebar */}
      <div className="space-y-6">
        <Card className="p-5 space-y-6 border-border/60 bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">基本设置</h3>
              <Type className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">水印文字</Label>
              <Input 
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">颜色</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 p-1 h-9 cursor-pointer"
                />
                <Input 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 bg-background/50 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">样式调整</h3>
              <RotateCw className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">字体大小</Label>
                <span className="text-xs text-muted-foreground">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={(v) => setFontSize(v[0])}
                min={12}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">不透明度</Label>
                <span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={(v) => setOpacity(v[0])}
                min={0.1}
                max={1}
                step={0.05}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-muted-foreground">旋转角度</Label>
                <span className="text-xs text-muted-foreground">{rotate}°</span>
              </div>
              <Slider
                value={[rotate]}
                onValueChange={(v) => setRotate(v[0])}
                min={-180}
                max={180}
                step={5}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">布局模式</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="tiled-mode" className="text-xs cursor-pointer">平铺</Label>
                <Switch
                  id="tiled-mode"
                  checked={isTiled}
                  onCheckedChange={setIsTiled}
                />
              </div>
            </div>

            {isTiled && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">间距</Label>
                  <span className="text-xs text-muted-foreground">{gap}px</span>
                </div>
                <Slider
                  value={[gap]}
                  onValueChange={(v) => setGap(v[0])}
                  min={20}
                  max={300}
                  step={10}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Preview Area */}
      <div className="relative min-h-[500px] rounded-3xl border border-border/60 bg-muted/10 flex items-center justify-center overflow-hidden p-4">
        {!image ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">上传图片开始制作</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                支持 JPG, PNG 格式。图片仅在本地处理，不会上传到服务器。
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
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[70vh] object-contain"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-none"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                更换
              </Button>
              <Button 
                onClick={handleDownload}
                className="rounded-full shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                下载结果
              </Button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
