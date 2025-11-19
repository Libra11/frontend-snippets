/*
 * @Author: Libra
 * @Date: 2025-11-02 20:54:54
 * @LastEditors: Libra
 * @Description:
 */
import type { SnippetDefinition, SnippetMetadata } from "./types";
import { snippetMetadata } from "./snippet-metadata";
import { AnchorFileDownloadSnippet } from "./anchor-file-download";
import { CameraCaptureSnippet } from "./camera-capture";
import { ChartTemplatesSnippet } from "./chart-templates";
import { CodeEditorSnippet } from "./code-editor";
import { CommandPaletteSnippet } from "./command-palette";
import { CopyToClipboardSnippet } from "./copy-to-clipboard";
import { CountdownTimerSnippet } from "./countdown-timer";
import { DataRequestStatusSnippet } from "./data-request-status";
import { DebounceThrottleInputSnippet } from "./debounce-throttle-input";
import { DraggableSortableListSnippet } from "./draggable-sortable-list";
import { DynamicFormSnippet } from "./dynamic-form";
import { FileUploadPanelSnippet } from "./file-upload-panel";
import { FilePreviewSnippet } from "./file-preview";
import { GlobalErrorBoundarySnippet } from "./global-error-boundary";
import { I18nLanguageSwitcherSnippet } from "./i18n-language-switcher";
import { ImageColorExtractorSnippet } from "./image-color-extractor";
import { LazyImageGallerySnippet } from "./image-lazy-load";
import { LoadMoreOnScrollSnippet } from "./load-more-on-scroll";
import { MarkdownPreviewSnippet } from "./markdown-preview";
import { MasonryLayoutSnippet } from "./masonry-layout";
import { NotificationToastsSnippet } from "./notification-toasts";
import { PaginationControlsSnippet } from "./pagination-controls";
import { PreventButtonSpamSnippet } from "./prevent-button-spam";
import { QrGeneratorSnippet } from "./qr-generator";
import { RichTextEditorSnippet } from "./rich-text-editor";
import { ScreenShareSnippet } from "./screen-share";
import { ScrollToTopSnippet } from "./scroll-to-top";
import { StepperFormSnippet } from "./stepper-form";
import { ThemeColorSwitcherSnippet } from "./theme-color-switcher";
import { ThemeToggleSnippet } from "./theme-toggle";
import { WatermarkSnippet } from "./watermark";
import { VirtualListSnippet } from "./virtual-list";

type ComponentMap = Record<string, SnippetDefinition["Component"]>;

const componentMap: ComponentMap = Object.freeze({
  "anchor-file-download": AnchorFileDownloadSnippet,
  "camera-capture": CameraCaptureSnippet,
  "chart-templates": ChartTemplatesSnippet,
  "code-editor": CodeEditorSnippet,
  "command-palette": CommandPaletteSnippet,
  "copy-to-clipboard": CopyToClipboardSnippet,
  "countdown-timer": CountdownTimerSnippet,
  "countdown-worker": CountdownTimerSnippet,
  "data-request-status": DataRequestStatusSnippet,
  "debounce-throttle-input": DebounceThrottleInputSnippet,
  "draggable-sortable-list": DraggableSortableListSnippet,
  "dynamic-form": DynamicFormSnippet,
  "file-upload-panel": FileUploadPanelSnippet,
  "global-error-boundary": GlobalErrorBoundarySnippet,
  "i18n-language-switcher": I18nLanguageSwitcherSnippet,
  "image-lazy-load": LazyImageGallerySnippet,
  "image-color-extractor": ImageColorExtractorSnippet,
  "lazy-image": LazyImageGallerySnippet,
  "load-more-on-scroll": LoadMoreOnScrollSnippet,
  "markdown-preview": MarkdownPreviewSnippet,
  "masonry-layout": MasonryLayoutSnippet,
  "notification-toasts": NotificationToastsSnippet,
  "pagination-controls": PaginationControlsSnippet,
  "file-preview": FilePreviewSnippet,
  "prevent-button-spam": PreventButtonSpamSnippet,
  "qr-generator": QrGeneratorSnippet,
  "rich-text-editor": RichTextEditorSnippet,
  "screen-share": ScreenShareSnippet,
  "scroll-to-top": ScrollToTopSnippet,
  "stepper-form": StepperFormSnippet,
  "theme-color-switcher": ThemeColorSwitcherSnippet,
  "theme-toggle": ThemeToggleSnippet,
  "watermark": WatermarkSnippet,
  "virtual-list": VirtualListSnippet,
} as const);

function attachComponent(metadata: SnippetMetadata): SnippetDefinition {
  const Component = componentMap[metadata.id];
  if (!Component) {
    throw new Error(`Missing component mapping for snippet id "${metadata.id}"`);
  }
  return {
    ...metadata,
    Component,
  };
}

export const snippets: SnippetDefinition[] = snippetMetadata.map(attachComponent);
