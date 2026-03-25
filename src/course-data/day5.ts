import { CourseDay } from "../types";

export const day5: CourseDay = {
  day: 5,
  title: "Testing and CI/CD",
  subtitle: "Untested code is a liability. CI/CD turns testing into a habit.",
  estimatedMinutes: 90,
  sections: [
    {
      id: "testing-pyramid",
      title: "Testing Pyramid",
      body: `The **testing pyramid** organizes tests by speed, cost, and scope. At the wide base: **unit tests** — fast, cheap, isolated, testing individual functions or classes. They form the bulk of your test suite.

In the middle: **integration tests** — they verify that multiple components work together correctly. Slower than unit tests because they may involve a real database, API calls, or filesystem operations.

At the narrow tip: **end-to-end (E2E) tests** — they simulate real user interactions through the full stack. Most expensive to write, slowest to run, and most brittle (they break when UI changes). But they provide the highest confidence that the system works as a whole.

The key insight: write many unit tests, fewer integration tests, and even fewer E2E tests. This gives you fast feedback loops during development while still catching system-level bugs. Inverting the pyramid (mostly E2E tests) leads to slow, fragile test suites.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph Pyramid["Testing Pyramid"]
    E2E["E2E Tests<br/>Slow, High Confidence<br/>Few in number"]
    INT["Integration Tests<br/>Medium speed<br/>Moderate count"]
    UNIT["Unit Tests<br/>Fast, Isolated<br/>Many in number"]
  end
  E2E --> INT --> UNIT`,
        caption: "Testing pyramid: many unit tests at the base, few E2E tests at the tip"
      },
      quiz: [
        {
          question: "Which type of test forms the base of the testing pyramid?",
          options: ["E2E tests", "Integration tests", "Unit tests", "Manual tests"],
          correctIndex: 2,
          explanation: "Unit tests are the fastest and cheapest to write, forming the wide base — you should have many of them."
        },
        {
          question: "Why should you have fewer E2E tests than unit tests?",
          options: [
            "E2E tests are less accurate",
            "E2E tests are slow, expensive, and brittle",
            "E2E tests don't catch real bugs",
            "E2E tests require special hardware"
          ],
          correctIndex: 1,
          explanation: "E2E tests simulate full user flows, making them slow to run and fragile when UI changes — so you use them sparingly for critical paths."
        },
        {
          question: "What happens when the testing pyramid is inverted?",
          options: [
            "Tests run faster",
            "Test suites become slow and brittle",
            "Code coverage increases",
            "Fewer bugs are found"
          ],
          correctIndex: 1,
          explanation: "An inverted pyramid (mostly E2E, few unit tests) means slow feedback loops, brittle tests, and long CI pipelines."
        }
      ]
    },
    {
      id: "unit-testing-patterns",
      title: "Unit Testing Patterns",
      body: `The **Arrange-Act-Assert (AAA)** pattern structures every test clearly. **Arrange** — set up the inputs and dependencies. **Act** — call the function under test. **Assert** — verify the output matches expectations.

**Test doubles** replace real dependencies with controlled substitutes. A **mock** records calls and lets you verify interactions ("was \`sendEmail\` called with these args?"). A **stub** returns canned responses ("always return this user object"). A **spy** wraps a real object and records calls while still executing the original behavior.

**Test isolation** means each test runs independently — no shared state between tests. Use setup/teardown hooks to reset state. If tests depend on each other, one failure cascades into false failures everywhere.

Good unit tests are fast (milliseconds), deterministic (same result every run), and focused (test one behavior). If a test is slow or flaky, it's probably an integration test in disguise.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph AAA["Arrange - Act - Assert"]
    Arrange["Arrange<br/>Set up inputs,<br/>create mocks"] --> Act["Act<br/>Call the function<br/>under test"] --> Assert["Assert<br/>Verify output<br/>matches expected"]
  end`,
        caption: "The AAA (Arrange-Act-Assert) pattern for structuring unit tests"
      },
      quiz: [
        {
          question: "What is the purpose of 'Arrange' in the AAA pattern?",
          options: [
            "Run the function being tested",
            "Set up inputs, dependencies, and test data",
            "Check the output",
            "Clean up after the test"
          ],
          correctIndex: 1,
          explanation: "Arrange is the setup phase where you prepare inputs, create mock objects, and configure the test environment."
        },
        {
          question: "What is the difference between a mock and a stub?",
          options: [
            "Mocks are faster than stubs",
            "Mocks verify interactions; stubs return canned data",
            "Stubs are only used in integration tests",
            "There is no difference"
          ],
          correctIndex: 1,
          explanation: "Mocks record and verify that certain calls were made (behavior verification). Stubs simply return predefined data (state verification)."
        },
        {
          question: "Why is test isolation important?",
          options: [
            "It makes tests run in parallel",
            "It prevents one test's failure from cascading to others",
            "It reduces code coverage",
            "It eliminates the need for assertions"
          ],
          correctIndex: 1,
          explanation: "When tests share state, a failure in one test can corrupt the state for subsequent tests, causing misleading cascading failures."
        }
      ]
    },
    {
      id: "integration-e2e",
      title: "Integration and E2E",
      body: `**Integration tests** verify that components work together — your API route handler correctly queries the database and returns the right response. They typically use a real (or containerized) database, actual HTTP calls, and real file I/O.

**E2E tests** simulate real user behavior through the entire application stack. Tools like **Cypress** and **Playwright** drive a real browser, clicking buttons, filling forms, and asserting on visible text. They catch issues that unit and integration tests miss — broken routing, CSS hiding a button, JavaScript errors on page load.

When to use each: integration tests for verifying service boundaries (API ↔ DB, service ↔ service). E2E tests for critical user journeys (sign up, checkout, onboarding flow). Both are slower than unit tests, so be selective.

**Jest** is the most common JavaScript test runner for unit and integration tests. **Playwright** is gaining traction for E2E testing due to its reliability and multi-browser support.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph Integration["Integration Test"]
    IT_Test["Test"] --> IT_API["API Route"]
    IT_API --> IT_DB["Real Database"]
    IT_DB --> IT_Assert["Assert Response"]
  end
  subgraph E2E["E2E Test"]
    E_Test["Test Script"] --> E_Browser["Automated Browser"]
    E_Browser --> E_App["Full Application"]
    E_App --> E_Server["Backend + DB"]
  end`,
        caption: "Integration test hitting a real DB; E2E test driving an automated browser"
      },
      quiz: [
        {
          question: "What makes integration tests slower than unit tests?",
          options: [
            "They test more code",
            "They involve real I/O (database, network, filesystem)",
            "They use more assertions",
            "They require more setup code"
          ],
          correctIndex: 1,
          explanation: "Integration tests hit real external systems (databases, APIs), which adds I/O latency compared to in-memory unit tests."
        },
        {
          question: "Which tool drives a real browser for E2E testing?",
          options: ["Jest", "Mocha", "Playwright", "ESLint"],
          correctIndex: 2,
          explanation: "Playwright (and Cypress) automate real browsers to simulate user interactions for end-to-end testing."
        },
        {
          question: "When should you write E2E tests?",
          options: [
            "For every function",
            "For critical user journeys like sign up and checkout",
            "Only in production",
            "Never — unit tests are sufficient"
          ],
          correctIndex: 1,
          explanation: "E2E tests are expensive, so focus them on the most critical user paths where failures have the highest impact."
        }
      ]
    },
    {
      id: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      body: `**Continuous Integration (CI)** means every code push triggers an automated pipeline: lint → test → build. If any step fails, the build is broken and the team is notified immediately. This catches bugs early, before they reach production.

**Continuous Delivery (CD)** extends CI by automatically deploying every successful build to a staging environment. **Continuous Deployment** goes further — successful builds deploy directly to production without manual approval.

A typical pipeline: 1) **Commit** — developer pushes code. 2) **Lint** — static analysis catches style and syntax issues. 3) **Test** — unit, integration, and E2E tests run. 4) **Build** — the app is compiled/bundled. 5) **Deploy** — the artifact is shipped to staging or production.

**Feature flags** let you deploy code with new features disabled, then gradually enable them for subsets of users. This decouples deployment from release.

**Blue/green deployment**: run two identical environments (blue = current, green = new). Route traffic to green once verified; roll back to blue if issues arise. Zero-downtime deploys.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  Commit["Commit"] --> Lint["Lint<br/>ESLint, Prettier"]
  Lint --> Test["Test<br/>Unit + Integration"]
  Test --> Build["Build<br/>Compile & Bundle"]
  Build --> Deploy["Deploy<br/>Staging / Prod"]
  Deploy --> Monitor["Monitor<br/>Logs & Alerts"]`,
        caption: "CI/CD pipeline stages: commit → lint → test → build → deploy → monitor"
      },
      quiz: [
        {
          question: "What is the primary goal of Continuous Integration?",
          options: [
            "Deploy to production faster",
            "Catch bugs early by running automated checks on every push",
            "Eliminate the need for testing",
            "Reduce the number of developers needed"
          ],
          correctIndex: 1,
          explanation: "CI automatically runs linting, tests, and builds on every code push, catching issues before they accumulate."
        },
        {
          question: "What are feature flags used for?",
          options: [
            "Identifying bugs in production",
            "Deploying code with features disabled, enabling them gradually",
            "Flagging deprecated APIs",
            "Marking tests as skipped"
          ],
          correctIndex: 1,
          explanation: "Feature flags let you separate deployment from release — deploy new code but only enable features for specific users or percentages."
        },
        {
          question: "How does blue/green deployment achieve zero downtime?",
          options: [
            "By deploying faster",
            "By running two environments and switching traffic after verification",
            "By using smaller servers",
            "By caching all responses"
          ],
          correctIndex: 1,
          explanation: "Blue/green runs two identical environments — traffic switches to the new one only after it's verified, with instant rollback if needed."
        }
      ]
    }
  ],
  summary: [
    "The testing pyramid: many unit tests (fast), fewer integration tests, even fewer E2E tests (slow but high confidence)",
    "Use AAA (Arrange-Act-Assert) to structure tests; use mocks/stubs/spies for isolation",
    "Integration tests verify component boundaries; E2E tests simulate real user journeys",
    "CI runs lint → test → build on every push; CD extends this to automatic deployment",
    "Feature flags decouple deployment from release; blue/green enables zero-downtime deploys"
  ],
  furtherReading: [
    { label: "Martin Fowler — Testing Pyramid", url: "https://martinfowler.com/bliki/TestPyramid.html" },
    { label: "Playwright Documentation", url: "https://playwright.dev/" },
    { label: "GitHub Actions — CI/CD Guide", url: "https://docs.github.com/en/actions" }
  ]
};
