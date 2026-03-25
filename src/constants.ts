import { Course, Achievement, LiveSession, Resource } from "./types";

export const COURSES: Course[] = [
  {
    id: "ds-1",
    title: "Advanced Distributed Systems",
    description: "Mastering consensus algorithms and fault tolerance.",
    longDescription: "A comprehensive deep-dive into the theory and practice of distributed systems. From the foundations of logical clocks to the cutting edge of Byzantine fault tolerance, this course equips senior engineers with the architectural intuition needed to design systems that scale, heal, and endure.",
    progress: 68,
    totalLessons: 18,
    completedLessons: 12,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
    category: "Systems Architecture",
    difficulty: "Advanced",
    rating: 4.9,
    reviews: 1200,
    price: 89,
    instructor: {
      name: "Dr. Julian Voss",
      title: "Principal Systems Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
    },
    duration: "24 hours",
    prerequisites: ["Basic networking concepts", "Operating systems fundamentals", "Familiarity with at least one systems language (Go, Rust, C++)"],
    objectives: [
      "Define and analyze the CAP theorem and its practical implications",
      "Implement consensus algorithms (Paxos, Raft) from first principles",
      "Design fault-tolerant distributed architectures",
      "Understand Byzantine Fault Tolerance and its applications",
      "Build and reason about distributed state machines",
      "Apply formal verification techniques to distributed protocols"
    ],
    modules: [
      {
        id: "ds-1-m1",
        title: "Foundations of Distribution",
        lessons: [
          { id: "ds-1-m1-l1", title: "Introduction to Distributed Systems", duration: "45 min", type: "video", completed: true },
          { id: "ds-1-m1-l2", title: "The Fallacies of Distributed Computing", duration: "30 min", type: "reading", completed: true },
          { id: "ds-1-m1-l3", title: "Models & Assumptions", duration: "40 min", type: "video", completed: true },
          { id: "ds-1-m1-l4", title: "Foundation Check", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: "ds-1-m2",
        title: "Time, Order & Causality",
        lessons: [
          { id: "ds-1-m2-l1", title: "Physical vs. Logical Clocks", duration: "50 min", type: "video", completed: true },
          { id: "ds-1-m2-l2", title: "Lamport Timestamps & Vector Clocks", duration: "45 min", type: "video", completed: true },
          { id: "ds-1-m2-l3", title: "Causal Ordering Lab", duration: "60 min", type: "lab", completed: true },
          { id: "ds-1-m2-l4", title: "Ordering Concepts Check", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: "ds-1-m3",
        title: "Basic Network Protocols",
        lessons: [
          { id: "ds-1-m3-l1", title: "Gossip Protocols & Epidemic Algorithms", duration: "40 min", type: "video", completed: true },
          { id: "ds-1-m3-l2", title: "Reliable Broadcast", duration: "35 min", type: "video", completed: true },
          { id: "ds-1-m3-l3", title: "Protocol Verification with TLA+", duration: "55 min", type: "lab", completed: true },
          { id: "ds-1-m3-l4", title: "Protocol Design Check", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: "ds-1-m4",
        title: "Advanced Consensus",
        lessons: [
          { id: "ds-1-m4-l1", title: "Byzantine Fault Tolerance & Consensus", duration: "45 min", type: "video" },
          { id: "ds-1-m4-l2", title: "Proof of Stake vs. Proof of Work", duration: "40 min", type: "video" },
          { id: "ds-1-m4-l3", title: "Paxos Deep Dive", duration: "55 min", type: "video" },
          { id: "ds-1-m4-l4", title: "The Raft Algorithm", duration: "50 min", type: "video" },
          { id: "ds-1-m4-l5", title: "Consensus Lab: Raft Implementation", duration: "90 min", type: "lab" },
          { id: "ds-1-m4-l6", title: "Consensus Check", duration: "20 min", type: "quiz" }
        ]
      }
    ]
  },
  {
    id: "cc-1",
    title: "Compiler Construction",
    description: "Building a functional LLVM-based backend.",
    longDescription: "Walk through the entire compiler pipeline from lexical analysis to code generation. This course takes a hands-on approach, building a working compiler targeting LLVM IR. By the end, you will have implemented a complete language frontend with type checking, optimization passes, and machine code output.",
    progress: 42,
    totalLessons: 12,
    completedLessons: 5,
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800",
    category: "Language Engineering",
    difficulty: "Advanced",
    rating: 4.8,
    reviews: 850,
    price: 95,
    instructor: {
      name: "Dr. Alistair Vance",
      title: "Chief Architect, ScholarStack",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
    },
    duration: "18 hours",
    prerequisites: ["Data structures & algorithms", "C/C++ proficiency", "Understanding of automata theory"],
    objectives: [
      "Build a lexer and parser from scratch using recursive descent",
      "Construct and traverse Abstract Syntax Trees",
      "Implement semantic analysis and type checking",
      "Generate LLVM IR from a custom language",
      "Apply basic optimization passes",
      "Produce working machine code from source"
    ],
    modules: [
      {
        id: "cc-1-m1",
        title: "Lexical Analysis",
        lessons: [
          { id: "cc-1-m1-l1", title: "Tokens, Patterns & Regular Expressions", duration: "40 min", type: "video", completed: true },
          { id: "cc-1-m1-l2", title: "Building a Hand-Written Lexer", duration: "55 min", type: "lab", completed: true },
          { id: "cc-1-m1-l3", title: "Lexer Check", duration: "10 min", type: "quiz", completed: true }
        ]
      },
      {
        id: "cc-1-m2",
        title: "Parsing & AST Construction",
        lessons: [
          { id: "cc-1-m2-l1", title: "Context-Free Grammars", duration: "35 min", type: "video", completed: true },
          { id: "cc-1-m2-l2", title: "Recursive Descent Parsing", duration: "50 min", type: "video", completed: true },
          { id: "cc-1-m2-l3", title: "AST Design & Visitor Pattern", duration: "45 min", type: "video" },
          { id: "cc-1-m2-l4", title: "Parser Lab: Expressions", duration: "60 min", type: "lab" },
          { id: "cc-1-m2-l5", title: "Parsing Check", duration: "15 min", type: "quiz" }
        ]
      },
      {
        id: "cc-1-m3",
        title: "Semantic Analysis & Code Generation",
        lessons: [
          { id: "cc-1-m3-l1", title: "Type Systems & Type Checking", duration: "45 min", type: "video" },
          { id: "cc-1-m3-l2", title: "Introduction to LLVM IR", duration: "50 min", type: "video" },
          { id: "cc-1-m3-l3", title: "Code Generation Lab", duration: "70 min", type: "lab" },
          { id: "cc-1-m3-l4", title: "Final Project: End-to-End Compiler", duration: "120 min", type: "lab" }
        ]
      }
    ]
  },
  {
    id: "crypto-1",
    title: "Applied Cryptography",
    description: "Implementing zero-knowledge proofs in modern apps.",
    longDescription: "Explore the mathematical foundations and practical implementations of modern cryptographic systems. From symmetric ciphers to zero-knowledge proofs, this course bridges theory and application. You will implement real cryptographic protocols and understand the security properties they guarantee.",
    progress: 15,
    totalLessons: 14,
    completedLessons: 2,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    category: "Security",
    difficulty: "Advanced",
    rating: 4.9,
    reviews: 600,
    price: 112,
    instructor: {
      name: "Prof. Elena Rios",
      title: "Cryptography Research Lead",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100"
    },
    duration: "20 hours",
    prerequisites: ["Number theory basics", "Probability & statistics", "Programming in Python or Rust"],
    objectives: [
      "Understand symmetric and asymmetric cryptographic primitives",
      "Implement hash functions and MACs",
      "Build public-key encryption from first principles",
      "Design and verify zero-knowledge proof systems",
      "Analyze the security of real-world protocols (TLS, Signal)",
      "Apply cryptographic techniques to blockchain and decentralized systems"
    ],
    modules: [
      {
        id: "crypto-1-m1",
        title: "Cryptographic Foundations",
        lessons: [
          { id: "crypto-1-m1-l1", title: "History & Principles of Cryptography", duration: "35 min", type: "video", completed: true },
          { id: "crypto-1-m1-l2", title: "Symmetric Ciphers (AES, ChaCha20)", duration: "45 min", type: "video", completed: true },
          { id: "crypto-1-m1-l3", title: "Hash Functions & MACs", duration: "40 min", type: "video" },
          { id: "crypto-1-m1-l4", title: "Foundations Check", duration: "15 min", type: "quiz" }
        ]
      },
      {
        id: "crypto-1-m2",
        title: "Public-Key Cryptography",
        lessons: [
          { id: "crypto-1-m2-l1", title: "RSA from Number Theory", duration: "50 min", type: "video" },
          { id: "crypto-1-m2-l2", title: "Elliptic Curve Cryptography", duration: "55 min", type: "video" },
          { id: "crypto-1-m2-l3", title: "Digital Signatures Lab", duration: "60 min", type: "lab" },
          { id: "crypto-1-m2-l4", title: "Public-Key Check", duration: "15 min", type: "quiz" }
        ]
      },
      {
        id: "crypto-1-m3",
        title: "Zero-Knowledge Proofs & Applications",
        lessons: [
          { id: "crypto-1-m3-l1", title: "Interactive Proof Systems", duration: "45 min", type: "video" },
          { id: "crypto-1-m3-l2", title: "zk-SNARKs & zk-STARKs", duration: "55 min", type: "video" },
          { id: "crypto-1-m3-l3", title: "ZKP Implementation Lab", duration: "75 min", type: "lab" },
          { id: "crypto-1-m3-l4", title: "Protocol Analysis: TLS & Signal", duration: "40 min", type: "reading" },
          { id: "crypto-1-m3-l5", title: "Blockchain Cryptography", duration: "50 min", type: "video" },
          { id: "crypto-1-m3-l6", title: "Final Assessment", duration: "30 min", type: "quiz" }
        ]
      }
    ]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "a1",
    title: "Security Architect",
    date: "Earned Oct 2023",
    icon: "ShieldCheck",
    color: "bg-secondary-container text-secondary"
  },
  {
    id: "a2",
    title: "Kernel Contributor",
    date: "Earned Dec 2023",
    icon: "Terminal",
    color: "bg-primary-fixed text-primary"
  }
];

export const LIVE_SESSIONS: LiveSession[] = [
  {
    id: "l1",
    title: "Scaling Distributed Databases",
    time: "Tomorrow, 10:00 AM",
    instructor: "Dr. Julian Voss",
    status: "upcoming"
  },
  {
    id: "l2",
    title: "Zero-Trust Network Design",
    time: "Friday, 2:30 PM",
    instructor: "Deep Dive Workshop",
    status: "upcoming"
  }
];

export const RESOURCES: Resource[] = [
  {
    id: "r1",
    title: "Time, Clocks, and the Ordering of Events in a Distributed System",
    author: "Leslie Lamport",
    year: 1978,
    description: "Groundbreaking work on logical clocks and causality in systems without a physical global clock.",
    type: "Seminal Paper",
    citations: "14,820+",
    complexity: 3,
    readTime: "45 min"
  },
  {
    id: "r2",
    title: "The Raft Consensus Algorithm",
    author: "Diego Ongaro",
    year: 2014,
    description: "In search of an understandable consensus algorithm for replicated logs.",
    type: "Whitepaper",
    complexity: 2,
    readTime: "35 min"
  },
  {
    id: "r3",
    title: "The Byzantine Generals Problem",
    author: "Leslie Lamport, Robert Shostak, Marshall Pease",
    year: 1982,
    description: "The original formalization of agreement problems in the presence of faulty or malicious participants.",
    type: "Seminal Paper",
    citations: "8,400+",
    complexity: 3,
    readTime: "50 min"
  },
  {
    id: "r4",
    title: "Paxos Made Simple",
    author: "Leslie Lamport",
    year: 2001,
    description: "A simplified description of the Paxos algorithm for reaching consensus in asynchronous distributed systems.",
    type: "Whitepaper",
    citations: "4,200+",
    complexity: 2,
    readTime: "30 min"
  }
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find(c => c.id === id);
}

export function getLessonById(courseId: string, lessonId: string): { course: Course; module: import("./types").Module; lesson: import("./types").Lesson } | undefined {
  const course = getCourseById(courseId);
  if (!course) return undefined;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find(l => l.id === lessonId);
    if (lesson) return { course, module: mod, lesson };
  }
  return undefined;
}

export function getFirstIncompleteLessonId(course: Course): string | undefined {
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!lesson.completed) return lesson.id;
    }
  }
  return undefined;
}

export function getModuleProgress(mod: import("./types").Module): number {
  const completed = mod.lessons.filter(l => l.completed).length;
  return mod.lessons.length > 0 ? Math.round((completed / mod.lessons.length) * 100) : 0;
}
