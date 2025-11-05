import { LazyImage } from "@/components/ui/lazy-image";

type GalleryImage = {
  id: string;
  alt: string;
  src: string;
  placeholder: string;
  location: string;
};

const images: GalleryImage[] = [
  {
    id: "aurora",
    alt: "黎明时分的极光映照雪山",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    placeholder:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE2MCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iNTAlIiBjeT0iNTAuMDAwMSIgcj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MjRBNiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzg4QURFQyIvPjwvcmFkaWFsR3JhZGllbnQ+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48cmVjdCB5PSI1MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI0ZGRjkwMCIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9zdmc+",
    location: "特罗姆瑟，挪威",
  },
  {
    id: "desert",
    alt: "沙漠中弯曲的公路与夕阳",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
    placeholder:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE2MCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJiIiBjeD0iNTAlIiBjeT0iNTAuMDAwMSIgcj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZBMjE0MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGMkRCOSIvPjwvcmFkaWFsR3JhZGllbnQ+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYikiLz48cmVjdCB5PSI1NCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI0NiIgZmlsbD0iI0ZGRjNEMCIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9zdmc+",
    location: "亚利桑那，美国",
  },
  {
    id: "forest",
    alt: "云雾缭绕的原始森林",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1400&q=80",
    placeholder:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE2MCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJjIiBjeD0iNTAlIiBjeT0iNTAuMDAwMSIgcj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzM5Njg1MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzg5QjNBNyIvPjwvcmFkaWFsR3JhZGllbnQ+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYykiLz48cmVjdCB5PSI0NSIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI1NSIgZmlsbD0iI0VGRkZGQSIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9zdmc+",
    location: "福岛，日本",
  },
  {
    id: "coast",
    alt: "岩石海岸线与蓝色海浪",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
    placeholder:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE2MCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJkIiBjeD0iNTAlIiBjeT0iNTAuMDAwMSIgcj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzA4NjVCQyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0YwRkZGQiIvPjwvcmFkaWFsR3JhZGllbnQ+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZCkiLz48cmVjdCB5PSI1MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=",
    location: "凯库拉，新西兰",
  },
];

export function LazyImageGallerySnippet() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
        使用 IntersectionObserver 监听图片是否进入视口，真正需要时才开始加载，同时搭配模糊占位与淡入过渡，减少首屏体积并保持平滑过渡。
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {images.map((image) => (
          <figure
            key={image.id}
            className="group relative overflow-hidden rounded-3xl border border-border/70 bg-background/80 shadow-[0_15px_40px_-24px_rgba(15,23,42,0.5)]"
          >
            <LazyImage
              src={image.src}
              alt={image.alt}
              placeholderSrc={image.placeholder}
              className="h-64 w-full object-cover sm:h-72"
              wrapperClassName="h-full"
              transitionDuration={700}
            />
            <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="line-clamp-1 text-foreground/90">{image.alt}</span>
              <span className="ml-3 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-primary">
                {image.location}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

