import { CourseDay } from "../types";

export const day2: CourseDay = {
  day: 2,
  title: "Algorithms",
  subtitle: "Knowing a data structure is useless without knowing how to move through it.",
  estimatedMinutes: 90,
  sections: [
    {
      id: "sorting",
      title: "Sorting",
      body: `Sorting is the most studied problem in CS. **Bubble sort** compares adjacent pairs and swaps — O(n²) worst and average. Simple to understand, almost never used in practice.

**Merge sort** uses divide-and-conquer: split the array in half, sort each half recursively, then merge. It's O(n log n) in all cases and is stable (equal elements keep their relative order). The downside is O(n) extra space for the merge buffer.

**Quick sort** picks a pivot, partitions elements into less-than and greater-than groups, and recurses. Average O(n log n), worst O(n²) with bad pivots. In practice it's often fastest due to cache locality, and randomized pivots avoid worst cases.

Use merge sort when stability matters or data is on disk. Use quicksort for general in-memory sorting. Many languages' built-in sort is Timsort — a hybrid of merge sort and insertion sort.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  A["[38, 27, 43, 3, 9, 82, 10]"] --> B["[38, 27, 43, 3]"]
  A --> C["[9, 82, 10]"]
  B --> D["[38, 27]"]
  B --> E["[43, 3]"]
  C --> F["[9, 82]"]
  C --> G["[10]"]
  D --> H["[27, 38]"]
  E --> I["[3, 43]"]
  F --> J["[9, 82]"]
  H --> K["[3, 27, 38, 43]"]
  I --> K
  J --> L["[9, 10, 82]"]
  G --> L
  K --> M["[3, 9, 10, 27, 38, 43, 82]"]
  L --> M`,
        caption: "Merge sort: recursive split and merge phases"
      },
      quiz: [
        {
          question: "What is the time complexity of merge sort?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
          correctIndex: 1,
          explanation: "Merge sort always runs in O(n log n) — the array is split log n times, and each merge pass processes n elements."
        },
        {
          question: "Why is quicksort often faster in practice than merge sort?",
          options: [
            "It has better worst-case complexity",
            "It uses less memory and has better cache locality",
            "It's always stable",
            "It doesn't require comparisons"
          ],
          correctIndex: 1,
          explanation: "Quicksort operates in-place with good cache locality, reducing memory overhead. Its average case matches merge sort at O(n log n)."
        },
        {
          question: "Which sort is stable?",
          options: ["Quicksort", "Heapsort", "Merge sort", "Selection sort"],
          correctIndex: 2,
          explanation: "Merge sort preserves the relative order of equal elements, making it stable. Quicksort and heapsort are not stable."
        }
      ]
    },
    {
      id: "searching",
      title: "Searching",
      body: `**Linear search** checks every element one by one — O(n). It works on any collection, sorted or not. Simple but slow for large datasets.

**Binary search** requires a sorted array. It repeatedly halves the search space by comparing the target to the middle element. If the target is smaller, search the left half; if larger, search the right. This gives O(log n) — massively faster for large n.

A common interview pattern: if you can sort the data first (O(n log n)), then binary search multiple queries each in O(log n), the total cost is often less than running linear search for each query.

Binary search is also the foundation for many advanced techniques: finding boundaries (lower/upper bound), searching rotated arrays, and optimizing over monotonic functions.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph Step1["Step 1: Full Array"]
    S1["[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]<br/>target=23, mid=16"]
  end
  subgraph Step2["Step 2: Right Half"]
    S2["[23, 38, 56, 72, 91]<br/>mid=56"]
  end
  subgraph Step3["Step 3: Left Quarter"]
    S3["[23, 38]<br/>mid=23 ✓"]
  end
  Step1 --> Step2 --> Step3`,
        caption: "Binary search halving: each step eliminates half the remaining elements"
      },
      quiz: [
        {
          question: "What is the prerequisite for binary search?",
          options: ["A linked list", "A sorted array", "A hash table", "A balanced tree"],
          correctIndex: 1,
          explanation: "Binary search relies on sorted order to decide which half to discard at each step."
        },
        {
          question: "How many comparisons does binary search need on an array of 1024 elements?",
          options: ["1024", "512", "~10", "~32"],
          correctIndex: 2,
          explanation: "log₂(1024) = 10, so binary search needs at most about 10 comparisons."
        },
        {
          question: "What is the time complexity of linear search?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          correctIndex: 2,
          explanation: "Linear search may need to check every element, giving O(n) worst case."
        }
      ]
    },
    {
      id: "recursion-call-stack",
      title: "Recursion and the Call Stack",
      body: `Recursion is when a function calls itself. Every recursive function needs two parts: a **base case** (when to stop) and a **recursive case** (how to break the problem down).

When a function calls itself, the runtime pushes a new **stack frame** onto the call stack. Each frame holds local variables and the return address. When the base case is reached, frames start popping off and returning their results.

\`factorial(4)\` creates 4 stack frames: factorial(4) → factorial(3) → factorial(2) → factorial(1). factorial(1) returns 1, then each frame multiplies and returns up the chain: 1 → 2 → 6 → 24.

**Tail recursion** is when the recursive call is the last operation in the function. Some compilers/runtimes optimize tail calls to reuse the current stack frame, preventing stack overflow. JavaScript engines have limited support for this; languages like Scheme and Haskell do it reliably.`,
      diagram: {
        type: "mermaid",
        code: `graph TB
  subgraph CallStack["Call Stack for factorial(4)"]
    direction TB
    F4["factorial(4)<br/>return 4 × factorial(3)"]
    F3["factorial(3)<br/>return 3 × factorial(2)"]
    F2["factorial(2)<br/>return 2 × factorial(1)"]
    F1["factorial(1)<br/>BASE CASE → return 1"]
  end
  F4 --> F3 --> F2 --> F1
  F1 -.->|"1"| F2
  F2 -.->|"2"| F3
  F3 -.->|"6"| F4
  F4 -.->|"24"| R["Result: 24"]`,
        caption: "Call stack frames for factorial(4) — push down, return up"
      },
      quiz: [
        {
          question: "What are the two essential parts of a recursive function?",
          options: [
            "Loop and counter",
            "Base case and recursive case",
            "Input and output",
            "Push and pop"
          ],
          correctIndex: 1,
          explanation: "Every recursive function needs a base case (termination) and a recursive case (self-call that progresses toward the base case)."
        },
        {
          question: "What happens if a recursive function lacks a base case?",
          options: [
            "It returns undefined",
            "It optimizes to a loop",
            "It causes a stack overflow",
            "It runs in O(1)"
          ],
          correctIndex: 2,
          explanation: "Without a base case, the function calls itself infinitely, filling the call stack until it overflows."
        },
        {
          question: "What is tail recursion?",
          options: [
            "Recursion that uses two base cases",
            "When the recursive call is the last operation in the function",
            "Recursion on linked lists only",
            "When the call stack is empty"
          ],
          correctIndex: 1,
          explanation: "Tail recursion means the recursive call is the final operation — no computation remains after it returns. This allows compilers to optimize away the extra stack frame."
        }
      ]
    },
    {
      id: "big-o-intuition",
      title: "Big-O Intuition",
      body: `**Big-O notation** describes how an algorithm's time (or space) grows relative to its input size n. It captures the **worst-case upper bound**, ignoring constants and lower-order terms.

**O(1)** — constant: array access, hash table lookup. Doesn't grow with input.
**O(log n)** — logarithmic: binary search. Halving the input each step.
**O(n)** — linear: scanning an array. Touching each element once.
**O(n log n)** — linearithmic: merge sort, quicksort average. The "speed limit" for comparison-based sorting.
**O(n²)** — quadratic: nested loops over the same input (bubble sort, brute-force pair matching).

**Deriving complexity from code:** count the loops. A single loop over n is O(n). A nested loop of n × n is O(n²). A loop that halves the range each iteration is O(log n). A recursive call that divides the input and processes both halves is O(n log n).

Common pitfall: string concatenation in a loop. Each concat creates a new string, turning what looks like O(n) into O(n²).`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph Complexity["Growth Rate Comparison (n=1000)"]
    C1["O(1)<br/>1 op"]
    C2["O(log n)<br/>~10 ops"]
    C3["O(n)<br/>1,000 ops"]
    C4["O(n log n)<br/>~10,000 ops"]
    C5["O(n²)<br/>1,000,000 ops"]
  end
  C1 --> C2 --> C3 --> C4 --> C5`,
        caption: "Operation count for n=1000 across common Big-O classes"
      },
      quiz: [
        {
          question: "What is the Big-O of a simple for-loop iterating over an array of n elements?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctIndex: 2,
          explanation: "A single loop that touches each of n elements runs in O(n)."
        },
        {
          question: "What is the lower bound for comparison-based sorting?",
          options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
          correctIndex: 1,
          explanation: "It's mathematically proven that no comparison-based sort can do better than O(n log n) in the worst case."
        },
        {
          question: "A loop that halves the input each iteration runs in:",
          options: ["O(n)", "O(n/2)", "O(log n)", "O(1)"],
          correctIndex: 2,
          explanation: "Halving the input each step means you need log₂(n) iterations to reduce it to 1 — O(log n)."
        }
      ]
    }
  ],
  summary: [
    "Merge sort is O(n log n) and stable; quicksort is often faster in practice due to cache locality",
    "Binary search needs a sorted array and runs in O(log n) — orders of magnitude faster than linear search",
    "Recursion uses the call stack; always define a base case to avoid stack overflow",
    "Tail recursion can be optimized by compilers to avoid extra stack frames",
    "Big-O describes worst-case growth: O(1) < O(log n) < O(n) < O(n log n) < O(n²)",
    "Count loops to derive complexity; watch for hidden O(n) operations inside loops"
  ],
  furtherReading: [
    { label: "VisuAlgo — Sorting Visualizations", url: "https://visualgo.net/en/sorting" },
    { label: "Khan Academy — Algorithms", url: "https://www.khanacademy.org/computing/computer-science/algorithms" },
    { label: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com/" }
  ]
};
