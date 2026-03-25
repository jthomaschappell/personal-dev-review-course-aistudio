import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  LogOut,
  ExternalLink
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useState, useEffect, useRef, createContext, useContext, useCallback, useMemo } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
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
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { cn } from "./lib/utils";
import { COURSE_DAYS, getCourseDay, getTotalSections, getDaySectionCounts } from "./course-data";
import {
  loadProgress,
  saveProgress,
  toggleSection,
  isSectionComplete,
  getDayProgress,
  getGlobalProgress,
  getCompletedDays,
  ProgressData
} from "./lib/progress";
import type { QuickCheckQuestion as QuickCheckQuestionType, DiagramBlockData, Section as SectionType } from "./types";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#ede7f6",
    primaryTextColor: "#3e00ab",
    primaryBorderColor: "#5624d0",
    lineColor: "#5624d0",
    secondaryColor: "#e0f2f1",
    tertiaryColor: "#f6f3f2",
    fontFamily: "Inter, sans-serif",
    fontSize: "13px",
  },
});

// --- Firebase Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
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
  };
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

// --- Progress Context ---

const ProgressContext = createContext<{
  progress: ProgressData;
  toggle: (day: number, sectionId: string) => void;
}>({ progress: {}, toggle: () => {} });

const useProgress = () => useContext(ProgressContext);

const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 420;
const SIDEBAR_DEFAULT_WIDTH = 256;
const SIDEBAR_COLLAPSE_THRESHOLD = 170;

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
      if (history.length > 0) setMessages(history);
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
        await addDoc(collection(db, path), { uid: user.uid, role: "user", text: userMsg, timestamp: serverTimestamp() });
      } catch (error) { handleFirestoreError(error, OperationType.CREATE, path); }
    } else {
      setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    }

    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a world-class computer science architect and professor. Answer the following question from a graduate student with technical precision and architectural clarity. Question: ${userMsg}`,
      });
      const aiMsg = response.text || "I apologize, I could not process that logic.";
      if (user) {
        const path = `users/${user.uid}/chat_history`;
        await addDoc(collection(db, path), { uid: user.uid, role: "ai", text: aiMsg, timestamp: serverTimestamp() });
      } else {
        setMessages(prev => [...prev, { role: "ai", text: aiMsg }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection to the knowledge base interrupted. Please try again." }]);
    } finally {
      setIsTyping(false);
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
            className="absolute bottom-20 right-0 w-96 h-[500px] bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_rgba(62,0,171,0.04)] flex flex-col overflow-hidden"
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
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 p-4 overflow-auto space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-xl text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-on-primary rounded-tr-none"
                      : "bg-surface-container-low text-on-surface rounded-tl-none"
                  )}>{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold animate-pulse">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <span>Synthesizing logic...</span>
                </div>
              )}
            </div>
            <div className="p-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about architectural patterns..."
                className="flex-1 bg-surface-container-low rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 border-none"
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

// --- Global Progress Bar ---

const GlobalProgressBar = () => {
  const { progress } = useProgress();
  const totalSections = getTotalSections();
  const globalPct = getGlobalProgress(progress, totalSections);

  return (
    <div className="w-full h-1 bg-surface-container-high">
      <motion.div
        className="h-full bg-secondary"
        initial={{ width: 0 }}
        animate={{ width: `${globalPct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

// --- Sidebar ---

const Sidebar = ({
  width,
  isResizing,
  onResizeStart,
}: {
  width: number;
  isResizing: boolean;
  onResizeStart: (event: ReactMouseEvent<HTMLDivElement>) => void;
}) => {
  const { progress } = useProgress();
  const location = useLocation();
  const dayCounts = getDaySectionCounts();

  const isHomePage = location.pathname === "/";
  const dayMatch = location.pathname.match(/^\/day\/(\d+)/);
  const activeDay = dayMatch ? parseInt(dayMatch[1]) : null;

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-surface-container-low flex flex-col p-6 gap-y-2 z-40 hidden md:flex"
      style={{ width: `${width}px` }}
    >
      <Link to="/" className="mb-8 px-2 block">
        <h1 className="text-xl font-black tracking-tighter text-on-surface">CS Review</h1>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">7-Day Full-Stack Refresher</p>
      </Link>

      <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-hide">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 font-semibold text-sm",
            isHomePage
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-lowest/50 hover:translate-x-1"
          )}
        >
          <BookOpen size={18} fill={isHomePage ? "currentColor" : "none"} />
          <span>Course Home</span>
        </Link>

        <div className="pt-4 pb-2 px-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Daily Modules</span>
        </div>

        {COURSE_DAYS.map((day) => {
          const isActive = activeDay === day.day;
          const pct = getDayProgress(progress, day.day, dayCounts[day.day]);
          const isComplete = pct === 100;

          return (
            <div key={day.day}>
              <Link
                to={`/day/${day.day}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 font-semibold text-sm group",
                  isActive
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-lowest/50 hover:translate-x-1"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black",
                  isComplete ? "bg-secondary text-white" : isActive ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                )}>
                  {isComplete ? <CheckCircle2 size={14} /> : day.day}
                </div>
                <span className="truncate flex-1">{day.title}</span>
                {pct > 0 && pct < 100 && (
                  <span className="text-[10px] text-on-surface-variant font-bold">{pct}%</span>
                )}
              </Link>
              {isActive && (
                <div className="ml-9 mt-1 space-y-0.5">
                  {day.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={cn(
                        "block py-1.5 px-3 text-xs rounded transition-colors",
                        isSectionComplete(progress, day.day, section.id)
                          ? "text-secondary font-bold"
                          : "text-on-surface-variant hover:text-primary"
                      )}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onMouseDown={onResizeStart}
        className={cn(
          "absolute top-0 right-0 h-full w-1.5 cursor-col-resize transition-colors",
          isResizing ? "bg-primary/30" : "hover:bg-primary/20"
        )}
      />
    </aside>
  );
};

// --- Header ---

const Header = ({
  showDesktopMenuButton,
  onDesktopMenuClick,
}: {
  showDesktopMenuButton: boolean;
  onDesktopMenuClick: () => void;
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const dayMatch = location.pathname.match(/^\/day\/(\d+)/);
  const activeDay = dayMatch ? parseInt(dayMatch[1]) : null;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return COURSE_DAYS
      .flatMap((day) =>
        day.sections.map((section) => ({
          day: day.day,
          dayTitle: day.title,
          sectionId: section.id,
          sectionTitle: section.title,
        }))
      )
      .filter(
        (entry) =>
          entry.sectionTitle.toLowerCase().includes(normalizedQuery) ||
          entry.dayTitle.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 8);
  }, [normalizedQuery]);

  return (
    <>
      <GlobalProgressBar />
      <header className="sticky top-0 z-50 w-full glass-header flex items-center justify-between px-6 py-3 shadow-[0_12px_32px_rgba(62,0,171,0.04)]">
        <div className="flex items-center gap-6">
          {showDesktopMenuButton && (
            <button
              type="button"
              onClick={onDesktopMenuClick}
              className="hidden md:inline-flex p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          <Link to="/" className="text-xl font-black tracking-tighter text-on-surface md:hidden">CS Review</Link>

          <div className="hidden lg:flex items-center gap-1">
            {COURSE_DAYS.map((day) => (
              <Link
                key={day.day}
                to={`/day/${day.day}`}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                  activeDay === day.day
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Day {day.day}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                window.setTimeout(() => setSearchQuery(""), 120);
              }}
              className="pl-10 pr-4 py-2 bg-surface-container-high rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-56 transition-all border-none"
            />
            {normalizedQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-lg overflow-hidden">
                {searchResults.length > 0 ? (
                  <ul className="max-h-72 overflow-auto py-1">
                    {searchResults.map((result) => (
                      <li key={`${result.day}-${result.sectionId}`}>
                        <Link
                          to={`/day/${result.day}#${result.sectionId}`}
                          onClick={() => setSearchQuery("")}
                          className="block px-3 py-2 hover:bg-surface-container-high transition-colors"
                        >
                          <p className="text-xs font-bold text-on-surface">{result.sectionTitle}</p>
                          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                            Day {result.day}: {result.dayTitle}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-2 text-xs text-on-surface-variant">No matching topics.</p>
                )}
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button onClick={logout} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}

          <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 bg-surface-container-lowest p-4 shadow-lg md:hidden"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {COURSE_DAYS.map((day) => (
                <Link
                  key={day.day}
                  to={`/day/${day.day}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeDay === day.day ? "bg-primary text-on-primary" : "text-on-surface-variant bg-surface-container-high"
                  )}
                >
                  Day {day.day}
                </Link>
              ))}
            </div>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-on-surface-variant hover:text-primary">
              Course Home
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Footer ---

const Footer = () => (
  <footer className="bg-surface-container-low w-full py-12 px-8 mt-20">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
      <div className="col-span-1">
        <span className="font-bold text-on-surface text-xl">CS Review</span>
        <p className="text-xs text-on-surface-variant mt-4 leading-relaxed uppercase tracking-widest font-medium">
          A 7-day full-stack CS refresher for graduates preparing for interviews.
        </p>
      </div>
      <div>
        <h5 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-on-surface">Resources</h5>
        <ul className="space-y-3">
          <li><a href="https://www.bigocheatsheet.com/" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Big-O Cheat Sheet</a></li>
          <li><a href="https://refactoring.guru/design-patterns" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Design Patterns</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-on-surface">Further Learning</h5>
        <ul className="space-y-3">
          <li><a href="https://neetcode.io/" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">NeetCode</a></li>
          <li><a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">freeCodeCamp</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-4 text-on-surface">Open Source</h5>
        <ul className="space-y-3">
          <li><a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">System Design Primer</a></li>
          <li><a href="https://roadmap.sh/backend" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Roadmap.sh</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
        © 2024 CS Review. Designed for the Architectural Scholar.
      </p>
    </div>
  </footer>
);

// --- Mermaid Diagram ---

const MermaidDiagram = ({ code, caption }: { code: string; caption?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return;
      try {
        const { svg } = await mermaid.render(idRef.current, code);
        containerRef.current.innerHTML = svg;
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Diagram rendering failed");
      }
    };
    render();
  }, [code]);

  return (
    <div className="my-8 rounded-xl bg-surface-container-lowest p-6 shadow-sm" role="img" aria-label={caption || "Diagram"}>
      {error ? (
        <pre className="text-xs font-mono text-on-surface-variant bg-surface-container-high rounded-lg p-4 overflow-x-auto">{code}</pre>
      ) : (
        <div ref={containerRef} className="flex justify-center overflow-x-auto [&_svg]:max-w-full" />
      )}
      {caption && (
        <p className="text-xs text-on-surface-variant text-center mt-4 font-medium italic">{caption}</p>
      )}
    </div>
  );
};

// --- Diagram Block ---

const DiagramBlock = ({ diagram }: { diagram: DiagramBlockData }) => {
  if (diagram.type === "mermaid") {
    return <MermaidDiagram code={diagram.code} caption={diagram.caption} />;
  }
  return (
    <div className="my-8 rounded-xl bg-surface-container-lowest p-6 shadow-sm" role="img" aria-label={diagram.caption || "Diagram"}>
      <div dangerouslySetInnerHTML={{ __html: diagram.code }} className="flex justify-center" />
      {diagram.caption && (
        <p className="text-xs text-on-surface-variant text-center mt-4 font-medium italic">{diagram.caption}</p>
      )}
    </div>
  );
};

// --- Quick Check ---

const QuickCheck = ({ questions, sectionTitle }: { questions: QuickCheckQuestionType[]; sectionTitle: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="my-6 rounded-xl bg-surface-container-low overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-high/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-secondary-container text-secondary text-[10px] font-bold uppercase tracking-widest rounded">Quick Check</span>
          <span className="text-sm font-bold text-on-surface">{sectionTitle}</span>
        </div>
        <ChevronDown size={18} className={cn("text-on-surface-variant transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">
              {finished ? (
                <div className="text-center py-8 space-y-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black",
                    score === questions.length ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                  )}>
                    {score}/{questions.length}
                  </div>
                  <p className="text-lg font-bold text-on-surface">
                    {score === questions.length ? "Perfect score!" : score >= questions.length / 2 ? "Good work!" : "Keep studying!"}
                  </p>
                  <button onClick={handleReset} className="px-6 py-2 rounded-lg bg-surface-container-high text-primary font-bold text-sm">
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                    Question {currentQ + 1} of {questions.length}
                  </p>
                  <p className="text-on-surface font-bold mb-6 leading-relaxed">{q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => !submitted && setSelected(i)}
                        disabled={submitted}
                        className={cn(
                          "w-full text-left p-4 rounded-lg transition-all flex items-center gap-4",
                          submitted && i === q.correctIndex
                            ? "bg-secondary/10 text-secondary ring-1 ring-secondary/30"
                            : submitted && i === selected && i !== q.correctIndex
                              ? "bg-error/10 text-error ring-1 ring-error/30"
                              : selected === i
                                ? "bg-primary/5 text-primary"
                                : "bg-surface-container-lowest hover:bg-surface-container-high text-on-surface"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          submitted && i === q.correctIndex
                            ? "bg-secondary text-white"
                            : selected === i
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant"
                        )}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm font-medium">{opt}</span>
                      </button>
                    ))}
                  </div>

                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-secondary/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-secondary" />
                        <p className="text-sm font-bold text-secondary">Explanation</p>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">{q.explanation}</p>
                    </motion.div>
                  )}

                  <div className="mt-6 flex justify-end">
                    {!submitted ? (
                      <button
                        onClick={handleSubmit}
                        disabled={selected === null}
                        className="px-6 py-2.5 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg disabled:opacity-50"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg flex items-center gap-2"
                      >
                        {currentQ < questions.length - 1 ? "Next Question" : "See Score"}
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Section Block ---

const SectionBlock = ({ section, day }: { section: SectionType; day: number }) => {
  const { progress, toggle } = useProgress();
  const complete = isSectionComplete(progress, day, section.id);

  const renderBody = (body: string) => {
    const parts = body.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-on-surface">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded text-primary">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <section id={section.id} className="scroll-mt-20">
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => toggle(day, section.id)}
          className={cn(
            "mt-1 w-6 h-6 rounded shrink-0 flex items-center justify-center transition-all",
            complete
              ? "bg-secondary text-white"
              : "bg-surface-container-high hover:bg-surface-container-highest"
          )}
          aria-label={complete ? "Mark incomplete" : "Mark complete"}
        >
          {complete && <CheckCircle2 size={16} />}
        </button>
        <h3 className={cn(
          "text-2xl font-bold tracking-tight",
          complete ? "text-on-surface-variant" : "text-on-surface"
        )}>
          {section.title}
        </h3>
      </div>

      <div className="pl-10 space-y-6">
        <div className="text-on-surface-variant leading-[1.6] text-base whitespace-pre-line">
          {section.body.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4">{renderBody(paragraph)}</p>
          ))}
        </div>

        {section.diagram && <DiagramBlock diagram={section.diagram} />}
        {section.quiz && section.quiz.length > 0 && (
          <QuickCheck questions={section.quiz} sectionTitle={section.title} />
        )}
      </div>
    </section>
  );
};

// --- Summary Box ---

const SummaryBox = ({ points }: { points: string[] }) => (
  <div className="rounded-xl bg-surface-container-low p-8 space-y-4">
    <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
      <ShieldCheck size={20} className="text-secondary" />
      Day Summary
    </h4>
    <ul className="space-y-3">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
          <span className="text-sm text-on-surface-variant leading-relaxed">{point}</span>
        </li>
      ))}
    </ul>
  </div>
);

// --- Further Reading ---

const FurtherReading = ({ links }: { links: { label: string; url: string }[] }) => (
  <div className="rounded-xl bg-surface-container-low p-8 space-y-4">
    <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
      <FileText size={20} className="text-primary" />
      Further Reading
    </h4>
    <ul className="space-y-3">
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-primary font-medium hover:underline group"
          >
            <ExternalLink size={14} className="shrink-0 text-on-surface-variant group-hover:text-primary transition-colors" />
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// --- Day Card (Home Page) ---

const DayCard = ({ day, progress: progressData }: { day: typeof COURSE_DAYS[0]; progress: ProgressData }) => {
  const dayCounts = getDaySectionCounts();
  const totalLessons = dayCounts[day.day] ?? day.sections.length;
  const dayKey = `day${day.day}`;
  const completedLessons = Object.values(progressData[dayKey] ?? {}).filter(Boolean).length;
  const pct = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const isComplete = pct === 100;
  const statusLabel = isComplete ? "COMPLETE" : "IN PROGRESS";
  const statusClass = isComplete ? "bg-secondary text-on-primary" : "bg-primary text-on-primary";

  const coverTheme = (() => {
    // Simple per-day color theme for the silhouette covers.
    switch (day.day) {
      case 1:
        return { bg: "bg-primary-fixed", fg: "text-primary" };
      case 2:
        return { bg: "bg-secondary-container", fg: "text-secondary" };
      case 3:
        return { bg: "bg-surface-container-high", fg: "text-primary" };
      case 4:
        return { bg: "bg-primary-container", fg: "text-on-primary" };
      case 5:
        return { bg: "bg-surface-container-highest", fg: "text-secondary" };
      case 6:
        return { bg: "bg-primary-fixed", fg: "text-secondary" };
      case 7:
        return { bg: "bg-secondary-container", fg: "text-primary" };
      default:
        return { bg: "bg-surface-container-high", fg: "text-primary" };
    }
  })();

  return (
    <Link
      to={`/day/${day.day}`}
      className="group bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-[0_12px_32px_rgba(62,0,171,0.04)] transition-shadow duration-300"
    >
      <div className="relative">
        <div className={cn("w-full h-28 md:h-32", coverTheme.bg)}>
          {/* Silhouette cover: simple “scholar” icon, styled as an editorial card cover. */}
          <svg
            viewBox="0 0 800 320"
            className={cn("w-full h-full", coverTheme.fg)}
            role="img"
            aria-label={`${day.title} cover`}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id={`g-${day.day}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.75" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="800" height="320" fill={`url(#g-${day.day})`} opacity="0.55" />

            {/* Head */}
            <circle cx="400" cy="105" r="42" fill="currentColor" opacity="0.9" />

            {/* Torso */}
            <path
              d="M290 285c25-85 75-135 110-150 35 15 85 65 110 150H290z"
              fill="currentColor"
              opacity="0.9"
            />

            {/* Book/board */}
            <path
              d="M260 220c0-18 14-32 32-32h216c18 0 32 14 32 32v74H260v-74z"
              fill="currentColor"
              opacity="0.18"
            />
            <path
              d="M292 228h216"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.38"
            />
            <path
              d="M320 255h160"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.26"
            />
            <path
              d="M330 85c-20 10-30 26-30 45"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.25"
            />
          </svg>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        <div className={cn(
          "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
          statusClass
        )}>
          {statusLabel}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{day.title}</h3>
          <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed mt-1">{day.subtitle}</p>
        </div>

        <div className="flex justify-between text-xs font-bold text-on-surface-variant">
          <span>{pct}% Complete</span>
          <span>{completedLessons}/{totalLessons} Lessons</span>
        </div>

        <div className="h-1 w-full bg-secondary-container rounded-full overflow-hidden">
          <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
};

// --- Landing / Home Page ---

const Landing = () => {
  const { progress } = useProgress();
  const totalSections = getTotalSections();
  const globalPct = getGlobalProgress(progress, totalSections);
  const dayCounts = getDaySectionCounts();
  const completedDays = getCompletedDays(progress, dayCounts);
  const navigate = useNavigate();

  const firstIncompleteDay = COURSE_DAYS.find(day => {
    return getDayProgress(progress, day.day, dayCounts[day.day]) < 100;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-16"
    >
      <section className="text-center max-w-3xl mx-auto pt-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter leading-[0.95] mb-6">
            Your 7-Day Full-Stack <span className="text-primary">CS Refresher</span>
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            A self-paced review course for CS graduates refreshing for full-stack roles. Data structures through deployment — with diagrams for every concept.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(`/day/${firstIncompleteDay?.day || 1}`)}
            className="px-10 py-4 rounded-xl primary-gradient text-on-primary font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
          >
            {globalPct > 0 ? "Continue Learning" : "Start Day 1"}
          </button>
        </motion.div>

        {globalPct > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto space-y-3"
          >
            <div className="flex justify-between text-sm font-bold text-on-surface-variant">
              <span>{completedDays} of 7 days complete</span>
              <span>{globalPct}%</span>
            </div>
            <div className="h-2 w-full bg-secondary-container rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${globalPct}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-black tracking-tighter text-on-surface">Days</h2>
          <span className="text-sm font-bold text-primary/80">View All</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSE_DAYS.map((day, i) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <DayCard day={day} progress={progress} />
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

// --- Day Page ---

const DayPage = () => {
  const { day: dayParam } = useParams();
  const dayNumber = parseInt(dayParam || "1");
  const courseDay = getCourseDay(dayNumber);
  const { progress } = useProgress();
  const navigate = useNavigate();

  if (!courseDay) {
    return (
      <div className="py-20 text-center">
        <p className="text-on-surface-variant font-bold uppercase tracking-widest">Day not found</p>
        <Link to="/" className="text-primary font-bold text-sm mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  const dayCounts = getDaySectionCounts();
  const pct = getDayProgress(progress, courseDay.day, dayCounts[courseDay.day]);
  const prevDay = dayNumber > 1 ? dayNumber - 1 : null;
  const nextDay = dayNumber < 7 ? dayNumber + 1 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 pb-20"
      key={dayNumber}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Day {courseDay.day}</span>
            <span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-full">
              ~ {courseDay.estimatedMinutes} min
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface">{courseDay.title}</h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl">{courseDay.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {prevDay && (
            <button
              onClick={() => navigate(`/day/${prevDay}`)}
              className="px-5 py-2.5 rounded-lg bg-surface-container-highest text-primary font-bold text-sm hover:bg-surface-container-high transition-all"
            >
              ← Day {prevDay}
            </button>
          )}
          {nextDay && (
            <button
              onClick={() => navigate(`/day/${nextDay}`)}
              className="px-6 py-2.5 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              Day {nextDay}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          <span>Day Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 w-full bg-secondary-container rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="space-y-16">
        {courseDay.sections.map((section) => (
          <div key={section.id}>
            <SectionBlock section={section} day={courseDay.day} />
          </div>
        ))}
      </div>

      <SummaryBox points={courseDay.summary} />
      <FurtherReading links={courseDay.furtherReading} />

      <div className="flex items-center justify-between pt-8">
        {prevDay ? (
          <button
            onClick={() => { navigate(`/day/${prevDay}`); window.scrollTo(0, 0); }}
            className="px-6 py-3 rounded-lg bg-surface-container-highest text-primary font-bold text-sm hover:bg-surface-container-high transition-all"
          >
            ← Day {prevDay}: {getCourseDay(prevDay)?.title}
          </button>
        ) : <div />}
        {nextDay ? (
          <button
            onClick={() => { navigate(`/day/${nextDay}`); window.scrollTo(0, 0); }}
            className="px-6 py-3 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            Day {nextDay}: {getCourseDay(nextDay)?.title}
            <ChevronRight size={16} />
          </button>
        ) : (
          <Link
            to="/"
            className="px-6 py-3 rounded-lg primary-gradient text-on-primary font-bold text-sm shadow-lg shadow-primary/20"
          >
            Back to Course Home
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgressState] = useState<ProgressData>(loadProgress);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const lastExpandedSidebarWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH);

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

  const signInFn = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (error) { console.error("Sign in error", error); }
  };

  const logoutFn = async () => {
    try { await signOut(auth); } catch (error) { console.error("Logout error", error); }
  };

  const toggleSectionProgress = useCallback((day: number, sectionId: string) => {
    const updated = toggleSection(day, sectionId);
    setProgressState({ ...updated });
  }, []);

  const startSidebarResize = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    sidebarResizeRef.current = {
      startX: event.clientX,
      startWidth: sidebarWidth,
    };
    setIsResizingSidebar(true);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!sidebarResizeRef.current) return;
      const { startX, startWidth } = sidebarResizeRef.current;
      const nextRawWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(0, startWidth + (event.clientX - startX))
      );
      if (nextRawWidth <= SIDEBAR_COLLAPSE_THRESHOLD) {
        setIsSidebarCollapsed(true);
        return;
      }

      const nextWidth = Math.max(SIDEBAR_MIN_WIDTH, nextRawWidth);
      setIsSidebarCollapsed(false);
      setSidebarWidth(nextWidth);
      lastExpandedSidebarWidthRef.current = nextWidth;
    };

    const stopResizing = () => {
      sidebarResizeRef.current = null;
      setIsResizingSidebar(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingSidebar]);

  const openSidebarFromHamburger = useCallback(() => {
    const restoredWidth = Math.max(SIDEBAR_MIN_WIDTH, lastExpandedSidebarWidthRef.current);
    setSidebarWidth(restoredWidth);
    setIsSidebarCollapsed(false);
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizingSidebar]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn: signInFn, logout: logoutFn }}>
      <ProgressContext.Provider value={{ progress, toggle: toggleSectionProgress }}>
        <Router>
          <div
            className="min-h-screen bg-surface flex"
            style={{ "--sidebar-width": isSidebarCollapsed ? "0px" : `${sidebarWidth}px` } as CSSProperties}
          >
            {!isSidebarCollapsed && (
              <Sidebar
                width={sidebarWidth}
                isResizing={isResizingSidebar}
                onResizeStart={startSidebarResize}
              />
            )}
            <main className="flex-1 md:ml-[var(--sidebar-width)] flex flex-col min-h-screen">
              <Header
                showDesktopMenuButton={isSidebarCollapsed}
                onDesktopMenuClick={openSidebarFromHamburger}
              />
              <div className="p-6 md:p-12 max-w-4xl mx-auto w-full flex-1">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/day/:day" element={<DayPage />} />
                  </Routes>
                </AnimatePresence>
              </div>
              <Footer />
            </main>
            <ScholarAssistant />
          </div>
        </Router>
      </ProgressContext.Provider>
    </AuthContext.Provider>
  );
}
