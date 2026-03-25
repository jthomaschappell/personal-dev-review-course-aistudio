import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Terminal, 
  Search, 
  Bell, 
  ShoppingCart, 
  Settings, 
  User as UserIcon,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  TrendingUp,
  CheckCircle2,
  Link as LinkIcon,
  PlayCircle,
  SkipForward,
  Volume2,
  Maximize,
  HelpCircle,
  FileText,
  LogOut,
  LogIn,
  BookMarked,
  Beaker,
  CircleDot
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useState, useEffect, useRef, createContext, useContext, useMemo } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  addDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { cn } from "./lib/utils";
import { COURSES, ACHIEVEMENTS, LIVE_SESSIONS, RESOURCES, getCourseById, getFirstIncompleteLessonId, getModuleProgress } from "./constants";
import type { Course, Module as ModuleType, Lesson as LessonType } from "./types";

// --- Firebase Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Auth Context ---

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Helpers ---

const lessonTypeIcon = (type: LessonType["type"]) => {
  switch (type) {
    case "video": return <PlayCircle size={14} />;
    case "reading": return <BookMarked size={14} />;
    case "quiz": return <HelpCircle size={14} />;
    case "lab": return <Beaker size={14} />;
  }
};

// --- Scholar Assistant ---

const ScholarAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Greetings, Scholar. I am your architectural assistant. How can I help you navigate these complex systems today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user || !isOpen) return;

    const path = `users/${user.uid}/chat_history`;
    const q = query(collection(db, path), orderBy("timestamp", "asc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        role: doc.data().role as "user" | "ai",
        text: doc.data().text
      }));
      if (history.length > 0) {
        setMessages(history);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [user, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    
    if (user) {
      const path = `users/${user.uid}/chat_history`;
      try {
        await addDoc(collection(db, path), {
          uid: user.uid,
          role: "user",
          text: userMsg,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else {
      setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    }

    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a world-class computer science architect and professor. 
        Answer the following question from a graduate student with technical precision and architectural clarity.
        Question: ${userMsg}`,
      });
      
      const aiMsg = response.text || "I apologize, I could not process that logic.";
      
      if (user) {
        const path = `users/${user.uid}/chat_history`;
        await addDoc(collection(db, path), {
          uid: user.uid,
          role: "ai",
          text: aiMsg,
          timestamp: serverTimestamp()
        });
      } else {
        setMessages(prev => [...prev, { role: "ai", text: aiMsg }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Connection to the knowledge base interrupted. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!user) {
      setMessages([{ role: "ai", text: "Greetings, Scholar. I am your architectural assistant. How can I help you navigate these complex systems today?" }]);
      return;
    }

    const path = `users/${user.uid}/chat_history`;
    try {
      const snapshot = await getDocs(collection(db, path));
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, path, d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-96 h-[500px] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden"
          >
            <div className="p-4 primary-gradient text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">Scholar Assistant</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-80">Architectural Logic Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearHistory}
                  title="Clear History"
                  className="hover:bg-white/10 p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 p-4 overflow-auto space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-xl text-sm leading-relaxed",
                    m.role === "user" 
                      ? "bg-primary text-on-primary rounded-tr-none" 
                      : "bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/10"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold animate-pulse">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Synthesizing logic...</span>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/10 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about architectural patterns..."
                className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleSend} className="p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity">
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full primary-gradient text-on-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform relative group"
      >
        <GraduationCap size={28} />
        <div className="absolute -top-12 right-0 bg-on-surface text-surface text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Consult the Architect
        </div>
      </button>
    </div>
  );
};

// --- Shell Components ---

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, label: "Catalog", path: "/catalog" },
    { icon: FileText, label: "Library", path: "/library" },
    { icon: GraduationCap, label: "My Modules", path: "/modules" },
    { icon: Terminal, label: "Workspace", path: "/workspace" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low flex flex-col p-6 gap-y-2 z-40 hidden md:flex">
      <Link to="/" className="mb-10 px-2 block">
        <h1 className="text-xl font-black tracking-tighter text-on-surface">ScholarStack</h1>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">Architectural Scholar</p>
      </Link>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/dashboard" && location.pathname === "/dashboard") ||
            (item.path === "/modules" && location.pathname.startsWith("/lesson"));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 font-semibold text-sm",
                isActive 
                  ? "bg-surface-container-lowest text-primary shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-lowest/50 hover:translate-x-1"
              )}
            >
              <item.icon size={18} fill={isActive ? "currentColor" : "none"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 bg-surface-container-high/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden">
            <img 
              src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"} 
              alt="Scholar Identity" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">{user?.displayName || "Guest Scholar"}</p>
            <p className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">Senior Architect</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header = () => {
  const { user, signIn, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full glass-header flex items-center justify-between px-8 py-4 shadow-[0_12px_32px_rgba(62,0,171,0.04)]">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black tracking-tighter text-on-surface md:hidden">ScholarStack</Link>
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/catalog" className="text-on-surface-variant font-medium hover:text-primary transition-all">Catalog</Link>
          <Link to="/library" className="text-on-surface-variant font-medium hover:text-primary transition-all">Library</Link>
          <Link to="/dashboard" className="text-primary font-bold border-b-2 border-primary pb-1">My Learning</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
          />
        </div>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
          <Bell size={20} />
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
          <ShoppingCart size={20} />
        </button>
        
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/10">
              <img 
                src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} 
                alt="User Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={logout}
              className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={signIn}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-surface-container-low w-full py-12 px-8 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-1">
          <span className="font-bold text-on-surface text-xl">ScholarStack</span>
          <p className="text-xs text-on-surface-variant mt-4 leading-relaxed uppercase tracking-widest font-medium">
            Defining the standard for high-level computer science education for the architectural mind.
          </p>
        </div>
        <div>
          <h5 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-on-surface">Resources</h5>
          <ul className="space-y-2">
            <li><Link to="/library" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link to="/library" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Whitepapers</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-on-surface">Community</h5>
          <ul className="space-y-2">
            <li><a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Forums</a></li>
            <li><a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Scholarship</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-on-surface">Legal</h5>
          <ul className="space-y-2">
            <li><a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Privacy</a></li>
            <li><a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/10">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          &copy; 2024 ScholarStack. Designed for the Architectural Scholar.
        </p>
      </div>
    </footer>
  );
};

// --- Pages ---

const Dashboard = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (doc) => {
      if (doc.exists()) {
        setUserProgress(doc.data().progress || {});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsubscribe;
  }, [user]);

  const coursesWithProgress = useMemo(() => COURSES.map(course => ({
    ...course,
    progress: userProgress[course.id] ?? course.progress,
    completedLessons: Math.floor(((userProgress[course.id] ?? course.progress) / 100) * course.totalLessons)
  })), [userProgress]);

  const activeCourses = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const totalCompletedLessons = coursesWithProgress.reduce((sum, c) => sum + c.completedLessons, 0);
  const totalLessons = coursesWithProgress.reduce((sum, c) => sum + c.totalLessons, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-on-surface">Welcome back, {user?.displayName?.split(' ')[0] || 'Scholar'}.</h2>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Your architectural journey continues. You have {activeCourses.length} active {activeCourses.length === 1 ? 'module' : 'modules'} and {totalCompletedLessons} of {totalLessons} lessons completed.
        </p>
      </div>

      <section>
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-2xl font-bold tracking-tight">My Courses</h3>
          <Link to="/catalog" className="text-primary font-bold text-sm hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithProgress.map((course) => {
            const nextLesson = getFirstIncompleteLessonId(course);
            return (
              <Link 
                key={course.id}
                to={nextLesson ? `/lesson/${course.id}/${nextLesson}` : `/lesson/${course.id}`}
                className="group bg-surface-container-lowest rounded-xl p-5 hover:shadow-[0_12px_32px_rgba(62,0,171,0.04)] transition-all duration-300 border border-transparent hover:border-outline-variant/15"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 relative">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                    {course.progress === 100 ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{course.category}</span>
                  <span className="text-[10px] text-on-surface-variant">&middot;</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{course.difficulty}</span>
                </div>
                <h4 className="text-lg font-bold mb-1">{course.title}</h4>
                <p className="text-sm text-on-surface-variant mb-2">{course.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <img src={course.instructor.avatar} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <span className="text-xs text-on-surface-variant font-medium">{course.instructor.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>{course.progress}% Complete</span>
                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                  </div>
                  <div className="h-1 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all duration-1000" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Recommended Topics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-surface-container-low flex flex-col justify-between border-l-4 border-primary group hover:bg-surface-container-high transition-colors">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Advanced Logic</span>
                <h5 className="text-lg font-bold mb-2">Category Theory for CS</h5>
                <p className="text-sm text-on-surface-variant">Deepen your understanding of functional programming abstractions.</p>
              </div>
              <button className="mt-6 flex items-center gap-2 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                Explore Module <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-6 rounded-xl bg-surface-container-low flex flex-col justify-between border-l-4 border-secondary group hover:bg-surface-container-high transition-colors">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">Performance</span>
                <h5 className="text-lg font-bold mb-2">eBPF Observability</h5>
                <p className="text-sm text-on-surface-variant">Master kernel-level tracing and performance analysis for Linux.</p>
              </div>
              <button className="mt-6 flex items-center gap-2 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                Explore Module <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="bg-primary-container/5 rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10 max-w-md">
              <h4 className="text-2xl font-bold mb-4">Deep Dive: Quantum Computing</h4>
              <p className="text-on-surface-variant mb-6">A new session has been added based on your interest in complexity theory.</p>
              <button className="px-6 py-3 primary-gradient text-on-primary rounded-lg font-bold text-sm shadow-lg active:scale-95 transition-transform">Enroll Now</button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-6">Achievements</h3>
            <div className="space-y-4">
              {ACHIEVEMENTS.map((ach) => (
                <div key={ach.id} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-sm">
                  <div className={cn("w-12 h-12 flex items-center justify-center rounded-full", ach.color)}>
                    {ach.icon === "ShieldCheck" ? <ShieldCheck size={24} /> : <Terminal size={24} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{ach.title}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{ach.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-secondary" />
              Upcoming Live
            </h3>
            <div className="space-y-6">
              {LIVE_SESSIONS.map((session) => (
                <div key={session.id} className="relative pl-6 border-l-2 border-primary/20">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary"></div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{session.time}</p>
                  <h6 className="text-sm font-bold">{session.title}</h6>
                  <p className="text-xs text-on-surface-variant">{session.instructor}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

const ModulesPage = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        setUserProgress(docSnap.data().progress || {});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsubscribe;
  }, [user]);

  const enrolledCourses = useMemo(() => COURSES.map(course => ({
    ...course,
    progress: userProgress[course.id] ?? course.progress,
    completedLessons: Math.floor(((userProgress[course.id] ?? course.progress) / 100) * course.totalLessons)
  })), [userProgress]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div>
        <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">My Learning</span>
        <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-4">Enrolled Modules</h1>
        <p className="text-on-surface-variant leading-relaxed max-w-2xl">Track your progress across all enrolled courses. Each module contains structured lessons with video lectures, readings, hands-on labs, and knowledge checks.</p>
      </div>

      <div className="space-y-6">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{course.category}</span>
                  <span className="text-[10px] text-on-surface-variant">&middot;</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{course.duration}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-on-surface-variant mb-4">{course.description}</p>
                <div className="flex items-center gap-3 mb-4">
                  <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <span className="text-xs font-medium text-on-surface-variant">{course.instructor.name} &middot; {course.instructor.title}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>{course.progress}% Complete</span>
                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                  </div>
                  <div className="h-2 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-1000 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {course.modules.map((mod) => {
                    const modProgress = getModuleProgress(mod);
                    const completedCount = mod.lessons.filter(l => l.completed).length;
                    return (
                      <div key={mod.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                        <div className="flex items-center gap-3">
                          {modProgress === 100 ? (
                            <CheckCircle2 size={16} className="text-secondary" />
                          ) : modProgress > 0 ? (
                            <CircleDot size={16} className="text-primary" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-outline-variant" />
                          )}
                          <span className="text-sm font-semibold">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{completedCount}/{mod.lessons.length}</span>
                          <Link 
                            to={`/lesson/${course.id}/${mod.lessons.find(l => !l.completed)?.id || mod.lessons[0].id}`}
                            className="text-primary text-xs font-bold hover:underline"
                          >
                            {modProgress === 100 ? 'Review' : modProgress > 0 ? 'Continue' : 'Start'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = [...new Set(COURSES.map(c => c.category))];
  const filteredCourses = selectedCategory 
    ? COURSES.filter(c => c.category === selectedCategory) 
    : COURSES;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <section className="mb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">The Scholar's Path</span>
            <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter leading-none mb-6">
              Master the Architecture of Computation.
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed opacity-80">
              Deep-dive review modules designed for advanced graduates. Precision-engineered content covering the most complex paradigms in modern computing.
            </p>
          </div>
          <Link to="/modules" className="px-8 py-4 rounded-lg primary-gradient text-white font-bold text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20 text-center">
            My Modules
          </Link>
        </div>
      </section>

      <div className="flex items-center gap-3 flex-wrap">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-bold transition-all",
            !selectedCategory ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          )}
        >
          All Courses
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold transition-all",
              selectedCategory === cat ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-[0_20px_40px_rgba(62,0,171,0.06)] transition-all">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent"></div>
              <div className="absolute top-3 left-3 bg-surface-container-lowest/90 text-on-surface text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                {course.difficulty}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{course.category}</span>
                <div className="flex items-center gap-1 text-on-surface-variant text-xs font-medium">
                  <Star size={12} className="text-secondary fill-secondary" />
                  <span>{course.rating}</span>
                  <span className="text-on-surface-variant/50">({course.reviews})</span>
                </div>
              </div>
              <h4 className="text-lg font-bold text-on-surface mb-2">{course.title}</h4>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">{course.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                <span className="text-xs text-on-surface-variant">{course.instructor.name}</span>
                <span className="text-xs text-on-surface-variant">&middot;</span>
                <span className="text-xs text-on-surface-variant">{course.duration}</span>
                <span className="text-xs text-on-surface-variant">&middot;</span>
                <span className="text-xs text-on-surface-variant">{course.totalLessons} lessons</span>
              </div>
              <div className="pt-4 border-t border-surface-container-high flex justify-between items-center">
                <span className="text-sm font-black text-on-surface">${course.price}.00</span>
                <Link to={`/lesson/${course.id}`} className="text-primary text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">Preview</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const Library = () => {
  const [search, setSearch] = useState("");
  const filteredResources = RESOURCES.filter(res => 
    res.title.toLowerCase().includes(search.toLowerCase()) ||
    res.author.toLowerCase().includes(search.toLowerCase()) ||
    res.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-secondary font-bold text-sm tracking-widest uppercase mb-4 block">Knowledge Base</span>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-4">Seminal Works Archive</h1>
          <p className="text-on-surface-variant leading-relaxed">Access the foundational papers and technical specifications that defined modern computer science.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="Search archive..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-bold text-sm border border-outline-variant/10">Filter</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div key={res.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-secondary-container text-secondary text-[10px] font-bold uppercase tracking-widest rounded">{res.type}</span>
              <span className="text-xs font-mono text-on-surface-variant">{res.year}</span>
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-tight">{res.title}</h3>
            <p className="text-xs text-on-surface-variant font-bold mb-4 italic">By {res.author}</p>
            <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">{res.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-container-high">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase">
                  <FileText size={12} />
                  <span>{res.readTime}</span>
                </div>
                {res.citations && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase">
                    <TrendingUp size={12} />
                    <span>{res.citations} Citations</span>
                  </div>
                )}
              </div>
              <button className="text-primary hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredResources.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-on-surface-variant font-bold uppercase tracking-widest">No resources found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Workspace = () => {
  const { courseId = "cc-1" } = useParams();
  const { user } = useAuth();
  const course = getCourseById(courseId);

  const defaultCode = course 
    ? `// ${course.title}: Workspace\n// ${course.description}\n\n// Start coding here...\n`
    : `// Workspace\n// Select a course from My Modules to get started.\n`;

  const [code, setCode] = useState(defaultCode);

  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/workspace/${courseId}`;
    const loadCode = async () => {
      try {
        const docSnap = await getDoc(doc(db, path));
        if (docSnap.exists()) {
          setCode(docSnap.data().code);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };

    loadCode();
  }, [user, courseId]);

  useEffect(() => {
    setCode(defaultCode);
  }, [courseId]);

  const handleSave = async () => {
    if (!user) return;

    const path = `users/${user.uid}/workspace/${courseId}`;
    try {
      await setDoc(doc(db, path), {
        uid: user.uid,
        courseId: courseId,
        code: code,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[calc(100vh-12rem)] flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course ? course.title : "Workspace"}</h1>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">
            {course ? `${course.category} · ${course.difficulty}` : "Select a course to begin"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-colors"
          >
            Save Draft
          </button>
          <button className="px-6 py-2 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg">Run Tests</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <div className="lg:col-span-8 bg-on-surface rounded-xl overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-surface-container-highest/10 px-4 py-2 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded text-[10px] font-mono text-white/80">
                <FileText size={12} />
                <span>main.{courseId === "cc-1" ? "cpp" : courseId === "crypto-1" ? "py" : "go"}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-mono text-white/40">
                <FileText size={12} />
                <span>tests.{courseId === "cc-1" ? "cpp" : courseId === "crypto-1" ? "py" : "go"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Settings size={14} />
              <HelpCircle size={14} />
            </div>
          </div>
          <div className="flex-1 p-6 font-mono text-sm overflow-auto scrollbar-hide text-white/90 leading-relaxed">
            <textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none scrollbar-hide"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          {course && (
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">Course Info</h3>
              <div className="flex items-center gap-3 mb-4">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-sm font-bold">{course.instructor.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{course.instructor.title}</p>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-on-surface leading-relaxed">
                  {course.modules.length} modules &middot; {course.totalLessons} lessons &middot; {course.duration}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex-1 bg-on-surface rounded-xl p-6 font-mono text-xs text-secondary overflow-auto shadow-inner">
            <div className="flex items-center gap-2 mb-4 text-white/40 border-b border-white/5 pb-2">
              <Terminal size={14} />
              <span className="uppercase tracking-widest font-bold">Terminal Output</span>
            </div>
            <p className="mb-1 text-white/60">[info] Ready. Waiting for input...</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-primary">scholar@stack:~/{courseId}$</span>
              <span className="w-2 h-4 bg-primary animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Quiz = ({ course }: { course: Course }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const quizData: Record<string, { question: string; options: string[]; correct: number; explanation: string; tlaSpec: string }> = {
    "ds-1": {
      question: "In the provided formal model, what is the primary consequence of a 'FailNode' event during a network partition?",
      options: [
        "The system remains available but may return stale data.",
        "The system halts all operations to ensure consistency.",
        "The system partitions into two independent sub-networks.",
        "The system uses a majority vote to elect a new leader."
      ],
      correct: 1,
      explanation: "Correct. In a CP (Consistent & Partition-tolerant) system, the network halts to prevent split-brain scenarios. This ensures that no conflicting states are committed.",
      tlaSpec: `---- MODULE NetworkVerification ----
EXTENDS Naturals, Sequences

VARIABLES network_state, messages

Next == 
  \\/ SendMessage
  \\/ ReceiveMessage
  \\/ FailNode

Spec == Init /\\ [][Next]_vars
================================`
    },
    "cc-1": {
      question: "Given the AST specification below, what happens when the parser encounters an unexpected token during expression parsing?",
      options: [
        "The parser silently skips the token and continues.",
        "The parser enters panic mode and synchronizes at the next statement boundary.",
        "The parser backtracks to the last valid production rule.",
        "The parser emits an error node in the AST and continues."
      ],
      correct: 1,
      explanation: "Correct. In panic-mode error recovery, the parser discards tokens until it finds a synchronization point (typically a statement delimiter like ';'), then resumes normal parsing. This prevents cascading errors.",
      tlaSpec: `---- MODULE ParserVerification ----
EXTENDS Naturals, Sequences

VARIABLES tokens, ast_stack, current

Parse ==
  \\/ MatchToken
  \\/ ReduceRule
  \\/ ErrorRecovery

Spec == Init /\\ [][Parse]_vars
================================`
    },
    "crypto-1": {
      question: "In the zero-knowledge proof model below, what property ensures the verifier learns nothing beyond the validity of the statement?",
      options: [
        "Soundness — a cheating prover cannot convince the verifier.",
        "Completeness — a valid proof is always accepted.",
        "Zero-knowledge — the interaction reveals no information beyond truth.",
        "Succinctness — the proof is shorter than the witness."
      ],
      correct: 2,
      explanation: "Correct. The zero-knowledge property guarantees that the verifier's view of the interaction can be simulated without the prover's secret, ensuring no information leakage beyond the validity of the statement.",
      tlaSpec: `---- MODULE ZKProofVerification ----
EXTENDS Naturals, Sequences

VARIABLES prover_state, verifier_state

Protocol ==
  \\/ ProverCommit
  \\/ VerifierChallenge
  \\/ ProverRespond

Spec == Init /\\ [][Protocol]_vars
================================`
    }
  };

  const quiz = quizData[course.id] || quizData["ds-1"];

  return (
    <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-6">
        <span className="px-2 py-1 bg-secondary-container text-secondary text-[10px] font-bold uppercase tracking-widest rounded">Knowledge Check</span>
        <h3 className="text-xl font-bold">{course.title}</h3>
      </div>
      <div className="bg-on-surface rounded-lg p-6 mb-8 font-mono text-sm text-white/80 overflow-hidden relative">
        <div className="absolute top-2 right-4 text-[10px] text-white/20 uppercase font-bold tracking-widest">TLA+ Model</div>
        <pre className="whitespace-pre-wrap">{quiz.tlaSpec}</pre>
      </div>
      <p className="text-on-surface font-bold mb-6">{quiz.question}</p>
      <div className="space-y-3">
        {quiz.options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => !submitted && setSelected(i)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-4",
              selected === i 
                ? "bg-primary/5 border-primary text-primary" 
                : "bg-surface-container-lowest border-outline-variant/10 hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0",
              selected === i ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-on-surface-variant"
            )}>
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-sm font-medium">{opt}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Question 1 of 5</p>
        <button 
          onClick={() => setSubmitted(true)}
          disabled={selected === null}
          className="px-8 py-3 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg disabled:opacity-50"
        >
          Submit Answer
        </button>
      </div>
      {submitted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-secondary/5 border-l-4 border-secondary rounded-r-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-secondary" />
            <p className="text-sm font-bold text-secondary">Architect's Insight</p>
          </div>
          <p className="text-sm text-on-surface leading-relaxed">{quiz.explanation}</p>
        </motion.div>
      )}
    </div>
  );
};

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = getCourseById(courseId || "");
  const [progress, setProgress] = useState(0);

  const currentLessonInfo = useMemo(() => {
    if (!course || !lessonId) return null;
    for (const mod of course.modules) {
      const idx = mod.lessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) return { module: mod, lesson: mod.lessons[idx], lessonIndex: idx };
    }
    return null;
  }, [course, lessonId]);

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title })));
  }, [course]);

  const currentFlatIndex = useMemo(() => {
    if (!lessonId) return 0;
    return allLessons.findIndex(l => l.id === lessonId);
  }, [allLessons, lessonId]);

  const currentLesson = currentLessonInfo?.lesson;
  const currentModule = currentLessonInfo?.module;

  useEffect(() => {
    if (!user || !course) return;
    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (doc) => {
      if (doc.exists()) {
        const userProgress = doc.data().progress || {};
        setProgress(userProgress[course.id] || 0);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return unsubscribe;
  }, [user, course]);

  const markComplete = async () => {
    if (!user || !course) return;
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, path);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentProgress = userSnap.data().progress || {};
        const newProgress = Math.min((currentProgress[course.id] || 0) + Math.ceil(100 / course.totalLessons), 100);
        await setDoc(userRef, {
          progress: {
            ...currentProgress,
            [course.id]: newProgress
          }
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }

    if (currentFlatIndex < allLessons.length - 1) {
      navigate(`/lesson/${course.id}/${allLessons[currentFlatIndex + 1].id}`);
    }
  };

  const goToPrevious = () => {
    if (!course || currentFlatIndex <= 0) return;
    navigate(`/lesson/${course.id}/${allLessons[currentFlatIndex - 1].id}`);
  };

  if (!course) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Link to="/catalog" className="text-primary font-bold hover:underline">Browse the catalog</Link>
      </motion.div>
    );
  }

  const displayLesson = currentLesson || (course.modules[0]?.lessons[0]);
  const displayModule = currentModule || course.modules[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2">
            <Link to="/modules" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">{course.title}</Link>
            <ChevronRight size={12} className="text-on-surface-variant" />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{displayModule?.title}</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">{displayLesson?.title || course.title}</h1>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium">
              <Clock size={14} />
              <span>{displayLesson?.duration || course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium">
              {lessonTypeIcon(displayLesson?.type || "video")}
              <span className="capitalize">{displayLesson?.type || "Video"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium">
              <TrendingUp size={14} />
              <span>{course.difficulty}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={goToPrevious}
            disabled={currentFlatIndex <= 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-highest text-primary font-bold hover:bg-surface-container-high transition-all disabled:opacity-40"
          >
            Previous
          </button>
          <button 
            onClick={markComplete}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg primary-gradient text-on-primary font-bold shadow-lg shadow-primary/20 transition-all"
          >
            {currentFlatIndex < allLessons.length - 1 ? "Next Lesson" : "Complete Course"}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="relative aspect-video bg-on-surface rounded-xl overflow-hidden shadow-2xl group">
            <img 
              src={course.image} 
              alt={displayLesson?.title || course.title} 
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 rounded-full bg-primary/90 text-on-primary flex items-center justify-center hover:scale-110 hover:bg-primary transition-all shadow-2xl">
                <PlayCircle size={40} fill="currentColor" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden relative">
                <div className="absolute h-full bg-secondary rounded-full" style={{ width: `${allLessons.length > 0 ? ((currentFlatIndex + 1) / allLessons.length) * 100 : 33}%` }}></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                  <PlayCircle size={20} className="cursor-pointer" />
                  <SkipForward size={20} className="cursor-pointer" />
                  <Volume2 size={20} className="cursor-pointer" />
                  <span className="text-xs font-medium font-mono">
                    Lesson {currentFlatIndex + 1} of {allLessons.length}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <span className="text-xs font-bold px-1.5 py-0.5 border border-white/40 rounded">HD</span>
                  <Settings size={20} className="cursor-pointer" />
                  <Maximize size={20} className="cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-2 shadow-sm">
            <div className="flex border-b border-surface-container-high px-4">
              <button className="px-6 py-4 text-sm font-bold text-primary border-b-2 border-primary">Course Overview</button>
              <button className="px-6 py-4 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Q&A</button>
              <button className="px-6 py-4 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Resources</button>
              <button className="px-6 py-4 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Notes</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="max-w-3xl">
                <h3 className="text-xl font-bold text-on-surface mb-4">About this course</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">{course.longDescription}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Key Learning Objectives</h4>
                    <ul className="space-y-2">
                      {course.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-on-surface font-medium">
                          <CheckCircle2 size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Prerequisites</h4>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-on-surface font-medium">
                          <LinkIcon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                          {prereq}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-surface-container-high">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">Instructor</h4>
                      <div className="flex items-center gap-3">
                        <img src={course.instructor.avatar} alt={course.instructor.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-sm font-bold">{course.instructor.name}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{course.instructor.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Quiz course={course} />
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface-container-low rounded-xl overflow-hidden sticky top-28">
            <div className="p-6 bg-surface-container flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-on-surface">Course Content</h2>
                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary-fixed rounded">{progress}% Complete</span>
              </div>
              <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full transition-all duration-500 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <div className="p-4 space-y-1 max-h-[60vh] overflow-auto scrollbar-hide">
              {course.modules.map((mod) => {
                const modProgress = getModuleProgress(mod);
                return (
                  <div key={mod.id}>
                    <div className="flex items-center justify-between mb-2 px-2 pt-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{mod.title}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant">{mod.lessons.filter(l => l.completed).length} / {mod.lessons.length}</span>
                    </div>
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === lessonId || (!lessonId && lesson.id === displayLesson?.id);
                      return (
                        <Link
                          key={lesson.id}
                          to={`/lesson/${course.id}/${lesson.id}`}
                          className={cn(
                            "p-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer block",
                            isActive
                              ? "bg-surface-container-lowest shadow-sm ring-1 ring-primary/10"
                              : "hover:bg-surface-container-high"
                          )}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {lesson.completed ? (
                              <CheckCircle2 size={18} className="text-secondary" />
                            ) : isActive ? (
                              <div className="w-[18px] h-[18px] rounded border-2 border-primary flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-primary rounded-sm"></div>
                              </div>
                            ) : (
                              <div className="w-[18px] h-[18px] rounded border-2 border-outline-variant"></div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className={cn(
                              "text-sm font-semibold leading-tight",
                              isActive ? "text-primary" : lesson.completed ? "text-on-surface-variant line-through" : "text-on-surface"
                            )}>{lesson.title}</p>
                            <div className="mt-1 flex items-center gap-2 text-on-surface-variant">
                              {lessonTypeIcon(lesson.type)}
                              <span className="text-[10px] font-bold uppercase tracking-widest">{lesson.duration}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Landing Page ---

const Landing = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-24 -mt-12"
    >
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.3em]">The Architectural Standard</span>
          <h1 className="text-6xl md:text-8xl font-black text-on-surface tracking-tighter leading-[0.9] max-w-4xl mx-auto">
            Master the Core Logic of <span className="text-primary">Computer Science.</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
            A premium editorial review platform for advanced graduates and systems architects. Precision-engineered curriculum for the modern scholar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/catalog" className="px-10 py-4 rounded-xl primary-gradient text-on-primary font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
              Begin Your Journey
            </Link>
            <Link to="/catalog" className="px-10 py-4 rounded-xl bg-surface-container-high text-on-surface font-bold text-lg hover:bg-surface-container-highest transition-colors">
              View Curriculum
            </Link>
          </div>
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center mb-6">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Foundational Rigor</h3>
          <p className="text-on-surface-variant leading-relaxed">We don't just teach tools; we teach the underlying logic that makes those tools possible. From kernel design to formal verification.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
            <Terminal size={24} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Architectural Clarity</h3>
          <p className="text-on-surface-variant leading-relaxed">Content designed for the visual and structural thinker. Every module is a blueprint for high-level systems engineering.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center mb-6">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Scholar-Led Learning</h3>
          <p className="text-on-surface-variant leading-relaxed">Learn from the architects of thought. Our instructors are industry veterans and academic pioneers in their respective fields.</p>
        </div>
      </section>

      <section className="px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">Featured Courses</span>
          <h2 className="text-4xl font-black tracking-tighter">Precision-Engineered Curriculum</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COURSES.map((course) => (
            <Link key={course.id} to={`/lesson/${course.id}`} className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-[0_20px_40px_rgba(62,0,171,0.06)] transition-all">
              <div className="h-48 overflow-hidden relative">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent"></div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{course.category}</span>
                  <span className="text-[10px] text-on-surface-variant">&middot;</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{course.modules.length} modules</span>
                </div>
                <h4 className="text-lg font-bold text-on-surface mb-2">{course.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">{course.description}</p>
                <div className="flex items-center gap-2">
                  <img src={course.instructor.avatar} alt={course.instructor.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <span className="text-xs text-on-surface-variant font-medium">{course.instructor.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-on-surface text-surface rounded-[2rem] p-12 md:p-20 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Architects of Thought.</h2>
            <p className="text-lg text-surface/70 leading-relaxed">
              "ScholarStack represents the next evolution in technical education. It bridges the gap between raw code and high-level architectural intuition."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                  alt="Dr. Alistair Vance" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="font-bold">Dr. Alistair Vance</p>
                <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Chief Architect, ScholarStack</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-white/5 rounded-2xl p-6 flex flex-col justify-between border border-white/10">
              <span className="text-4xl font-black text-primary">12k+</span>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Active Scholars</p>
            </div>
            <div className="aspect-square bg-white/5 rounded-2xl p-6 flex flex-col justify-between border border-white/10">
              <span className="text-4xl font-black text-secondary">
                {COURSES.reduce((sum, c) => sum + c.modules.length, 0)}+
              </span>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Deep-Dive Modules</p>
            </div>
            <div className="aspect-square bg-white/5 rounded-2xl p-6 flex flex-col justify-between border border-white/10">
              <span className="text-4xl font-black text-white">{RESOURCES.length}</span>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Seminal Papers</p>
            </div>
            <div className="aspect-square bg-white/5 rounded-2xl p-6 flex flex-col justify-between border border-white/10">
              <span className="text-4xl font-black text-primary-container">24/7</span>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Architect Support</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
      </section>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const path = `users/${firebaseUser.uid}`;
        try {
          const userRef = doc(db, path);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: "scholar",
              progress: {},
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in error", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      <Router>
        <div className="min-h-screen bg-surface flex">
          <Sidebar />
          <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
            <Header />
            <div className="p-8 md:p-12 max-w-7xl mx-auto w-full flex-1">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/workspace/:courseId" element={<Workspace />} />
                  <Route path="/lesson/:courseId" element={<LessonPage />} />
                  <Route path="/lesson/:courseId/:lessonId" element={<LessonPage />} />
                  <Route path="/modules" element={<ModulesPage />} />
                </Routes>
              </AnimatePresence>
            </div>
            <Footer />
          </main>
          <ScholarAssistant />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
