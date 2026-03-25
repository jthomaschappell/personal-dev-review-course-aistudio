# CS Review Course — Personal Website Spec

## Project Overview

A personal, single-page-app (or multi-route) website that functions as a self-paced,
week-long CS review course. It is styled as a polished "course platform" — but built as
a static personal site (no backend required). The learner is a CS graduate refreshing
for a full-stack job. Diagrams are central to every topic.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Diagrams**: Mermaid.js (rendered client-side) or SVG inline components
- **State / Progress**: localStorage (no auth needed)
- **Deployment target**: Vercel (static export compatible)

---

## Visual Design Direction

**Aesthetic**: "Technical notebook" — dark theme, monospace accents, structured like
a printed engineering textbook crossed with a minimal SaaS dashboard. Think Stripe Docs
meets a Moleskine notebook.

**Typography**:
- Display/headings: `IBM Plex Serif` (editorial weight)
- Body: `IBM Plex Sans`
- Code/labels: `IBM Plex Mono`

**Color palette** (CSS variables):
```
--bg:          #0f1117   (near-black)
--surface:     #181c27   (card backgrounds)
--border:      #2a2f3e
--accent:      #4f8ef7   (electric blue — primary CTA)
--accent-warm: #f0a04b   (amber — for diagrams/highlights)
--text:        #e2e8f0
--text-muted:  #8896aa
--success:     #34d399
```

**Motion**: Subtle. Page transitions fade-slide. Progress bars animate on mount.
Section reveals use `IntersectionObserver` + CSS transition. No bouncing or spinning.

---

## Course Structure — 7 Days

Each day covers one major topic area. Each day page contains:
1. A short intro paragraph (2-4 sentences, plain language)
2. Two to four **concept sections**, each with:
   - A written explanation (~150-300 words)
   - At least one **diagram** (Mermaid or custom SVG)
   - Optional: a "Quick Check" (3-question multiple choice quiz, self-graded)
3. A **Day Summary** box — bullet-point recap of key takeaways
4. A **Further Reading** box — 2-3 links to free resources (MDN, Refactoring Guru, etc.)

---

### Day 1 — Data Structures

**Intro**: The building blocks of every algorithm. Know these cold.

**Sections**:

1. **Arrays vs Linked Lists**
   - Diagram: side-by-side memory layout (boxes and arrows)
   - Topics: contiguous vs pointer-based memory, O(1) index vs O(n) search

2. **Stacks and Queues**
   - Diagram: LIFO vs FIFO visual with push/pop/enqueue/dequeue labels
   - Topics: use cases (call stack, BFS queue), array vs linked list implementation

3. **Hash Tables**
   - Diagram: key -> hash function -> bucket array -> collision chain
   - Topics: load factor, open addressing vs chaining, amortized O(1)

4. **Trees and Graphs**
   - Diagram: BST with labeled nodes; adjacency list vs matrix
   - Topics: BST invariant, DFS vs BFS traversal, directed vs undirected

**Quick Checks**: Yes, one per section.

---

### Day 2 — Algorithms

**Intro**: Knowing a data structure is useless without knowing how to move through it.

**Sections**:

1. **Sorting**
   - Diagram: step-by-step merge sort split/merge tree
   - Topics: Bubble O(n2), Merge O(n log n), Quick O(n log n) avg, when to use each

2. **Searching**
   - Diagram: binary search "halving" visualization on a sorted array
   - Topics: linear vs binary, why sorted order is required

3. **Recursion and the Call Stack**
   - Diagram: call stack frames for factorial(4)
   - Topics: base case, recursive case, tail recursion concept

4. **Big-O Intuition**
   - Diagram: a simple chart of O(1), O(log n), O(n), O(n log n), O(n2) growth curves
   - Topics: how to derive complexity from loops, common pitfalls (nested loops)

**Quick Checks**: Yes.

---

### Day 3 — Design Patterns (GoF + SOLID)

**Intro**: Patterns are a shared vocabulary. Know the names and shapes, not just the code.

**Sections**:

1. **SOLID Principles**
   - Diagram: one-liner + bad vs good code snippet per principle
   - Topics: SRP, OCP, LSP, ISP, DIP — one sentence definition each, one real example each

2. **Creational Patterns**
   - Diagram: Singleton class diagram; Factory method call flow
   - Topics: Singleton, Factory Method, Builder — when each makes sense

3. **Structural Patterns**
   - Diagram: Adapter wrapping an incompatible interface; Decorator layering
   - Topics: Adapter, Decorator, Facade

4. **Behavioral Patterns**
   - Diagram: Observer event flow (subject -> observers); Strategy swap diagram
   - Topics: Observer, Strategy, Command

**Quick Checks**: Yes.

---

### Day 4 — System Design

**Intro**: Full-stack devs need to think beyond the function. Think at the service level.

**Sections**:

1. **Client-Server and REST**
   - Diagram: request/response lifecycle (browser -> DNS -> server -> DB -> response)
   - Topics: HTTP verbs, status codes, statelessness, JSON payloads

2. **Databases: SQL vs NoSQL**
   - Diagram: ER diagram (normalized) vs document store (nested JSON)
   - Topics: ACID, indexing, when to use each, N+1 problem

3. **Scalability Fundamentals**
   - Diagram: vertical vs horizontal scaling; load balancer in front of app servers
   - Topics: load balancing, caching (Redis), CDN, stateless services

4. **APIs and Microservices**
   - Diagram: monolith vs microservices boundary diagram; API gateway pattern
   - Topics: REST vs GraphQL tradeoffs, API gateway, service communication

**Quick Checks**: Yes.

---

### Day 5 — Testing and CI/CD

**Intro**: Untested code is a liability. CI/CD turns testing into a habit.

**Sections**:

1. **Testing Pyramid**
   - Diagram: pyramid — unit (wide base) -> integration -> E2E (tip)
   - Topics: what lives at each layer, speed vs confidence tradeoffs

2. **Unit Testing Patterns**
   - Diagram: Arrange / Act / Assert boxes
   - Topics: mocking, test doubles (mock/stub/spy), test isolation

3. **Integration and E2E**
   - Diagram: integration test hitting a real DB; E2E test driving a browser
   - Topics: when to use each, tools (Jest, Cypress, Playwright)

4. **CI/CD Pipeline**
   - Diagram: pipeline stages: commit -> lint -> test -> build -> deploy
   - Topics: what a pipeline does, feature flags, blue/green deployment concept

**Quick Checks**: Yes.

---

### Day 6 — Full-Stack Architecture Patterns

**Intro**: How modern full-stack apps are actually put together.

**Sections**:

1. **Frontend Architecture**
   - Diagram: component tree, state lifted vs colocated, context API boundary
   - Topics: CSR vs SSR vs SSG, hydration, state management (local vs global)

2. **Backend Architecture**
   - Diagram: layered architecture (routes -> controllers -> services -> repositories -> DB)
   - Topics: separation of concerns, dependency injection, middleware

3. **Auth Patterns**
   - Diagram: JWT flow (login -> token -> protected request); OAuth flow (simplified)
   - Topics: session vs JWT, refresh tokens, RBAC basics

4. **Deployment and Infrastructure Basics**
   - Diagram: simple cloud deployment: CDN + app server + managed DB + object storage
   - Topics: containers (Docker basics), environment variables, 12-factor app concept

**Quick Checks**: Yes.

---

### Day 7 — Review and Practice

**Intro**: Consolidate. The goal is confidence, not perfection.

**Sections**:

1. **Week Recap Diagram**
   - A single "map" diagram showing all 6 topic areas and how they connect
   - No new content — purely connective

2. **Interview Prep Cheat Sheet**
   - Key terms from each day in a compact table (term | one-liner definition)
   - Printable / copyable format

3. **Practice Problem Bank**
   - 10 short prompts (not full solutions) across DSA, system design, and patterns
   - Each prompt tagged by day topic

4. **What to Study Next**
   - Curated list of 5-7 free resources (courses, books, docs) for deeper dives
   - Tags: beginner-friendly, advanced, video, interactive

---

## Site Navigation and Layout

### Global Shell

- **Top nav** (sticky): Site name ("CS Review") + day pill-tabs (Day 1...Day 7)
- **Sidebar** (desktop): day navigation + per-day section anchors
- **Progress bar** (top of page): fills as user marks sections "complete"
- **Mobile**: sidebar collapses to hamburger; tabs scroll horizontally

### Home / Landing Page (`/`)

- Hero: "Your 7-Day Full-Stack CS Refresher"
- Subheader: brief description of what the course covers and who it is for
- "Start Day 1" CTA button
- Overview grid: 7 cards (one per day) with title, topic count, and completion status
- Progress summary if user has started (e.g., "3 of 7 days complete")

### Day Pages (`/day/[1-7]`)

- Day title and subtitle
- Estimated time: shown as a badge (e.g., "~ 90 min")
- Sections render in order with anchor links
- Each section has a "Mark complete" checkbox (persisted to localStorage)
- Diagrams are inline — not links — using Mermaid or custom SVG components
- Quick Check quizzes are collapsible accordion panels; score shown after submit

### Progress System

- `localStorage` key: `cs-review-progress`
- Schema:
```json
{
  "day1": { "section1": true, "section2": false, ... },
  "day2": { ... },
  ...
}
```
- Global progress = (completed sections / total sections) * 100
- Day progress shown on day cards on home page
- No account, no server — purely local

---

## Component Architecture

```
/app
  /page.tsx                  <- Home/landing
  /day/[day]/page.tsx        <- Day page (dynamic route)

/components
  /layout
    TopNav.tsx
    Sidebar.tsx
    ProgressBar.tsx
  /course
    DayCard.tsx              <- Home page grid card
    SectionBlock.tsx         <- Wraps a single concept section
    DiagramBlock.tsx         <- Renders Mermaid or SVG diagram
    QuickCheck.tsx           <- 3-question quiz accordion
    SummaryBox.tsx           <- Day summary
    FurtherReading.tsx       <- Links box
  /ui                        <- shadcn/ui primitives (Button, Badge, etc.)

/lib
  /course-data               <- All course content as typed TS objects
    day1.ts ... day7.ts
    index.ts                 <- Re-exports all days
  /progress.ts               <- localStorage read/write helpers

/types
  course.ts                  <- CourseDay, Section, Diagram, QuickCheckQuestion types
```

---

## Content Data Shape (TypeScript)

```typescript
export type QuickCheckQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type DiagramBlock = {
  type: "mermaid" | "svg";
  code: string;          // Mermaid DSL string, or raw SVG string
  caption?: string;
};

export type Section = {
  id: string;
  title: string;
  body: string;          // Markdown or plain text
  diagram?: DiagramBlock;
  quiz?: QuickCheckQuestion[];
};

export type CourseDay = {
  day: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  sections: Section[];
  summary: string[];         // Bullet points
  furtherReading: { label: string; url: string }[];
};
```

---

## Diagram Rendering

Use **Mermaid.js** for all architecture, flow, and sequence diagrams.
Use inline **SVG** (as React components or raw strings) for memory layout diagrams
(arrays, linked lists, hash buckets) where Mermaid falls short visually.

Mermaid diagrams render client-side. Use a `DiagramBlock` component that:
1. Detects `type === "mermaid"` and uses the `mermaid` npm package to render
2. Falls back to a code block if rendering fails
3. For `type === "svg"`, renders `dangerouslySetInnerHTML` or imports as component

---

## Accessibility and Performance

- All interactive elements keyboard-navigable
- Mermaid diagrams include `aria-label` captions
- Images/SVGs have `alt` text
- Tailwind `prose` classes for body text readability
- No external font loading blocking render (use `next/font`)
- `next/dynamic` for Mermaid client component to avoid SSR mismatch

---

## Out of Scope (do not build)

- User accounts or server-side persistence
- Video embeds
- Comments or discussion
- Paid gating
- Mobile app

---

## Suggested Build Order

1. Types and data shape (`/types/course.ts`)
2. Course content data files (`/lib/course-data/day1.ts` etc.) — start with Day 1 only
3. Progress localStorage helpers (`/lib/progress.ts`)
4. Home page layout + DayCard component
5. Day page shell + SectionBlock component
6. DiagramBlock with Mermaid rendering
7. QuickCheck quiz component
8. SummaryBox + FurtherReading components
9. TopNav + Sidebar + ProgressBar
10. Fill in remaining 6 days of content
11. Polish: animations, mobile layout, accessibility pass
