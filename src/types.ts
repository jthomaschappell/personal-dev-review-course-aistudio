export interface Instructor {
  name: string;
  title: string;
  avatar: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "lab";
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  image: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  reviews: number;
  price?: number;
  instructor: Instructor;
  duration: string;
  modules: Module[];
  prerequisites: string[];
  objectives: string[];
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
