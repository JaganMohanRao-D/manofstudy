import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  Sparkles,
  Clock,
  Layers,
  ChevronDown,
  Loader2,
  BookOpen,
  Trash2,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export type SupportedLanguage = 'python' | 'c' | 'cpp' | 'java' | 'javascript';

interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  pistonLang: string;
  versionDisplay: string;
  ext: string;
  defaultStarter: string;
}

const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  python: {
    id: 'python',
    name: 'Python 3',
    pistonLang: 'python',
    versionDisplay: 'Python 3.10+',
    ext: 'py',
    defaultStarter: `# Write your Python code here
print("Hello, StudyMacha!")
`,
  },
  c: {
    id: 'c',
    name: 'C (GCC)',
    pistonLang: 'c',
    versionDisplay: 'GCC 10.2+',
    ext: 'c',
    defaultStarter: `#include <stdio.h>

int main() {
    printf("Hello, StudyMacha!\\n");
    return 0;
}
`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (G++)',
    pistonLang: 'cpp',
    versionDisplay: 'G++ 20+',
    ext: 'cpp',
    defaultStarter: `#include <iostream>

using namespace std;

int main() {
    cout << "Hello, StudyMacha!" << endl;
    return 0;
}
`,
  },
  java: {
    id: 'java',
    name: 'Java (OpenJDK)',
    pistonLang: 'java',
    versionDisplay: 'OpenJDK 15+',
    ext: 'java',
    defaultStarter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, StudyMacha!");
    }
}
`,
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node)',
    pistonLang: 'javascript',
    versionDisplay: 'Node.js 18+',
    ext: 'js',
    defaultStarter: `// Write your JavaScript code here
console.log("Hello, StudyMacha!");
`,
  },
};

type LabSnippetKey = 'starter' | 'factorial' | 'fibonacci' | 'bubbleSort' | 'pattern';

interface LabSnippet {
  id: LabSnippetKey;
  label: string;
  codes: Record<SupportedLanguage, string>;
  defaultStdin?: string;
}

const LAB_SNIPPETS: LabSnippet[] = [
  {
    id: 'starter',
    label: 'Standard Hello World',
    codes: {
      python: `# Write your Python code here\nprint("Hello, StudyMacha!")\n`,
      c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, StudyMacha!\\n");\n    return 0;\n}\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, StudyMacha!" << endl;\n    return 0;\n}\n`,
      java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, StudyMacha!");\n    }\n}\n`,
      javascript: `// Write your JavaScript code here\nconsole.log("Hello, StudyMacha!");\n`,
    },
  },
  {
    id: 'factorial',
    label: 'Factorial of a Number',
    defaultStdin: '5',
    codes: {
      python: `# 1st Year B.Tech Lab: Factorial Calculation
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

try:
    num = int(input() or 5)
except Exception:
    num = 5

print(f"Input Number: {num}")
print(f"Factorial of {num} is {factorial(num)}")
`,
      c: `// 1st Year B.Tech Lab: Factorial Calculation
#include <stdio.h>

long long factorial(int n) {
    long long fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

int main() {
    int n = 5;
    printf("Computing factorial for n = %d\\n", n);
    printf("Factorial of %d = %lld\\n", n, factorial(n));
    return 0;
}
`,
      cpp: `// 1st Year B.Tech Lab: Factorial Calculation
#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int n = 6;
    cout << "Computing Factorial for: " << n << endl;
    cout << "Result: " << factorial(n) << endl;
    return 0;
}
`,
      java: `// 1st Year B.Tech Lab: Factorial Calculation
public class Main {
    public static long factorial(int n) {
        long fact = 1;
        for (int i = 1; i <= n; i++) fact *= i;
        return fact;
    }

    public static void main(String[] args) {
        int n = 5;
        System.out.println("Input: " + n);
        System.out.println("Factorial of " + n + " = " + factorial(n));
    }
}
`,
      javascript: `// 1st Year B.Tech Lab: Factorial Calculation
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

const n = 5;
console.log("Input:", n);
console.log(\`Factorial of \${n} = \${factorial(n)}\`);
`,
    },
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci Series',
    defaultStdin: '8',
    codes: {
      python: `# 1st Year B.Tech Lab: Fibonacci Sequence
def generate_fibonacci(count):
    series = []
    a, b = 0, 1
    for _ in range(count):
        series.append(a)
        a, b = b, a + b
    return series

terms = 8
print(f"Fibonacci Series ({terms} terms):")
print(" -> ".join(map(str, generate_fibonacci(terms))))
`,
      c: `// 1st Year B.Tech Lab: Fibonacci Sequence
#include <stdio.h>

int main() {
    int n = 8, t1 = 0, t2 = 1, nextTerm;
    printf("First %d terms of Fibonacci series:\\n", n);

    for (int i = 1; i <= n; ++i) {
        printf("%d ", t1);
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    printf("\\n");
    return 0;
}
`,
      cpp: `// 1st Year B.Tech Lab: Fibonacci Sequence
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 8;
    vector<long long> fib(n);
    if (n > 0) fib[0] = 0;
    if (n > 1) fib[1] = 1;

    for (int i = 2; i < n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
    }

    cout << "Fibonacci sequence of " << n << " elements: ";
    for (auto num : fib) cout << num << " ";
    cout << endl;
    return 0;
}
`,
      java: `// 1st Year B.Tech Lab: Fibonacci Sequence
public class Main {
    public static void main(String[] args) {
        int n = 8;
        int first = 0, second = 1;
        System.out.print("Fibonacci Series of " + n + " terms: ");
        for (int i = 1; i <= n; i++) {
            System.out.print(first + " ");
            int next = first + second;
            first = second;
            second = next;
        }
        System.out.println();
    }
}
`,
      javascript: `// 1st Year B.Tech Lab: Fibonacci Sequence
function getFibonacci(n) {
    const res = [0, 1];
    while (res.length < n) {
        res.push(res[res.length - 1] + res[res.length - 2]);
    }
    return res.slice(0, n);
}

const count = 8;
console.log(\`Fibonacci Series (\${count} terms):\`, getFibonacci(count).join(" -> "));
`,
    },
  },
  {
    id: 'bubbleSort',
    label: 'Bubble Sort Algorithm',
    codes: {
      python: `# 1st Year B.Tech Lab: Bubble Sort Algorithm
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

data = [64, 34, 25, 12, 22, 11, 90]
print("Unsorted Array:", data)
sorted_data = bubble_sort(data.copy())
print("Sorted Array:  ", sorted_data)
`,
      c: `// 1st Year B.Tech Lab: Bubble Sort Algorithm
#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);

    printf("Original array: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    bubbleSort(arr, n);

    printf("Sorted array:   ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}
`,
      cpp: `// 1st Year B.Tech Lab: Bubble Sort Algorithm
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    cout << "Unsorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;

    bubbleSort(arr);

    cout << "Sorted:   ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
`,
      java: `// 1st Year B.Tech Lab: Bubble Sort Algorithm
import java.util.Arrays;

public class Main {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Before: " + Arrays.toString(arr));
        bubbleSort(arr);
        System.out.println("After:  " + Arrays.toString(arr));
    }
}
`,
      javascript: `// 1st Year B.Tech Lab: Bubble Sort Algorithm
function bubbleSort(arr) {
    const a = [...arr];
    const n = a.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (a[j] > a[j + 1]) {
                const temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
    return a;
}

const list = [64, 34, 25, 12, 22, 11, 90];
console.log("Unsorted:", list);
console.log("Sorted:  ", bubbleSort(list));
`,
    },
  },
  {
    id: 'pattern',
    label: 'Pattern Printing (Star Pyramid)',
    codes: {
      python: `# 1st Year B.Tech Lab: Pattern Printing
rows = 5
print(f"Star Pyramid ({rows} levels):\\n")
for i in range(1, rows + 1):
    spaces = " " * (rows - i)
    stars = "* " * i
    print(spaces + stars)
`,
      c: `// 1st Year B.Tech Lab: Pattern Printing
#include <stdio.h>

int main() {
    int rows = 5;
    printf("Star Pyramid (%d levels):\\n\\n", rows);
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= rows - i; j++) {
            printf(" ");
        }
        for (int k = 1; k <= i; k++) {
            printf("* ");
        }
        printf("\\n");
    }
    return 0;
}
`,
      cpp: `// 1st Year B.Tech Lab: Pattern Printing
#include <iostream>
using namespace std;

int main() {
    int rows = 5;
    cout << "Star Pyramid (" << rows << " levels):\\n\\n";
    for (int i = 1; i <= rows; i++) {
        for (int s = 1; s <= rows - i; s++) cout << " ";
        for (int star = 1; star <= i; star++) cout << "* ";
        cout << "\\n";
    }
    return 0;
}
`,
      java: `// 1st Year B.Tech Lab: Pattern Printing
public class Main {
    public static void main(String[] args) {
        int rows = 5;
        System.out.println("Star Pyramid (" + rows + " levels):\\n");
        for (int i = 1; i <= rows; i++) {
            for (int s = 1; s <= rows - i; s++) {
                System.out.print(" ");
            }
            for (int star = 1; star <= i; star++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }
}
`,
      javascript: `// 1st Year B.Tech Lab: Pattern Printing
const rows = 5;
console.log(\`Star Pyramid (\${rows} levels):\\n\`);
for (let i = 1; i <= rows; i++) {
    const spaces = " ".repeat(rows - i);
    const stars = "* ".repeat(i);
    console.log(spaces + stars);
}
`,
    },
  },
];

export const CodeStudioCompiler: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(LANGUAGES.python.defaultStarter);
  const [selectedSnippet, setSelectedSnippet] = useState<LabSnippetKey>('starter');
  const [stdin, setStdin] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stdout, setStdout] = useState<string>('Welcome to StudyMacha CodeStudio.\nClick "Run Code ▶" to compile and execute program.');
  const [stderr, setStderr] = useState<string>('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [execTime, setExecTime] = useState<string>('0 ms');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync line numbers on scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Switch language
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLang(newLang);
    // Load matching snippet or starter
    const activeSnippet = LAB_SNIPPETS.find((s) => s.id === selectedSnippet);
    if (activeSnippet && activeSnippet.codes[newLang]) {
      setCode(activeSnippet.codes[newLang]);
    } else {
      setCode(LANGUAGES[newLang].defaultStarter);
    }
  };

  // Select Lab Problem Snippet
  const handleSelectSnippet = (snippetKey: LabSnippetKey) => {
    setSelectedSnippet(snippetKey);
    const snippet = LAB_SNIPPETS.find((s) => s.id === snippetKey);
    if (snippet) {
      setCode(snippet.codes[selectedLang]);
      if (snippet.defaultStdin) {
        setStdin(snippet.defaultStdin);
        setShowStdin(true);
      }
      setStdout(`[Snippet Loaded] ${snippet.label} for ${LANGUAGES[selectedLang].name}.\nClick "Run Code ▶" to execute.`);
      setStderr('');
      setExitCode(null);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  // Download Source Code
  const handleDownloadSource = () => {
    const cfg = LANGUAGES[selectedLang];
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${cfg.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear Terminal Output
  const handleClearTerminal = () => {
    setStdout('');
    setStderr('');
    setExitCode(null);
  };

  // Reset to default starter template
  const handleResetCode = () => {
    setSelectedSnippet('starter');
    setCode(LANGUAGES[selectedLang].defaultStarter);
    setStdout('Editor reset to starter template. Ready to run.');
    setStderr('');
    setExitCode(null);
  };

  // Execute Code using Piston Public API with Client Fallback
  const handleRunCode = async () => {
    setIsRunning(true);
    setStderr('');
    setStdout('Compiling and executing on cloud sandbox...');
    setExitCode(null);

    const startTime = performance.now();

    try {
      const payload: {
        language: string;
        version: string;
        files: { content: string }[];
        stdin?: string;
      } = {
        language: LANGUAGES[selectedLang].pistonLang,
        version: '*',
        files: [{ content: code }],
      };

      if (stdin.trim()) {
        payload.stdin = stdin;
      }

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setExecTime(`${elapsed} ms`);

      if (!response.ok) {
        throw new Error(`Execution service returned HTTP ${response.status}`);
      }

      const result = await response.json();

      // Check for compilation errors (e.g. C/C++/Java syntax errors)
      if (result.compile && result.compile.code !== 0) {
        setExitCode(result.compile.code || 1);
        setStderr(result.compile.stderr || result.compile.output || 'Compilation failed with error.');
        setStdout('');
        setIsRunning(false);
        return;
      }

      // Check runtime results
      if (result.run) {
        setExitCode(result.run.code);
        if (result.run.stderr) {
          setStderr(result.run.stderr);
        }
        setStdout(result.run.stdout || result.run.output || (result.run.stderr ? '' : '[Program finished with no standard output]'));
      } else {
        setStdout('[No output returned from execution engine]');
      }
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecTime(`${elapsed} ms`);

      // If language is JavaScript, provide instant local fallback execution!
      if (selectedLang === 'javascript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          const originalError = console.error;

          console.log = (...args: unknown[]) => {
            logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
          };
          console.error = (...args: unknown[]) => {
            logs.push('[Error] ' + args.map(String).join(' '));
          };

          const runFn = new Function(code);
          runFn();

          console.log = originalLog;
          console.error = originalError;

          setExitCode(0);
          setStdout(logs.length > 0 ? logs.join('\n') : '[Program executed successfully with no stdout]');
          setStderr('');
          setIsRunning(false);
          return;
        } catch (localErr: any) {
          setExitCode(1);
          setStderr(`JavaScript Runtime Exception:\n${localErr?.message || String(localErr)}`);
          setStdout('');
          setIsRunning(false);
          return;
        }
      }

      setExitCode(1);
      setStderr(
        `Unable to reach public execution sandbox (${(err as Error).message}).\nPlease check your internet connection or try again in a moment.`
      );
      setStdout('');
    } finally {
      setIsRunning(false);
    }
  };

  // Compute line count
  const linesCount = Math.max(1, code.split('\n').length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div id="codestudio-compiler-root" className="space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
            <Terminal className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                StudyMacha CodeStudio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Multi-Language Compiler
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Zero-install in-browser code editor &amp; compiler for Python 3, C, C++, Java, and JavaScript powered by public Piston execution.
            </p>
          </div>
        </div>

        {/* Quick Language Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 text-xs">
          {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((langKey) => {
            const isSelected = selectedLang === langKey;
            return (
              <button
                key={langKey}
                type="button"
                onClick={() => handleLanguageChange(langKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-teal-700 border border-teal-200 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {LANGUAGES[langKey].name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Workbench Grid (Editor on Left/Top, Terminal on Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left/Top: Code Editor Panel (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-md overflow-hidden min-h-[480px]">
          
          {/* Editor Header Toolbar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Left Controls: Language & Problem Snippet Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              {/* IDE Window Dots */}
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* Language Selector */}
              <div className="relative">
                <select
                  value={selectedLang}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-bold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  title="Select Programming Language"
                >
                  {Object.values(LANGUAGES).map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* B.Tech Lab Snippets Dropdown */}
              <div className="relative">
                <select
                  value={selectedSnippet}
                  onChange={(e) => handleSelectSnippet(e.target.value as LabSnippetKey)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  title="Load 1st Year B.Tech Lab Problem Snippet"
                >
                  {LAB_SNIPPETS.map((snip) => (
                    <option key={snip.id} value={snip.id}>
                      Snippet: {snip.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5">
              {/* STDIN Toggle */}
              <button
                type="button"
                onClick={() => setShowStdin(!showStdin)}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  showStdin
                    ? 'bg-teal-900/60 text-teal-300 border border-teal-700'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
                title="Toggle Standard Input (stdin)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Input (stdin)</span>
              </button>

              {/* Copy Code */}
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy Source Code"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Download Source */}
              <button
                type="button"
                onClick={handleDownloadSource}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Download solution.${LANGUAGES[selectedLang].ext}`}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Reset to Starter */}
              <button
                type="button"
                onClick={handleResetCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset to Template"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Editor Body with Line Numbers */}
          <div className="relative flex-1 flex min-h-[360px] max-h-[500px] overflow-hidden bg-slate-900">
            {/* Line Numbers Column */}
            <div
              ref={lineNumbersRef}
              className="py-4 pl-3 pr-2 text-right font-mono text-sm text-slate-600 select-none bg-slate-950/60 border-r border-slate-800/80 overflow-hidden leading-relaxed shrink-0 w-12"
            >
              {lineNumbers.map((n) => (
                <div key={n} className="leading-relaxed">
                  {n}
                </div>
              ))}
            </div>

            {/* Textarea Code Input */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent text-slate-100 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-auto selection:bg-teal-900 selection:text-teal-200"
              placeholder={`Write your ${LANGUAGES[selectedLang].name} code here...`}
            />
          </div>

          {/* Optional STDIN Input Box */}
          {showStdin && (
            <div className="p-3 bg-slate-950/90 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Standard Input (STDIN) for scanf / input() / Scanner:
                </span>
                <span className="text-[10px] text-slate-500">Passed line-by-line</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={2}
                placeholder="Enter input values separated by spaces or newlines..."
                className="w-full px-3 py-1.5 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>
          )}

          {/* Editor Footer Action Bar */}
          <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{LANGUAGES[selectedLang].versionDisplay}</span>
            </div>

            {/* Run Code Button */}
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Compiling &amp; Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Code ▶</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right/Bottom: Interactive Terminal Output Window (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          
          {/* Execution Metrics Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="font-medium">Execution Time:</span>
              <span className="font-bold text-slate-900 font-mono">{execTime}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {exitCode === 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Exit Code: 0 (Success)
                </span>
              )}
              {exitCode !== null && exitCode !== 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Exit Code: {exitCode}
                </span>
              )}
              {exitCode === null && (
                <span className="text-[11px] text-slate-400">Ready</span>
              )}
            </div>
          </div>

          {/* Interactive Terminal Output Console */}
          <div className="flex-1 flex flex-col bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl min-h-[220px] sm:min-h-[360px] border border-slate-800 shadow-md overflow-hidden justify-between">
            <div>
              {/* Terminal Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  <span>Terminal Console Output</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearTerminal}
                    className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer text-[10px]"
                    title="Clear Console Output"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Output Content */}
              <div className="overflow-auto max-h-[380px] space-y-2">
                {/* Standard Output (Green) */}
                {stdout && (
                  <pre className="whitespace-pre-wrap text-emerald-400 leading-relaxed break-words font-mono">
                    {stdout}
                  </pre>
                )}

                {/* Standard Error / Compilation Error (Red) */}
                {stderr && (
                  <pre className="whitespace-pre-wrap text-rose-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40 leading-relaxed break-words font-mono">
                    {stderr}
                  </pre>
                )}

                {!stdout && !stderr && (
                  <span className="text-slate-500 italic">
                    Console is empty. Click "Run Code ▶" to execute your program.
                  </span>
                )}
              </div>
            </div>

            {/* Terminal Footer Status */}
            <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 mt-3">
              <span>Host: Piston Remote Sandbox API</span>
              <span>StudyMacha v2.6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeStudioCompiler;
