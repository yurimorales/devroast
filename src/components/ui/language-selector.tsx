"use client";

import { useId } from "react";
import { type LanguageId, SUPPORTED_LANGUAGES } from "@/lib/detect-language";

type LanguageSelectorProps = {
  value: LanguageId;
  onChange: (value: LanguageId) => void;
  className?: string;
};

function LanguageSelector({
  value,
  onChange,
  className,
}: LanguageSelectorProps) {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        Select language
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageId)}
        className="h-9 px-3 pr-8 text-xs font-mono bg-bg-surface border border-border-primary rounded-md appearance-none cursor-pointer outline-none enabled:hover:border-accent-green enabled:focus:border-accent-green enabled:focus:ring-1 enabled:focus:ring-accent-green disabled:opacity-50"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export { LanguageSelector, type LanguageSelectorProps };
