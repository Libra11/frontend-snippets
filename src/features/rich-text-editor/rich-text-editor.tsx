import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";
import {
  Bold,
  Code,
  CodeSquare,
  Heading2,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Undo2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./rich-text-editor.css";

const INITIAL_HTML = `<h2>欢迎使用富文本编辑器</h2><p>这里可以编辑<strong>加粗</strong>、<em>斜体</em>、<s>删除线</s>等样式，也支持代码块与引用。</p><ul><li>快捷键：Ctrl/Cmd + B/I/U</li><li>支持 Markdown 风格快捷输入</li><li>可通过工具栏插入链接</li></ul>`;
const MAX_CHAR_COUNT = 2000;

type ToolbarButtonProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
};

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  isActive,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="h-9 w-9"
      onMouseDown={(event) => event.preventDefault()}
    >
      <Icon className="size-4" />
    </Button>
  );
}

const EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Link.configure({ autolink: true, openOnClick: false }),
  Typography,
  Image.configure({ inline: false, allowBase64: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

export function RichTextEditorSnippet() {
  const [linkUrl, setLinkUrl] = useState("https://frontend-snippets.libra.dev");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=80",
  );
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [characterCount, setCharacterCount] = useState(0);
  const [htmlPreview, setHtmlPreview] = useState(INITIAL_HTML);

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: INITIAL_HTML,
    editorProps: {
      attributes: {
        class:
          "tiptap prose dark:prose-invert prose-sm sm:prose-base w-full focus:outline-none [&_table]:w-full",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (!text) {
          return false;
        }

        event.preventDefault();
        const currentLength = view.state.doc.textContent.length;
        const remaining = MAX_CHAR_COUNT - currentLength;
        if (remaining <= 0) {
          return true;
        }
        const insertText = text.slice(0, remaining);
        view.dispatch(view.state.tr.insertText(insertText));
        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const updateState = () => {
      setCharacterCount(editor.getText().length);
      setHtmlPreview(editor.getHTML());
    };
    updateState();
    editor.on("update", updateState);
    editor.on("selectionUpdate", updateState);
    return () => {
      editor.off("update", updateState);
      editor.off("selectionUpdate", updateState);
      editor.destroy();
    };
  }, [editor]);

  const charProgress = useMemo(
    () => Math.min(characterCount / MAX_CHAR_COUNT, 1),
    [characterCount],
  );

  const runCommand = (
    action: (instance: Editor) => void,
    canExecute?: (instance: Editor) => boolean,
  ) => {
    if (!editor) {
      return;
    }
    if (canExecute && !canExecute(editor)) {
      return;
    }
    action(editor);
  };

  const applyLink = () => {
    runCommand((instance) => {
      const href = linkUrl.trim();
      if (href) {
        instance.chain().focus().extendMarkRange("link").setLink({ href }).run();
      } else {
        instance.chain().focus().unsetLink().run();
      }
    });
  };

  const insertImage = () => {
    runCommand((instance) => {
      const src = imageUrl.trim();
      if (!src) return;
      instance.chain().focus().setImage({ src, alt: "插入图片" }).run();
    });
  };

  const insertTable = () => {
    runCommand((instance) => {
      const rows = Math.min(Math.max(tableRows, 2), 8);
      const cols = Math.min(Math.max(tableCols, 2), 8);
      instance.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        TipTap 富文本编辑器示例，涵盖标题、列表、代码、链接、图片、表格等编辑能力，并具备粘贴过滤与字数统计。
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <Card className="space-y-6">
          <CardHeader className="px-6 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">富文本编辑器</CardTitle>
                <CardDescription>使用工具栏快速切换排版样式或插入链接、图片、表格。</CardDescription>
              </div>
              <Badge variant="secondary">TipTap Starter Kit</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
              <ToolbarButton
                icon={Undo2}
                label="撤销"
                onClick={() => runCommand((instance) => instance.chain().focus().undo().run())}
                disabled={!editor?.can().undo()}
              />
              <ToolbarButton
                icon={Redo2}
                label="重做"
                onClick={() => runCommand((instance) => instance.chain().focus().redo().run())}
                disabled={!editor?.can().redo()}
              />

              <div className="mx-2 h-5 w-px bg-border" aria-hidden />

              <ToolbarButton
                icon={Heading2}
                label="标题"
                onClick={() =>
                  runCommand((instance) =>
                    instance.chain().focus().toggleHeading({ level: 2 }).run(),
                  )
                }
                isActive={editor?.isActive("heading", { level: 2 })}
              />
              <ToolbarButton
                icon={Bold}
                label="加粗"
                onClick={() => runCommand((instance) => instance.chain().focus().toggleBold().run())}
                isActive={editor?.isActive("bold")}
              />
              <ToolbarButton
                icon={Italic}
                label="斜体"
                onClick={() =>
                  runCommand((instance) => instance.chain().focus().toggleItalic().run())
                }
                isActive={editor?.isActive("italic")}
              />
              <ToolbarButton
                icon={Strikethrough}
                label="删除线"
                onClick={() =>
                  runCommand((instance) => instance.chain().focus().toggleStrike().run())
                }
                isActive={editor?.isActive("strike")}
              />
              <ToolbarButton
                icon={Code}
                label="行内代码"
                onClick={() => runCommand((instance) => instance.chain().focus().toggleCode().run())}
                isActive={editor?.isActive("code")}
              />
              <ToolbarButton
                icon={CodeSquare}
                label="代码块"
                onClick={() =>
                  runCommand((instance) => instance.chain().focus().toggleCodeBlock().run())
                }
                isActive={editor?.isActive("codeBlock")}
              />

              <div className="mx-2 h-5 w-px bg-border" aria-hidden />

              <ToolbarButton
                icon={List}
                label="无序列表"
                onClick={() =>
                  runCommand(
                    (instance) => instance.chain().focus().toggleBulletList().run(),
                    (instance) => instance.can().chain().focus().toggleBulletList().run(),
                  )
                }
                isActive={editor?.isActive("bulletList")}
              />
              <ToolbarButton
                icon={ListOrdered}
                label="有序列表"
                onClick={() =>
                  runCommand(
                    (instance) => instance.chain().focus().toggleOrderedList().run(),
                    (instance) => instance.can().chain().focus().toggleOrderedList().run(),
                  )
                }
                isActive={editor?.isActive("orderedList")}
              />
              <ToolbarButton
                icon={Quote}
                label="引用"
                onClick={() =>
                  runCommand(
                    (instance) => instance.chain().focus().toggleBlockquote().run(),
                    (instance) => instance.can().chain().focus().toggleBlockquote().run(),
                  )
                }
                isActive={editor?.isActive("blockquote")}
              />

              <div className="mx-2 h-5 w-px bg-border" aria-hidden />

              <ToolbarButton
                icon={LinkIcon}
                label="设置链接"
                onClick={applyLink}
                disabled={!editor}
                isActive={editor?.isActive("link")}
              />
              <ToolbarButton
                icon={ImageIcon}
                label="插入图片"
                onClick={insertImage}
                disabled={!editor}
              />
              <ToolbarButton
                icon={TableIcon}
                label="插入表格"
                onClick={insertTable}
                disabled={!editor}
              />
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/95 p-4">
              <EditorContent editor={editor} className="tiptap" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                字数 {characterCount}/{MAX_CHAR_COUNT}
              </span>
              {characterCount > MAX_CHAR_COUNT ? (
                <span className="text-destructive">超出建议上限，可精简内容</span>
              ) : (
                <span className="relative flex h-2 w-32 overflow-hidden rounded-full bg-muted">
                  <span
                    className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round(charProgress * 100)}%` }}
                  />
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg">插入链接</CardTitle>
              <CardDescription>选中文本后应用链接，留空即可移除。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <div className="space-y-2">
                <Label htmlFor="link-url">链接地址</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={applyLink} disabled={!editor}>
                  应用链接
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => runCommand((instance) => instance.chain().focus().unsetLink().run())}
                  disabled={!editor?.isActive("link")}
                >
                  移除
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="space-y-4 p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg">插入图片</CardTitle>
              <CardDescription>支持粘贴图片地址或自建上传服务。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <div className="space-y-2">
                <Label htmlFor="image-url">图片链接</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://"
                />
              </div>
              <Button type="button" onClick={insertImage} disabled={!editor}>
                插入图片
              </Button>
            </CardContent>
          </Card>

          <Card className="space-y-4 p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg">插入表格</CardTitle>
              <CardDescription>设置表格行列数，表头行会自动生成。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="table-rows">行数</Label>
                  <Input
                    id="table-rows"
                    type="number"
                    min={2}
                    max={8}
                    value={tableRows}
                    onChange={(event) => setTableRows(Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-cols">列数</Label>
                  <Input
                    id="table-cols"
                    type="number"
                    min={2}
                    max={8}
                    value={tableCols}
                    onChange={(event) => setTableCols(Number(event.target.value))}
                  />
                </div>
              </div>
              <Button type="button" onClick={insertTable} disabled={!editor}>
                <TableIcon className="mr-2 size-4" />
                插入表格
              </Button>
            </CardContent>
          </Card>

          <Card className="space-y-3 p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg">HTML 预览</CardTitle>
              <CardDescription>可复制到其他系统或直接用于渲染。</CardDescription>
            </CardHeader>
            <CardContent className="max-h-64 overflow-auto rounded-xl border border-border/60 bg-muted/10 p-4 text-xs">
              <pre className="whitespace-pre-wrap wrap-break-word text-muted-foreground">
                {htmlPreview}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

