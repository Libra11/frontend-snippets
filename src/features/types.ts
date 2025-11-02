import type { ComponentType } from "react";

export type SnippetDetail = {
  overview: string;
  implementation: string[];
  notes?: string[];
};

export type SnippetCodeExample = {
  name?: string;
  code: string;
  language?: string;
};

export type SnippetResource = {
  title: string;
  url: string;
};

export type SnippetDefinition = {
  id: string;
  title: string;
  excerpt: string;
  keywords: string[];
  Component: ComponentType;
  detail: SnippetDetail;
  codeExamples?: SnippetCodeExample[];
  resources?: SnippetResource[];
};
