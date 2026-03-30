import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Baby, 
  Calendar, 
  Droplets, 
  Pill, 
  Footprints,
  ChevronRight,
  TrendingUp,
  Clock,
  HeartPulse,
  Plus,
  MessageCircle,
  Users,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { insforge } from '../lib/insforge';
import { useLanguage } from '../context/LanguageContext';

interface Reminder {
  id: string;
  title: string;
  reminder_date: string;
  is_completed: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [newCheckupDate, setNewCheckupDate] = useState('');
  
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    hb: '', bp_sys: '', bp_dia: '', sugar: ''
  });

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  // Fallback state if database connectivity is patchy
  const [localVitals, setLocalVitals] = useState<any>(null);
  const [localReminders, setLocalReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: profileData } = await insforge.database.from('profiles').select('*').single();
      if (profileData) setProfile(profileData);

      // Attempt to fetch real data, but don't crash if table doesn't exist yet
      const { data: detailsData } = await insforge.database
        .from('pregnancy_details')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (detailsData) setDetails(detailsData);

      const { data: reminderData } = await insforge.database
        .from('reminders')
        .select('*')
        .order('reminder_date', { ascending: true });
      
      if (reminderData) setReminders(reminderData);
    } catch (err) {
      console.warn('Backend tables might be initializing...');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCheckup = async () => {
    if (!newCheckupDate) return;
    try {
      if (profile?.id) {
        await insforge.database
          .from('profiles')
          .update({ next_checkup: newCheckupDate })
          .eq('id', profile.id);
        
        setProfile({ ...profile, next_checkup: newCheckupDate });
      }
      setIsCheckupModalOpen(false);
    } catch (err) {
      console.error('Update checkup failed:', err);
    }
  };

  const handleLogVitals = async () => {
    const newVitals = {
      user_id: profile?.user_id || 'guest',
      hb_level: parseFloat(vitalsForm.hb),
      bp_sys: parseInt(vitalsForm.bp_sys),
      bp_dia: parseInt(vitalsForm.bp_dia),
      blood_sugar: parseInt(vitalsForm.sugar),
      pregnancy_week: profile?.pregnancy_week || 24
    };

    try {
      // 1. Update UI immediately for "Real-time" feel
      setLocalVitals(newVitals);
      setDetails(newVitals);
      setIsVitalsModalOpen(false);

      // 2. Persist to database
      const { error } = await insforge.database
        .from('pregnancy_details')
        .insert([newVitals]);

      if (error) {
        console.warn('Note: Data saved to session. Backend sync pending.');
      }
    } catch (err) {
      console.error('Log vitals persistence failed:', err);
    }
  };

  const handleAddReminder = async () => {
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      title: reminderTitle,
      reminder_date: reminderDate,
      is_completed: false
    };

    try {
      // 1. Immediate UI Update
      setReminders(prev => [...prev, newReminder]);
      setIsReminderModalOpen(false);
      setReminderTitle('');
      setReminderDate('');

      // 2. Persist
      await insforge.database
        .from('reminders')
        .insert([{
          user_id: profile?.user_id || 'guest',
          title: newReminder.title,
          reminder_date: newReminder.reminder_date,
        }]);

    } catch (err) {
      console.error('Add reminder persistence failed:', err);
    }
  };

  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    try {
      await insforge.database.from('reminders').delete().eq('id', id);
    } catch (err) {
       console.warn('Sync pending for deletion.');
    }
  };

  const stats = [
    { 
      label: t('hb'), 
      value: details?.hb_level || '--', 
      unit: 'g/dL', 
      icon: HeartPulse, 
      color: 'text-rose-500', 
      bg: 'bg-rose-100' 
    },
    { 
      label: t('bp'), 
      value: details ? `${details.bp_sys}/${details.bp_dia}` : '--/--', 
      unit: 'mmHg', 
      icon: Activity, 
      color: 'text-blue-500', 
      bg: 'bg-blue-100' 
    },
    { 
      label: t('sugar'), 
      value: details?.blood_sugar || '--', 
      unit: 'mg/dL', 
      icon: Droplets, 
      color: 'text-purple-500', 
      bg: 'bg-purple-100' 
    },
  ];

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 size={48} className="text-[#F43F5E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hello Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#1E293B] mb-2">{t('hello')}, {profile?.full_name || 'Mother'}! 👋</h1>
          <p className="text-lg text-[#64748B] font-medium">{t('welcome')}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-6 py-4 glass-card font-bold text-[#F43F5E]">
            <Calendar size={22} />
            <span>{t('week')} {profile?.pregnancy_week || details?.pregnancy_week || '--'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Vitals Section */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-[#1E293B]">{t('dashboard')}</h3>
            <button 
              onClick={() => setIsVitalsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 gradient-bg text-white font-bold rounded-2xl shadow-lg hover:premium-shadow transition-all"
            >
              <Plus size={20} />
              <span>{t('log_vitals')}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 ring-1 ring-[#FFE4E6] hover:ring-[#F43F5E]/20 transition-all"
              >
                <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  <stat.icon size={28} />
                </div>
                <p className="text-[#64748B] font-bold uppercase tracking-widest text-xs mb-2">{stat.label}</p>
                <h4 className="text-3xl font-black text-[#1E293B] flex items-baseline gap-2">
                  {stat.value}
                  <span className="text-lg font-bold text-[#64748B]">{stat.unit}</span>
                </h4>
              </motion.div>
            ))}
          </div>

          {/* Reminders Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-[#1E293B]">{t('reminders')}</h3>
              <button 
                onClick={() => setIsReminderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white font-bold rounded-xl hover:bg-black transition-colors"
              >
                <Plus size={18} />
                <span>{t('add_btn')}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {reminders.length > 0 ? (
                 reminders.map((r) => (
                   <div key={r.id} className="glass-card p-6 flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                         <Clock size={24} />
                       </div>
                       <div>
                         <h5 className="text-lg font-black text-[#1E293B]">{r.title}</h5>
                         <p className="text-sm font-bold text-[#64748B]">{new Date(r.reminder_date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US')}</p>
                       </div>
                     </div>
                     <button onClick={() => deleteReminder(r.id)} className="text-[#94A3B8] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                       <Trash2 size={20} />
                     </button>
                   </div>
                 ))
               ) : (
                 <div className="col-span-2 p-14 text-center glass-card border-dashed border-2 border-[#E2E8F0]">
                    <p className="text-[#64748B] font-bold text-lg">{t('no_reminders')}</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           {/* Checkup Reminder Card */}
           <div className="glass-card p-8 bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Calendar size={22} />
                  <span className="font-bold uppercase tracking-wider text-xs">{t('medical_schedule')}</span>
                </div>
                <h3 className="text-2xl font-black">{t('next_checkup')}</h3>
                <div className="py-2">
                  {profile?.next_checkup ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-black text-white">{new Date(profile.next_checkup).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-white/50 italic">{t('no_checkup')}</p>
                  )}
                </div>
                <button 
                  onClick={() => setIsCheckupModalOpen(true)}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black transition-all"
                >
                  {profile?.next_checkup ? t('reschedule') : t('set_date')}
                </button>
              </div>
              <Calendar className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 rotate-12" />
           </div>

           <div className="glass-card p-8 bg-gradient-to-br from-white to-[#FFF1F2] space-y-4 border-[#FFE4E6]">
                <button onClick={() => navigate('/chatbot')} className="w-full py-5 gradient-bg text-white rounded-[24px] font-black text-lg premium-shadow flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                  <MessageCircle size={24} /> {t('chatbot')}
                </button>
                <button onClick={() => navigate('/community')} className="w-full py-5 bg-[#1E293B] text-white rounded-[24px] font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                  <Users size={24} /> {t('join_community_btn')}
                </button>
           </div>
        </div>
      </div>

      {/* Vitals Modal */}
      <AnimatePresence>
        {isVitalsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[32px] p-8 space-y-6 shadow-2xl">
              <h3 className="text-2xl font-black text-[#1E293B]">{t('log_vitals')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#64748B]">Hb (g/dL)</label>
                  <input type="number" step="0.1" value={vitalsForm.hb} onChange={e => setVitalsForm({...vitalsForm, hb: e.target.value})} className="w-full p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl outline-none focus:border-[#F43F5E] font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#64748B]">Sugar (mg/dL)</label>
                  <input type="number" value={vitalsForm.sugar} onChange={e => setVitalsForm({...vitalsForm, sugar: e.target.value})} className="w-full p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl outline-none focus:border-[#F43F5E] font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#64748B]">BP Sys</label>
                  <input type="number" value={vitalsForm.bp_sys} onChange={e => setVitalsForm({...vitalsForm, bp_sys: e.target.value})} className="w-full p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl outline-none focus:border-[#F43F5E] font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#64748B]">BP Dia</label>
                  <input type="number" value={vitalsForm.bp_dia} onChange={e => setVitalsForm({...vitalsForm, bp_dia: e.target.value})} className="w-full p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl outline-none focus:border-[#F43F5E] font-bold" />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsVitalsModalOpen(false)} className="flex-1 py-4 font-bold text-[#64748B]">{t('cancel')}</button>
                <button onClick={handleLogVitals} className="flex-1 py-4 gradient-bg text-white rounded-2xl font-black shadow-lg">{t('save_date')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[32px] p-8 space-y-6 shadow-2xl">
              <h3 className="text-2xl font-black text-[#1E293B]">{t('add_reminder')}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#64748B]">{language === 'ta' ? 'தலைப்பு' : 'Task Title'}</label>
                  <input type="text" placeholder="Drink Milk / Pelvic Yoga" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} className="w-full p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl outline-none focus:border-[#F43F5E] font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#64748B]">{t('set_date')}</label>
                  <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="w-full p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl outline-none focus:border-[#F43F5E] font-bold" />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsReminderModalOpen(false)} className="flex-1 py-4 font-bold text-[#64748B]">{t('cancel')}</button>
                <button onClick={handleAddReminder} disabled={!reminderTitle || !reminderDate} className="flex-1 py-4 gradient-bg text-white rounded-2xl font-black shadow-lg disabled:opacity-50">{t('add_btn')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkup Modal */}
      {isCheckupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[32px] p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-black text-[#1E293B]">{t('schedule_checkup')}</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#64748B] uppercase tracking-wider">{t('set_date')}</label>
              <input type="date" value={newCheckupDate} onChange={(e) => setNewCheckupDate(e.target.value)} className="w-full p-5 bg-[#F8FAFC] rounded-2xl border-2 border-[#E2E8F0] outline-none focus:border-[#F43F5E] font-bold text-lg" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsCheckupModalOpen(false)} className="flex-1 py-4 font-bold text-[#64748B]">{t('cancel')}</button>
              <button onClick={handleUpdateCheckup} disabled={!newCheckupDate} className="flex-1 py-4 gradient-bg text-white rounded-2xl font-black shadow-lg disabled:opacity-50">{t('save_date')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
