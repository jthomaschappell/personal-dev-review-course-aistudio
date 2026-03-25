import { CourseDay } from "../types";

export const day4: CourseDay = {
  day: 4,
  title: "System Design",
  subtitle: "Full-stack devs need to think beyond the function. Think at the service level.",
  estimatedMinutes: 90,
  sections: [
    {
      id: "client-server-rest",
      title: "Client-Server and REST",
      body: `The **client-server** model separates concerns: the client (browser, mobile app) handles presentation, the server handles data and business logic. Communication happens over HTTP.

**REST** (Representational State Transfer) is an architectural style for APIs. It uses standard HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE (remove). Resources are identified by URLs. Each request is **stateless** — the server doesn't remember previous requests; all context must be in the request itself.

The lifecycle: Browser sends a DNS lookup to resolve the domain, then sends an HTTP request to the server. The server processes it (often querying a database), constructs a response (usually JSON), and sends it back with a status code: 200 (OK), 201 (Created), 404 (Not Found), 500 (Internal Server Error).

REST's simplicity makes it the default for most web APIs. Its statelessness enables horizontal scaling — any server can handle any request.`,
      diagram: {
        type: "mermaid",
        code: `sequenceDiagram
  participant Browser
  participant DNS
  participant Server
  participant Database
  Browser->>DNS: Resolve domain
  DNS-->>Browser: IP address
  Browser->>Server: GET /api/users (HTTP)
  Server->>Database: SELECT * FROM users
  Database-->>Server: Rows
  Server-->>Browser: 200 OK + JSON payload`,
        caption: "Request/response lifecycle: browser → DNS → server → database → response"
      },
      quiz: [
        {
          question: "What does 'stateless' mean in the context of REST?",
          options: [
            "The server never stores data",
            "Each request must contain all information needed to process it",
            "The client has no state",
            "Cookies are not allowed"
          ],
          correctIndex: 1,
          explanation: "Stateless means the server doesn't store session context between requests — all required information must be included in each request."
        },
        {
          question: "Which HTTP verb is used to create a new resource?",
          options: ["GET", "POST", "PUT", "DELETE"],
          correctIndex: 1,
          explanation: "POST is the standard HTTP verb for creating new resources on the server."
        },
        {
          question: "Why does REST's statelessness help with scaling?",
          options: [
            "It reduces database size",
            "Any server can handle any request without shared session state",
            "It eliminates the need for load balancers",
            "It makes responses smaller"
          ],
          correctIndex: 1,
          explanation: "Since no server holds per-client state, requests can be routed to any server instance, enabling easy horizontal scaling."
        }
      ]
    },
    {
      id: "databases-sql-nosql",
      title: "Databases: SQL vs NoSQL",
      body: `**SQL databases** (PostgreSQL, MySQL) store data in tables with fixed schemas. Relationships are explicit (foreign keys). They enforce **ACID** properties: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes).

**NoSQL databases** (MongoDB, DynamoDB) store data as documents, key-value pairs, or wide-column stores. Schemas are flexible — documents in the same collection can have different fields. They trade strict consistency for scalability and speed.

**Indexing** makes queries fast by creating sorted lookup structures (B-trees, hash indexes). Without indexes, the database scans every row — O(n). With a proper index, lookups become O(log n).

The **N+1 problem**: when you query a list of 100 users and then make 100 individual queries for their orders, you've made 101 queries instead of 1-2. Use JOINs (SQL) or data embedding (NoSQL) to avoid it.

Choose SQL when data is relational and consistency matters. Choose NoSQL when schema flexibility and horizontal scaling are priorities.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph SQL["SQL (Normalized)"]
    Users["Users Table<br/>id | name | email"]
    Orders["Orders Table<br/>id | user_id | total"]
    Users -->|"FK: user_id"| Orders
  end
  subgraph NoSQL["NoSQL (Document)"]
    Doc["User Document<br/>{name, email,<br/> orders: [{total}, ...]}"]
  end`,
        caption: "Normalized SQL with foreign keys vs nested NoSQL document"
      },
      quiz: [
        {
          question: "What does ACID stand for?",
          options: [
            "Asynchronous, Concurrent, Isolated, Distributed",
            "Atomicity, Consistency, Isolation, Durability",
            "Automatic, Cached, Indexed, Deduplicated",
            "Aggregated, Computed, Integrated, Decoupled"
          ],
          correctIndex: 1,
          explanation: "ACID guarantees: Atomicity (all or nothing), Consistency (valid states), Isolation (no interference), Durability (data persists)."
        },
        {
          question: "What is the N+1 query problem?",
          options: [
            "Querying N tables plus 1 index",
            "Fetching a list and then making N additional queries for related data",
            "Having N+1 database connections",
            "A query that returns N+1 results"
          ],
          correctIndex: 1,
          explanation: "N+1 occurs when fetching a list (1 query) triggers N individual queries for related data — use JOINs or embedding to fix it."
        },
        {
          question: "Why are database indexes important?",
          options: [
            "They reduce storage size",
            "They turn O(n) full table scans into O(log n) lookups",
            "They enforce schema constraints",
            "They enable NoSQL features"
          ],
          correctIndex: 1,
          explanation: "Indexes create sorted data structures that allow the database to find rows in O(log n) instead of scanning every row."
        }
      ]
    },
    {
      id: "scalability-fundamentals",
      title: "Scalability Fundamentals",
      body: `**Vertical scaling** (scale up): add more CPU, RAM, or disk to a single server. Simple but has a ceiling — there's a maximum machine size, and it's a single point of failure.

**Horizontal scaling** (scale out): add more servers behind a **load balancer**. The load balancer distributes incoming requests across servers using strategies like round-robin, least connections, or IP hashing. This scales nearly infinitely and provides redundancy.

**Caching** stores frequently accessed data in a fast store (Redis, Memcached) to reduce database load. Cache invalidation — knowing when cached data is stale — is one of the hardest problems in CS.

**CDNs** (Content Delivery Networks) cache static assets (images, CSS, JS) at edge servers worldwide, reducing latency for geographically distributed users.

**Stateless services** are critical for horizontal scaling. If a server holds no session state, any server can handle any request. Store session data in Redis or a database, not in server memory.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  Client["Clients"] --> LB["Load Balancer"]
  LB --> S1["App Server 1"]
  LB --> S2["App Server 2"]
  LB --> S3["App Server 3"]
  S1 --> Cache["Redis Cache"]
  S2 --> Cache
  S3 --> Cache
  Cache --> DB["Database"]
  Client --> CDN["CDN<br/>(Static Assets)"]`,
        caption: "Horizontal scaling: load balancer → app servers → cache → database"
      },
      quiz: [
        {
          question: "What is the main advantage of horizontal scaling over vertical scaling?",
          options: [
            "It's cheaper per machine",
            "It has no ceiling and provides redundancy",
            "It's simpler to implement",
            "It doesn't require a load balancer"
          ],
          correctIndex: 1,
          explanation: "Horizontal scaling can add servers indefinitely and provides fault tolerance — if one server fails, others continue serving."
        },
        {
          question: "What does a CDN cache?",
          options: [
            "Database queries",
            "User sessions",
            "Static assets like images, CSS, and JavaScript",
            "API responses only"
          ],
          correctIndex: 2,
          explanation: "CDNs cache static content at edge servers worldwide, reducing latency by serving from locations near the user."
        },
        {
          question: "Why is cache invalidation considered difficult?",
          options: [
            "Caches are too small",
            "Knowing when cached data is stale requires careful coordination",
            "Caches don't support writes",
            "Cache invalidation is O(n²)"
          ],
          correctIndex: 1,
          explanation: "Determining exactly when to refresh or remove cached data without serving stale content or overloading the source is a classic hard problem."
        }
      ]
    },
    {
      id: "apis-microservices",
      title: "APIs and Microservices",
      body: `A **monolith** is a single deployable unit containing all functionality. Simple to start with, but as it grows, deployments become risky, scaling is all-or-nothing, and team autonomy suffers.

**Microservices** decompose the monolith into small, independently deployable services. Each service owns its domain (users, payments, notifications), has its own database, and communicates via APIs. Teams can deploy, scale, and update services independently.

An **API Gateway** sits in front of all services, handling routing, authentication, rate limiting, and protocol translation. The client talks to one endpoint; the gateway routes to the right service.

**REST vs GraphQL**: REST returns fixed response shapes per endpoint. GraphQL lets the client specify exactly which fields it needs in a single query — reducing over-fetching and the number of round trips. The tradeoff: GraphQL adds query complexity and caching challenges.

Service communication: **synchronous** (HTTP/gRPC for real-time needs) or **asynchronous** (message queues like Kafka/RabbitMQ for decoupled, resilient communication).`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph Monolith["Monolith"]
    M_All["All Features<br/>in One Codebase"]
  end
  subgraph Microservices["Microservices"]
    Client["Client"] --> GW["API Gateway"]
    GW --> US["User Service"]
    GW --> PS["Payment Service"]
    GW --> NS["Notification Service"]
    US --> UDB["Users DB"]
    PS --> PDB["Payments DB"]
    NS --> Q["Message Queue"]
  end`,
        caption: "Monolith vs microservices with API gateway and per-service databases"
      },
      quiz: [
        {
          question: "What is the main benefit of microservices over a monolith?",
          options: [
            "Lower latency",
            "Independent deployment, scaling, and team autonomy",
            "Less code overall",
            "No need for APIs"
          ],
          correctIndex: 1,
          explanation: "Microservices allow teams to deploy, scale, and update their services independently, improving agility and fault isolation."
        },
        {
          question: "What advantage does GraphQL have over REST?",
          options: [
            "It's faster at the network level",
            "Clients can request exactly the fields they need, reducing over-fetching",
            "It doesn't require a server",
            "It eliminates the need for a database"
          ],
          correctIndex: 1,
          explanation: "GraphQL lets clients specify their data requirements precisely, avoiding the over-fetching and under-fetching common with REST endpoints."
        },
        {
          question: "What is the role of an API Gateway?",
          options: [
            "To store all microservice data",
            "To route requests, handle auth, and rate limiting in front of services",
            "To replace the load balancer",
            "To compile microservices into a monolith"
          ],
          correctIndex: 1,
          explanation: "The API Gateway is a single entry point that handles cross-cutting concerns like routing, authentication, and rate limiting."
        }
      ]
    }
  ],
  summary: [
    "Client-server + REST: stateless HTTP with standard verbs, enabling horizontal scaling",
    "SQL for relational data with ACID guarantees; NoSQL for flexible schemas and horizontal scale",
    "Indexing turns O(n) scans into O(log n) lookups; avoid the N+1 query problem with JOINs or embedding",
    "Scale horizontally with load balancers and stateless services; use caching and CDNs for performance",
    "Microservices enable independent deployment; API gateways centralize cross-cutting concerns",
    "REST returns fixed shapes; GraphQL lets clients query exactly what they need"
  ],
  furtherReading: [
    { label: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
    { label: "MDN — HTTP Overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
    { label: "Martin Fowler — Microservices", url: "https://martinfowler.com/articles/microservices.html" }
  ]
};
