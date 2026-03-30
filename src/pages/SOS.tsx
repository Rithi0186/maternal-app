import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  ShieldCheck, 
  BellRing,
  ChevronRight,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { insforge } from '../lib/insforge';
import { useLanguage } from '../context/LanguageContext';

const SOS: React.FC = () => {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [profile, setProfile] = useState<any>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: profileData } = await insforge.database.from('profiles').select('*').single();
      if (profileData) setProfile(profileData);
      
      const { data: contactsData } = await insforge.database.from('sos_contacts').select('*');
      if (contactsData) setEmergencyContacts(contactsData);
    };
    fetchProfileData();
  }, []);

  const handleSOS = () => {
    setIsActive(true);
    let timer = 5;
    const interval = setInterval(async () => {
      timer -= 1;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        
        // 1. Get real coordinates
        let location = 'Location not available';
        if ('geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              });
            });
            const { latitude, longitude } = position.coords;
            location = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
          } catch (geoError) {
            console.warn("Geolocation failing:", geoError);
          }
        }

        // 2. Trigger SOS Function
        try {
          const { error } = await insforge.functions.invoke('trigger-sos-v2', {
             body: {
               location: location,
               timestamp: new Date().toISOString(),
               user_id: profile?.id || '12345678-1234-5678-90ab-cdef12345678'
             }
          });
          if (error) throw error;
          alert("🚨 SOS Alert Sent Successfully! Your emergency contacts and doctors have been notified.");
        } catch (error) {
          console.error("SOS Alert Failed:", error);
          alert("Failed to send SOS alert. Please check your Twilio configuration.");
        }
        setIsActive(false);
        setCountdown(5);
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-4 px-4">
        <h1 className="text-4xl font-extrabold text-[#1E293B]">{t('emergency_protocols')} 🆘</h1>
        <p className="text-lg text-[#64748B] font-medium max-w-xl mx-auto">{t('medical_emergencies')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        {/* Left SOS Trigger Zone */}
        <div className="space-y-8 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#B50045] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleSOS}
              disabled={isActive}
              className={cn(
                "relative z-10 w-64 h-64 rounded-full flex flex-col items-center justify-center p-8 transition-all duration-300 shadow-2xl overflow-hidden active:shadow-inner",
                isActive 
                  ? "bg-[#1E293B] ring-8 ring-[#B50045] ring-offset-8 ring-offset-white" 
                  : "bg-gradient-to-br from-[#B50045] to-[#F43F5E] hover:from-[#881337] cursor-pointer"
              )}
            >
              {isActive ? (
                <div className="text-center space-y-2">
                   <h4 className="text-6xl font-black text-white">{countdown}</h4>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B50045]">Seconds to Alert</p>
                   <button 
                     onClick={(e) => {e.stopPropagation(); setIsActive(false); setCountdown(5);}}
                     className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md transition-all"
                   >
                     Cancel
                   </button>
                </div>
              ) : (
                <>
                  <BellRing size={80} className="text-white mb-4 animate-[bounce_2s_infinite]" />
                  <h4 className="text-3xl font-black text-white">{t('trigger_sos')}</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mt-2">Tap to Activate</p>
                </>
              )}
            </motion.button>
          </div>

          <div className="space-y-6 w-full max-w-sm">
             <div className="glass-card p-6 flex items-center gap-5 border-[#FFE4E6]">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center">
                   <MapPin size={24} />
                </div>
                <div>
                   <h5 className="font-black text-[#1E293B]">Live Location Status</h5>
                   <p className="text-sm font-bold text-[#64748B]">GPS Ready</p>
                </div>
             </div>
             <div className="glass-card p-6 flex items-center gap-5 border-[#FFE4E6]">
                <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h5 className="font-black text-[#1E293B]">Auto-Alert Response</h5>
                   <p className="text-sm font-bold text-[#64748B]">24/7 Monitoring Active</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Contacts Section */}
        <div className="space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-2xl font-black text-[#1E293B] flex items-center gap-3">
               <PhoneCall className="text-[#B50045]" />
               {t('sos')}
             </h3>
           </div>

           <div className="space-y-4">
               {emergencyContacts.map((contact) => {
                 const isDoctor = contact.relationship?.toLowerCase().includes('doctor') || contact.relationship?.toLowerCase().includes('health');
                 const isFamily = contact.relationship?.toLowerCase().includes('husband') || contact.relationship?.toLowerCase().includes('guardian') || contact.relationship?.toLowerCase().includes('family');
                 
                 const iconBg = isDoctor ? 'bg-emerald-100' : isFamily ? 'bg-rose-100' : 'bg-blue-100';
                 const iconColor = isDoctor ? 'text-emerald-600' : isFamily ? 'text-rose-600' : 'text-blue-600';

                 return (
                   <div key={contact.id} className="glass-card p-6 flex items-center justify-between group hover:premium-shadow transition-all border-[#FFE4E6]">
                      <div className="flex items-center gap-5">
                         <div className={`${iconBg} ${iconColor} w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                            {isDoctor ? <Stethoscope size={30} /> : <PhoneCall size={30} />}
                         </div>
                         <div>
                           <h4 className="text-lg font-black text-[#1E293B]">{contact.name}</h4>
                           <p className="text-sm font-bold text-[#64748B] flex items-center gap-2">
                              {contact.number}
                              <span className="w-1 h-1 bg-[#CBD5E1] rounded-full"></span>
                              {contact.relationship}
                           </p>
                         </div>
                      </div>
                   </div>
                 );
               })}
           </div>

           {/* FAQ/Tip */}
           <div className="glass-card p-8 bg-black text-white rounded-[40px] space-y-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h4 className="text-2xl font-black flex items-center gap-3">
                   <AlertCircle size={28} className="text-[#F43F5E]" />
                   Emergency Status
                 </h4>
                 <p className="text-white/70 font-medium leading-relaxed">
                   When you trigger SOS, your location and profile are shared with medical staff and family immediately.
                 </p>
                 <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3">
                   Read Protocol
                   <ChevronRight size={20} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SOS;
