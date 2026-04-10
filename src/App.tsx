import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";
import { 
  Plus, 
  LogOut, 
  User as UserIcon, 
  Lock, 
  Unlock, 
  Instagram, 
  Phone, 
  MessageCircle, 
  Ghost,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  Eye,
  Share2,
  Edit,
  Copy,
  Check,
  Send,
  Trash2
} from "lucide-react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

// --- Components ---

const VerifiedBadge = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={cn("text-blue-500 shrink-0", className)}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12.01 2.011a3.2 3.2 0 0 1 2.113 .797l.154 .145l.698 .698a1.2 1.2 0 0 0 .71 .341l.135 .008h1a3.2 3.2 0 0 1 3.195 3.018l.005 .182v1c0 .27 .092 .533 .258 .743l.09 .1l.697 .698a3.2 3.2 0 0 1 .147 4.382l-.145 .154l-.698 .698a1.2 1.2 0 0 0 -.341 .71l-.008 .135v1a3.2 3.2 0 0 1 -3.018 3.195l-.182 .005h-1a1.2 1.2 0 0 0 -.743 .258l-.1 .09l-.698 .697a3.2 3.2 0 0 1 -4.382 .147l-.154 -.145l-.698 -.698a1.2 1.2 0 0 0 -.71 -.341l-.135 -.008h-1a3.2 3.2 0 0 1 -3.195 -3.018l-.005 -.182v-1a1.2 1.2 0 0 0 -.258 -.743l-.09 -.1l-.697 -.698a3.2 3.2 0 0 1 -.147 -4.382l.145 -.154l.698 -.698a1.2 1.2 0 0 0 .341 -.71l.008 -.135v-1l.005 -.182a3.2 3.2 0 0 1 3.013 -3.013l.182 -.005h1a1.2 1.2 0 0 0 .743 -.258l.1 -.09l.698 -.697a3.2 3.2 0 0 1 2.269 -.944zm3.697 7.282a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
  </svg>
);

const Navbar = ({ user, onOpenAuth }: { user: User | null | undefined, onOpenAuth: () => void }) => {
  const handleLogout = () => supabase.auth.signOut();
  const location = useLocation();
  const isSubscriptionPage = location.pathname.startsWith("/p/");

  if (isSubscriptionPage) return null;

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
          <Lock className="w-6 h-6" />
          <span>Privato</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-all border border-gray-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            !isSubscriptionPage && (
              <button 
                onClick={onOpenAuth}
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Creator Login
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

const LandingPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [influencer, setInfluencer] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [paymentMode, setPaymentMode] = useState<"subscribe" | "tip">("subscribe");
  const [tipAmount, setTipAmount] = useState<string>("5.00");

  const allowedPaymentType = influencer?.paymentType || "both";
  const activeMode = allowedPaymentType === "both" ? paymentMode : allowedPaymentType;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchInfluencer = async () => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (data) {
        setInfluencer(data);
      }
      setLoading(false);
    };

    fetchInfluencer();
  }, [slug]);

  useEffect(() => {
    if (!influencer) return;

    const verifyAndCheck = async () => {
      // 1. Check URL session
      if (sessionId) {
        try {
          const res = await fetch(`/api/verify-session/${sessionId}?influencerId=${influencer.id}`);
          const data = await res.json();
          if (data.valid && data.influencerId === influencer.id) {
            setIsSubscribed(true);
            return;
          }
        } catch (e) {
          console.error("Session verification failed", e);
        }
      }

      // 2. Check Auth user
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('userId', user.id)
          .eq('influencerId', influencer.id)
          .eq('status', 'active');
        
        setIsSubscribed(data && data.length > 0);
      }
    };

    verifyAndCheck();
  }, [user, influencer, sessionId]);

  const handleSubscribe = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: influencer.priceId,
          influencerId: influencer.id,
          userId: user?.id || "guest",
          successUrl: window.location.origin + window.location.pathname,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Real Stripe Redirect
        window.location.href = data.url;
      } else if (data.error) {
        // If Stripe is not configured, we'll fall back to simulation for testing
        console.warn("Stripe error (likely missing keys):", data.error);
        
        if (user) {
          await supabase.from('subscriptions').insert([{
            userId: user.id,
            influencerId: influencer.id,
            status: "active"
          }]);
          alert("Stripe keys not configured. Simulating subscription for testing.");
        } else {
          const fakeSessionId = "sim_" + Math.random().toString(36).substring(7);
          window.location.href = `${window.location.origin}${window.location.pathname}?session_id=${fakeSessionId}`;
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start checkout. Please check your internet connection.");
    }
  };

  const handleTip = async () => {
    if (!tipAmount || isNaN(parseFloat(tipAmount)) || parseFloat(tipAmount) <= 0) {
      alert("Please enter a valid tip amount.");
      return;
    }

    try {
      const response = await fetch("/api/create-tip-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(tipAmount),
          influencerId: influencer.id,
          influencerName: influencer.name,
          userId: user?.id || "guest",
          successUrl: window.location.origin + window.location.pathname,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        console.warn("Stripe error:", data.error);
        alert("Stripe keys not configured. Simulating tip for testing.");
        const fakeSessionId = "sim_" + Math.random().toString(36).substring(7);
        window.location.href = `${window.location.origin}${window.location.pathname}?session_id=${fakeSessionId}&type=tip`;
      }
    } catch (error) {
      console.error("Tip error:", error);
      alert("Failed to start checkout. Please check your internet connection.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!influencer) return <div className="min-h-screen flex items-center justify-center">Influencer not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-48 md:h-64 relative w-full">
        <div className="absolute inset-0 overflow-hidden">
          {influencer.bannerImage ? (
            <img 
              src={influencer.bannerImage} 
              alt="Banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
          )}
        </div>
        <div className="absolute -bottom-20 md:-bottom-24 left-1/2 -translate-x-1/2 z-20">
          <img 
            src={influencer.profileImage || `https://picsum.photos/seed/${influencer.slug}/200`}
            alt={influencer.name}
            className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover bg-white"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-24 md:pt-28 pb-12 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            {influencer.name}
            <VerifiedBadge className="w-7 h-7" />
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm font-medium mb-8">
            <Check className="w-4 h-4 text-green-500" />
            <span>ID Verified</span>
          </div>

            {!isSubscribed ? (
              <div className="space-y-6">
                <div className="py-8">
                  <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-indigo-900 mb-2">Unlock Private Access</h2>
                  <p className="text-indigo-700/80 mb-8">
                    {allowedPaymentType === "subscribe" ? "Subscribe to reveal private socials and contact info." : 
                     allowedPaymentType === "tip" ? "Send a tip to support." : 
                     "Subscribe or send a tip to support."}
                  </p>
                  
                  {allowedPaymentType === "both" && (
                    <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setPaymentMode("subscribe")}
                        className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", activeMode === "subscribe" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                      >
                        Subscribe
                      </button>
                      <button
                        onClick={() => setPaymentMode("tip")}
                        className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", activeMode === "tip" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                      >
                        Send Tip
                      </button>
                    </div>
                  )}

                  {activeMode === "subscribe" ? (
                    <button 
                      onClick={handleSubscribe}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      Subscribe Now {influencer.price ? `- ${influencer.price}` : ""}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="Amount"
                        />
                      </div>
                      <button 
                        onClick={handleTip}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                      >
                        Send Tip
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-8 flex items-center justify-center gap-1 text-gray-400 font-bold text-xs tracking-tight opacity-30">
                    <Lock className="w-3 h-3" />
                    <span>Privato</span>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold mb-6">
                  <Unlock className="w-5 h-5" />
                  <span>Access Unlocked</span>
                </div>
                
                <div className="grid gap-4 text-left">
                  {influencer.privateInfo?.snapchat && (
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Ghost className="w-6 h-6 text-yellow-600" />
                        <div>
                          <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Snapchat</p>
                          <p className="text-lg font-mono text-gray-900">@{influencer.privateInfo.snapchat}</p>
                        </div>
                      </div>
                      <a 
                        href={`https://snapchat.com/add/${influencer.privateInfo.snapchat}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-yellow-600" />
                      </a>
                    </div>
                  )}
                  {influencer.privateInfo?.whatsapp && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-xs font-bold text-green-800 uppercase tracking-wider">WhatsApp</p>
                          <p className="text-lg font-mono text-gray-900">{influencer.privateInfo.whatsapp}</p>
                        </div>
                      </div>
                      <a 
                        href={`https://wa.me/${influencer.privateInfo.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-green-600" />
                      </a>
                    </div>
                  )}
                  {influencer.privateInfo?.instagram && (
                    <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Instagram className="w-6 h-6 text-pink-600" />
                        <div>
                          <p className="text-xs font-bold text-pink-800 uppercase tracking-wider">Private Instagram</p>
                          <p className="text-lg font-mono text-gray-900">@{influencer.privateInfo.instagram}</p>
                        </div>
                      </div>
                      <a 
                        href={`https://instagram.com/${influencer.privateInfo.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-pink-600" />
                      </a>
                    </div>
                  )}
                  {influencer.privateInfo?.telegram && (
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Send className="w-6 h-6 text-sky-600" />
                        <div>
                          <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Telegram</p>
                          <p className="text-lg font-mono text-gray-900">@{influencer.privateInfo.telegram}</p>
                        </div>
                      </div>
                      <a 
                        href={`https://t.me/${influencer.privateInfo.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-sky-600" />
                      </a>
                    </div>
                  )}
                  {influencer.privateInfo?.phoneNumber && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Phone Number</p>
                          <p className="text-lg font-mono text-gray-900">{influencer.privateInfo.phoneNumber}</p>
                        </div>
                      </div>
                      <a 
                        href={`tel:${influencer.privateInfo.phoneNumber}`}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-center gap-1 text-gray-400 font-bold text-xs tracking-tight opacity-30">
                  <Lock className="w-3 h-3" />
                  <span>Privato</span>
                </div>
              </motion.div>
            )}
          </motion.div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    paymentType: "both",
    priceId: "",
    price: "",
    profileImage: "",
    bannerImage: "",
    snapchat: "",
    whatsapp: "",
    instagram: "",
    telegram: "",
    phoneNumber: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchInfluencers = async () => {
      const { data } = await supabase
        .from('influencers')
        .select('*')
        .eq('ownerId', user.id);
      
      if (data) {
        setInfluencers(data);
      }
    };

    fetchInfluencers();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "", slug: "", paymentType: "both", priceId: "", price: "", profileImage: "", bannerImage: "",
      snapchat: "", whatsapp: "", instagram: "", telegram: "", phoneNumber: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inf: any) => {
    setEditingId(inf.id);
    setFormData({
      name: inf.name || "",
      slug: inf.slug || "",
      paymentType: inf.paymentType || "both",
      priceId: inf.priceId || "",
      price: inf.price || "",
      profileImage: inf.profileImage || "",
      bannerImage: inf.bannerImage || "",
      snapchat: inf.privateInfo?.snapchat || "",
      whatsapp: inf.privateInfo?.whatsapp || "",
      instagram: inf.privateInfo?.instagram || "",
      telegram: inf.privateInfo?.telegram || "",
      phoneNumber: inf.privateInfo?.phoneNumber || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      name: formData.name,
      slug: formData.slug,
      paymentType: formData.paymentType,
      priceId: formData.priceId,
      price: formData.price,
      profileImage: formData.profileImage,
      bannerImage: formData.bannerImage,
      ownerId: user.id,
      privateInfo: {
        snapchat: formData.snapchat,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        telegram: formData.telegram,
        phoneNumber: formData.phoneNumber
      }
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('influencers').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('influencers').insert([payload]);
        if (error) throw error;
      }
      
      // Refresh list
      const { data: updatedList, error: fetchError } = await supabase
        .from('influencers')
        .select('*')
        .eq('ownerId', user.id);
        
      if (fetchError) throw fetchError;
      if (updatedList) setInfluencers(updatedList);
      
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving influencer page:", error);
      alert("Failed to save: " + error.message);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deletingId || !user) return;
    
    try {
      const { error } = await supabase.from('influencers').delete().eq('id', deletingId);
      if (error) throw error;
      
      setInfluencers(influencers.filter(inf => inf.id !== deletingId));
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting influencer page:", error);
      alert("Failed to delete: " + error.message);
    }
  };

  if (!user) return <div className="p-8 text-center">Please sign in to access the dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your subscription landing pages</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create Page</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map(inf => (
            <div key={inf.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={inf.profileImage || `https://picsum.photos/seed/${inf.slug}/100`} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1 flex items-center gap-1.5">
                      {inf.name}
                      <VerifiedBadge className="w-4 h-4" />
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      <Check className="w-2.5 h-2.5" />
                      <span>ID Verified</span>
                    </div>
                    <p className="text-sm text-gray-500">/{inf.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenEdit(inf)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit Page"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setDeletingId(inf.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Page"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 mb-6">
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link 
                  to={`/p/${inf.slug}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button 
                  onClick={() => handleCopyLink(inf.slug, inf.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    copiedId === inf.id 
                      ? "bg-green-50 text-green-700 border border-green-100" 
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  )}
                >
                  {copiedId === inf.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId ? "Edit Landing Page" : "Create New Landing Page"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <LogOut className="w-6 h-6 rotate-180" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Name</label>
                        <input 
                          required
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="Influencer Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">URL Slug</label>
                        <input 
                          required
                          type="text"
                          value={formData.slug}
                          onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="my-private-page"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Profile Image URL</label>
                        <input 
                          type="url"
                          value={formData.profileImage}
                          onChange={e => setFormData({...formData, profileImage: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Banner Image URL</label>
                        <input 
                          type="url"
                          value={formData.bannerImage}
                          onChange={e => setFormData({...formData, bannerImage: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="https://example.com/banner.jpg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Payment Options</label>
                        <select
                          value={formData.paymentType}
                          onChange={e => setFormData({...formData, paymentType: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                          <option value="both">Subscription & Tips</option>
                          <option value="subscribe">Subscription Only</option>
                          <option value="tip">Tips Only</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Stripe Price ID</label>
                        <input 
                          required
                          type="text"
                          value={formData.priceId}
                          onChange={e => setFormData({...formData, priceId: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="price_H5v..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Display Price</label>
                        <input 
                          required
                          type="text"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="$9.99/mo"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Private Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Snapchat Username</label>
                          <input 
                            type="text"
                            value={formData.snapchat}
                            onChange={e => setFormData({...formData, snapchat: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="username"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp Number</label>
                          <input 
                            type="text"
                            value={formData.whatsapp}
                            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="+1234567890"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Instagram Username</label>
                          <input 
                            type="text"
                            value={formData.instagram}
                            onChange={e => setFormData({...formData, instagram: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="username"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Telegram Username</label>
                          <input 
                            type="text"
                            value={formData.telegram}
                            onChange={e => setFormData({...formData, telegram: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="username"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                          <input 
                            type="text"
                            value={formData.phoneNumber}
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="+1 234 567 890"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      {editingId ? "Update Page" : "Create Page"}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deletingId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Page?</h2>
                  <p className="text-gray-600 mb-8">This action cannot be undone. All subscriptions tied to this page will be affected.</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Home = ({ onOpenAuth }: { onOpenAuth: () => void }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
            <Lock className="w-4 h-4" />
            <span>Secure Private Access</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
            Monetize your <span className="text-indigo-600">private socials</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create beautiful subscription landing pages in seconds. Reveal your Snapchat, WhatsApp, or phone number only to paid subscribers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to={user ? "/dashboard" : "#"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  onOpenAuth();
                }
              }}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Start Creating <ChevronRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
              View Demo
            </button>
          </div>
        </motion.div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Easy Setup</h3>
            <p className="text-gray-600">Connect your Stripe and create your page in under 2 minutes. No coding required.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Secure Access</h3>
            <p className="text-gray-600">Private info is only revealed after a successful Stripe subscription is confirmed.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Full Control</h3>
            <p className="text-gray-600">Manage your subscribers and track your earnings through your personal dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  if (loading) return null;

  return (
    <Router>
      <Navbar user={user} onOpenAuth={() => setIsAuthModalOpen(true)} />
      <Routes>
        <Route path="/" element={<Home onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/p/:slug" element={<LandingPage />} />
      </Routes>

      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <button onClick={() => setIsAuthModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                      {authError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email</label>
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Password</label>
                    <input 
                      required
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4"
                  >
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Router>
  );
}
