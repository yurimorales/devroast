"use client";

import { Collapsible } from "@base-ui/react/collapsible";

function CollapsibleTrigger({ extraLines }: { extraLines: number }) {
  return (
    <Collapsible.Trigger className="group flex items-center gap-2 font-mono text-xs text-text-tertiary hover:text-text-secondary transition-colors">
      <span className="transition-transform ease-out data-[state=open]:rotate-90">
        ▶
      </span>
      <span className="data-[state=open]:hidden">
        expand {extraLines} more lines
      </span>
      <span className="hidden data-[state=open]:block">collapse</span>
    </Collapsible.Trigger>
  );
}

function CollapsibleContent({
  preview,
  expanded,
  extraLines,
}: {
  preview: React.ReactNode;
  expanded: React.ReactNode;
  extraLines: number;
}) {
  return (
    <Collapsible.Root>
      <div className="flex items-center justify-end h-8 px-3 border-t border-border-primary bg-bg-surface">
        {extraLines > 0 && <CollapsibleTrigger extraLines={extraLines} />}
      </div>

      <Collapsible.Panel className="data-[state=closed]:hidden">
        {expanded}
      </Collapsible.Panel>

      {extraLines > 0 ? (
        <div className="data-[state=open]:hidden">{preview}</div>
      ) : (
        preview
      )}
    </Collapsible.Root>
  );
}

export { CollapsibleContent };
