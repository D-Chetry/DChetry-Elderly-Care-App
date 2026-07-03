import React, { useState, useEffect } from 'react';
import { ScheduledItem, UserProfile } from './types';
import { DEFAULT_SCHEDULE } from './initialSchedule';
import TaskSchedulePanel from './components/TaskSchedulePanel';
import VoiceNotificationSystem from './components/VoiceNotificationSystem';
import ChatAssistant from './components/ChatAssistant';
import { 
  Sun, Moon, Sunrise, Sunset, Clock, User, 
  Settings, Type, Volume2, Info, ChevronRight, CheckCircle, Flame
} from 'lucide-react';

export default function App() {
  // Load schedule from localStorage or default
  const [schedule, setSchedule] = useState<ScheduledItem[]>(() => {
    const saved = localStorage.getItem('elderly_wellness_schedule');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SCHEDULE;
  });

  // Load user profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('elderly_wellness_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      name: 'Margaret',
      avatarColor: 'bg-indigo-600',
      textSize: 'large', // default large for elderly
      voiceEnabled: true,
    };
  });

  // Share simulation clock state
  const [simulatedTime, setSimulatedTime] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [isSimulating, setIsSimulating] = useState(false);

  // Active right column tab: 'schedule' or 'chat'
  const [activeTab, setActiveTab] = useState<'schedule' | 'chat'>('schedule');
  const [showSettings, setShowSettings] = useState(false);

  // Sync schedule and profile to localStorage
  useEffect(() => {
    localStorage.setItem('elderly_wellness_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('elderly_wellness_profile', JSON.stringify(profile));
  }, [profile]);

  // Sync real-time clock if NOT simulating
  useEffect(() => {
    if (isSimulating) return;

    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setSimulatedTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Dynamic greeting based on current simulated time
  const getDynamicGreeting = () => {
    const [hour] = simulatedTime.split(':').map(Number);
    let message = 'Welcome back';
    let Icon = Sunrise;
    let color = 'text-amber-600';

    if (hour >= 5 && hour < 12) {
      message = 'Good morning';
      Icon = Sunrise;
      color = 'text-amber-500';
    } else if (hour >= 12 && hour < 17) {
      message = 'Good afternoon';
      Icon = Sun;
      color = 'text-orange-500';
    } else if (hour >= 17 && hour < 22) {
      message = 'Good evening';
      Icon = Sunset;
      color = 'text-indigo-500';
    } else {
      message = 'Rest well';
      Icon = Moon;
      color = 'text-violet-500';
    }

    return { message, Icon, color };
  };

  const greetingConfig = getDynamicGreeting();

  // Handle schedule modifiers
  const handleAddSchedule = (item: Omit<ScheduledItem, 'id' | 'completed'>) => {
    const newItem: ScheduledItem = {
      ...item,
      id: Math.random().toString(),
      completed: false,
    };
    setSchedule((prev) => [...prev, newItem]);
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleResetDefaultSchedule = () => {
    if (window.confirm('Would you like to reset your schedule to the standard weekly wellness list?')) {
      setSchedule(DEFAULT_SCHEDULE);
    }
  };

  // Helper to compute countdown text
  const getCountdownText = (itemTimeStr: string) => {
    const [currH, currM] = simulatedTime.split(':').map(Number);
    const [evtH, evtM] = itemTimeStr.split(':').map(Number);

    const currTotal = currH * 60 + currM;
    const evtTotal = evtH * 60 + evtM;

    let diff = evtTotal - currTotal;

    if (diff > 0) {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      if (hours > 0) {
        return `In ${hours} hr, ${mins} min`;
      }
      return `In ${mins} min`;
    } else if (diff === 0) {
      return 'Happening now!';
    } else {
      // Occurred in the past today
      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / 60);
      const mins = absDiff % 60;
      if (hours > 0) {
        return `${hours} hr, ${mins} min ago`;
      }
      return `${mins} min ago`;
    }
  };

  // Text size classes
  const getTextSizeClass = () => {
    if (profile.textSize === 'extra-large') return 'text-elderly-xl';
    if (profile.textSize === 'large') return 'text-elderly-large';
    return 'text-elderly-normal';
  };

  return (
    <div className="min-h-screen bg-brand-bg text-[#1A1A1A] font-sans flex flex-col transition-all">
      {/* Top Header */}
      <header className="bg-white border-b border-brand-border py-4 px-8 shadow-sm sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo & Slogan */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-sage rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark">
                Senior Wellness & Care
              </h1>
              <p className="text-brand-secondary font-medium text-xs tracking-wide">A peaceful companion for a healthier daily routine</p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
            {/* Real-time/Simulated Clock Display */}
            <div className="bg-brand-soft border border-brand-border rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${profile.voiceEnabled ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-brand-sage uppercase tracking-wider">
                  {profile.voiceEnabled ? 'Voice Active' : 'Voice Off'}
                </span>
              </div>
              <div className="h-8 w-px bg-brand-border" />
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold">
                  {isSimulating ? 'Simulating' : 'Current Time'}
                </p>
                <p className="text-2xl font-bold font-mono text-brand-sage leading-none">
                  {simulatedTime}
                </p>
              </div>
            </div>

            {/* Settings toggler */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-brand-soft hover:bg-white text-brand-sage border border-brand-border font-bold px-4 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 text-base shadow-sm cursor-pointer"
              id="settings-toggle-btn"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>

        </div>
      </header>

      {/* Settings Modal/Panel if open */}
      {showSettings && (
        <div className="bg-[#ECF0EE] border-b border-brand-border p-6 animate-fadeIn shrink-0 z-30" id="settings-panel">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2">
              <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                <Settings className="w-6 h-6 text-brand-sage" /> Adjust Application Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-brand-sage hover:text-brand-dark font-bold text-base px-3 py-1.5 rounded-lg hover:bg-white"
              >
                Close Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name customization */}
              <div>
                <label className="block text-brand-dark font-bold mb-1.5 text-base">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-brand-secondary w-5 h-5" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value || 'Margaret' })}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-brand-border rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-[#1A1A1A] focus:outline-none focus:border-brand-sage"
                  />
                </div>
              </div>

              {/* Text Size Customization - Highly critical for elderly accessibility */}
              <div>
                <label className="block text-brand-dark font-bold mb-1.5 text-base">Text Readability size</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['normal', 'large', 'extra-large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setProfile({ ...profile, textSize: size })}
                      className={`py-3 px-2 rounded-xl border font-bold capitalize text-sm transition-all cursor-pointer ${
                        profile.textSize === size
                          ? 'bg-brand-sage border-brand-sage text-white shadow-sm'
                          : 'bg-white border-brand-border text-brand-secondary hover:border-brand-sage'
                      }`}
                    >
                      {size === 'extra-large' ? 'Huge' : size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset schedule to default */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleResetDefaultSchedule}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 py-3 px-4 rounded-xl transition-colors text-base cursor-pointer"
                >
                  Reset Daily Schedule to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Greeting, Voice Alerts, Timers List (Take 5 columns) */}
        <section className="lg:col-span-5 flex flex-col gap-6 min-h-0 overflow-y-auto pr-0 lg:pr-2">
          
          {/* Greeting Box */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-soft rounded-full flex items-center justify-center">
                <greetingConfig.Icon className={`w-7 h-7 ${greetingConfig.color} animate-pulse`} />
              </div>
              <div>
                <p className="text-brand-secondary text-sm font-semibold uppercase tracking-wider">{greetingConfig.message}</p>
                <h2 className="text-3xl font-bold text-brand-dark tracking-tight">
                  {profile.name || 'Friend'}
                </h2>
              </div>
            </div>

            {/* Care tip */}
            <p className="mt-4 text-brand-secondary bg-brand-soft rounded-xl p-4 border border-[#E1EDE7] text-sm font-medium">
              💡 <span className="font-bold text-brand-sage">Wellness Quote:</span> "Taking care of your body is an act of loving yourself. Take it one gentle step at a time today."
            </p>
          </div>

          {/* Voice Notification Control Component */}
          <VoiceNotificationSystem
            schedule={schedule}
            profile={profile}
            onUpdateProfile={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
            simulatedTime={simulatedTime}
            setSimulatedTime={setSimulatedTime}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
          />

          {/* Daily Schedule List with Live Timers */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-sm flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
              <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                <Clock className="w-6 h-6 text-brand-sage" /> Today's Wellness Timers
              </h3>
              <span className="bg-brand-soft border border-brand-border text-brand-sage font-bold px-3 py-1 rounded-full text-xs">
                {schedule.filter(s => !s.completed).length} Pending
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 max-h-[450px] pr-1">
              {schedule.length === 0 ? (
                <div className="text-center py-10 text-brand-secondary">
                  <p className="text-lg">No pending timers.</p>
                  <p className="text-sm">Use the Schedule Planner to add items.</p>
                </div>
              ) : (
                [...schedule]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((item) => {
                    const isPassed = getCountdownText(item.time).includes('ago');
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          item.completed
                            ? 'bg-[#F9F9F7] border-brand-border opacity-50'
                            : isPassed
                            ? 'bg-[#F9F9F7] border-brand-border'
                            : 'bg-brand-soft/70 border-brand-border hover:border-brand-sage'
                        }`}
                      >
                        <div className="min-w-0">
                          {/* Label in dynamic size */}
                          <h4 className={`font-bold text-brand-dark leading-tight truncate ${getTextSizeClass()}`}>
                            {item.label}
                          </h4>
                          <span className="text-brand-secondary font-bold text-sm font-mono mt-0.5 block">
                            Scheduled: {item.time}
                          </span>
                        </div>

                        {/* Timer / Status Pill */}
                        <div className="shrink-0 text-right">
                          {item.completed ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          ) : (
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border font-mono ${
                              isPassed
                                ? 'bg-white text-brand-secondary border-brand-border'
                                : 'bg-[#ECF0EE] text-brand-sage border-[#DDE5E1] animate-pulse'
                            }`}>
                              {getCountdownText(item.time)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

        </section>

        {/* Right Column: Dynamic tab view for TaskSchedulePanel & ChatAssistant (Take 7 columns) */}
        <section className="lg:col-span-7 flex flex-col h-full min-h-0">
          
          {/* Navigation Tab Selector */}
          <div className="flex bg-[#E5E2D9]/70 p-1 rounded-2xl gap-1 mb-4 shrink-0 shadow-sm border border-brand-border">
            <button
              onClick={() => {
                setActiveTab('schedule');
                window.speechSynthesis.cancel();
              }}
              id="tab-schedule-btn"
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-brand-sage text-white shadow-sm'
                  : 'text-brand-secondary hover:text-brand-dark hover:bg-white/50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Schedule Planner</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                window.speechSynthesis.cancel();
              }}
              id="tab-chat-btn"
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-brand-sage text-white shadow-sm'
                  : 'text-brand-secondary hover:text-brand-dark hover:bg-white/50'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>AI Companion Chat</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 min-h-0">
            {activeTab === 'schedule' ? (
              <TaskSchedulePanel
                schedule={schedule}
                onAdd={handleAddSchedule}
                onRemove={handleRemoveSchedule}
                onToggleComplete={handleToggleComplete}
                profile={profile}
              />
            ) : (
              <ChatAssistant
                schedule={schedule}
                profile={profile}
              />
            )}
          </div>

        </section>

      </main>

      {/* Footer Info credit */}
      <footer className="bg-brand-dark border-t border-brand-border py-4 px-8 text-[#A0B0A8] text-sm shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest text-[#A0B0A8] font-bold">System Health</span>
          <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white">Wellness Concierge: Connected</span>
        </div>
        <p className="text-xs">Senior Wellness Companion v4.2 &copy; 2026</p>
      </footer>
    </div>
  );
}
