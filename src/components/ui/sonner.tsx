import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const mappedTheme: ToasterProps["theme"] =
    theme === "dark" ? "dark" : "light";

  return (
    <Sonner
      theme={mappedTheme}
      className="toaster pointer-events-none group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          zIndex: 9999,
        } as CSSProperties
      }
      toastOptions={{
        className: "pointer-events-auto border border-border/60 backdrop-blur",
        descriptionClassName: "text-muted-foreground",
        closeButton: true,
      }}
      {...props}
    />
  );
};

export { Toaster };
