import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  Navigate
} from "react-router-dom";
import { 
  ArrowRight, 
  Github, 
  Linkedin, 
  Twitter, 
  Sparkles, 
  Briefcase, 
  Trophy, 
  Scale, 
  Music,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  LogOut,
  LayoutDashboard,
  User,
  Image as ImageIcon,
  Type,
  Settings,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

// --- Firebase ---
import { db, auth } from "./firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  onSnapshot
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

// --- Types ---
interface Member {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  tags: string[];
  profile_url: string;
}

interface PortfolioData {
  hero_title: string;
  hero_description: string;
  about_philosophy: string;
  members: Member[];
}

// --- Components ---

const Navbar = ({ isAdmin = false, user }: { isAdmin?: boolean, user?: FirebaseUser | null }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("admin_logged_in");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold tracking-tighter text-2xl uppercase">BESTFOLIO</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          {!isAdmin ? (
            <>
              {["Home", "Team", "Members", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </>
          ) : (
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">Admin Dashboard</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user || localStorage.getItem("admin_logged_in") ? (
            <>
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-900"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    const fetchData = async () => {
      try {
        setError(null);
        // Fetch content
        const contentSnap = await getDocs(collection(db, "portfolio_content"));
        const content: any = {};
        contentSnap.forEach(doc => {
          content[doc.id] = doc.data().content;
        });

        // Fetch members
        const membersSnap = await getDocs(collection(db, "members"));
        const members: Member[] = [];
        membersSnap.forEach(doc => {
          members.push({ id: doc.id, ...doc.data() } as Member);
        });

        // Seed if empty
        if (contentSnap.empty && membersSnap.empty) {
          const initialContent = {
            hero_title: "Defining the New Standard.",
            hero_description: "A collective of four outstanding students achieving professional excellence across diverse industries. From corporate management to creative production.",
            about_philosophy: "We are more than just a group of students. We are a collective of high-achievers who have already made significant marks in our respective fields. Our success is built on a foundation of discipline, innovation, and a relentless pursuit of quality."
          };
          
          for (const [id, text] of Object.entries(initialContent)) {
            await setDoc(doc(db, "portfolio_content", id), { content: text });
          }

          const initialMembers = [
            { name: "Muhammad Zaky", role: "Manager Company", description: "Visionary leader focused on organizational excellence and strategic growth.", image: "https://picsum.photos/seed/zaky/600/800", tags: ["Leadership", "Strategy"], profile_url: "https://linkedin.com" },
            { name: "Fikri Pradana", role: "Professional Football Athlete", description: "Elite athlete dedicated to peak performance, teamwork, and sportsmanship.", image: "https://picsum.photos/seed/fikri/600/800", tags: ["Athletics", "Performance"], profile_url: "https://instagram.com" },
            { name: "Ahmad Zaidan", role: "Law Specialist", description: "Expert in legal frameworks, committed to justice and professional integrity.", image: "https://picsum.photos/seed/zaidan/600/800", tags: ["Law", "Justice"], profile_url: "https://twitter.com" },
            { name: "Muhammad Farrel", role: "Music Producer", description: "Creative sound architect blending innovation with rhythm to create masterpieces.", image: "https://picsum.photos/seed/farrel/600/800", tags: ["Production", "Sound"], profile_url: "https://spotify.com" }
          ];

          for (const m of initialMembers) {
            await addDoc(collection(db, "members"), m);
          }
          
          // Re-fetch
          window.location.reload();
          return;
        }

        setData({
          hero_title: content.hero_title || "Defining the New Standard.",
          hero_description: content.hero_description || "",
          about_philosophy: content.about_philosophy || "",
          members: members
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.code === 'permission-denied') {
          setError("Firebase Permission Denied: Please update your Firestore Security Rules in the Firebase Console to allow public read access.");
        } else {
          setError("Failed to connect to Firebase. Please check your configuration.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => unsubscribeAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 shadow-xl border border-zinc-100 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-6">Firebase Setup Required</h2>
          <p className="text-zinc-500 mb-10 leading-relaxed">
            {error}
          </p>
          <div className="bg-zinc-900 text-left p-6 rounded-2xl mb-10 overflow-x-auto">
            <pre className="text-[10px] text-zinc-400 font-mono leading-relaxed">
              {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </div>
          <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest mb-8">
            Paste the rules above in Firebase Console &gt; Firestore &gt; Rules
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all"
          >
            I've Updated the Rules
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("manager")) return <Briefcase className="w-6 h-6" />;
    if (r.includes("athlete") || r.includes("football")) return <Trophy className="w-6 h-6" />;
    if (r.includes("law")) return <Scale className="w-6 h-6" />;
    if (r.includes("music") || r.includes("producer")) return <Music className="w-6 h-6" />;
    return <User className="w-6 h-6" />;
  };

  return (
    <div className="bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Navbar user={user} />
      
      {/* Hero Section */}
      <section id="home" className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-zinc-100 rounded-full">
                <span className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">The Collective Excellence</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] uppercase">
                {data.hero_title.split(".")[0]} <br />
                <span className="text-zinc-300">{data.hero_title.split(".")[1] || "Standard."}</span>
              </h1>
              <p className="max-w-lg text-lg text-zinc-500 mb-12 leading-relaxed">
                {data.hero_description}
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#members" className="px-10 py-5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all flex items-center gap-3">
                  Explore Portfolio <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#team" className="px-10 py-5 bg-white text-zinc-900 text-xs font-bold uppercase tracking-widest rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all">
                  Our Story
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-zinc-50 rounded-[40px] border border-zinc-100 overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
                  alt="Team Collaboration"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="aspect-[3/4] bg-white rounded-3xl border border-zinc-100 p-8 flex flex-col justify-end shadow-sm">
                    <div className="text-4xl font-bold mb-2">{String(data.members.length).padStart(2, '0')}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Core Members</div>
                  </div>
                  <div className="aspect-square bg-zinc-900 rounded-3xl p-8 flex flex-col justify-end text-white">
                    <Sparkles className="w-8 h-8 mb-4" />
                    <div className="text-xl font-bold leading-tight">Professional Excellence</div>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="aspect-square bg-white rounded-3xl border border-zinc-100 p-8 flex flex-col justify-end shadow-sm">
                    <div className="text-4xl font-bold mb-2">2024</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Founded</div>
                  </div>
                  <div className="aspect-[3/4] bg-zinc-100 rounded-3xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" 
                      className="w-full h-full object-cover grayscale"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-6 block">✦ Our Philosophy</span>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 uppercase leading-[0.9]">
                A Collective of <br />
                <span className="text-zinc-300">Success Stories.</span>
              </h2>
              <p className="text-zinc-500 text-lg leading-relaxed mb-10">
                {data.about_philosophy}
              </p>
              <ul className="space-y-6">
                {[
                  "Multi-disciplinary expertise across diverse industries",
                  "Proven track record of professional achievements",
                  "Modern approach to traditional success metrics",
                  "Commitment to continuous innovation and growth"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-medium text-zinc-600">
                    <div className="w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section id="members" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">✦ The Members</span>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase">Our Collective</h2>
            </div>
            <p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
              Meet the individuals driving excellence across multiple professional domains.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.members.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-8 bg-zinc-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 right-6">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm">
                      {getIcon(member.role)}
                    </div>
                  </div>
                </div>
                <div className="px-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">{member.role}</span>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-zinc-500 transition-colors uppercase tracking-tight">{member.name}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {member.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-500 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={member.profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-4 transition-all"
                  >
                    View Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-zinc-100 gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">© 2026 BESTFOLIO. All rights reserved.</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Crafted with ✦ Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("admin_logged_in", "true");
        navigate("/admin");
      } else {
        setError("Invalid credentials. Use admin / admin123");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-xl border border-zinc-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">Admin Login</h1>
          <p className="text-zinc-400 text-sm">Enter your credentials to manage BESTFOLIO</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
            Back to Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    fetchData();
    return () => unsubscribeAuth();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const contentSnap = await getDocs(collection(db, "portfolio_content"));
      const content: any = {};
      contentSnap.forEach(doc => {
        content[doc.id] = doc.data().content;
      });

      const membersSnap = await getDocs(collection(db, "members"));
      const members: Member[] = [];
      membersSnap.forEach(doc => {
        members.push({ id: doc.id, ...doc.data() } as Member);
      });

      setData({
        hero_title: content.hero_title || "",
        hero_description: content.hero_description || "",
        about_philosophy: content.about_philosophy || "",
        members: members
      });
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.code === 'permission-denied') {
        setError("Firebase Permission Denied: Please update your Firestore Security Rules.");
      } else {
        setError("Failed to connect to Firebase.");
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateContent = async (id: string, content: string) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "portfolio_content", id), { content });
      showToast("success", "Content updated successfully");
      fetchData();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        showToast("error", "Permission denied: Update Firestore rules");
      } else {
        showToast("error", "Failed to update content");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMember = async (member: Partial<Member>) => {
    setSaving(true);
    try {
      if (member.id) {
        const { id, ...rest } = member;
        await updateDoc(doc(db, "members", id), rest);
        showToast("success", "Member updated");
      } else {
        await addDoc(collection(db, "members"), member);
        showToast("success", "Member added");
      }
      setEditingMember(null);
      setIsAdding(false);
      fetchData();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        showToast("error", "Permission denied: Update Firestore rules");
      } else {
        showToast("error", "Action failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, "members", id));
      showToast("success", "Member deleted");
      fetchData();
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        showToast("error", "Permission denied: Update Firestore rules");
      } else {
        showToast("error", "Failed to delete");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="max-w-2xl w-full bg-white rounded-[40px] p-12 shadow-xl border border-zinc-100 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-6">Permission Error</h2>
          <p className="text-zinc-500 mb-10 leading-relaxed">
            {error}
          </p>
          <div className="bg-zinc-900 text-left p-6 rounded-2xl mb-10 overflow-x-auto">
            <pre className="text-[10px] text-zinc-400 font-mono leading-relaxed">
              {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6">
      <Navbar isAdmin user={user || ({ email: 'admin' } as any)} />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Dashboard (Firebase)</h1>
            <p className="text-zinc-400 text-sm">Manage your portfolio content and team members in Firestore</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hero Content Management */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-bold uppercase tracking-tight">Website Content</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Hero Title</label>
                  <textarea 
                    defaultValue={data.hero_title}
                    onBlur={(e) => handleUpdateContent("hero_title", e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Hero Description</label>
                  <textarea 
                    defaultValue={data.hero_description}
                    onBlur={(e) => handleUpdateContent("hero_description", e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">About Philosophy</label>
                  <textarea 
                    defaultValue={data.about_philosophy}
                    onBlur={(e) => handleUpdateContent("about_philosophy", e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 min-h-[150px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Members Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <User className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-bold uppercase tracking-tight">Team Members</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {data.members.map((member) => (
                  <div key={member.id} className="group p-6 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-zinc-200 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-16 h-16 rounded-2xl object-cover grayscale"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold uppercase tracking-tight">{member.name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{member.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingMember(member)}
                          className="p-2 bg-white rounded-lg text-zinc-400 hover:text-zinc-900 shadow-sm transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-2 bg-white rounded-lg text-zinc-400 hover:text-red-600 shadow-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{member.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 bg-white text-zinc-400 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Modal (Add/Edit) */}
      <AnimatePresence>
        {(isAdding || editingMember) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAdding(false); setEditingMember(null); }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">
                  {isAdding ? "Add New Member" : "Edit Member"}
                </h2>
                <button 
                  onClick={() => { setIsAdding(false); setEditingMember(null); }}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const memberData = {
                    id: editingMember?.id,
                    name: formData.get("name") as string,
                    role: formData.get("role") as string,
                    description: formData.get("description") as string,
                    image: formData.get("image") as string,
                    tags: (formData.get("tags") as string).split(",").map(t => t.trim()),
                    profile_url: formData.get("profile_url") as string
                  };
                  handleSaveMember(memberData);
                }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Full Name</label>
                    <input name="name" defaultValue={editingMember?.name} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Role</label>
                    <input name="role" defaultValue={editingMember?.role} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Image URL</label>
                    <input name="image" defaultValue={editingMember?.image} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Profile URL</label>
                    <input name="profile_url" defaultValue={editingMember?.profile_url} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" placeholder="https://..." required />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Description</label>
                    <textarea name="description" defaultValue={editingMember?.description} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm min-h-[100px]" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Tags (comma separated)</label>
                    <input name="tags" defaultValue={editingMember?.tags.join(", ")} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm" required />
                  </div>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Member</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 right-10 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest ${
              toast.type === 'success' ? 'bg-zinc-900 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
