import React, { useState } from 'react';
import { 
  Apple, 
  Carrot, 
  Droplets, 
  CheckCircle2, 
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight as ChevronRight2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { insforge } from '../lib/insforge';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const Nutrition: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(0);
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);

  const MEAL_PLAN = [
    { id: 'm0', type: language === 'ta' ? 'அதிகாலை' : 'Early Morning', time: '6:30 AM', title: language === 'ta' ? 'ஊறவைத்த பாதாம் மற்றும் வெதுவெதுப்பான நீர்' : 'Soaked Almonds & Warm Water', nutrients: 'Energy, Folate', color: 'bg-amber-500', icon: Droplets },
    { id: 'm1', type: language === 'ta' ? 'காலை உணவு' : 'Breakfast', time: '8:30 AM', title: language === 'ta' ? 'ராகி கூழ் அல்லது 3 இட்லி சாம்பாருடன்' : 'Ragi Koozh or 3 Idlis with Sambar', nutrients: 'Calcium, Protein', color: 'bg-rose-500', icon: Apple },
    { id: 'm2', type: language === 'ta' ? 'காலை இடைவேளை' : 'Mid-Morning', time: '11:00 AM', title: language === 'ta' ? 'மோர் மற்றும் வறுத்த கடலை' : 'Buttermilk & Roasted Channa', nutrients: 'Hydration, Iron', color: 'bg-emerald-500', icon: Droplets },
    { id: 'm3', type: language === 'ta' ? 'மதிய உணவு' : 'Lunch', time: '1:00 PM', title: language === 'ta' ? 'சிவப்பு அரிசி, கீரை பொரியல் மற்றும் பருப்பு' : 'Red Rice, Keerai Poriyal & Lentils', nutrients: 'Iron, Fiber, Zinc', color: 'bg-blue-500', icon: Carrot },
    { id: 'm4', type: language === 'ta' ? 'மாலை சிற்றுண்டி' : 'Evening', time: '4:30 PM', title: language === 'ta' ? 'சத்து மாவு கஞ்சி அல்லது சர்க்கரைவள்ளிக் கிழங்கு' : 'Sathu Maavu Kanji or Sweet Potato', nutrients: 'Complex Carbs, Energy', color: 'bg-purple-500', icon: Flame },
    { id: 'm5', type: language === 'ta' ? 'இரவு உணவு' : 'Dinner', time: '7:30 PM', title: language === 'ta' ? '2 சப்பாத்தி காய்கறி குருமாவுடன்' : '2 Chapati with Vegetable Kurma', nutrients: 'Easy Digestion', color: 'bg-indigo-500', icon: CheckCircle2 },
  ];

  const WEEKLY_ESSENTIALS = [
    { food: language === 'ta' ? 'முட்டை' : 'Egg', times: '5-6', nutrient: t('iron') },
    { food: language === 'ta' ? 'சிறிய மீன்' : 'Small Fish', times: '2-3', nutrient: 'Omega-3' },
    { food: language === 'ta' ? 'கீரை' : 'Greens (Keerai)', times: '4-5', nutrient: t('iron') },
    { food: language === 'ta' ? 'ராகி' : 'Ragi', times: '4-5', nutrient: t('calcium') },
  ];

  const handleTrackMeal = async (mealId: string) => {
    if (completedMeals.includes(mealId)) return;
    setCompletedMeals([...completedMeals, mealId]);
    
    const meal = MEAL_PLAN.find(m => m.id === mealId);
    if (!meal) return;

    try {
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (userData?.user) {
        await insforge.database.from('nutrition_logs').insert([{
          user_id: userData.user.id,
          meal_type: meal.type,
          title: meal.title,
          nutrients: meal.nutrients,
          completed: true
        }]);
      }
    } catch (e) {
      console.error("Tracking failed:", e);
    }
  };

  const progressPercentage = (completedMeals.length / MEAL_PLAN.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <h1 className="text-4xl font-extrabold text-[#1E293B] mb-2">{t('nutritional_journey')} 🥗</h1>
          <p className="text-lg text-[#64748B] font-medium">{t('nutrition_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left: Meal Plan Tracker */}
        <div className="xl:col-span-2 space-y-10">
           <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-[#FFE4E6]">
             <div className="flex gap-4 items-center">
               <button onClick={() => setSelectedDay(Math.max(0, selectedDay-1))} className="p-3 hover:bg-[#F8FAFC] rounded-2xl transition-colors">
                  <ChevronLeft size={24} className="text-[#64748B]" />
               </button>
               <div className="text-center w-32">
                 <h4 className="text-xl font-black text-[#1E293B]">{t('today')}</h4>
                 <p className="text-sm font-bold text-[#64748B]">{new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US')}</p>
               </div>
               <button onClick={() => setSelectedDay(selectedDay+1)} className="p-3 hover:bg-[#F8FAFC] rounded-2xl transition-colors">
                  <ChevronRight2 size={24} className="text-[#64748B]" />
               </button>
             </div>
             <div className="flex items-center gap-4 bg-emerald-100 text-emerald-600 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest">
               <CheckCircle2 size={18} />
               {t('on_track')}
             </div>
           </div>

           <div className="space-y-6">
              {MEAL_PLAN.map((meal, i) => (
                <motion.div 
                   key={meal.type}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="glass-card p-6 flex flex-col md:flex-row items-center gap-8 group hover:bg-white transition-all ring-1 ring-[#FFE4E6]"
                >
                   <div className="flex items-center gap-6 flex-1">
                      <div className={`${meal.color} w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                         <meal.icon size={36} className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md", meal.color)}>{meal.type}</span>
                           <span className="flex items-center gap-1 text-[11px] font-bold text-[#64748B]">
                             <Clock size={12} />
                             {meal.time}
                           </span>
                        </div>
                        <h4 className="text-2xl font-black text-[#1E293B]">{meal.title}</h4>
                        <p className="text-sm font-bold text-[#64748B] flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          {meal.nutrients}
                        </p>
                      </div>
                   </div>
                   <button 
                      onClick={() => handleTrackMeal(meal.id)}
                      disabled={completedMeals.includes(meal.id)}
                      className={cn(
                        "px-8 py-4 rounded-2xl font-black transition-all border group-hover:border-[#F43F5E]/40",
                        completedMeals.includes(meal.id) 
                          ? "bg-emerald-100 text-emerald-600 border-emerald-200 cursor-default" 
                          : "bg-[#F8FAFC] text-[#64748B] hover:text-[#F43F5E] border-[#E2E8F0]"
                      )}
                    >
                       {completedMeals.includes(meal.id) ? t('logged') : t('track_meal')}
                    </button>
                </motion.div>
              ))}
           </div>

           {/* Weekly Essentials */}
           <div className="glass-card p-8 bg-white border-[#FFE4E6]">
              <h3 className="text-2xl font-black text-[#1E293B] mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-[#F43F5E]" />
                {t('weekly_essentials')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {WEEKLY_ESSENTIALS.map((item) => (
                   <div key={item.food} className="bg-[#FFF1F2] p-4 rounded-2xl border border-[#FFE4E6] text-center space-y-2">
                     <p className="text-xs font-black text-[#F43F5E] uppercase tracking-widest">{item.food}</p>
                     <p className="text-xl font-black text-[#1E293B]">{item.times}x</p>
                     <p className="text-[10px] font-bold text-[#64748B]">{item.nutrient}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Tracking & Tips */}
        <div className="space-y-8">
           <div className="glass-card p-10 space-y-10 relative overflow-hidden ring-4 ring-[#F43F5E]/5">
              <div className="space-y-6">
                 {[
                   { label: t('calcium'), value: 80, color: 'bg-rose-500' },
                   { label: t('iron'), value: 65, color: 'bg-[#B50045]' },
                   { label: t('protein'), value: 70, color: 'bg-emerald-500' },
                   { label: t('water'), value: 60, color: 'bg-blue-500' },
                 ].map((track) => (
                   <div key={track.label} className="space-y-2">
                     <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-black text-[#1E293B] uppercase tracking-widest">{track.label}</span>
                        <span className="text-sm font-black text-[#64748B]">{track.value}%</span>
                     </div>
                     <div className="h-4 bg-[#F1F5F9] rounded-full overflow-hidden p-1 border border-[#E2E8F0]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${track.value}%` }}
                          className={cn("h-full rounded-full shadow-lg", track.color)}
                        ></motion.div>
                     </div>
                   </div>
                 ))}
               </div>
           </div>

           {/* Warning / Avoid Card */}
           <div className="glass-card p-8 bg-rose-50 border-2 border-dashed border-rose-200 space-y-4">
              <h4 className="text-lg font-black text-rose-600 flex items-center gap-2">
                ⚠️ {t('avoid_safety')}
              </h4>
              <ul className="space-y-2 text-sm font-bold text-rose-800">
                {language === 'ta' ? (
                  <>
                    <li>• உணவுக்குப் பிறகு காபி/டீ குடிக்க வேண்டாம்</li>
                    <li>• பப்பாளி அல்லது அன்னாசிப்பழம் சாப்பிட வேண்டாம்</li>
                    <li>• பேக் செய்யப்பட்ட நொறுக்குத் தீனிகள் / அதிக எண்ணெய் தவிர்க்கவும்</li>
                  </>
                ) : (
                  <>
                    <li>• No coffee/tea after meals</li>
                    <li>• Unripe Papaya or Pineapple</li>
                    <li>• Packaged snacks / excess oil</li>
                  </>
                )}
              </ul>
           </div>

           {/* Maternal Tip */}
           <div className="glass-card p-8 bg-[#1E293B] text-white space-y-6 relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <Apple size={30} className="text-[#F43F5E]" />
                <h4 className="text-xl font-black">{t('daily_pro_tip')}</h4>
                <p className="text-white/70 font-medium leading-relaxed italic">
                  {language === 'ta' 
                    ? '"ராகியில் அரிசியை விட 10 மடங்கு அதிக கால்சியம் உள்ளது. ஒரு வேளை உணவை ராகி கூழாக மாற்றினால் குழந்தையின் எலும்பு வளர்ச்சிக்கு பெரிதும் உதவும்."' 
                    : '"Ragi is 10x richer in calcium than rice. Swapping one meal for Ragi Koozh significantly helps baby\'s bone growth."'
                  }
                </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
