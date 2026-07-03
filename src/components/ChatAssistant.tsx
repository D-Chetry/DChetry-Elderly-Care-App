import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ScheduledItem, UserProfile } from '../types';
import { 
  Send, Bot, User, Sparkles, Volume2, 
  VolumeX, AlertCircle, RefreshCw, MessageSquare 
} from 'lucide-react';

interface ChatAssistantProps {
  schedule: ScheduledItem[];
  profile: UserProfile;
}

const PRESETS = [
  'What is next on my schedule?',
  'Suggest a gentle stretching exercise',
  'Give me a friendly wellness tip',
  'Why is water hydration important?'
];

export default function ChatAssistant({ schedule, profile }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello ${profile.name || 'there'}! I am your companion assistant. You can ask me about your schedule, ask for some gentle stretching tips, or just have a friendly conversation! How are you feeling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTextClass = () => {
    if (profile.textSize === 'extra-large') return 'text-elderly-xl';
    if (profile.textSize === 'large') return 'text-elderly-large';
    return 'text-elderly-normal';
  };

  const speakText = (text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      // Toggle stop
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(messageId);

    const cleanText = text.replace(/[*#_`~]/g, ''); // Remove basic markdown characters for better TTS speech flow
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85; // Pleasant, steady reading rate for elderly ears
    
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    // Use english friendly voice
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.startsWith('en-'));
    if (friendlyVoice) utterance.voice = friendlyVoice;

    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError('');
    const userMsgText = textToSend.trim();
    setInput('');

    const newUserMessage: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for context (last 6 messages)
      const formattedHistory = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsgText,
          history: formattedHistory,
          schedule: schedule,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not contact your companion. Please try again.');
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If user voice is enabled, automatically read out the assistant response!
      if (profile.voiceEnabled) {
        speakText(data.reply, assistantMsg.id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Apologies, my link is briefly down. Let us try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden flex flex-col h-full" id="chat-assistant">
      {/* Header */}
      <div className="bg-brand-dark p-6 text-white shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="w-9 h-9 text-brand-sage animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">AI Companion & Helper</h2>
            <p className="text-[#A0B0A8] text-sm">Ask anything in comfortable large text</p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                text: `Hello ${profile.name || 'there'}! I am reset and ready. What shall we talk about or plan today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
          }}
          className="bg-brand-sage text-white hover:bg-[#4E6D60] text-sm font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          title="Reset chat"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-soft min-h-0" id="chat-messages-container">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isAssistant ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                isAssistant ? 'bg-brand-sage text-white' : 'bg-brand-dark text-white'
              }`}>
                {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  isAssistant 
                    ? 'bg-white border-brand-border text-brand-dark rounded-tl-none' 
                    : 'bg-[#EAE6DD] border-[#DCD7CB] text-brand-dark rounded-tr-none'
                }`}>
                  {/* Message Text - support dynamic size */}
                  <p className={`font-medium break-words whitespace-pre-wrap ${getTextClass()}`}>
                    {msg.text}
                  </p>

                  {/* Speak button for assistant responses - lovely accessibility utility */}
                  {isAssistant && (
                    <div className="mt-2.5 flex justify-end border-t border-brand-border pt-2">
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          speakingMessageId === msg.id
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-brand-soft text-brand-sage hover:bg-white border border-[#CBDCD2]'
                        }`}
                        title="Read this out loud"
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Stop Reading</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-brand-sage" />
                            <span>Read Out Loud</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <span className={`text-[11px] font-mono mt-1 ${isAssistant ? 'text-brand-secondary' : 'text-brand-secondary text-right'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] self-start mr-auto">
            <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-sage flex items-center justify-center animate-pulse border border-brand-border">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-brand-border p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-brand-secondary font-medium shadow-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-sage" />
              <span>Thinking companion replies...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset helpers - nice big tap targets */}
      <div className="p-4 bg-brand-soft border-t border-brand-border shrink-0">
        <p className="text-xs text-brand-secondary font-bold mb-2 uppercase tracking-wider">Tap to ask directly:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="bg-white hover:bg-brand-soft border border-brand-border hover:border-brand-sage text-brand-dark text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-left disabled:opacity-50 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-brand-border bg-white shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(input);
            }}
            placeholder="Type your question or message..."
            disabled={isLoading}
            className="flex-1 bg-[#F9F9F7] border border-brand-border rounded-xl px-4 py-3.5 text-lg text-brand-dark focus:outline-none focus:border-brand-sage font-medium disabled:opacity-60"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="bg-brand-sage text-white font-bold p-4 rounded-xl hover:bg-[#4E6D60] transition-colors disabled:opacity-45 cursor-pointer"
            title="Send"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
