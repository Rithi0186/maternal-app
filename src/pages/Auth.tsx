import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Heart,
  ShieldCheck,
  Flame,
  Loader2,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { checkUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLanguageSelect, setShowLanguageSelect] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginError } = await insforge.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        await checkUser();
        window.location.href = '/';
      } else {
        if (!showOtp) {
          const { data, error: signupError } = await insforge.auth.signUp({
            email,
            password,
            name,
          });
          if (signupError) throw signupError;
          
          if (data?.requireEmailVerification) {
            setShowOtp(true);
          } else {
            await checkUser();
            window.location.href = '/';
          }
        } else {
          const { error: verifyError } = await insforge.auth.verifyEmail({
            email,
            otp,
          });
          if (verifyError) throw verifyError;
          await checkUser();
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      console.error('Auth action failed:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showLanguageSelect) {
    return (
      <div className="min-h-screen bg-[#FFF1F2] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-300/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-400/20 blur-[120px] rounded-full"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full glass-card p-12 text-center space-y-10 relative z-10 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto gradient-bg rounded-[32px] flex items-center justify-center shadow-xl animate-bounce">
              <Globe className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-[#1E293B]">Choose Your Language</h2>
            <p className="text-xl font-medium text-[#64748B]">உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => { setLanguage('en'); setShowLanguageSelect(false); }}
              className="p-8 rounded-[32px] border-4 border-transparent hover:border-[#F43F5E] bg-white shadow-lg transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 bg-slate-50 rounded-bl-[32px] group-hover:bg-[#F43F5E] group-hover:text-white transition-colors">
                 <span className="font-black text-xs uppercase tracking-widest">EN</span>
              </div>
              <div className="text-left space-y-2">
                <h3 className="text-2xl font-black text-[#1E293B]">English</h3>
                <p className="font-bold text-[#64748B]">International Support</p>
              </div>
            </button>

            <button 
              onClick={() => { setLanguage('ta'); setShowLanguageSelect(false); }}
              className="p-8 rounded-[32px] border-4 border-transparent hover:border-[#F43F5E] bg-white shadow-lg transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 bg-slate-50 rounded-bl-[32px] group-hover:bg-[#F43F5E] group-hover:text-white transition-colors">
                 <span className="font-black text-xs uppercase tracking-widest">தமிழ்</span>
              </div>
              <div className="text-left space-y-2">
                <h3 className="text-2xl font-black text-[#1E293B]">தமிழ்</h3>
                <p className="font-bold text-[#64748B]">உள்ளூர் மொழி ஆதரவு</p>
              </div>
            </button>
          </div>

          <p className="text-[#94A3B8] font-bold text-sm uppercase tracking-[0.2em] animate-pulse">
             You can change this later in settings
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1F2] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-300/30 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-400/20 blur-[120px] rounded-full animate-pulse"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 glass-card overflow-hidden shadow-2xl relative z-10">
        {/* Left Side: Illustration & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 gradient-bg text-white relative">
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="text-white fill-white" size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tight">{language === 'ta' ? 'பிரெக்னாகேர்' : 'PregnaCare'}</h1>
            </div>
            
            <div className="space-y-6 max-w-sm">
              <h2 className="text-5xl font-black leading-tight">
                {language === 'ta' ? 'உங்கள் ஆரோக்கியத் தரவு எங்களிடம் பாதுகாப்பாக உள்ளது.' : 'Your health data is safe with us.'}
              </h2>
              <p className="text-xl font-medium text-white/80 leading-relaxed">
                {language === 'ta' 
                  ? 'எங்கள் தாய்மார்களின் சமூகத்தில் இணைந்து, AI-இயங்கும் சுகாதார நுண்ணறிவு மற்றும் அவசரப் பாதுகாப்பைப் பெறுங்கள்.' 
                  : 'Join our community of mothers and get AI-powered health insights, medical record storage, and emergency protection.'
                }
              </p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold">{language === 'ta' ? 'குறியாக்கம் செய்யப்பட்டது' : 'End-to-End Encrypted'}</h4>
                <p className="text-sm text-white/60">{language === 'ta' ? 'உங்கள் தகவல்கள் மர்மமான முறையில் பாதுகாக்கப்படுகின்றன.' : 'Your records stay private.'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Flame size={24} />
              </div>
              <div>
                <h4 className="font-bold">{language === 'ta' ? 'அவசர உதவி' : 'Real-time SOS'}</h4>
                <p className="text-sm text-white/60">{language === 'ta' ? 'உங்களுக்குத் தேவைப்படும்போது உடனடி உதவி.' : 'Immediate help when you need it.'}</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left relative">
            <button 
              onClick={() => setShowLanguageSelect(true)}
              className="absolute -top-10 right-0 flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] font-bold text-xs text-[#64748B] hover:text-[#F43F5E] hover:border-[#F43F5E] transition-all"
            >
              <Globe size={14} />
              {language === 'en' ? 'Change Language' : 'மொழியை மாற்றவும்'}
            </button>

            <h3 className="text-3xl font-black text-[#1E293B] mb-2">
              {showOtp 
                ? (language === 'ta' ? 'கணக்கை சரிபார்க்கவும்' : 'Verify Account') 
                : isLogin 
                  ? (language === 'ta' ? 'மீண்டும் வருக!' : 'Welcome Back!') 
                  : (language === 'ta' ? 'சரணாலயத்தை உருவாக்குங்கள்' : 'Create Sanctuary')
              }
            </h3>
            <p className="text-[#64748B] font-medium text-lg">
              {showOtp 
                ? (language === 'ta' ? 'மின்னஞ்சலுக்கு அனுப்பப்பட்ட 6 இலக்கக் குறியீட்டை உள்ளிடவும்' : 'Enter 6-digit code sent to email') 
                : isLogin 
                  ? (language === 'ta' ? 'உங்கள் டாஷ்போர்டை அணுகவும்' : 'Access your maternal dashboard') 
                  : (language === 'ta' ? 'தாய்மார்களுக்கான பாதுகாப்பான இடத்தில் இணையுங்கள்' : 'Join the safest space for mothers')
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!showOtp ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="auth-form"
                  className="space-y-6"
                >
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#64748B] ml-2">
                        {language === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#F43F5E]" size={20} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={language === 'ta' ? "உங்கள் பெயர்" : "Alice Johnson"}
                          className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none transition-all focus:border-[#F43F5E] focus:bg-white font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#64748B] ml-2">
                      {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#F43F5E]" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mother@sanctuary.com"
                        className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none transition-all focus:border-[#F43F5E] focus:bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#64748B] ml-2">
                      {language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#F43F5E]" size={20} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none transition-all focus:border-[#F43F5E] focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="otp-form"
                  className="space-y-2"
                >
                  <label className="text-xs font-black uppercase tracking-widest text-[#64748B] ml-2">
                    {language === 'ta' ? 'சரிபார்ப்பு குறியீடு' : 'Verification Code'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      className="w-full py-6 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none transition-all focus:border-[#F43F5E] focus:bg-white text-center text-4xl font-black tracking-[0.5em]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-50 border-2 border-rose-100 p-4 rounded-xl text-rose-600 font-bold text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 gradient-bg text-white rounded-2xl font-black text-lg shadow-xl hover: premium-shadow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {showOtp 
                    ? (language === 'ta' ? 'இப்போதே சரிபார்க்கவும்' : 'Verify Now') 
                    : isLogin 
                      ? (language === 'ta' ? 'இணையுங்கள்' : 'Enter Sanctuary') 
                      : (language === 'ta' ? 'இப்போதே சேருங்கள்' : 'Join Now')
                  }
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-[#F1F5F9] text-center">
            {!showOtp ? (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#64748B] font-bold text-lg hover:text-[#F43F5E] transition-colors"
                type="button"
              >
                {isLogin 
                  ? (language === 'ta' ? "கணக்கு இல்லையா? பதிவு செய்யுங்கள்" : "Don't have an account? Sign Up") 
                  : (language === 'ta' ? "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்" : "Already have an account? Login")
                }
              </button>
            ) : (
              <button
                onClick={() => setShowOtp(false)}
                className="text-emerald-600 font-bold text-lg hover:underline transition-all"
                type="button"
              >
                {language === 'ta' ? 'விவரங்களை மாற்றவும் அல்லது கடவுச்சொல்லை உள்ளிடவும்' : 'Change details or re-enter password'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
