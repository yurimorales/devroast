"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

function HomeEditor() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);
  const MAX_CHARS = 2000;

  const isOverLimit = code.length > MAX_CHARS;
  const isEmpty = code.trim().length === 0;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <CodeEditor
        value={code}
        onChange={setCode}
        maxLength={MAX_CHARS}
        className="w-full max-w-3xl"
      />

      {/* Actions Bar */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            onCheckedChange={setRoastMode}
            label="roast mode"
          />
          <span className="font-mono text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>

        <Button variant="primary" size="lg" disabled={isEmpty || isOverLimit}>
          $ roast_my_code
        </Button>
      </div>
    </div>
  );
}

export { HomeEditor };
