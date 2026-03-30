import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Phone, 
  User, 
  ArrowRight, 
  Loader2
} from 'lucide-react';
import { insforge } from '../lib/insforge';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Onboarding: React.FC = () => {
  const { user, checkUser } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: (user?.profile as any)?.name || '',
    pregnancyMonth: '1',
    emergencyName: '',
    emergencyPhone: '',
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Update Profile
      const { error: profileError } = await insforge.database
        .from('profiles')
        .insert([{
          user_id: user.id,
          full_name: formData.fullName,
          pregnancy_week: parseInt(formData.pregnancyMonth) * 4,
        }]);

      if (profileError && !profileError.message.includes('unique constraint')) {
         await insforge.database
          .from('profiles')
          .update({
            full_name: formData.fullName,
            pregnancy_week: parseInt(formData.pregnancyMonth) * 4,
          })
          .eq('user_id', user.id);
      }

      // 2. Add Emergency Contact
      await insforge.database
        .from('sos_contacts')
        .insert([{
          user_id: user.id,
          name: formData.emergencyName,
          number: formData.emergencyPhone,
          relationship: language === 'ta' ? 'அவசர தொடர்பு' : 'Emergency Contact'
        }]);

      await checkUser();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Onboarding failed:', err);
      alert(language === 'ta' ? 'விவரங்களைச் சேமிக்க முடியவில்லை.' : 'Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: language === 'ta' ? "உங்களைப் பற்றி சொல்லுங்கள்" : "Tell us about yourself",
      subtitle: language === 'ta' ? "உங்கள் பயணத்தைத் தனிப்பயனாக்க" : "To personalize your journey",
      icon: User,
      fields: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-[#64748B] ml-2">{t('full_name')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={language === 'ta' ? "உங்கள் பெயர்" : "Alice Johnson"}
                className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#F43F5E]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-[#64748B] ml-2">{t('pregnancy_month')}</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <select
                value={formData.pregnancyMonth}
                onChange={(e) => setFormData({ ...formData, pregnancyMonth: e.target.value })}
                className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#F43F5E] appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => (
                  <option key={m} value={m}>{language === 'ta' ? `மாதம் ${m}` : `Month ${m}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: language === 'ta' ? "அவசர பாதுகாப்பு" : "Emergency Security",
      subtitle: language === 'ta' ? "அவசர காலத்தில் யாரை தொடர்பு கொள்ள வேண்டும்?" : "Who should we contact in an SOS?",
      icon: Phone,
      fields: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-[#64748B] ml-2">{t('contact_name')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input
                type="text"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder={language === 'ta' ? "கணவர் / சகோதரி / நண்பர்" : "Husband / Sister / Friend"}
                className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#F43F5E]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-[#64748B] ml-2">{t('phone_number')}</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+91 00000 00000"
                className="w-full pl-12 pr-6 py-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl outline-none focus:border-[#F43F5E]"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-[#FFF1F2] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/30 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 relative z-10 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto gradient-bg rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform cursor-default">
            <currentStep.icon className="text-white" size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#1E293B]">{currentStep.title}</h2>
            <p className="text-[#64748B] font-medium">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex justify-center gap-3">
          {steps.map((_, i) => (
            <div 
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${step === i + 1 ? 'w-12 bg-[#F43F5E]' : 'w-2 bg-[#E2E8F0]'}`}
            />
          ))}
        </div>

        <div className="min-h-[240px]">
          {currentStep.fields}
        </div>

        <button
          onClick={() => step < steps.length ? setStep(step + 1) : handleSubmit()}
          disabled={loading}
          className="w-full py-4 gradient-bg text-white rounded-2xl font-black text-lg shadow-xl hover:premium-shadow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              {step === steps.length ? (language === 'ta' ? 'அமைப்பை முடிக்கவும்' : 'Complete Sanctuary Setup') : (language === 'ta' ? 'தொடரவும்' : 'Continue Journey')}
              <ArrowRight size={22} />
            </>
          )}
        </button>

        <p className="text-center text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
          {language === 'ta' ? `படி ${step} / ${steps.length}` : `Step ${step} of ${steps.length}`}
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
