"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";
import {
  detectLanguage,
  getShikiLanguage,
  type LanguageId,
} from "@/lib/detect-language";
import { LanguageSelector } from "./ui/language-selector";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
};

const THEME = "vesper";
const MIN_LINES = 16;
const DEFAULT_MAX_LENGTH = 2000;

function getCurrentLine(textarea: HTMLTextAreaElement): string {
  const original = textarea.value;
  const selectionStart = textarea.selectionStart;
  const beforeStart = original.slice(0, selectionStart);
  const lineStart = beforeStart.lastIndexOf("\n") + 1;
  return original.slice(lineStart, beforeStart.length).split("\n")[0] ?? "";
}

function handleTab(_event: KeyboardEvent, _textarea: HTMLTextAreaElement) {
  document.execCommand("insertText", false, "  ");
}

function handleBracketClose(
  _event: KeyboardEvent,
  textarea: HTMLTextAreaElement,
) {
  const currentLine = getCurrentLine(textarea);
  const { selectionStart, selectionEnd } = textarea;

  if (selectionStart === selectionEnd && /^\s{2,}$/.test(currentLine)) {
    textarea.setSelectionRange(selectionStart - 2, selectionEnd);
  }

  document.execCommand("insertText", false, "}");
}

function handleEnter(event: KeyboardEvent, textarea: HTMLTextAreaElement) {
  event.preventDefault();
  const currentLine = getCurrentLine(textarea);
  const currentIndentationMatch = currentLine.match(/^(\s+)/);
  let wantedIndentation = currentIndentationMatch
    ? currentIndentationMatch[0]
    : "";

  if (/([{[:>])$/.test(currentLine)) {
    wantedIndentation += "  ";
  }

  document.execCommand("insertText", false, `\n${wantedIndentation}`);
}

function CodeEditor({
  value,
  onChange,
  maxLength = DEFAULT_MAX_LENGTH,
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const id = useId();

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, MIN_LINES);

  const detectedLanguage = useMemo(() => {
    if (!value || value.trim().length === 0) return null;
    return detectLanguage(value);
  }, [value]);

  useEffect(() => {
    if (detectedLanguage && detectedLanguage !== "plaintext") {
      setLanguage(detectedLanguage as LanguageId);
    }
  }, [detectedLanguage]);

  useEffect(() => {
    const generateHighlight = async () => {
      if (!value || language === "plaintext") {
        setHighlightedHtml("");
        return;
      }

      try {
        const shikiLang = getShikiLanguage(language);
        const html = await codeToHtml(value, {
          lang: shikiLang,
          theme: THEME,
        });
        setHighlightedHtml(html);
      } catch {
        setHighlightedHtml("");
      }
    };

    generateHighlight();
  }, [value, language]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      switch (event.key) {
        case "Tab":
          event.preventDefault();
          handleTab(event.nativeEvent, textarea);
          break;
        case "}":
          event.preventDefault();
          handleBracketClose(event.nativeEvent, textarea);
          break;
        case "Enter":
          event.preventDefault();
          handleEnter(event.nativeEvent, textarea);
          break;
      }
    },
    [],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    [onChange, maxLength],
  );

  return (
    <div
      ref={containerRef}
      className={twMerge(
        "border border-border-primary overflow-hidden flex flex-col",
        className,
      )}
    >
      {/* Window Header */}
      <div className="flex items-center gap-3 h-10 px-4 border-b border-border-primary">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />
        <span className="flex-1" />
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      {/* Code Area */}
      <div className="relative flex flex-1 bg-bg-input overflow-hidden">
        {/* Line Numbers */}
        <div className="flex flex-col items-end gap-0 py-4 px-3 w-12 border-r border-border-primary bg-bg-surface select-none shrink-0">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className="font-mono text-xs leading-[1.625] text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Editor Container */}
        <div className="relative flex-1 overflow-hidden">
          {/* Highlighted Code (behind) */}
          <div
            ref={highlightRef}
            className="absolute inset-0 p-4 overflow-hidden font-mono text-xs leading-[1.625] pointer-events-none whitespace-pre-wrap break-words"
          >
            {highlightedHtml ? (
              <div
                className="[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent [&_.line]:leading-[1.625]"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            ) : (
              <pre className="text-text-primary whitespace-pre-wrap break-words">
                {value || " "}
              </pre>
            )}
          </div>

          {/* Textarea (in front, transparent) */}
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="// paste your code here..."
            className="absolute inset-0 w-full h-full p-4 bg-transparent font-mono text-xs leading-[1.625] text-transparent caret-text-primary placeholder:text-text-tertiary outline-none resize-none whitespace-pre-wrap break-words"
            style={{ WebkitTextFillColor: "transparent" }}
          />
        </div>
      </div>

      {/* Character Counter */}
      <div className="flex items-center justify-end gap-2 h-8 px-4 border-t border-border-primary bg-bg-surface">
        <span
          className={twMerge(
            "font-mono text-xs",
            value.length > maxLength
              ? "text-accent-red font-bold"
              : "text-text-tertiary",
          )}
        >
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}

export { CodeEditor, type CodeEditorProps };
