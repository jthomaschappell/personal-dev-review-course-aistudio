import { CourseDay } from "../types";

export const day6: CourseDay = {
  day: 6,
  title: "Full-Stack Architecture Patterns",
  subtitle: "How modern full-stack apps are actually put together.",
  estimatedMinutes: 90,
  sections: [
    {
      id: "frontend-architecture",
      title: "Frontend Architecture",
      body: `**CSR (Client-Side Rendering)** — the server sends a bare HTML shell and a JavaScript bundle. The browser executes JS to render the UI. Fast transitions after initial load, but slow first paint and poor SEO (search engines see empty HTML).

**SSR (Server-Side Rendering)** — the server renders full HTML for each request. Fast first paint, good SEO, but every navigation triggers a full server round-trip. Frameworks like Next.js support SSR.

**SSG (Static Site Generation)** — pages are pre-rendered at build time. Fastest delivery (just HTML files from a CDN), great SEO, but content can only change at build time. Perfect for blogs and documentation.

**Hydration** is the process where CSR takes over after SSR delivers HTML — React attaches event listeners to the server-rendered markup, making it interactive.

**State management** ranges from local (useState, component-level) to global (Context API, Redux, Zustand). Keep state as local as possible; lift it only when multiple components need the same data. Global state adds complexity.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph Frontend["Frontend Rendering Strategies"]
    CSR["CSR<br/>JS renders in browser<br/>Slow first paint"]
    SSR["SSR<br/>Server renders HTML<br/>Fast first paint"]
    SSG["SSG<br/>Pre-built at deploy<br/>Fastest delivery"]
  end
  subgraph ComponentTree["Component State"]
    App["App (Global State)"] --> Page["Page (Route State)"]
    Page --> CompA["Component A<br/>(Local State)"]
    Page --> CompB["Component B<br/>(Local State)"]
  end`,
        caption: "CSR vs SSR vs SSG rendering; component tree with state hierarchy"
      },
      quiz: [
        {
          question: "What is the main drawback of Client-Side Rendering (CSR)?",
          options: [
            "It requires a powerful server",
            "Slow initial page load and poor SEO",
            "It can't handle user interactions",
            "It's incompatible with React"
          ],
          correctIndex: 1,
          explanation: "CSR delivers an empty HTML shell that requires JavaScript to render content — search engines may not index it, and users see a blank page until JS loads."
        },
        {
          question: "What is hydration in the context of SSR?",
          options: [
            "Caching the server response",
            "The process of React attaching event listeners to server-rendered HTML",
            "Sending CSS along with HTML",
            "Pre-loading images"
          ],
          correctIndex: 1,
          explanation: "After the server sends rendered HTML, the client-side React code 'hydrates' it by attaching interactivity (event handlers, state) to the existing markup."
        },
        {
          question: "When should you use Static Site Generation (SSG)?",
          options: [
            "For real-time data dashboards",
            "For content that changes infrequently, like blogs or docs",
            "For authenticated user-specific pages",
            "For highly dynamic e-commerce sites"
          ],
          correctIndex: 1,
          explanation: "SSG pre-renders pages at build time — ideal for content that doesn't change between builds, like blogs, docs, or marketing pages."
        }
      ]
    },
    {
      id: "backend-architecture",
      title: "Backend Architecture",
      body: `A well-structured backend separates concerns into **layers**. The most common pattern is the layered (or "clean") architecture:

**Routes** define URL endpoints and HTTP methods. They're the entry point — thin, containing minimal logic, just parsing the request and calling a controller.

**Controllers** handle request/response logic — validate input, call the appropriate service, format the response. They shouldn't contain business logic.

**Services** contain the core business logic — the rules, calculations, and workflows that make your app unique. They orchestrate operations across multiple repositories.

**Repositories** abstract data access. They handle database queries, hiding the ORM or raw SQL from the rest of the app. This makes it easy to swap databases or add caching.

**Dependency Injection (DI)** wires these layers together. Instead of a service creating its own repository, the repository is passed in (injected). This makes testing trivial — inject a mock repository instead of a real one.

**Middleware** intercepts requests before they reach routes — handling auth, logging, CORS, rate limiting. Think of it as a pipeline of pre/post-processing steps.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  Request["HTTP Request"] --> MW["Middleware<br/>(Auth, Logging, CORS)"]
  MW --> Route["Routes<br/>(URL → Controller)"]
  Route --> Controller["Controllers<br/>(Parse & Validate)"]
  Controller --> Service["Services<br/>(Business Logic)"]
  Service --> Repo["Repositories<br/>(Data Access)"]
  Repo --> DB["Database"]`,
        caption: "Layered backend: routes → controllers → services → repositories → DB"
      },
      quiz: [
        {
          question: "Which layer should contain business logic in a layered architecture?",
          options: ["Routes", "Controllers", "Services", "Repositories"],
          correctIndex: 2,
          explanation: "Services contain business logic — the domain rules and workflows. Controllers handle HTTP concerns, and repositories handle data access."
        },
        {
          question: "What does dependency injection enable?",
          options: [
            "Faster database queries",
            "Easy testing by swapping real dependencies with mocks",
            "Automatic error handling",
            "Runtime type checking"
          ],
          correctIndex: 1,
          explanation: "DI lets you inject dependencies from outside, so you can easily swap in mocks for testing without changing the class's code."
        },
        {
          question: "Where does middleware sit in the request pipeline?",
          options: [
            "After the response is sent",
            "Between the client and the route handler",
            "Inside the database",
            "Only in the frontend"
          ],
          correctIndex: 1,
          explanation: "Middleware intercepts requests before they reach the route handler, processing auth, logging, CORS, and other cross-cutting concerns."
        }
      ]
    },
    {
      id: "auth-patterns",
      title: "Auth Patterns",
      body: `**Session-based auth**: user logs in, server creates a session (stored in memory or DB) and sends a session ID cookie. On subsequent requests, the cookie is sent automatically, and the server looks up the session. Simple and secure, but sessions consume server memory and complicate horizontal scaling.

**JWT (JSON Web Token)** auth: user logs in, server creates a signed token containing user info (payload) and sends it to the client. The client includes the token in an Authorization header. The server verifies the signature without database lookup — stateless.

The tradeoff: JWTs can't be individually revoked (the server doesn't track them). **Refresh tokens** mitigate this: short-lived access tokens (15 min) + long-lived refresh tokens (7 days). When the access token expires, the client uses the refresh token to get a new one.

**OAuth** delegates authentication to a third-party provider (Google, GitHub). The flow: user clicks "Sign in with Google" → redirected to Google → authorizes → Google sends an auth code → your server exchanges it for tokens. You never handle the user's password.

**RBAC (Role-Based Access Control)** assigns roles (admin, editor, viewer) to users. Permissions are attached to roles, not individual users. Check: "Does this user's role have the 'edit:posts' permission?"`,
      diagram: {
        type: "mermaid",
        code: `sequenceDiagram
  participant Client
  participant Server
  participant Google as Google OAuth
  
  Note over Client,Server: JWT Flow
  Client->>Server: POST /login (email, password)
  Server-->>Client: JWT access token + refresh token
  Client->>Server: GET /api/data (Authorization: Bearer JWT)
  Server-->>Client: 200 OK + data
  
  Note over Client,Google: OAuth Flow
  Client->>Google: Redirect to Google consent
  Google-->>Client: Auth code
  Client->>Server: POST /auth/callback (code)
  Server->>Google: Exchange code for tokens
  Server-->>Client: Set session / JWT`,
        caption: "JWT login flow and simplified OAuth with Google"
      },
      quiz: [
        {
          question: "What is the main advantage of JWT over session-based auth?",
          options: [
            "JWTs are more secure",
            "JWTs are stateless — no server-side session storage needed",
            "JWTs never expire",
            "JWTs don't require HTTPS"
          ],
          correctIndex: 1,
          explanation: "JWTs contain all necessary info in the token itself, so the server doesn't need to maintain session state — enabling easy horizontal scaling."
        },
        {
          question: "Why are refresh tokens used alongside short-lived access tokens?",
          options: [
            "To speed up API calls",
            "To allow token renewal without re-login while limiting exposure window",
            "To store user preferences",
            "To enable offline access"
          ],
          correctIndex: 1,
          explanation: "Short-lived access tokens limit the damage if stolen. Refresh tokens let users get new access tokens without re-entering credentials."
        },
        {
          question: "In RBAC, permissions are attached to:",
          options: ["Individual users", "Roles", "API endpoints", "Databases"],
          correctIndex: 1,
          explanation: "RBAC assigns permissions to roles (admin, editor, viewer), and users are assigned roles — simplifying permission management."
        }
      ]
    },
    {
      id: "deployment-infrastructure",
      title: "Deployment and Infrastructure Basics",
      body: `**Containers (Docker)** package your app with all its dependencies into a portable, reproducible unit. A Dockerfile specifies the base image, installs dependencies, copies code, and defines the run command. Containers ensure "it works on my machine" extends to production.

**Environment variables** store configuration that varies between environments (dev, staging, prod): database URLs, API keys, feature flags. Never hardcode secrets in source code. Use \`.env\` files locally and secret managers (AWS Secrets Manager, Vault) in production.

The **12-Factor App** methodology defines principles for building cloud-native apps. Key factors: store config in the environment, treat backing services as attached resources, keep dev/prod parity, and scale by adding stateless processes.

A typical **cloud deployment**: CDN serves static assets → load balancer distributes traffic → stateless app servers process requests → managed database stores data → object storage (S3) holds uploads and media.

**Infrastructure as Code (IaC)** tools like Terraform define your infrastructure in version-controlled files, making deployments repeatable and auditable.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  Users["Users"] --> CDN["CDN<br/>(Static Assets)"]
  Users --> LB["Load Balancer"]
  LB --> App1["App Server<br/>(Container)"]
  LB --> App2["App Server<br/>(Container)"]
  App1 --> DB["Managed Database"]
  App2 --> DB
  App1 --> S3["Object Storage<br/>(S3)"]
  App2 --> S3`,
        caption: "Cloud deployment: CDN + load balancer + containers + managed DB + object storage"
      },
      quiz: [
        {
          question: "What problem does Docker solve?",
          options: [
            "Slow database queries",
            "Environment inconsistency between dev, staging, and production",
            "High memory usage",
            "Network latency"
          ],
          correctIndex: 1,
          explanation: "Docker packages your app with its dependencies into a container, ensuring it runs identically across all environments."
        },
        {
          question: "Where should secrets (API keys, DB passwords) be stored?",
          options: [
            "In the source code",
            "In environment variables or secret managers",
            "In the README",
            "In the database"
          ],
          correctIndex: 1,
          explanation: "Secrets should never be in source code. Use environment variables locally and secret managers (Vault, AWS Secrets Manager) in production."
        },
        {
          question: "What is the 12-Factor App principle about 'config'?",
          options: [
            "Config should be hardcoded for performance",
            "Config should be stored in the environment, not in code",
            "Config files should be encrypted",
            "Config should be in XML format"
          ],
          correctIndex: 1,
          explanation: "The 12-Factor App stores config in environment variables, keeping code and configuration separate for portability."
        }
      ]
    }
  ],
  summary: [
    "CSR for dynamic SPAs, SSR for SEO-critical pages, SSG for static content; hydration bridges SSR and client interactivity",
    "Layered backend: routes → controllers → services → repositories; dependency injection enables testability",
    "JWT is stateless auth; refresh tokens limit exposure; OAuth delegates auth to trusted providers",
    "Docker containerizes apps for consistency; environment variables keep secrets out of code",
    "12-Factor App principles guide cloud-native development; IaC makes deployments repeatable"
  ],
  furtherReading: [
    { label: "Next.js Documentation — Rendering", url: "https://nextjs.org/docs/app/building-your-application/rendering" },
    { label: "The Twelve-Factor App", url: "https://12factor.net/" },
    { label: "Docker — Getting Started", url: "https://docs.docker.com/get-started/" }
  ]
};
