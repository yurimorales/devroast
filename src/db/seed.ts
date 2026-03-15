import { faker } from "@faker-js/faker";
import { db } from "./index";
import { analyses, submissions, suggestions } from "./schema";

const codeSnippets = [
  // JavaScript
  `var x = 1;
console.log(x);`,
  `function add(a, b) {
  return a + b;
}
console.log(add(1, 2));`,
  `let data = [];
data.forEach(item => console.log(item));`,
  // TypeScript
  `interface User {
  name: string;
  age: number;
}
const user: User = { name: "John", age: 25 };`,
  `type Status = "pending" | "active" | "done";
let currentStatus: Status = "pending";`,
  `function processData<T>(data: T): T {
  return data;
}`,
  // Python
  `def calculate():
    x = 10
    y = 20
    return x + y`,
  `class DataProcessor:
    def process(self, data):
        return data`,
  `result = [x for x in range(10)]`,
  // Java
  `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}`,
  `List<String> items = new ArrayList<>();
items.add("item");`,
  // Go
  `func main() {
    x := 10
    fmt.Println(x)
}`,
  `func process(data string) string {
    return strings.ToUpper(data)
}`,
  // Ruby
  `def add(a, b)
  a + b
end
puts add(1, 2)`,
  `items = [1, 2, 3]
items.each { |i| puts i }`,
  // PHP
  `<?php
function add($a, $b) {
    return $a + $b;
}
echo add(1, 2);
?>`,
  `$data = array();
$data[] = "item";`,
  // C#
  `public class Program {
    public static void Main() {
        Console.WriteLine("Hello");
    }
}`,
  `var list = new List<int>();
list.Add(1);`,
  // Rust
  `fn main() {
    let x = 10;
    println!("{}", x);
}`,
  `fn process(data: String) -> String {
    data
}`,
  // Misc
  `SELECT * FROM users WHERE id = 1;`,
  `const result = data.filter(x => x > 10);`,
  `for (let i = 0; i < 10; i++) {
  console.log(i);
}`,
  `async function fetchData() {
  const response = await fetch(url);
  return response.json();
}`,
  `try {
  doSomething();
} catch (e) {
  console.error(e);
}`,
  `const config = {
  "debug": true,
  "apiKey": "secret123"
};`,
  `<div class="container">
  <h1>Hello World</h1>
</div>`,
  `# This is a comment
def hello():
    print("hello")`,
];

const roastMessages = {
  critical: [
    "Using 'var' in 2024? That's bold. Use 'const' or 'let' instead.",
    "Console.log in production? That's a bold strategy, Cotton.",
    "Empty array literal when you could use a proper type? Amateur hour.",
    "Global variables detected. This is why we can't have nice things.",
    "Using ArrayList without generics? Java 1.4 called, it wants its code back.",
    "No type safety whatsoever. Are you living in 2010?",
    "Synchronous fetch in a loop? I admire your optimism.",
    "No error handling. Just pure, unadulterated optimism.",
    "SQL injection vulnerability. Hacking yourself since day one.",
    "Hardcoded API key in source code. Congratulations, you just got hacked.",
    "Using '==' instead of '==='. I don't know who hurt you, but I'm sorry.",
    "No input validation. Just assume user input is always correct. Bold choice.",
    "Global state everywhere. Future you will be so confused.",
    "No error boundaries. Let it crash, I guess.",
    "Synchronous operations blocking the main thread. Performance is for cowards.",
    "eval() usage detected. Are you trying to hack yourself?",
    "No authentication. Everyone is admin now, I guess.",
    "Catching Exception without handling. Classic 'swallow the error' move.",
    "Magic numbers everywhere. What does 42 even mean?",
    "No error logging. Errors just vanish into the void. Spooky.",
  ],
  warning: [
    "Single letter variable names? x, y, z are great, but 'user' might be clearer.",
    "Nested callbacks 5 levels deep. Welcome to Callback Hell.",
    "No comments in code. Are you writing for the Matrix?",
    "Function is 200 lines long. Maybe break it up a bit?",
    "Using 'any' in TypeScript. That's cheating, you know.",
    "No unit tests. Bold move, Cotton.",
    "Magic strings scattered everywhere. Create constants, please.",
    "Repeated code blocks. Copy-paste is not a design pattern.",
    "No JSDoc comments. Future you won't remember what this does.",
    "Using deprecated API. Living on the edge, I see.",
    "No async/await, just raw promises. You're not wrong, just old school.",
    "Hardcoded values that should be in config. Environment variables exist.",
    "No TypeScript strict mode. Living dangerously.",
    "Not using linter. You do you, I guess.",
    "Code indentation is inconsistent. It looks like your cat walked on the keyboard.",
    "No error messages in validation. User will have fun guessing what went wrong.",
    "Using for loops when map/filter exists. We're in 2024, not 2005.",
    "No logging framework. console.log is not a logger.",
    "Functions with 10 parameters. Maybe use an object instead?",
    "No database indexing. Query performance will be... interesting.",
  ],
  good: [
    "Nice use of const! Immutability is a good habit.",
    "Proper error handling with try-catch. Someone learned from their mistakes.",
    "Clean function separation. Well done, this is readable.",
    "Good use of TypeScript generics. Type safety is not dead!",
    "Proper SQL parameterization. SQL injection says goodbye.",
    "Async/await usage is on point. Clean and readable.",
    "Good variable naming. Future you will thank present you.",
    "Proper use of Optional in Java. Null safety matters!",
    "Nice destructuring in JavaScript. ES6 is your friend.",
    "Proper error boundaries in React. Crash gracefully!",
  ],
};

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "ruby",
  "php",
  "csharp",
  "rust",
  "sql",
] as const;

type Language = (typeof languages)[number];

const ruleCodes = [
  "no-var",
  "no-console",
  "no-any",
  "no-magic-numbers",
  "no-eval",
  "prefer-const",
  "require-types",
  "max-len",
  "no-complexity",
  "no-dupe",
  "secure-config",
  "proper-error-handling",
];

function getRandomElement<T>(arr: readonly T[]): T {
  return faker.helpers.arrayElement([...arr]);
}

async function seed() {
  console.log("🌱 Starting seed...");

  const startTime = Date.now();

  for (let i = 0; i < 100; i++) {
    const language = getRandomElement(languages) as Language;
    const snippet = getRandomElement(codeSnippets);
    const score = faker.number
      .float({ min: 0, max: 10, fractionDigits: 1 })
      .toString();
    const roastMode = faker.datatype.boolean();

    const [submission] = await db
      .insert(submissions)
      .values({
        code: snippet,
        language: language,
        score: score,
        roastMode: roastMode,
        status: "analyzed",
        ipHash: faker.string.alphanumeric(64),
      })
      .returning();

    const numAnalyses = faker.number.int({ min: 2, max: 5 });

    for (let j = 0; j < numAnalyses; j++) {
      const severity = getRandomElement([
        "critical",
        "warning",
        "good",
      ] as const);
      const message = getRandomElement(roastMessages[severity]);
      const lineStart = faker.number.int({ min: 1, max: 30 });
      const lineEnd = lineStart + faker.number.int({ min: 1, max: 5 });

      const [analysis] = await db
        .insert(analyses)
        .values({
          submissionId: submission.id,
          severity: severity,
          message: message,
          lineStart: lineStart,
          lineEnd: lineEnd,
          columnStart: faker.number.int({ min: 1, max: 20 }),
          columnEnd: faker.number.int({ min: 1, max: 20 }),
          ruleCode: getRandomElement(ruleCodes),
        })
        .returning();

      const numSuggestions = faker.number.int({ min: 0, max: 2 });

      if (numSuggestions > 0 && severity !== "good") {
        const originalLines = snippet.split("\n").slice(0, 3).join("\n");
        const fixedLines = originalLines
          .replace(/var /g, "const ")
          .replace(/console\.log/g, "logger.info");

        for (let k = 0; k < numSuggestions; k++) {
          await db.insert(suggestions).values({
            analysisId: analysis.id,
            originalCode: originalLines,
            fixedCode: fixedLines,
            explanation: faker.lorem.sentence(),
          });
        }
      }
    }

    const progress = ((i + 1) / 100) * 100;
    process.stdout.write(`\r🌱 Progress: ${progress.toFixed(0)}%`);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Seed completed in ${duration}s!`);
  console.log(`📊 Created 100 submissions with analyses and suggestions.`);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
