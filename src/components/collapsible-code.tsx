"use client";

import { useState } from "react";

function CollapsibleCode({
  collapsedHtml,
  expandedHtml,
  collapsedLines,
  totalLines,
}: {
  collapsedHtml: string;
  expandedHtml: string;
  collapsedLines: number;
  totalLines: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex bg-bg-input">
        <div className="flex flex-col items-end gap-1.5 py-2 px-2.5 w-10 border-r border-border-primary bg-bg-surface shrink-0">
          {Array.from(
            { length: isExpanded ? totalLines : collapsedLines },
            (_, i) => (
              <span
                key={`ln-${i}`}
                className="font-mono text-[11px] leading-tight text-text-tertiary"
              >
                {i + 1}
              </span>
            ),
          )}
        </div>
        <div
          className="flex-1 p-2 overflow-x-auto font-mono text-[11px] leading-tight [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent [&_.line]:leading-[1.65]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML pre-rendered on server from trusted code
          dangerouslySetInnerHTML={{
            __html: isExpanded ? expandedHtml : collapsedHtml,
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center h-8 border-t border-border-primary bg-bg-surface text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors"
      >
        {isExpanded
          ? "[ - ] collapse"
          : `[ + ] expand ${totalLines - collapsedLines} more lines`}
      </button>
    </div>
  );
}

export { CollapsibleCode };
