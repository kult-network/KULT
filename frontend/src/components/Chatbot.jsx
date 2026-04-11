import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Calendar, Bell, ArrowRight, BrainCircuit, Bot, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const Kultist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "SYSTEM ONLINE. I am KULTIST. Ask me about the network intel." }
  ]);
  const [input, setInput] = useState('');
  const [data, setData] = useState({ events: [], notifications: [] });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, notificationsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/hubs/0/events`),
          axios.get(`${API_BASE_URL}/api/notifications`)
        ]);
        setData({ events: eventsRes.data || [], notifications: notificationsRes.data || [] });
      } catch (err) { console.error("Kultist intel sync error:", err); }
    };
    fetchData();
  }, [isOpen]);

  const useSarcasticFallback = (query) => {
    let response = "";
    let foundItems = [];
    const matchedEvents = data.events.filter(e => e.Title?.toLowerCase().includes(query) || e.Description?.toLowerCase().includes(query));
    const matchedNotifications = data.notifications.filter(n => n.Title?.toLowerCase().includes(query) || n.Message?.toLowerCase().includes(query));

    if (matchedEvents.length > 0 || matchedNotifications.length > 0) {
      response = "Intel located.";
      foundItems = [
        ...matchedEvents.map(e => ({ type: 'event', title: e.Title, id: e.Id || e.id })),
        ...matchedNotifications.map(n => ({ type: 'notification', title: n.Title, id: n.Id || n.id }))
      ];
    } else {
      response = "Zero results found. Adjust parameters.";
    }
    setMessages(prev => [...prev, { role: 'bot', content: response, items: foundItems }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    const query = input.toLowerCase();
    setInput('');

    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== "") {
      try {
        const eventsContext = data.events.map(e => `- ${e.Title}`).join('\n');
        const notificationsContext = data.notifications.map(n => `- ${n.Title}`).join('\n');
        const systemPrompt = `You are KULTIST, a tactical AI assistant. Intel available: EVENTS: ${eventsContext || 'None'} NOTIFICATIONS: ${notificationsContext || 'None'}. Be concise, tactical, and minimal. Do not use excessive emojis.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'KULT Gateway' },
          body: JSON.stringify({ model: "meta-llama/llama-3.1-8b-instruct:free", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: query }] })
        });

        if (!response.ok) throw new Error(`AI Request failed: ${response.status}`);
        const resData = await response.json();
        const botResponse = resData?.choices?.[0]?.message?.content || "No intel found.";
        
        const matchedItems = [
          ...data.events.filter(e => e.Title && botResponse.toLowerCase().includes(e.Title.toLowerCase())),
          ...data.notifications.filter(n => n.Title && botResponse.toLowerCase().includes(n.Title.toLowerCase()))
        ];

        const foundItems = matchedItems.map(item => ({ type: item.Title ? 'event' : 'notification', title: item.Title || item.Message || "Link", id: item.Id || item.id }));
        setMessages(prev => [...prev, { role: 'bot', content: botResponse, items: foundItems }]);
      } catch (err) {
        useSarcasticFallback(query);
      } finally { setLoading(false); }
    } else {
      useSarcasticFallback(query);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[3000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[380px] h-[500px] bg-[#0a0a0a] border border-[#222] rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#111] border-b border-[#222] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm tracking-tight leading-tight">Kultist AI</h3>
                  <p className="text-[#888] text-xs font-medium mt-0.5">Network Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-[#666] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#000] custom-scrollbar">
              {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-[#EDEDED] text-black rounded-br-sm' : 'bg-[#111] border border-[#222] text-[#EDEDED] rounded-bl-sm'}`}>
                      {m.content}
                      {m.items && m.items.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {m.items.map((item, idx) => (
                            <button
                               key={idx}
                               onClick={() => { if (item.type === 'event') navigate(`/hub/0`); setIsOpen(false); }}
                               className="w-full flex items-center justify-between p-2.5 bg-[#0a0a0a] border border-[#333] hover:border-[#555] rounded-lg transition-colors group"
                             >
                               <div className="flex items-center gap-2.5 min-w-0">
                                 <div className="p-1 rounded-md bg-[#222] text-[#A1A1AA]">
                                    {item.type === 'event' ? <Calendar size={12} /> : <Bell size={12} />}
                                 </div>
                                 <span className="truncate text-xs font-medium text-white">{item.title}</span>
                               </div>
                               <ArrowRight size={12} className="text-[#666] group-hover:text-white transition-colors" />
                             </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                 </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                  <div className="bg-[#111] border border-[#222] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 size={14} className="text-[#A1A1AA] animate-spin" />
                  </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-[#111] border-t border-[#222] shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Message Kultist..."
                  className="w-full bg-[#0a0a0a] border border-[#333] pl-4 pr-12 py-3 rounded-xl outline-none focus:border-[#666] text-sm text-white placeholder-[#888] font-medium transition-colors"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-transform active:scale-95"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white text-black rounded-full shadow-[0_4px_14px_rgba(255,255,255,0.2)] flex items-center justify-center group outline-none"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={22} />}
      </motion.button>
    </div>
  );
};

export default Kultist;
