import { CourseDay } from "../types";

export const day1: CourseDay = {
  day: 1,
  title: "Data Structures",
  subtitle: "The building blocks of every algorithm. Know these cold.",
  estimatedMinutes: 90,
  sections: [
    {
      id: "arrays-vs-linked-lists",
      title: "Arrays vs Linked Lists",
      body: `Arrays store elements in **contiguous memory**, meaning each element sits right next to the last. This gives you O(1) random access by index — the CPU can jump straight to any position using simple arithmetic. The trade-off: inserting or deleting in the middle requires shifting every subsequent element, costing O(n).

Linked lists take a different approach. Each node stores a value and a **pointer** to the next node. Insertions and deletions at a known position are O(1) — just re-wire the pointers. But finding an element requires walking the chain from the head, making search O(n). There's no index shortcut.

Choose arrays when you need fast reads and know the size ahead of time. Choose linked lists when you need frequent insertions/deletions and don't mind sequential access.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph Array["Array (Contiguous Memory)"]
    A0["[0] 42"] --- A1["[1] 17"] --- A2["[2] 93"] --- A3["[3] 8"] --- A4["[4] 56"]
  end
  subgraph LinkedList["Linked List (Pointer-based)"]
    N0["42 | •→"] --> N1["17 | •→"] --> N2["93 | •→"] --> N3["8 | •→"] --> N4["56 | null"]
  end`,
        caption: "Memory layout: contiguous array vs pointer-based linked list"
      },
      quiz: [
        {
          question: "What is the time complexity of accessing the 5th element of an array?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
          correctIndex: 0,
          explanation: "Arrays provide O(1) random access because elements are stored contiguously — the address is computed directly from the index."
        },
        {
          question: "Which operation is more efficient in a linked list than in an array?",
          options: ["Random access by index", "Insertion at a known position", "Binary search", "Sorting"],
          correctIndex: 1,
          explanation: "Once you have a reference to the position, inserting into a linked list only requires re-wiring pointers — O(1) vs O(n) for shifting array elements."
        },
        {
          question: "Why can't you perform binary search on a linked list?",
          options: [
            "Linked lists don't support comparison operations",
            "Linked lists are always unsorted",
            "There's no O(1) way to access the middle element",
            "Binary search requires O(n) space"
          ],
          correctIndex: 2,
          explanation: "Binary search relies on O(1) indexed access to the midpoint. Linked lists require O(n) traversal to reach any given position."
        }
      ]
    },
    {
      id: "stacks-and-queues",
      title: "Stacks and Queues",
      body: `A **stack** follows Last-In, First-Out (LIFO). Think of a stack of plates: you add and remove from the top. The two core operations are \`push\` (add to top) and \`pop\` (remove from top), both O(1). The call stack in your runtime is literally a stack — each function call pushes a frame, and returning pops it.

A **queue** follows First-In, First-Out (FIFO). Think of a line at a store: the first person in line is served first. Core operations: \`enqueue\` (add to back) and \`dequeue\` (remove from front), both O(1) with proper implementation.

Both can be implemented with arrays or linked lists. Stacks are natural with arrays (push/pop at the end). Queues are better with linked lists or circular buffers to avoid costly shifts at the front.`,
      diagram: {
        type: "mermaid",
        code: `graph TB
  subgraph Stack["Stack (LIFO)"]
    direction TB
    S_top["TOP → push/pop"] --- S3["Frame 3"] --- S2["Frame 2"] --- S1["Frame 1"]
  end
  subgraph Queue["Queue (FIFO)"]
    direction LR
    Q_back["BACK ← enqueue"] --- Q3["Item 3"] --- Q2["Item 2"] --- Q1["Item 1"] --- Q_front["FRONT → dequeue"]
  end`,
        caption: "LIFO stack vs FIFO queue with push/pop and enqueue/dequeue operations"
      },
      quiz: [
        {
          question: "Which data structure does the function call stack in a runtime use?",
          options: ["Queue", "Stack", "Priority Queue", "Deque"],
          correctIndex: 1,
          explanation: "Function calls push frames onto the call stack and returning pops them off — classic LIFO behavior."
        },
        {
          question: "Which traversal algorithm relies on a queue?",
          options: ["Depth-First Search", "Breadth-First Search", "In-order traversal", "Post-order traversal"],
          correctIndex: 1,
          explanation: "BFS uses a queue to explore all neighbors at the current depth before moving deeper."
        },
        {
          question: "What is the time complexity of push and pop on a stack?",
          options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
          correctIndex: 2,
          explanation: "Both push and pop operate on the top of the stack, requiring constant time regardless of stack size."
        }
      ]
    },
    {
      id: "hash-tables",
      title: "Hash Tables",
      body: `A **hash table** maps keys to values using a hash function. The function takes a key, computes an integer hash, and uses modular arithmetic to map it to a bucket index. On average, lookup, insert, and delete are all **O(1)** — amortized.

The catch is **collisions**: two keys can hash to the same bucket. Two strategies handle this. **Chaining** stores a linked list at each bucket; on collision, you append to the list. **Open addressing** probes for the next empty slot using a sequence (linear, quadratic, or double hashing).

The **load factor** (n / buckets) determines performance. As it approaches 1.0, collisions increase. Most implementations resize (typically doubling) when the load factor exceeds ~0.75, rehashing all keys into the new table.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  K1["Key: 'alice'"] --> HF["Hash Function h(k)"]
  K2["Key: 'bob'"] --> HF
  K3["Key: 'carol'"] --> HF
  HF --> B0["Bucket 0: empty"]
  HF --> B1["Bucket 1: alice → carol"]
  HF --> B2["Bucket 2: bob"]
  HF --> B3["Bucket 3: empty"]`,
        caption: "Key → hash function → bucket array with collision chaining"
      },
      quiz: [
        {
          question: "What is the amortized time complexity of a hash table lookup?",
          options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
          correctIndex: 2,
          explanation: "With a good hash function and reasonable load factor, hash table lookups are amortized O(1)."
        },
        {
          question: "What happens when the load factor of a hash table exceeds 0.75?",
          options: [
            "The hash function changes automatically",
            "Lookups become O(n)",
            "The table typically resizes and rehashes all keys",
            "Insertions are rejected"
          ],
          correctIndex: 2,
          explanation: "Most implementations double the bucket array size and rehash all existing keys to maintain performance."
        },
        {
          question: "In chaining, what data structure is used at each bucket to handle collisions?",
          options: ["Array", "Binary tree", "Linked list", "Stack"],
          correctIndex: 2,
          explanation: "Chaining stores colliding elements in a linked list at each bucket index."
        }
      ]
    },
    {
      id: "trees-and-graphs",
      title: "Trees and Graphs",
      body: `A **tree** is a connected, acyclic graph. A **Binary Search Tree (BST)** maintains the invariant: for every node, all values in the left subtree are less, and all in the right subtree are greater. This gives O(log n) search, insert, and delete on a balanced tree — but degenerates to O(n) if unbalanced (e.g., sorted input).

**Graphs** generalize trees. A graph is a set of vertices and edges, which can be directed or undirected, weighted or unweighted. Two common representations: an **adjacency list** (array of neighbor lists — space-efficient for sparse graphs) and an **adjacency matrix** (2D boolean array — fast edge lookup for dense graphs).

**DFS** (Depth-First Search) uses a stack and explores as deep as possible before backtracking. **BFS** (Breadth-First Search) uses a queue and explores all neighbors at each level. DFS is great for path-finding and cycle detection; BFS finds shortest paths in unweighted graphs.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph BST["Binary Search Tree"]
    R["8"] --> L["3"]
    R --> Ri["10"]
    L --> LL["1"]
    L --> LR["6"]
    Ri --> RR["14"]
  end
  subgraph AdjList["Adjacency List"]
    AL0["A → [B, C]"]
    AL1["B → [A, D]"]
    AL2["C → [A]"]
    AL3["D → [B]"]
  end`,
        caption: "BST with labeled nodes; graph adjacency list representation"
      },
      quiz: [
        {
          question: "What is the BST invariant?",
          options: [
            "All left children are greater than the parent",
            "All left subtree values are less than the node, all right are greater",
            "The tree must be complete",
            "Each node has exactly two children"
          ],
          correctIndex: 1,
          explanation: "The BST invariant ensures that for every node, the left subtree contains only smaller values and the right subtree contains only larger values."
        },
        {
          question: "Which traversal uses a queue?",
          options: ["DFS", "BFS", "In-order", "Pre-order"],
          correctIndex: 1,
          explanation: "BFS explores level by level using a queue to track which nodes to visit next."
        },
        {
          question: "For a sparse graph, which representation is more space-efficient?",
          options: ["Adjacency matrix", "Adjacency list", "Edge list", "Incidence matrix"],
          correctIndex: 1,
          explanation: "Adjacency lists use O(V + E) space, which is much better than the O(V²) of an adjacency matrix when edges are few."
        }
      ]
    }
  ],
  summary: [
    "Arrays give O(1) access but O(n) inserts; linked lists give O(1) inserts but O(n) access",
    "Stacks (LIFO) and queues (FIFO) are foundational for DFS and BFS respectively",
    "Hash tables provide amortized O(1) operations through hash functions and collision handling",
    "BSTs maintain a sorted invariant for O(log n) operations when balanced",
    "Adjacency lists are better for sparse graphs; matrices for dense graphs",
    "Choose the right data structure by analyzing your access patterns and constraints"
  ],
  furtherReading: [
    { label: "MDN: JavaScript Data Structures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures" },
    { label: "VisuAlgo — Data Structure Visualizations", url: "https://visualgo.net/" },
    { label: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com/" }
  ]
};
