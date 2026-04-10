import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Calendar, Bell, ArrowRight, Loader2, Zap, Orbit, BrainCircuit } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

// Note: In a production environment, you should use a backend to securely call the Gemini API.
// For this task, we are calling the OpenRouter API from the client-side for demonstration.
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const Kultist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "SYSTEM ONLINE. I am KULTIST. Ask me about the network intel or why you're failing your minor courses. (Kidding, I only have the intel)." }
  ]);
  const [input, setInput] = useState('');
  const [data, setData] = useState({ events: [], notifications: [] });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, notificationsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/hubs/0/events`),
          axios.get(`${API_BASE_URL}/api/notifications`)
        ]);
        setData({
          events: eventsRes.data || [],
          notifications: notificationsRes.data || []
        });
      } catch (err) {
        console.error("Kultist intel sync error:", err);
      }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
  }, [isOpen]);

  const sarcasticPunchlines = [
    "Nothing found. Just like your attendance in those 8 AM lectures. 💀",
    "Zero results. Even the server is more productive than you during exam week. 🙄",
    "Intel empty. Much like your bank account after the campus fest. 💸",
    "404: Missions not found. Just like the 'free time' you expected in engineering. 🤡",
    "Nope. Nothing. Maybe check back when you've finished that back-log assignment? 📑",
    "Empty. Just like the library on a Friday night. 🏚️",
    "Nothing scheduled. Perfect time to take another '5-minute' nap that lasts 5 hours. 😴"
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const query = input.toLowerCase();
    setInput('');

    // If OpenRouter API Key is available, use it. Otherwise, use sarcastic fallback.
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== "") {
      try {
        // Prepare context for AI
        const eventsContext = data.events.map(e => `- ${e.Title}: ${e.Description || 'No description'}`).join('\n');
        const notificationsContext = data.notifications.map(n => `- ${n.Title}: ${n.Message || 'No message'}`).join('\n');
        
        const systemPrompt = `
          You are KULTIST, a sarcastic and tactical AI Oracle for a university network called KULT.
          Your personality: Sharp, cynical, and witty, like a tired university student but with a high-tech "operational" edge. 
          Use plenty of emojis to express your sarcasm and tactical vibe (e.g. 🙄, 📡, 💀, 🎓, ☕).
          
          You have access to the following campus intelligence (Intel):
          
          EVENTS:
          ${eventsContext || 'No events scheduled.'}
          
          NOTIFICATIONS:
          ${notificationsContext || 'No notifications currently active.'}
          
          Rules:
          1. Use emojis in every response to maintain your "KULTIST" persona. 💅
          2. ONLY provide specific details about an event or notification if the user explicitly asks for it (e.g., "What is the workshop about?" or "Give me details on the DL").
          3. If the user just says "Hi" or asks a general question, be sarcastic and cynical without dumping event details unless prompted.
          4. If the user asks for something that doesn't exist, give a cynical punchline about university student life (like lack of sleep, attendance issues, or empty wallets).
          5. Keep responses concise and tactical. 
          6. Never mention you are an AI. Always stay in character as KULTIST.
          7. Use "Intel" instead of "Information".
        `;

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'KULT Gateway'
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-120b:free",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
              ]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`AI Request failed: ${response.status}`);
        }

        const resData = await response.json();
        const botResponse = resData?.choices?.[0]?.message?.content || "No intel found.";
        
        // Find if any items were mentioned to show clickable links
        const matchedItems = [
          ...data.events.filter(e => e.Title && botResponse.toLowerCase().includes(e.Title.toLowerCase())),
          ...data.notifications.filter(n => e.Title && botResponse.toLowerCase().includes(n.Title.toLowerCase()))
        ];

        const foundItems = matchedItems.map(item => ({
          type: item.Title ? 'event' : 'notification',
          title: item.Title || item.Message || "Intel Link",
          id: item.Id || item.id
        }));

        setMessages(prev => [...prev, { role: 'bot', content: botResponse, items: foundItems }]);
      } catch (err) {
        console.error("KULTIST AI error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        // Fallback to sarcastic search if AI fails
        useSarcasticFallback(query);
      } finally {
        setLoading(false);
      }
    } else {
      // Use the previous sarcastic search logic
      useSarcasticFallback(query);
      setLoading(false);
    }
  };

  const useSarcasticFallback = (query) => {
    let response = "";
    let foundItems = [];

    const matchedEvents = data.events.filter(e => 
      e.Title?.toLowerCase().includes(query) || 
      e.Description?.toLowerCase().includes(query) ||
      e.Category?.toLowerCase().includes(query)
    );

    const matchedNotifications = data.notifications.filter(n => 
      n.Title?.toLowerCase().includes(query) || 
      n.Message?.toLowerCase().includes(query) ||
      n.Category?.toLowerCase().includes(query)
    );

    if (matchedEvents.length > 0 || matchedNotifications.length > 0) {
      response = "ACCESS GRANTED. INTEL FOUND:";
      foundItems = [
        ...matchedEvents.map(e => ({ type: 'event', title: e.Title, id: e.Id || e.id })),
        ...matchedNotifications.map(n => ({ type: 'notification', title: n.Title, id: n.Id || n.id }))
      ];
    } else {
      response = sarcasticPunchlines[Math.floor(Math.random() * sarcasticPunchlines.length)];
    }

    setMessages(prev => [...prev, { role: 'bot', content: response, items: foundItems }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[3000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            className="absolute bottom-20 right-0 w-[320px] sm:w-[350px] h-[500px] sm:h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-[#050505] backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Live Objects / Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, -90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"
              />
            </div>

            {/* Header */}
            <div className="relative p-4 bg-gradient-to-b from-purple-600 to-purple-700 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Zap size={20} className="text-white animate-pulse" />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-1 border border-dashed border-white/30 rounded-xl pointer-events-none"
                  />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase italic tracking-tighter text-base leading-none">KULTIST</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-ping" />
                    <p className="text-[8px] text-white/70 font-black uppercase tracking-[0.2em]">NETWORK ORACLE V3.0 AI</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[88%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-3 rounded-2xl text-[12px] font-bold leading-relaxed shadow-xl ${
                      m.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-white/10 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-md'
                    }`}>
                      {m.content}
                      
                      {m.items && m.items.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {m.items.map((item, idx) => (
                            <motion.button
                              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                              key={idx}
                              onClick={() => {
                                if (item.type === 'event') navigate(`/hub/0`);
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-1.5 rounded-lg ${item.type === 'event' ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                                  {item.type === 'event' ? <Calendar size={12} className="text-purple-400" /> : <Bell size={12} className="text-blue-400" />}
                                </div>
                                <span className="truncate text-[10px] font-black uppercase tracking-tight text-white">{item.title}</span>
                              </div>
                              <ArrowRight size={12} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-[7px] font-black uppercase tracking-widest mt-1.5 opacity-40 ${m.role === 'user' ? 'mr-1.5' : 'ml-1.5'}`}>
                      {m.role === 'user' ? 'OPERATIVE' : 'KULTIST'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl rounded-tl-none backdrop-blur-md flex items-center gap-2">
                    <BrainCircuit size={14} className="text-purple-400 animate-pulse" />
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 bg-purple-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 bg-purple-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 bg-purple-300 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Tactical Input */}
            <div className="relative p-4 bg-slate-900/80 border-t border-white/10 backdrop-blur-xl shrink-0">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="COMMAND INPUT..."
                    className="w-full bg-black/60 border border-white/10 p-3 pr-10 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/50 font-black uppercase text-[10px] tracking-widest text-white placeholder:text-white/20 transition-all"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                    <Orbit size={14} className="animate-spin-slow" />
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 hover:bg-purple-500 transition-all"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-purple-600 text-white rounded-[20px] shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center group relative overflow-hidden border border-white/20"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {isOpen ? <X size={24} className="relative z-10" /> : <Zap size={24} fill="white" className="relative z-10 animate-pulse" />}
        
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-white text-purple-600 rounded-full border-2 border-slate-950 flex items-center justify-center z-20"
            >
              <Sparkles size={10} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbit Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-white/10 rounded-[24px] pointer-events-none"
        />
      </motion.button>
    </div>
  );
};

export default Kultist;
