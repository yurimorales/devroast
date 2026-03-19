import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { CollapsibleContent } from "./collapsible-content";

type CollapsibleCodeProps = {
  code: string;
  lang: BundledLanguage;
  maxLines?: number;
  className?: string;
};

function CodeDisplay({ html, lineCount }: { html: string; lineCount: number }) {
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex bg-bg-input">
      <div className="flex flex-col items-end gap-1.5 py-2 px-2.5 w-10 border-r border-border-primary bg-bg-surface shrink-0">
        {lineNumbers.map((num) => (
          <span
            key={`ln-${num}`}
            className="font-mono text-[11px] leading-tight text-text-tertiary"
          >
            {num}
          </span>
        ))}
      </div>
      <div
        className="flex-1 p-2 overflow-x-auto font-mono text-[11px] leading-tight [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent [&_.line]:leading-[1.65]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates trusted HTML from code strings server-side
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export async function CollapsibleCode({
  code,
  lang,
  maxLines = 3,
  className,
}: CollapsibleCodeProps) {
  const lines = code.split("\n");
  const extraLines = lines.length - maxLines;
  const previewCode = lines.slice(0, maxLines).join("\n");

  const previewHtml = await codeToHtml(previewCode, { lang, theme: "vesper" });
  const fullHtml = await codeToHtml(code, { lang, theme: "vesper" });

  const preview = <CodeDisplay html={previewHtml} lineCount={maxLines} />;
  const expanded = <CodeDisplay html={fullHtml} lineCount={lines.length} />;

  return (
    <div
      className={`border border-border-primary overflow-hidden ${className ?? ""}`}
    >
      <CollapsibleContent
        preview={preview}
        expanded={expanded}
        extraLines={extraLines}
      />
    </div>
  );
}
