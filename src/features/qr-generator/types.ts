export type QrPreset = {
  id: string;
  title: string;
  description: string;
  value: string;
  size: number;
  fgColor?: string;
  bgColor?: string;
  level?: "L" | "M" | "Q" | "H";
};

