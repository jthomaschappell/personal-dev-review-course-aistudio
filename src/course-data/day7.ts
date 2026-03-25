import { CourseDay } from "../types";

export const day7: CourseDay = {
  day: 7,
  title: "Review and Practice",
  subtitle: "Consolidate. The goal is confidence, not perfection.",
  estimatedMinutes: 60,
  sections: [
    {
      id: "week-recap",
      title: "Week Recap Diagram",
      body: `This is the big picture. Over six days you've covered the foundational pillars of full-stack CS: data structures that organize information, algorithms that process it, design patterns that structure code, system design that scales services, testing that ensures reliability, and architecture patterns that tie frontend and backend together.

These topics are not isolated. Data structures power the algorithms. Algorithms are encapsulated in design patterns. Design patterns compose into system architectures. System architectures are verified by testing. And all of it is deployed through CI/CD pipelines into the cloud infrastructure you studied.

The diagram below connects all six days into a single map. Use it to identify which areas feel strongest and which need more review. The goal isn't perfection — it's confident fluency across the full stack.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  DS["Day 1: Data Structures<br/>Arrays, Lists, Trees, Graphs"] --> ALGO["Day 2: Algorithms<br/>Sorting, Searching, Big-O"]
  ALGO --> PATTERNS["Day 3: Design Patterns<br/>SOLID, Creational, Structural, Behavioral"]
  PATTERNS --> SYSDESIGN["Day 4: System Design<br/>REST, Databases, Scaling, APIs"]
  SYSDESIGN --> TESTING["Day 5: Testing & CI/CD<br/>Pyramid, Unit, Integration, Pipeline"]
  TESTING --> FULLSTACK["Day 6: Full-Stack Architecture<br/>CSR/SSR, Backend Layers, Auth, Deploy"]
  FULLSTACK --> REVIEW["Day 7: Review & Practice"]
  DS -->|"underpin"| SYSDESIGN
  PATTERNS -->|"structure"| FULLSTACK
  TESTING -->|"verify"| SYSDESIGN`,
        caption: "Full course map: how all six topic areas connect"
      }
    },
    {
      id: "interview-cheat-sheet",
      title: "Interview Prep Cheat Sheet",
      body: `Keep this table handy. It covers the key terms from each day in a compact format — perfect for a quick review before an interview.

| Term | Definition |
|------|-----------|
| **Array** | Contiguous memory, O(1) access, O(n) insert |
| **Linked List** | Pointer-based nodes, O(1) insert at known position, O(n) search |
| **Hash Table** | Key→hash→bucket, amortized O(1), collision handling via chaining or probing |
| **BST** | Binary tree with left < node < right invariant, O(log n) balanced |
| **Merge Sort** | Divide-and-conquer, O(n log n), stable |
| **Binary Search** | Sorted array, halve search space, O(log n) |
| **Big-O** | Worst-case growth rate: O(1) < O(log n) < O(n) < O(n log n) < O(n²) |
| **SOLID** | SRP, OCP, LSP, ISP, DIP — five principles of OO design |
| **Observer** | Subject notifies registered observers on state change |
| **REST** | Stateless HTTP API using standard verbs (GET, POST, PUT, DELETE) |
| **ACID** | Atomicity, Consistency, Isolation, Durability — DB transaction guarantees |
| **CAP Theorem** | Distributed systems can guarantee only 2 of: Consistency, Availability, Partition tolerance |
| **Testing Pyramid** | Many unit tests → fewer integration → few E2E |
| **JWT** | Stateless auth token containing signed user claims |
| **SSR vs CSR** | Server-rendered (SEO, fast paint) vs client-rendered (dynamic SPA) |
| **Docker** | Containerized, reproducible deployment units |`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph CheatSheet["Quick Reference"]
    DSA["DSA<br/>Arrays, Trees,<br/>Sorting, Search"]
    Patterns["Patterns<br/>SOLID, GoF,<br/>Observer, Strategy"]
    Systems["Systems<br/>REST, SQL/NoSQL,<br/>Caching, Scaling"]
    DevOps["DevOps<br/>CI/CD, Docker,<br/>Testing, Auth"]
  end
  DSA --> Patterns --> Systems --> DevOps`,
        caption: "Four pillars of full-stack interview preparation"
      }
    },
    {
      id: "practice-problems",
      title: "Practice Problem Bank",
      body: `Try these prompts without looking at solutions first. They cover the full range of topics from this week.

**1. [Data Structures]** Implement a hash table from scratch with chaining. Support get, set, and delete. What happens when load factor exceeds 0.75?

**2. [Data Structures]** Given a binary tree, write a function to check if it's a valid BST. What edge cases matter?

**3. [Algorithms]** Implement merge sort. Then analyze: why is it stable? What's the space complexity?

**4. [Algorithms]** Given a sorted, rotated array, find a target value in O(log n). (Hint: modified binary search.)

**5. [Design Patterns]** Refactor a function with a 200-line switch statement using the Strategy pattern. Which SOLID principle does this fix?

**6. [Design Patterns]** Design an event system using the Observer pattern. Support subscribe, unsubscribe, and emit.

**7. [System Design]** Design a URL shortener. Consider: hash function choice, collision handling, database schema, redirect latency, analytics.

**8. [System Design]** How would you scale a chat application to 1 million concurrent users? Consider: WebSockets, message queuing, horizontal scaling.

**9. [Testing]** Write unit tests for a shopping cart module. What do you mock? How do you test edge cases (empty cart, max items, discount codes)?

**10. [Full-Stack]** Design the auth flow for a SaaS app. JWT or sessions? How do you handle token refresh, password reset, and RBAC?`,
      quiz: [
        {
          question: "Which practice problem tests your understanding of the Strategy pattern?",
          options: [
            "Problem 1 (Hash table)",
            "Problem 5 (Refactoring a switch statement)",
            "Problem 7 (URL shortener)",
            "Problem 9 (Shopping cart tests)"
          ],
          correctIndex: 1,
          explanation: "Problem 5 asks you to refactor a switch statement using Strategy — replacing conditional logic with polymorphic behavior."
        },
        {
          question: "Which problem combines data structures and algorithms?",
          options: [
            "Problem 6 (Observer pattern)",
            "Problem 4 (Rotated array binary search)",
            "Problem 8 (Chat scaling)",
            "Problem 10 (Auth flow)"
          ],
          correctIndex: 1,
          explanation: "Problem 4 requires understanding sorted arrays (data structure) and binary search (algorithm), plus adapting to a rotated edge case."
        },
        {
          question: "What is the purpose of these practice problems?",
          options: [
            "To memorize solutions",
            "To build confidence across the full range of topics",
            "To learn new concepts",
            "To prepare for a specific company"
          ],
          correctIndex: 1,
          explanation: "These problems help you apply knowledge across all six days of material — the goal is confident fluency, not memorization."
        }
      ]
    },
    {
      id: "what-to-study-next",
      title: "What to Study Next",
      body: `You've built a solid foundation. Here's where to go deeper based on your goals:

**For algorithms and competitive programming:** LeetCode and Codeforces offer thousands of graded problems. Start with the "Blind 75" list for interview prep. NeetCode provides video walkthroughs for each problem.

**For system design depth:** "Designing Data-Intensive Applications" by Martin Kleppmann is the gold standard. It covers distributed systems, replication, partitioning, and stream processing at a level far beyond most courses.

**For frontend mastery:** The official React docs (react.dev) are exceptionally well-written. Follow up with Kent C. Dodds' "Epic React" for advanced patterns and testing.

**For backend and DevOps:** The "Roadmap.sh" backend roadmap provides a comprehensive learning path. Pair it with hands-on Docker and Kubernetes tutorials.

**For free, structured courses:** MIT OpenCourseWare (6.006, 6.824) offers world-class CS courses. freeCodeCamp covers full-stack web development from zero to deployment.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  You["You Are Here"] --> DSA_Path["DSA Deep Dive<br/>LeetCode, NeetCode<br/>🏷️ Interactive"]
  You --> SD_Path["System Design<br/>DDIA Book<br/>🏷️ Advanced"]
  You --> FE_Path["Frontend Mastery<br/>react.dev, Epic React<br/>🏷️ Intermediate"]
  You --> BE_Path["Backend + DevOps<br/>Roadmap.sh<br/>🏷️ Beginner-friendly"]
  You --> Academic["Academic CS<br/>MIT OCW 6.006 / 6.824<br/>🏷️ Video"]`,
        caption: "Learning paths based on your goals and current level"
      }
    }
  ],
  summary: [
    "All six days connect: data structures → algorithms → patterns → system design → testing → full-stack architecture",
    "Use the cheat sheet for quick interview prep — key terms and one-line definitions",
    "Practice problems span all topics — try them before looking at solutions",
    "Continue learning: LeetCode for DSA, DDIA for system design, react.dev for frontend, MIT OCW for academic depth",
    "The goal is confident fluency, not perfect memorization"
  ],
  furtherReading: [
    { label: "NeetCode — Blind 75 Problems", url: "https://neetcode.io/practice" },
    { label: "Designing Data-Intensive Applications", url: "https://dataintensive.net/" },
    { label: "MIT 6.006 — Introduction to Algorithms", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/" },
    { label: "freeCodeCamp", url: "https://www.freecodecamp.org/" },
    { label: "Roadmap.sh — Backend Developer", url: "https://roadmap.sh/backend" }
  ]
};
