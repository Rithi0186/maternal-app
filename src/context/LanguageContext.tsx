import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    chatbot: 'MaternalCare AI',
    community: 'Community',
    reports: 'Medical Reports',
    nutrition: 'Nutrition',
    sos: 'Emergency SOS',
    settings: 'Settings',
    sign_out: 'Sign Out',
    
    // Dashboard
    hello: 'Hello',
    welcome: 'Welcome back to your sanctuary.',
    week: 'Week',
    trimester: 'Trimester',
    fruit_size: 'Your baby is the size of a',
    pomegranate: 'Pomegranate',
    growth_tip: 'Your baby is developing tiny fingernails and unique fingerprints this week!',
    view_detailed: 'View Detailed Report',
    full_analytics: 'Full Analytics',
    hb: 'Hemoglobin',
    bp: 'Blood Pressure',
    sugar: 'Blood Sugar',
    tasks: "Today's Tasks",
    medical_schedule: 'Medical Schedule',
    next_checkup: 'Next Checkup',
    confirmed_appointment: 'Confirmed appointment',
    no_checkup: 'No checkup scheduled',
    reschedule: 'Reschedule',
    set_date: 'Set Checkup Date',
    quick_actions: 'Quick Actions',
    join_community_btn: 'Join Community',
    notifying_contacts: 'One tap to notify your doctors and family.',
    setup_sos_btn: 'Setup SOS Contacts',
    schedule_checkup: 'Schedule Checkup',
    cancel: 'Cancel',
    save_date: 'Save Date',
    log_vitals: 'Log Health Vitals',
    reminders: 'Reminders',
    add_reminder: 'Add Reminder',
    no_reminders: 'No custom reminders yet',
    add_btn: 'Add',

    // Nutrition
    nutritional_journey: 'Your Nutritional Journey',
    nutrition_desc: 'Localized meal plans designed for your health and baby\'s growth.',
    today: 'Today',
    on_track: 'On Track',
    track_meal: 'Track Meal',
    logged: 'Logged',
    weekly_essentials: 'Weekly Essentials Tracker',
    calcium: 'Calcium',
    iron: 'Iron',
    protein: 'Protein',
    water: 'Water',
    avoid_safety: 'Avoid for Safety',
    daily_pro_tip: 'Daily Pro-Tip',

    // Reports
    reports_vault: 'Reports Vault',
    vault_desc: 'Your personal encrypted space for medical records, scans, and laboratory reports.',
    add_record: 'Add New Record',
    select_medical_report: 'Select Medical Report',
    securing_file: 'Securing your file...',
    data_safety: 'Data Safety Guaranteed',
    vault_records: 'Vault Records',
    search_records: 'Search records...',
    vault_empty: 'Vault is Empty',
    secure_badge: 'SECURE',
    confirm_delete: 'Are you sure you want to delete this report?',

    // Community
    community_header: 'Community Feed',
    community_desc: 'Connect with moms and share your journey.',
    search_topics: 'Search topics...',
    share_story: 'Share Your Story',
    whats_on_mind: "What's on your mind today?",
    post_story: 'Post Story',
    popular_groups: 'Popular Groups',
    join_group: 'Join Group',
    member: 'Member',
    no_stories: 'No stories yet',
    add_image: 'Add Image',

    // Onboarding
    full_name: 'Your Full Name',
    pregnancy_month: 'Current Pregnancy Month',
    contact_name: 'Contact Name',
    phone_number: 'Emergency Phone Number',
  },
  ta: {
    // Nav
    dashboard: 'டாஷ்போர்டு',
    chatbot: 'தாய்மை AI',
    community: 'சமூகம்',
    reports: 'மருத்துவ அறிக்கைகள்',
    nutrition: 'ஊட்டச்சத்து',
    sos: 'அவசர SOS',
    settings: 'அமைப்புகள்',
    sign_out: 'வெளியேறு',

    // Dashboard
    hello: 'வணக்கம்',
    welcome: 'உங்கள் சரணாலயத்திற்கு மீண்டும் வருக.',
    week: 'வாரம்',
    trimester: 'மும்மாதம்',
    fruit_size: 'உங்கள் குழந்தை ஒரு',
    pomegranate: 'மாதுளை',
    growth_tip: 'இந்த வாரம் உங்கள் குழந்தைக்கு சிறிய நகங்கள் மற்றும் தனித்துவமான கைரேகைகள் உருவாகின்றன!',
    view_detailed: 'விரிவான அறிக்கையைப் பார்க்கவும்',
    full_analytics: 'முழு பகுப்பாய்வு',
    hb: 'ஹீமோகுளோபின்',
    bp: 'இரத்த அழுத்தம்',
    sugar: 'இரத்த சர்க்கரை',
    tasks: 'இன்றைய பணிகள்',
    medical_schedule: 'மருத்துவ அட்டவணை',
    next_checkup: 'அடுத்த பரிசோதனை',
    confirmed_appointment: 'உறுதிப்படுத்தப்பட்ட சந்திப்பு',
    no_checkup: 'பரிசோதனை எதுவும் திட்டமிடப்படவில்லை',
    reschedule: 'மறுதேதி',
    set_date: 'தேதியை அமை',
    quick_actions: 'விரைவான செயல்பாடுகள்',
    join_community_btn: 'சமூகத்தில் இணையுங்கள்',
    notifying_contacts: 'உங்கள் மருத்துவர்கள் மற்றும் குடும்பத்தினருக்கு தெரிவிக்க ஒரு முறை தொடவும்.',
    setup_sos_btn: 'SOS தொடர்புகளை அமைக்கவும்',
    schedule_checkup: 'பரிசோதனையை திட்டமிடுங்கள்',
    cancel: 'ரத்து செய்',
    save_date: 'தேதியைச் சேமி',
    log_vitals: 'சுகாதார விவரங்களைச் சேர்க்க',
    reminders: 'நினைவூட்டல்கள்',
    add_reminder: 'நினைவூட்டலைச் சேர்',
    no_reminders: 'நினைவூட்டல்கள் எதுவும் இல்லை',
    add_btn: 'சேர்',

    // Nutrition
    nutritional_journey: 'உங்கள் ஊட்டச்சத்து பயணம்',
    nutrition_desc: 'உங்கள் ஆரோக்கியம் மற்றும் குழந்தையின் வளர்ச்சிக்காக வடிவமைக்கப்பட்ட உணவு திட்டங்கள்.',
    today: 'இன்று',
    on_track: 'சரியான பாதையில்',
    track_meal: 'உணவைப் பதிவு செய்',
    logged: 'பதிவு செய்யப்பட்டது',
    weekly_essentials: 'வாராந்திர அத்தியாவசிய கண்காணிப்பு',
    calcium: 'கால்சியம்',
    iron: 'இரும்புச்சத்து',
    protein: 'புரதம்',
    water: 'தண்ணீர்',
    avoid_safety: 'பாதுகாப்பிற்காக தவிர்க்கவும்',
    daily_pro_tip: 'தினசரி குறிப்பு',

    // Reports
    reports_vault: 'அறிக்கை பெட்டகம்',
    vault_desc: 'மருத்துவ பதிவுகள், ஸ்கேன்கள் மற்றும் ஆய்வக அறிக்கைகளுக்கான உங்கள் தனிப்பட்ட பாதுகாப்பான இடம்.',
    add_record: 'புதிய பதிவைச் சேர்க்கவும்',
    select_medical_report: 'மருத்துவ அறிக்கையைத் தேர்ந்தெடுக்கவும்',
    securing_file: 'கோப்பைப் பாதுகாக்கிறது...',
    data_safety: 'தரவு பாதுகாப்பு உறுதி',
    vault_records: 'பெட்டக பதிவுகள்',
    search_records: 'பதிவுகளைத் தேடு...',
    vault_empty: 'பெட்டகம் காலியாக உள்ளது',
    secure_badge: 'பாதுகாப்பானது',
    confirm_delete: 'இந்த அறிக்கையை நீக்க விரும்புகிறீர்கள் என்பது உறுதியா?',

    // Community
    community_header: 'சமூகப் பதிவு',
    community_desc: 'தாய்மார்களுடன் இணையுங்கள் மற்றும் உங்கள் பயணத்தைப் பகிர்ந்து கொள்ளுங்கள்.',
    search_topics: 'தலைப்புகளைத் தேடு...',
    share_story: 'உங்கள் கதையைப் பகிர்ந்து கொள்ளுங்கள்',
    whats_on_mind: 'இன்று உங்கள் மனதில் என்ன இருக்கிறது?',
    post_story: 'கதையை பதிவிடு',
    popular_groups: 'பிரபலமான குழுக்கள்',
    join_group: 'குழுவில் சேர்',
    member: 'உறுப்பினர்',
    no_stories: 'இன்னும் கதைகள் இல்லை',
    add_image: 'படம் சேர்க்க',

    // Onboarding
    full_name: 'உங்கள் முழு பெயர்',
    pregnancy_month: 'தற்போதைய கர்ப்ப மாதம்',
    contact_name: 'தொடர்பு பெயர்',
    phone_number: 'அவசர தொலைபேசி எண்',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
