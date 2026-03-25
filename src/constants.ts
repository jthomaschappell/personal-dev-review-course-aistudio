import { Course, Achievement, LiveSession, Resource } from "./types";

export const COURSES: Course[] = [
  {
    id: "ds-1",
    title: "Advanced Distributed Systems",
    description: "Mastering consensus algorithms and fault tolerance.",
    progress: 68,
    totalLessons: 18,
    completedLessons: 12,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
    category: "Systems Arch",
    difficulty: "Advanced",
    rating: 4.9,
    reviews: 1200,
    price: 89
  },
  {
    id: "cc-1",
    title: "Compiler Construction",
    description: "Building a functional LLVM-based backend.",
    progress: 42,
    totalLessons: 12,
    completedLessons: 5,
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800",
    category: "Architecture",
    difficulty: "Advanced",
    rating: 4.8,
    reviews: 850,
    price: 95
  },
  {
    id: "crypto-1",
    title: "Applied Cryptography",
    description: "Implementing zero-knowledge proofs in modern apps.",
    progress: 15,
    totalLessons: 14,
    completedLessons: 2,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    category: "Security",
    difficulty: "Advanced",
    rating: 4.9,
    reviews: 600,
    price: 112
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
  }
];
