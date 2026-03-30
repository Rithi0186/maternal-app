import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Plus, 
  Search,
  Users,
  Award,
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { insforge } from '../lib/insforge';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
  tag?: string;
}

const Community: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const COMMUNITY_GROUPS = [
    { id: 'g1', name: language === 'ta' ? 'முதல் முறை தாய்மார்கள்' : 'First Time Moms', members: '2.4k', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'g2', name: language === 'ta' ? 'ஊட்டச்சத்து பராமரிப்பு' : 'Nutritional Care', members: '1.8k', icon: Award, color: 'text-rose-500', bg: 'bg-rose-100' },
    { id: 'g3', name: language === 'ta' ? 'யோகா மற்றும் ஆரோக்கியம்' : 'Yoga & Wellness', members: '3.1k', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  const FALLBACK_POSTS: Post[] = [
    {
      id: 'f1',
      author: language === 'ta' ? 'ப்ரியா' : 'Priya Raman',
      avatar: 'https://images.unsplash.com/photo-1594744803329-a584af1cae24?q=80&w=100&auto=format&fit=crop',
      content: language === 'ta' ? 'இன்று எனது யோகா பயிற்சியை முடித்தேன். மிகவும் புத்துணர்ச்சியாக உணர்கிறேன்! 🧘‍♀️' : 'Just finished my prenatal yoga session. Feeling so energized and connected! 🧘‍♀️',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
      likes: 24,
      comments: 5,
      time: '2h ago',
      tag: language === 'ta' ? 'யோகா' : 'Yoga'
    },
    {
      id: 'f2',
      author: language === 'ta' ? 'அனிதா' : 'Anitha S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
      content: language === 'ta' ? 'வீட்டிலேயே செய்த சத்தான உணவு! கீரை மற்றும் ராகி கூழ். 🥗' : 'Homemade nutritious lunch! Spinach stir-fry and Ragi koozh. Healthy eating is key. 🥗',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
      likes: 42,
      comments: 12,
      time: '5h ago',
      tag: language === 'ta' ? 'ஊட்டச்சத்து' : 'Nutrition'
    },
    {
      id: 'f3',
      author: language === 'ta' ? 'மீனா' : 'Meena Govind',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
      content: language === 'ta' ? '7-வது மாதம் துவங்குகிறது! அழகான பயணம். ❤️' : 'Starting my 7th month today! This journey is so beautiful. Cant wait to meet my little one. ❤️',
      likes: 89,
      comments: 24,
      time: '1d ago',
      tag: language === 'ta' ? 'பயணம்' : 'Journey'
    }
  ];

  useEffect(() => {
    fetchPosts();
  }, [language]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim() || !user) return;
    setIsPosting(true);
    
    try {
      let mediaUrl = null;
      if (selectedImage) {
        const fileName = `posts/${Date.now()}-${selectedImage.name}`;
        const { data: uploadData, error: uploadError } = await insforge.storage
          .from('reports') 
          .upload(fileName, selectedImage);
        
        if (uploadError) throw uploadError;
        mediaUrl = uploadData.url;
      }

      const { error } = await insforge.database
        .from('posts')
        .insert([{
          user_id: user.id,
          content: newPostContent,
          author_name: (user.profile as any)?.full_name || (user.profile as any)?.name || 'Anonymous',
          media_url: mediaUrl,
          category: 'General'
        }]);

      if (error) throw error;
      
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      console.error('Post creation failed:', err);
      alert('Failed to post story.');
    } finally {
      setIsPosting(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await insforge.database
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      let dbPosts = [];
      if (data) {
        dbPosts = data.map((p: any) => ({
          id: p.id,
          author: p.author_name || 'Anonymous',
          avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author_name || 'A')}&background=random`,
          content: p.content,
          image: p.media_url,
          likes: p.likes || 12,
          comments: p.comments || 3,
          time: p.created_at ? new Date(p.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US') : 'Just now',
          tag: p.category || 'General'
        }));
      }

      // Merge real posts and fallback posts for a rich UI
      setPosts([...dbPosts, ...FALLBACK_POSTS]);
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 size={48} className="text-[#F43F5E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#1E293B] mb-2">{t('community_header')} 👯‍♀️</h1>
          <p className="text-lg text-[#64748B] font-medium">{t('community_desc')}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="glass-card flex items-center gap-3 px-5 py-3 text-[#64748B]">
             <Search size={20} />
             <input type="text" placeholder={t('search_topics')} className="bg-transparent border-none outline-none font-semibold w-40" />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-14 h-14 gradient-bg text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
           >
             <Plus size={30} strokeWidth={3} />
           </button>
        </div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl relative z-10 p-8 space-y-6"
            >
              <h3 className="text-2xl font-black text-[#1E293B]">{t('share_story')}</h3>
              
              <div className="space-y-4">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t('whats_on_mind')}
                  className="w-full h-40 p-6 bg-[#F8FAFC] rounded-2xl border-2 border-[#E2E8F0] outline-none focus:border-[#F43F5E] font-medium resize-none transition-all"
                />

                {imagePreview && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#E2E8F0]">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button 
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[#64748B] hover:text-[#F43F5E] font-bold transition-colors"
                >
                  <ImageIcon size={24} />
                  <span>{t('add_image')}</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 font-bold text-[#64748B] hover:text-[#1E293B]"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={createPost}
                    disabled={!newPostContent.trim() || isPosting}
                    className="px-10 py-3 gradient-bg text-white rounded-xl font-black shadow-lg hover:premium-shadow disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPosting && <Loader2 size={18} className="animate-spin" />}
                    {t('post_story')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Stats/Groups */}
        <div className="hidden lg:block space-y-8">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-bold text-[#1E293B]">{t('popular_groups')}</h3>
            <div className="space-y-4">
              {COMMUNITY_GROUPS.map((group) => {
                const joined = joinedGroups.includes(group.id);
                return (
                  <div key={group.id} className="flex flex-col gap-3 p-4 rounded-2xl hover:bg-[#F8FAFC] transition-all border border-transparent hover:border-[#FFE4E6]">
                    <div className="flex items-center gap-4">
                      <div className={`${group.bg} ${group.color} p-3 rounded-xl`}>
                        <group.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#1E293B]">{group.name}</h4>
                        <p className="text-xs font-semibold text-[#64748B]">{group.members} {t('member')}s</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (!joined) {
                          setJoinedGroups(prev => [...prev, group.id]);
                        }
                      }}
                      className={cn(
                        "w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        joined ? "bg-emerald-100 text-emerald-600 cursor-default" : "bg-[#FFF1F2] text-[#F43F5E] hover:bg-[#F43F5E] hover:text-white"
                      )}
                    >
                      {joined ? t('member') : t('join_group')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card bg-white p-6 space-y-6 ring-1 ring-[#FFE4E6] hover:ring-[#F43F5E]/20 transition-all border-[#FFE4E6]"
              >
                {/* Post Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <h4 className="text-lg font-black text-[#1E293B]">{post.author}</h4>
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{post.time} • {post.tag}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                    <MoreHorizontal size={20} className="text-[#94A3B8]" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                  <p className="text-lg text-[#334155] leading-relaxed font-medium">
                    {post.content}
                  </p>
                  {post.image && (
                    <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl relative group">
                      <img src={post.image} alt="Post content" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all pointer-events-none"></div>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <div className="flex gap-6">
                    <button className="flex items-center gap-2 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-[#FFF1F2] transition-colors">
                        <Heart size={22} className="text-[#F43F5E] group-hover:fill-[#F43F5E] transition-all" />
                      </div>
                      <span className="text-sm font-black text-[#64748B] group-hover:text-[#F43F5E]">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-[#F0F9FF] transition-colors">
                        <MessageCircle size={22} className="text-[#0EA5E9]" />
                      </div>
                      <span className="text-sm font-black text-[#64748B] group-hover:text-[#0EA5E9]">{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-[#F8FAFC] transition-colors">
                      <Share2 size={22} className="text-[#64748B]" />
                    </div>
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Community;
