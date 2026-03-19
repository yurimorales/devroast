"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useTRPC } from "@/lib/trpc/client";

function HomeEditor() {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();

  const createRoast = useMutation(
    trpc.createRoast.mutationOptions({
      onSuccess: (result) => {
        router.push(`/roast/${result.id}`);
      },
      onError: (error) => {
        setIsLoading(false);
        alert(`Error: ${error.message}`);
      },
    }),
  );

  const handleSubmit = () => {
    if (isEmpty || isOverLimit) return;
    setIsLoading(true);
    createRoast.mutate({
      code,
      language: "javascript",
      roastMode,
    });
  };

  const MAX_CHARS = 2000;
  const isOverLimit = code.length > MAX_CHARS;
  const isEmpty = code.trim().length === 0;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <CodeEditor
        value={code}
        onChange={setCode}
        maxLength={MAX_CHARS}
        className="w-full max-w-3xl max-h-[360px]"
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
            {roastMode
              ? "// maximum sarcasm enabled"
              : "// constructive feedback"}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={isEmpty || isOverLimit || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "$ processing..." : "$ roast_my_code"}
        </Button>
      </div>
    </div>
  );
}

export { HomeEditor };
