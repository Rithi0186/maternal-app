import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  MoreVertical, 
  Paperclip, 
  Mic, 
  RotateCcw,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { insforge } from '../lib/insforge';
import { useLanguage } from '../context/LanguageContext';

const MODEL_NAME = "google/gemini-3-pro-image-preview";

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'bot', 
      text: t('hello') + '! ' + t('ai_assistant_desc'), 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await insforge.database.from('profiles').select('*').single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  const callGemini = async (userText: string): Promise<string> => {
    const userName = profile?.full_name || 'Mother';
    const week = profile?.pregnancy_week || 'unknown';
    
    const context = `
      USER PROFILE:
      Name: ${userName}
      Pregnancy Week: ${week}
      LANGUAGE: ${language === 'ta' ? 'Tamil' : 'English'}
      
      You are a polite, friendly, and helpful Maternal Health Chatbot.
      GOAL: Give immediate maternal health guidance.
      REPLY: Keep it short (2-3 lines). ALWAYS reply in ${language === 'ta' ? 'Tamil' : 'English'}.
      NEVER: Medical diagnosis. Always suggest consulting a doctor for serious issues.
      PERSONALIZATION: Address the user by ${userName}. Mention their pregnancy week (${week}) if relevant to their question.
    `;

    try {
      const promptContent = `
        ${context}
        User says: ${userText}
      `;

      const completion = await insforge.ai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'user', content: promptContent }
        ],
      });

      return completion.choices[0].message.content || "I'm having trouble thinking right now.";
    } catch (error) {
      console.error("AI Error:", error);
      return "I'm having trouble connecting to the AI services. Please check your internet or try again later.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botResponseText = await callGemini(input.trim());
    
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: botResponseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white/50 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <header className="p-6 bg-white flex items-center justify-between border-b border-[#FFE4E6]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center shadow-lg group relative overflow-hidden">
            <Bot size={28} className="text-white relative z-10" />
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1E293B]">MaternalCare AI</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t('always_online')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 hover:bg-[#FFF1F2] rounded-2xl transition-colors text-[#64748B]">
             <RotateCcw size={22} />
           </button>
           <button className="p-3 hover:bg-[#FFF1F2] rounded-2xl transition-colors text-[#64748B]">
             <MoreVertical size={22} />
           </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8FAFC]/50 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-end gap-3 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                msg.role === 'user' ? "bg-white border-[#FFE4E6]" : "gradient-bg"
              )}>
                {msg.role === 'user' ? <User size={20} className="text-[#F43F5E]" /> : <Sparkles size={20} className="text-white" />}
              </div>
              
              <div className={cn(
                "p-5 rounded-[24px] text-lg font-medium shadow-sm transition-all",
                msg.role === 'user' 
                  ? "bg-[#1E293B] text-white rounded-br-none" 
                  : "bg-white text-[#1E293B] border border-[#FFE4E6] rounded-bl-none"
              )}>
                {msg.text.split('\n').map((line, i) => (
                   <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                ))}
                <span className={cn(
                  "text-[10px] block mt-2 opacity-50 font-bold",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center animate-bounce">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-white border border-[#FFE4E6] p-4 rounded-full flex gap-2">
              <span className="w-2 h-2 bg-[#F43F5E] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#F43F5E] rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-[#F43F5E] rounded-full animate-bounce delay-200"></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-8 bg-white border-t border-[#FFE4E6]">
        <div className="max-w-4xl mx-auto relative group">
          <div className="flex items-center gap-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] p-3 pl-6 rounded-[32px] transition-all focus-within:border-[#F43F5E] focus-within:ring-4 focus-within:ring-[#F43F5E]/10 group-hover:border-[#F43F5E]/40">
            <button className="text-[#64748B] hover:text-[#F43F5E] transition-colors">
              <Paperclip size={24} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat_placeholder')}
              className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-[#1E293B] placeholder:text-[#94A3B8] py-2"
            />
            <button className="text-[#64748B] hover:text-[#F43F5E] transition-colors p-2">
              <Mic size={24} />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                "p-4 rounded-[20px] transition-all flex items-center justify-center shadow-xl",
                input.trim() && !isTyping ? "gradient-bg text-white hover:scale-105 active:scale-95" : "bg-[#F1F5F9] text-[#94A3B8]"
              )}
            >
              <Send size={24} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
             <Heart size={14} className="text-[#F43F5E]" />
             <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">{t('medical_disclaimer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;
