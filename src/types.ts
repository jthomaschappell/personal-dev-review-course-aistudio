export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  image: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  reviews: number;
  price?: number;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  icon: string;
  color: string;
}

export interface LiveSession {
  id: string;
  title: string;
  time: string;
  instructor: string;
  status: "upcoming" | "live";
}

export interface Resource {
  id: string;
  title: string;
  author: string;
  year: number;
  description: string;
  type: "Seminal Paper" | "RFC" | "Whitepaper" | "Course";
  tag?: string;
  citations?: string;
  complexity?: number;
  readTime?: string;
  image?: string;
}
