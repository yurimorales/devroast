import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import dart from "highlight.js/lib/languages/dart";
import elixir from "highlight.js/lib/languages/elixir";
import go from "highlight.js/lib/languages/go";
import haskell from "highlight.js/lib/languages/haskell";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import kotlin from "highlight.js/lib/languages/kotlin";
import lua from "highlight.js/lib/languages/lua";
import markdown from "highlight.js/lib/languages/markdown";
import perl from "highlight.js/lib/languages/perl";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import r from "highlight.js/lib/languages/r";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import scala from "highlight.js/lib/languages/scala";
import sql from "highlight.js/lib/languages/sql";
import swift from "highlight.js/lib/languages/swift";
import typescript from "highlight.js/lib/languages/typescript";
import vim from "highlight.js/lib/languages/vim";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("java", java);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("dart", dart);
hljs.registerLanguage("scala", scala);
hljs.registerLanguage("haskell", haskell);
hljs.registerLanguage("elixir", elixir);
hljs.registerLanguage("lua", lua);
hljs.registerLanguage("perl", perl);
hljs.registerLanguage("r", r);
hljs.registerLanguage("vim", vim);

const SHEBANG_PATTERNS: Record<string, string> = {
  "#!/usr/bin/env node": "javascript",
  "#!/usr/bin/node": "javascript",
  "#!/bin/bash": "bash",
  "#!/bin/sh": "bash",
  "#!/usr/bin/env python": "python",
  "#!/usr/bin/python": "python",
  "#!/usr/bin/env ruby": "ruby",
  "#!/usr/bin/env go": "go",
};

const KEYWORD_PATTERNS: Record<string, string> = {
  "import React": "javascript",
  "import {": "javascript",
  "export default": "javascript",
  "export const": "javascript",
  "export interface": "typescript",
  "export class": "typescript",
  "function ": "javascript",
  "const ": "javascript",
  "let ": "javascript",
  "def ": "python",
  "class ": "java",
  "public static void main": "java",
  "fn main()": "rust",
  "func ": "go",
  "package ": "go",
  "namespace ": "csharp",
  "using System": "csharp",
  "<?php": "php",
  "require ": "javascript",
  "from ": "python",
  "import ": "python",
};

function detectByShebang(code: string): string | null {
  const firstLine = code.split("\n")[0].trim();
  for (const [pattern, lang] of Object.entries(SHEBANG_PATTERNS)) {
    if (firstLine.startsWith(pattern)) {
      return lang;
    }
  }
  return null;
}

function detectByKeywords(code: string): string | null {
  for (const [pattern, lang] of Object.entries(KEYWORD_PATTERNS)) {
    if (code.includes(pattern)) {
      return lang;
    }
  }
  return null;
}

function detectByStructure(code: string): string | null {
  if (
    code.includes("func ") &&
    code.includes("package ") &&
    code.includes("import ")
  ) {
    return "go";
  }
  if (code.includes("def ") && code.includes(":") && !code.includes("{")) {
    return "python";
  }
  if (code.includes("fn ") && code.includes("let ") && code.includes("->")) {
    return "rust";
  }
  if (code.includes("public class ") || code.includes("private class ")) {
    return "java";
  }
  if (code.includes("<") && code.includes(">") && code.includes("</")) {
    return "html";
  }
  if (code.trim().startsWith("{") || code.trim().startsWith("[")) {
    try {
      JSON.parse(code);
      return "json";
    } catch {
      return null;
    }
  }
  return null;
}

export function detectLanguage(code: string): string {
  if (!code || code.trim().length === 0) {
    return "plaintext";
  }

  const trimmedCode = code.trim();

  const shebangResult = detectByShebang(trimmedCode);
  if (shebangResult) return shebangResult;

  try {
    const result = hljs.highlightAuto(trimmedCode);
    if (result.language && result.relevance > 5) {
      return result.language;
    }
  } catch {}

  const keywordResult = detectByKeywords(trimmedCode);
  if (keywordResult) return keywordResult;

  const structureResult = detectByStructure(trimmedCode);
  if (structureResult) return structureResult;

  return "plaintext";
}

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", name: "JavaScript", shiki: "javascript" },
  { id: "typescript", name: "TypeScript", shiki: "typescript" },
  { id: "python", name: "Python", shiki: "python" },
  { id: "go", name: "Go", shiki: "go" },
  { id: "rust", name: "Rust", shiki: "rust" },
  { id: "java", name: "Java", shiki: "java" },
  { id: "csharp", name: "C#", shiki: "csharp" },
  { id: "cpp", name: "C++", shiki: "cpp" },
  { id: "c", name: "C", shiki: "c" },
  { id: "ruby", name: "Ruby", shiki: "ruby" },
  { id: "php", name: "PHP", shiki: "php" },
  { id: "swift", name: "Swift", shiki: "swift" },
  { id: "kotlin", name: "Kotlin", shiki: "kotlin" },
  { id: "scala", name: "Scala", shiki: "scala" },
  { id: "haskell", name: "Haskell", shiki: "haskell" },
  { id: "elixir", name: "Elixir", shiki: "elixir" },
  { id: "html", name: "HTML", shiki: "html" },
  { id: "css", name: "CSS", shiki: "css" },
  { id: "scss", name: "SCSS", shiki: "scss" },
  { id: "json", name: "JSON", shiki: "json" },
  { id: "yaml", name: "YAML", shiki: "yaml" },
  { id: "sql", name: "SQL", shiki: "sql" },
  { id: "bash", name: "Bash", shiki: "bash" },
  { id: "markdown", name: "Markdown", shiki: "markdown" },
  { id: "xml", name: "XML", shiki: "xml" },
  { id: "dockerfile", name: "Dockerfile", shiki: "dockerfile" },
  { id: "plaintext", name: "Plain Text", shiki: "plaintext" },
] as const;

export type LanguageId = (typeof SUPPORTED_LANGUAGES)[number]["id"];

export function getShikiLanguage(id: LanguageId): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.id === id);
  return lang?.shiki ?? "plaintext";
}
