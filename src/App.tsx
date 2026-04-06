import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
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
  Send
} from "lucide-react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface User {
  id: string;
  email?: string;
}

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

const Navbar = ({ user }: { user: User | null }) => {
  const [email, setEmail] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link!");
      setShowEmailLogin(false);
    }
  };

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
            <div className="flex items-center gap-2">
              {showEmailLogin ? (
                <form onSubmit={handleEmailLogin} className="flex items-center gap-2">
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <button type="submit" className="px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all">
                    Send Link
                  </button>
                  <button type="button" onClick={() => setShowEmailLogin(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowEmailLogin(true)}
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Creator Login
                </button>
              )}
            </div>
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
  const [user] = useSupabaseAuth();

  useEffect(() => {
    if (!slug) return;

    const fetchInfluencer = async () => {
      const { data } = await supabase
        .from("influencers")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (data) {
        setInfluencer({
          id: data.id,
          name: data.name,
          slug: data.slug,
          priceId: data.price_id,
          price: data.price,
          profileImage: data.profile_image,
          bannerImage: data.banner_image,
          ownerId: data.owner_id,
          privateInfo: data.private_info
        });
      }
      setLoading(false);
    };

    fetchInfluencer();

    const channel = supabase
      .channel(`influencer-${slug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'influencers',
          filter: `slug=eq.${slug}`
        },
        (payload) => {
          const data = payload.new as any;
          setInfluencer({
            id: data.id,
            name: data.name,
            slug: data.slug,
            priceId: data.price_id,
            price: data.price,
            profileImage: data.profile_image,
            bannerImage: data.banner_image,
            ownerId: data.owner_id,
            privateInfo: data.private_info
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  useEffect(() => {
    if (!influencer) return;

    let channel: any = null;

    const verifyAndCheck = async () => {
      // 1. Check URL session
      if (sessionId) {
        try {
          const res = await fetch(`/api/verify-session/${sessionId}?influencerId=${influencer.id}`);
          const data = await res.json();
          if (data.valid && data.influencerId === influencer.id) {
            setIsSubscribed(true);
            if (user) {
              await supabase.from("subscriptions").insert({
                user_id: user.id,
                influencer_id: influencer.id,
                status: "active"
              });
            }
            return;
          }
        } catch (e) {
          console.error("Session verification failed", e);
        }
      }

      // 2. Check Auth user
      if (user) {
        const { data } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("influencer_id", influencer.id)
          .eq("status", "active");
        
        setIsSubscribed(data && data.length > 0);

        channel = supabase
          .channel(`sub-${user.id}-${influencer.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if ((payload.new as any).influencer_id === influencer.id) {
                setIsSubscribed((payload.new as any).status === 'active');
              }
            }
          )
          .subscribe();
      }
    };

    verifyAndCheck();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
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
        window.location.href = data.url;
      } else if (data.error) {
        console.warn("Stripe error (likely missing keys):", data.error);
        
        if (user) {
          await supabase.from("subscriptions").insert({
            user_id: user.id,
            influencer_id: influencer.id,
            status: "active"
          });
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
                  <p className="text-indigo-700/80 mb-8">Subscribe to reveal private socials and contact info.</p>
                  <button 
                    onClick={handleSubscribe}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Subscribe Now {influencer.price ? `- ${influencer.price}` : ""}
                  </button>
                  
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
  const [user, loadingAuth] = useSupabaseAuth();
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
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
    if (!user) return;

    const fetchInfluencers = async () => {
      const { data } = await supabase
        .from("influencers")
        .select("*")
        .eq("owner_id", user.id);
      if (data) {
        setInfluencers(data.map(inf => ({
          id: inf.id,
          name: inf.name,
          slug: inf.slug,
          priceId: inf.price_id,
          price: inf.price,
          profileImage: inf.profile_image,
          bannerImage: inf.banner_image,
          ownerId: inf.owner_id,
          privateInfo: inf.private_info
        })));
      }
    };

    fetchInfluencers();

    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'influencers',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          fetchInfluencers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "", slug: "", priceId: "", price: "", profileImage: "", bannerImage: "",
      snapchat: "", whatsapp: "", instagram: "", telegram: "", phoneNumber: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inf: any) => {
    setEditingId(inf.id);
    setFormData({
      name: inf.name || "",
      slug: inf.slug || "",
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

    const data = {
      name: formData.name,
      slug: formData.slug,
      price_id: formData.priceId,
      price: formData.price,
      profile_image: formData.profileImage,
      banner_image: formData.bannerImage,
      owner_id: user.id,
      private_info: {
        snapchat: formData.snapchat,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        telegram: formData.telegram,
        phoneNumber: formData.phoneNumber
      },
      updated_at: new Date().toISOString()
    };

    try {
      if (editingId) {
        await supabase.from("influencers").update(data).eq("id", editingId);
      } else {
        await supabase.from("influencers").insert({
          ...data,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving influencer page:", error);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
                <button 
                  onClick={() => handleOpenEdit(inf)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit Page"
                >
                  <Edit className="w-5 h-5" />
                </button>
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
      </div>
    </div>
  );
};

const Home = ({ user }: { user: User | null }) => {
  const [email, setEmail] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link!");
      setShowEmailLogin(false);
    }
  };

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
          
          <div className="flex flex-col items-center justify-center gap-6 pt-4">
            {!user && showEmailLogin ? (
              <motion.form 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleEmailLogin} 
                className="w-full max-w-sm space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100"
              >
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Creator Email</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 mt-1 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  Send Magic Link
                </button>
                <button type="button" onClick={() => setShowEmailLogin(false)} className="text-sm text-gray-400 hover:text-gray-600">
                  Back
                </button>
              </motion.form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <button 
                  onClick={() => {
                    if (user) {
                      navigate("/dashboard");
                    } else {
                      setShowEmailLogin(true);
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {user ? "Go to Dashboard" : "Start Creating"} <ChevronRight className="w-5 h-5" />
                </button>
                {!user && (
                  <button 
                    onClick={() => setShowEmailLogin(true)}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
                  >
                    Login with Email
                  </button>
                )}
              </div>
            )}
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

const ConfigRequired = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-6">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        To use this application, you need to connect your Supabase project. 
        Please add the following environment variables to your project settings:
      </p>
      <div className="space-y-3 text-left mb-8">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-xs text-gray-500 break-all">
          VITE_SUPABASE_URL
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-xs text-gray-500 break-all">
          VITE_SUPABASE_ANON_KEY
        </div>
      </div>
      <p className="text-sm text-gray-400">
        Once added, the application will automatically refresh.
      </p>
    </div>
  </div>
);

function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return [user, loading] as const;
}

export default function App() {
  const [user, loading] = useSupabaseAuth();

  if (loading) return null;
  if (!isSupabaseConfigured) return <ConfigRequired />;

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/p/:slug" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}
