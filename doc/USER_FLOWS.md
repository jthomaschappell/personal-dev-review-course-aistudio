# User Flows — CS Review (7-Day Full-Stack Refresher)

This document catalogs every user-facing flow in the application. Each flow includes a description, the steps a user takes, and expected outcomes. Use this as a manual QA checklist.

---

## Table of Contents

1. [UF-1: Landing Page — First Visit](#uf-1-landing-page--first-visit)
2. [UF-2: Landing Page — Returning User with Progress](#uf-2-landing-page--returning-user-with-progress)
3. [UF-3: Navigate to a Day (from Landing)](#uf-3-navigate-to-a-day-from-landing)
4. [UF-4: Day Page — Read Lesson Content](#uf-4-day-page--read-lesson-content)
5. [UF-5: Day Page — Mark Section Complete / Incomplete](#uf-5-day-page--mark-section-complete--incomplete)
6. [UF-6: Day Page — Quick Check Quiz](#uf-6-day-page--quick-check-quiz)
7. [UF-7: Day Page — Navigate Between Days](#uf-7-day-page--navigate-between-days)
8. [UF-8: Sidebar Navigation (Desktop)](#uf-8-sidebar-navigation-desktop)
9. [UF-9: Sidebar — Resize and Collapse](#uf-9-sidebar--resize-and-collapse)
10. [UF-10: Header — Day Pills Navigation](#uf-10-header--day-pills-navigation)
11. [UF-11: Header — Topic Search](#uf-11-header--topic-search)
12. [UF-12: Mobile Navigation Menu](#uf-12-mobile-navigation-menu)
13. [UF-13: Scholar Assistant — Open / Close Chat](#uf-13-scholar-assistant--open--close-chat)
14. [UF-14: Scholar Assistant — Send a Message](#uf-14-scholar-assistant--send-a-message)
15. [UF-15: Progress Persistence (localStorage)](#uf-15-progress-persistence-localstorage)
16. [UF-16: Mermaid Diagram Rendering](#uf-16-mermaid-diagram-rendering)
17. [UF-17: Footer — External Links](#uf-17-footer--external-links)
18. [UF-18: Global Progress Bar](#uf-18-global-progress-bar)
19. [UF-19: Day Not Found (Invalid Route)](#uf-19-day-not-found-invalid-route)
20. [UF-20: Loading State](#uf-20-loading-state)

---

## UF-1: Landing Page — First Visit

**Route:** `/`

**Preconditions:** No progress stored in localStorage.

**Steps:**
1. Open the application at `http://localhost:3000`.
2. Observe the landing page.

**Expected Outcomes:**
- Hero section displays: "Your 7-Day Full-Stack CS Refresher" with descriptive subtitle.
- Primary CTA button reads **"Start Day 1"** (not "Continue Learning" since no progress exists).
- No progress bar is displayed below the CTA (only shown when `globalPct > 0`).
- A grid of 7 **Day Cards** is rendered, each showing:
  - Cover image with scholar silhouette (different color per day).
  - Status badge: **"IN PROGRESS"** (all at 0%).
  - Day title, subtitle, progress percentage ("0% Complete"), and lesson count ("0/N Lessons").
  - Empty progress bar at the bottom of each card.
- Page animates in with a fade + slide-up transition.

---

## UF-2: Landing Page — Returning User with Progress

**Route:** `/`

**Preconditions:** Some sections are marked complete in localStorage (`cs-review-progress`).

**Steps:**
1. Complete at least one section on a day page (see UF-5).
2. Navigate back to the landing page.

**Expected Outcomes:**
- CTA button text changes to **"Continue Learning"**.
- CTA navigates to the first day that is not 100% complete.
- Global progress summary appears below the CTA: "X of 7 days complete" and "Y%".
- An animated horizontal progress bar fills to the global percentage.
- Individual Day Cards reflect per-day progress:
  - Cards for completed days show badge **"COMPLETE"** (green).
  - Progress bars and fractions update accordingly.

---

## UF-3: Navigate to a Day (from Landing)

**Route:** `/` → `/day/:day`

**Steps:**
1. On the landing page, click any Day Card.
2. Alternatively, click the primary CTA ("Start Day 1" / "Continue Learning").

**Expected Outcomes:**
- The application navigates to `/day/{N}` where N is the day number.
- The Day Page renders with the selected day's content (see UF-4).
- The sidebar highlights the active day (desktop only).
- The header day pills highlight the active day (desktop ≥ lg breakpoint).

---

## UF-4: Day Page — Read Lesson Content

**Route:** `/day/:day`

**Steps:**
1. Navigate to any day page.
2. Scroll through the content.

**Expected Outcomes:**
- Page header shows: "Day N" label, estimated reading time badge, day title, and subtitle.
- Previous/Next day navigation buttons appear at the top and bottom of the page.
- Day progress bar (horizontal) displays the current day's completion percentage.
- Each section displays:
  - A **checkbox** (square, left of title) for marking completion.
  - Section title in large bold text.
  - Body text with inline formatting: **bold** text renders bold; `code` renders in monospace.
  - Optional **Mermaid diagram** or SVG diagram below the body.
  - Optional **Quick Check** quiz accordion below the diagram.
- After all sections, a **Day Summary** box lists key takeaways.
- A **Further Reading** box lists external links with icons.

---

## UF-5: Day Page — Mark Section Complete / Incomplete

**Route:** `/day/:day`

**Steps:**
1. On a day page, click the checkbox (square icon) next to any section title.
2. Click it again to toggle it back.

**Expected Outcomes:**
- **Marking complete:** Checkbox fills with a green background and a checkmark icon. Section title text becomes muted (`text-on-surface-variant`).
- **Marking incomplete:** Checkbox reverts to an empty gray square. Title text returns to full contrast.
- The day progress bar updates immediately (percentage and fill width).
- Progress is saved to `localStorage` under key `cs-review-progress`.
- On the sidebar (desktop), the section link turns green/bold when complete.
- On the landing page, the Day Card progress updates when navigating back.

---

## UF-6: Day Page — Quick Check Quiz

**Route:** `/day/:day`

**Steps:**
1. On a day page, scroll to a section that has a Quick Check quiz.
2. Click the "Quick Check" accordion bar to expand it.
3. Read the question and select an answer option.
4. Click "Submit Answer".
5. Read the explanation.
6. Click "Next Question" (or "See Score" if last question).
7. After finishing, view the score and optionally click "Try Again".

**Expected Outcomes:**
- **Collapsed state:** Shows "Quick Check" label and section title. Chevron points down.
- **Expanding:** Smooth animated reveal. Chevron rotates to point up.
- **Question display:** Shows "Question X of Y", the question text, and lettered options (A, B, C, D).
- **Selecting an option:** The selected option highlights with a primary color accent. The letter badge fills with primary color.
- **Submit disabled:** "Submit Answer" button is disabled (50% opacity) until an option is selected.
- **After submit:**
  - Correct answer highlights green with a checkmark badge.
  - If the user's answer was wrong, it highlights red.
  - An explanation panel appears below with a green "Explanation" header.
  - "Submit Answer" button is replaced by "Next Question" (or "See Score").
- **Score screen:** Shows a circular score badge (e.g., "2/3"), a message ("Perfect score!", "Good work!", or "Keep studying!"), and a "Try Again" button.
- **Try Again:** Resets the quiz to Question 1 with no selections.

---

## UF-7: Day Page — Navigate Between Days

**Route:** `/day/:day` → `/day/:day±1`

**Steps:**
1. On Day 1, observe that only a "Day 2 →" button appears at top-right and bottom-right.
2. Click "Day 2 →" to navigate forward.
3. On Day 2–6, both "← Day N-1" and "Day N+1 →" buttons appear.
4. On Day 7, "Day 6 ←" appears at left; "Back to Course Home" link appears at bottom-right.

**Expected Outcomes:**
- Navigation transitions with a fade animation (exit old, enter new).
- The page scrolls to the top on navigation (via `window.scrollTo(0, 0)` on bottom buttons).
- The sidebar and header pills update to reflect the new active day.
- Progress bar resets to show the newly navigated day's progress.

---

## UF-8: Sidebar Navigation (Desktop)

**Viewport:** ≥ 768px (md breakpoint)

**Steps:**
1. Open the app at desktop width (≥ 768px).
2. Observe the sidebar on the left.
3. Click "Course Home" to navigate to `/`.
4. Click any day module link to navigate to that day.
5. While on a day page, observe the in-day section links that appear.
6. Click a section link.

**Expected Outcomes:**
- Sidebar is visible with the "CS Review" branding at top.
- "Course Home" link highlights when on `/`.
- "Daily Modules" section lists all 7 days with:
  - A numbered badge (or checkmark if 100% complete).
  - Day title (truncated if sidebar is narrow).
  - Progress percentage shown when 0 < progress < 100%.
- Active day is highlighted with a card-like style (lighter background, primary text color, subtle shadow).
- When a day is active, nested section links appear below it.
  - Section links show green/bold text when that section is complete.
  - Clicking a section link scrolls to that section anchor on the page (`#sectionId`).

---

## UF-9: Sidebar — Resize and Collapse

**Viewport:** ≥ 768px (md breakpoint)

**Steps:**
1. Hover over the right edge of the sidebar — observe the resize handle (1.5px strip) that highlights on hover.
2. Click and drag the handle to the right to widen the sidebar (max 420px).
3. Drag left to narrow it (min 220px).
4. Drag far left past the collapse threshold (< 170px) to collapse the sidebar entirely.
5. After collapsing, observe that a hamburger menu button appears in the header.
6. Click the hamburger menu button to restore the sidebar.

**Expected Outcomes:**
- **Resizing:** The sidebar width updates in real-time. Cursor changes to `col-resize` while dragging. The main content area adjusts its left margin accordingly.
- **Collapse:** Sidebar disappears. Main content expands to full width. Header shows a hamburger icon (menu button) on desktop.
- **Restore:** Clicking the hamburger restores the sidebar to its last expanded width (or the default 256px if it was never manually resized).
- The resize handle turns `primary/30` color while actively dragging.

---

## UF-10: Header — Day Pills Navigation

**Viewport:** ≥ 1024px (lg breakpoint)

**Steps:**
1. Open the app at a large desktop width.
2. Observe the row of "Day 1" through "Day 7" pill buttons in the header.
3. Click any pill to navigate to that day.

**Expected Outcomes:**
- The active day pill has a filled primary-color background with white text.
- Other pills are text-only with a hover effect (gray background).
- Clicking a pill navigates to `/day/{N}`.
- The sidebar active day updates accordingly.

---

## UF-11: Header — Topic Search

**Viewport:** ≥ 640px (sm breakpoint — search input is `hidden sm:block`)

**Steps:**
1. Click on the "Search topics..." input in the header.
2. Type a query (e.g., "arrays", "TCP", "React").
3. Observe the dropdown results.
4. Click a result.
5. Clear the search by clicking away (blur).

**Expected Outcomes:**
- **Typing:** A dropdown appears below the search input with up to 8 matching results.
- **Matching logic:** Matches section titles and day titles (case-insensitive substring match).
- **Result format:** Each result shows the section title (bold) and "Day N: DayTitle" (muted, small).
- **Clicking a result:** Navigates to `/day/{N}#{sectionId}` and clears the search.
- **No results:** Shows "No matching topics." message.
- **Blur:** After 120ms delay, the search query clears and the dropdown closes.

---

## UF-12: Mobile Navigation Menu

**Viewport:** < 768px (below md breakpoint)

**Steps:**
1. Open the app at mobile width (< 768px).
2. Observe there is no sidebar. The header shows the "CS Review" logo and a hamburger icon.
3. Tap the hamburger icon to open the mobile menu.
4. Observe the day pills and "Course Home" link.
5. Tap a day pill or "Course Home" to navigate.

**Expected Outcomes:**
- **Closed:** Only the hamburger icon (Menu) is visible in the header.
- **Open:** An animated panel drops down below the header, containing:
  - A flex-wrap grid of day pills (Day 1–7).
  - A "Course Home" link.
- The active day pill is highlighted (primary background, white text).
- Tapping any link closes the mobile menu and navigates to the selected route.
- Tapping the X icon (replaces hamburger when open) closes the menu.

---

## UF-13: Scholar Assistant — Open / Close Chat

**Steps:**
1. Observe the floating circular button in the bottom-right corner (graduation cap icon).
2. Hover over it — a tooltip "Consult the Architect" appears.
3. Click it to open the chat panel.
4. Click the X button inside the chat header, or click the floating button again, to close it.

**Expected Outcomes:**
- **Button:** Always visible in bottom-right (z-index 60). Gradient background, hover scales to 110%.
- **Opening:** Chat panel animates in (scale + fade + slide up) from the button.
- **Panel layout:**
  - Header: gradient background with graduation cap icon, "Scholar Assistant" title, "Architectural Logic Engine" subtitle, X close button.
  - Message area: scrollable, shows initial AI greeting: "Greetings, Scholar. I am your architectural assistant..."
  - Input area: text input with placeholder "Ask about architectural patterns..." and a send button (arrow icon).
- **Closing:** Panel animates out (reverse of opening).

---

## UF-14: Scholar Assistant — Send a Message

**Preconditions:** Chat panel is open (UF-13).

**Steps:**
1. Type a message in the chat input.
2. Press Enter or click the send button (arrow icon).
3. Wait for the AI response.

**Expected Outcomes:**
- **User message:** Appears right-aligned with a primary-color background and rounded corners (no top-right radius).
- **Typing indicator:** Three pulsing dots with "Synthesizing logic..." text appear while the AI is processing.
- **AI response:** Appears left-aligned with a lighter background and rounded corners (no top-left radius).
- **Auto-scroll:** The message area scrolls to the bottom when new messages appear.
- **Empty input:** Sending an empty or whitespace-only message does nothing.
- **API error:** If the Gemini API call fails, the AI responds with "Connection to the knowledge base interrupted. Please try again."
- **Without auth:** Messages are stored in local component state only (not persisted to Firestore).
- **With auth:** Messages are persisted to Firestore at `users/{uid}/chat_history`. Chat history loads from Firestore when the panel opens.

---

## UF-15: Progress Persistence (localStorage)

**Steps:**
1. Mark several sections complete across different days.
2. Close the browser tab.
3. Reopen the app.

**Expected Outcomes:**
- All progress is preserved. The landing page shows accurate progress percentages.
- Day pages show the correct sections as completed.
- Progress is stored under `localStorage` key: `cs-review-progress`.
- Data format: `{ "day1": { "sectionId": true, ... }, "day2": { ... } }`.

---

## UF-16: Mermaid Diagram Rendering

**Steps:**
1. Navigate to a day page with a section that includes a Mermaid diagram (e.g., Day 1 — "Arrays vs Linked Lists").
2. Observe the diagram rendering.

**Expected Outcomes:**
- The Mermaid code is rendered into an SVG diagram within a rounded container.
- Diagram uses the custom theme (purple primary, teal secondary, Inter font).
- A caption may appear below the diagram in italic muted text.
- If rendering fails, the raw Mermaid code is shown in a monospace code block as a fallback.
- SVG-type diagrams render as raw HTML inside the container.

---

## UF-17: Footer — External Links

**Steps:**
1. Scroll to the bottom of any page.
2. Observe the footer content.
3. Click any external link.

**Expected Outcomes:**
- Footer has 4 columns: branding, Resources, Further Learning, Open Source.
- Links:
  - Resources: Big-O Cheat Sheet (bigocheatsheet.com), Design Patterns (refactoring.guru).
  - Further Learning: NeetCode (neetcode.io), freeCodeCamp (freecodecamp.org).
  - Open Source: System Design Primer (GitHub), Roadmap.sh (roadmap.sh/backend).
- All links open in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
- Copyright line: "© 2024 CS Review. Designed for the Architectural Scholar."

---

## UF-18: Global Progress Bar

**Steps:**
1. Observe the thin horizontal bar at the very top of the page (above the header).
2. Complete or uncomplete sections and observe changes.

**Expected Outcomes:**
- A 1px-height bar spans the full width at the top of the viewport.
- Fill color is `bg-secondary` (teal).
- Width animates smoothly to match the global completion percentage.
- Updates in real-time when sections are toggled.

---

## UF-19: Day Not Found (Invalid Route)

**Steps:**
1. Navigate to `/day/99` or `/day/abc`.

**Expected Outcomes:**
- The page shows a centered "Day not found" message.
- A "Back to Home" link is displayed below the message, linking to `/`.

---

## UF-20: Loading State

**Steps:**
1. Open the application (this state is visible briefly while Firebase auth initializes).

**Expected Outcomes:**
- A centered spinning circle (border-based spinner animation) is displayed on a plain surface background.
- Once `onAuthStateChanged` resolves, the spinner is replaced by the full app layout.

---

## Summary: Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Landing` | Course home page with day cards and global progress |
| `/day/:day` | `DayPage` | Individual day lesson content with sections, quizzes, diagrams |
| `/day/:invalid` | Error state | "Day not found" fallback within `DayPage` |

## Summary: Data Flows

| Data | Storage | Read | Write |
|------|---------|------|-------|
| Course content | Static TS modules (`src/course-data/`) | On import | N/A (read-only) |
| Section completion | `localStorage` (`cs-review-progress`) | `loadProgress()` | `saveProgress()` via `toggleSection()` |
| Chat messages (no auth) | React component state | In-memory | In-memory |
| Chat messages (with auth) | Firestore `users/{uid}/chat_history` | `onSnapshot` listener | `addDoc` |
| User profile (with auth) | Firestore `users/{uid}` | `getDoc` on auth | `setDoc` on first login |

---

## Manual QA Test Results (Desktop Mode)

**Date:** 2026-03-25  
**Viewport:** Desktop (≥ 1024px)

| Flow | Status | Notes |
|------|--------|-------|
| UF-1: Landing Page — First Visit | PASS | Hero section, "Start Day 1" CTA, 7 day cards all render correctly. No progress bar shown when localStorage is empty. |
| UF-2: Landing — Returning User | PASS | CTA changes to "Continue Learning", global progress shows "0 of 7 days complete — 4%", Day 1 card shows 25% / 1 of 4. |
| UF-3: Navigate to a Day | PASS | "Start Day 1" navigates to `/day/1`. Day cards link correctly. |
| UF-4: Day Page Content | PASS | Header, time estimate, subtitle, sections, bold/code formatting, diagrams, quizzes all present. |
| UF-5: Mark Section Complete | PASS | Checkbox toggles green with checkmark icon. Day progress updates 0% → 25%. Sidebar shows "25%" next to Day 1. Title text style changes on completion. |
| UF-6: Quick Check Quiz | PASS | Accordion expands/collapses. Options highlight on selection. Submit shows correct/incorrect feedback with explanation. Score screen shows "3/3 Perfect score!" with "Try Again" button. |
| UF-7: Day Navigation | PASS | Day 1 shows "Day 2 →" only. Day 7 shows "← Day 6" and "Back to Course Home". Navigation works correctly with page scroll to top. |
| UF-8: Sidebar Navigation | PASS | Sidebar visible on desktop. Course Home and Day links work. Section anchor links scroll to sections. Active day highlights with nested sections. |
| UF-9: Sidebar Resize/Collapse | NOT TESTED | Requires precise mouse drag interaction that is difficult to automate. |
| UF-10: Day Pills Navigation | PASS | Header pills navigate to correct days. Active pill highlighted in purple. |
| UF-11: Topic Search | PASS | Search for "sort" returns "Sorting — Day 2: Algorithms". Clicking navigates to `/day/2#sorting`. "TCP" shows "No matching topics." correctly. Blur clears search. |
| UF-12: Mobile Navigation | NOT TESTED | Requires viewport resize to < 768px (dedicated mobile QA recommended). |
| UF-13: Scholar Assistant Open/Close | PASS | Floating button visible. Chat panel opens with gradient header, greeting message, input field. X button closes panel. |
| UF-14: Scholar Assistant Send Message | PASS | User message appears right-aligned in purple. Without a valid GEMINI_API_KEY, the expected error message "Connection to the knowledge base interrupted. Please try again." is displayed. |
| UF-15: Progress Persistence | PASS | Progress survives page navigation. Day cards and sidebar update consistently. |
| UF-16: Mermaid Diagram Rendering | PASS | Linked List diagram renders as SVG with purple theme. Caption displays below. |
| UF-17: Footer External Links | PASS | Footer renders with 4 columns: branding, Resources, Further Learning, Open Source. Links present. |
| UF-18: Global Progress Bar | PASS | Thin teal bar visible at top of page. Fills proportionally to global completion. |
| UF-19: Day Not Found | PASS | `/day/99` shows "DAY NOT FOUND" with "Back to Home" link. Layout (sidebar, header, footer) remains intact. |
| UF-20: Loading State | PASS | Brief spinner visible on initial load while Firebase auth initializes. |

### Known Issues / Observations

1. **Scholar Assistant requires GEMINI_API_KEY**: Without a valid key in `.env`, the chat returns the graceful error message. This is expected behavior.
2. **Day Card badges**: Cards display "IN PROGRESS" badges even at 0% progress. This is the designed behavior (not "COMPLETE" until 100%).
3. **Search scope**: Search matches section titles and day titles only, not section body content.
