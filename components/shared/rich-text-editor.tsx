"use client";

import { cn } from "@/lib/utils";
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { plainTextToSemanticHtml, sanitizeJobDescriptionHtml } from "@/lib/jd-html";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write job description...",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const MIN_HEIGHT = 180;

  const normalizeHtml = (html: string) => {
    const sanitized = sanitizeJobDescriptionHtml(html);
    const container = document.createElement("div");
    container.innerHTML = sanitized;
    const plain = (container.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\u200B/g, "")
      .trim();
    // Treat empty editor artifacts (<div><br></div>, <p><br></p>, &nbsp;) as empty content.
    if (!plain) return "";
    return sanitized;
  };

  useEffect(() => {
    if (!editorRef.current) return;
    const normalizedValue = normalizeHtml(value);
    if (editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue;
    }
    const el = editorRef.current;
    el.style.height = "auto";
    el.style.height = `${Math.max(MIN_HEIGHT, el.scrollHeight)}px`;
  }, [value]);

  const resizeEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(MIN_HEIGHT, el.scrollHeight)}px`;
  };

  const exec = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    const normalized = normalizeHtml(editorRef.current?.innerHTML || "");
    if (editorRef.current && !normalized) {
      editorRef.current.innerHTML = "";
    }
    onChange(normalized);
    resizeEditor();
  };

  const insertLink = () => {
    const url = window.prompt("Enter link URL (https://...)");
    if (!url) return;
    exec("createLink", url);
  };

  return (
    <div className={cn("rounded-lg border border-neutral-300 dark:border-slate-500 overflow-hidden", className)}>
      <div className="flex items-center flex-wrap gap-1 border-b border-neutral-200 dark:border-slate-600 bg-neutral-50 dark:bg-slate-800/40 p-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => exec("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => exec("insertOrderedList")} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={insertLink} title="Insert link">
          <Link2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={(e) => {
          e.preventDefault();
          const html = e.clipboardData.getData("text/html");
          const text = e.clipboardData.getData("text/plain");
          const sanitized = html
            ? normalizeHtml(html)
            : plainTextToSemanticHtml(text);

          editorRef.current?.focus();
          if (sanitized) {
            document.execCommand("insertHTML", false, sanitized);
          }

          const normalized = normalizeHtml(editorRef.current?.innerHTML || "");
          if (editorRef.current && !normalized) {
            editorRef.current.innerHTML = "";
          }
          onChange(normalized);
          resizeEditor();
        }}
        onInput={(e) => {
          const normalized = normalizeHtml(e.currentTarget.innerHTML);
          if (!normalized && e.currentTarget.innerHTML !== "") {
            e.currentTarget.innerHTML = "";
          }
          onChange(normalized);
          resizeEditor();
        }}
        onBlur={(e) => {
          const normalized = normalizeHtml(e.currentTarget.innerHTML);
          if (!normalized && e.currentTarget.innerHTML !== "") {
            e.currentTarget.innerHTML = "";
          }
          resizeEditor();
        }}
        data-placeholder={placeholder}
        className="min-h-[180px] p-4 text-sm leading-6 bg-white dark:bg-slate-900 focus:outline-none overflow-y-auto [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-neutral-400 [&_p]:m-0 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline"
      />
    </div>
  );
}
