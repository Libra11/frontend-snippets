import type { SnippetMetadata } from "./types";

import { snippet as anchorFileDownload } from "./snippet-data/anchor-file-download";
import { snippet as cameraCapture } from "./snippet-data/camera-capture";
import { snippet as chartTemplates } from "./snippet-data/chart-templates";
import { snippet as codeEditor } from "./snippet-data/code-editor";
import { snippet as commandPalette } from "./snippet-data/command-palette";
import { snippet as copyToClipboard } from "./snippet-data/copy-to-clipboard";
import { snippet as countdownWorker } from "./snippet-data/countdown-worker";
import { snippet as dataRequestStatus } from "./snippet-data/data-request-status";
import { snippet as debounceThrottle } from "./snippet-data/debounce-throttle-input";
import { snippet as draggableSortableList } from "./snippet-data/draggable-sortable-list";
import { snippet as dynamicForm } from "./snippet-data/dynamic-form";
import { snippet as fileUploadPanel } from "./snippet-data/file-upload-panel";
import { snippet as globalErrorBoundary } from "./snippet-data/global-error-boundary";
import { snippet as i18nLanguageSwitcher } from "./snippet-data/i18n-language-switcher";
import { snippet as lazyImage } from "./snippet-data/lazy-image";
import { snippet as loadMoreOnScroll } from "./snippet-data/load-more-on-scroll";
import { snippet as markdownPreview } from "./snippet-data/markdown-preview";
import { snippet as masonryLayout } from "./snippet-data/masonry-layout";
import { snippet as notificationToasts } from "./snippet-data/notification-toasts";
import { snippet as paginationControls } from "./snippet-data/pagination-controls";
import { snippet as preventButtonSpam } from "./snippet-data/prevent-button-spam";
import { snippet as qrGenerator } from "./snippet-data/qr-generator";
import { snippet as richTextEditor } from "./snippet-data/rich-text-editor";
import { snippet as screenShare } from "./snippet-data/screen-share";
import { snippet as scrollToTop } from "./snippet-data/scroll-to-top";
import { snippet as stepperForm } from "./snippet-data/stepper-form";
import { snippet as themeColorSwitcher } from "./snippet-data/theme-color-switcher";
import { snippet as themeToggle } from "./snippet-data/theme-toggle";
import { snippet as filePreviewSnippet } from "./snippet-data/file-preview";

export const snippetMetadata: SnippetMetadata[] = [
  anchorFileDownload,
  cameraCapture,
  chartTemplates,
  codeEditor,
  commandPalette,
  copyToClipboard,
  countdownWorker,
  dataRequestStatus,
  debounceThrottle,
  draggableSortableList,
  dynamicForm,
  fileUploadPanel,
  globalErrorBoundary,
  i18nLanguageSwitcher,
  lazyImage,
  loadMoreOnScroll,
  markdownPreview,
  masonryLayout,
  notificationToasts,
  paginationControls,
  filePreviewSnippet,
  preventButtonSpam,
  qrGenerator,
  richTextEditor,
  screenShare,
  scrollToTop,
  stepperForm,
  themeColorSwitcher,
  themeToggle,
];
