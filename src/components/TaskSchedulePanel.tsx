import React, { useState } from 'react';
import { ScheduledItem, ScheduleCategory, UserProfile } from '../types';
import { 
  Plus, Trash2, Calendar, BookOpen, Smile, Tv, 
  Coffee, Pill, Utensils, GlassWater, Activity, 
  Clock, AlertCircle, Info, CheckCircle
} from 'lucide-react';

interface TaskSchedulePanelProps {
  schedule: ScheduledItem[];
  onAdd: (item: Omit<ScheduledItem, 'id' | 'completed'>) => void;
  onRemove: (id: string) => void;
  onToggleComplete: (id: string) => void;
  profile: UserProfile;
}

export const CATEGORIES: { value: ScheduleCategory; label: string; icon: any; color: string; bgColor: string }[] = [
  { value: 'Meals', label: 'Breakfast, Lunch, Dinner', icon: Utensils, color: 'text-amber-700', bgColor: 'bg-[#FCF9F2] border-[#F2ECE0]' },
  { value: 'Medication', label: 'Medications & Pills', icon: Pill, color: 'text-rose-700', bgColor: 'bg-[#FDF3F3] border-[#FAD3D3]' },
  { value: 'Physical Therapy', label: 'Physical Therapy & Exercise', icon: Activity, color: 'text-brand-sage', bgColor: 'bg-[#EDF6F1] border-[#C8E4D5]' },
  { value: 'Hydration', label: 'Water & Hydration', icon: GlassWater, color: 'text-sky-700', bgColor: 'bg-[#F2F8FC] border-[#D4E8F7]' },
  { value: 'Study', label: 'Reading & Newspaper', icon: BookOpen, color: 'text-indigo-700', bgColor: 'bg-[#F5F4FA] border-[#DFDCF0]' },
  { value: 'Refreshments and Snack', label: 'Snacks & Tea', icon: Coffee, color: 'text-orange-700', bgColor: 'bg-[#FCF6F2] border-[#F5E2D3]' },
  { value: 'Recreation', label: 'Recreation & Puzzles', icon: Smile, color: 'text-purple-700', bgColor: 'bg-[#F8F3FC] border-[#EADAF5]' },
  { value: 'Entertainment', label: 'TV, Music & Movies', icon: Tv, color: 'text-violet-700', bgColor: 'bg-[#F7F3FD] border-[#E7DBF8]' },
  { value: 'WakeUp', label: 'Wake Up Alarms', icon: Clock, color: 'text-yellow-700', bgColor: 'bg-[#FCFAF0] border-[#F3EDC8]' },
  { value: 'Other', label: 'Other Activities', icon: Calendar, color: 'text-[#555555]', bgColor: 'bg-[#F7F7F5] border-[#E8E8E5]' },
];

export default function TaskSchedulePanel({
  schedule,
  onAdd,
  onRemove,
  onToggleComplete,
  profile,
}: TaskSchedulePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState('09:00');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('Meals');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const getTextClass = () => {
    if (profile.textSize === 'extra-large') return 'text-elderly-xl';
    if (profile.textSize === 'large') return 'text-elderly-large';
    return 'text-elderly-normal';
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please enter a name for the activity.');
      return;
    }
    if (!time) {
      setError('Please choose a time.');
      return;
    }
    
    onAdd({
      time,
      label: label.trim(),
      category,
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setLabel('');
    setNotes('');
    setError('');
    setIsOpen(false);
  };

  // Sort schedule by time ASC
  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden flex flex-col h-full" id="task-schedule-panel">
      {/* Header */}
      <div className="bg-brand-dark p-6 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-brand-sage" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Weekly Wellness Schedule</h2>
            <p className="text-[#A0B0A8] text-sm">Add or edit your daily wellness sessions</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="btn-toggle-add-form"
          className="bg-brand-sage text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#4E6D60] active:scale-95 transition-all text-base shadow-sm cursor-pointer"
        >
          {isOpen ? 'Close Panel' : 'Add Activity'}
          <Plus className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Add Form Container */}
      {isOpen && (
        <form onSubmit={handleAdd} className="p-6 bg-brand-soft border-b border-brand-border flex-shrink-0 animate-fadeIn" id="add-task-form">
          <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-brand-sage" /> Create New Scheduled Activity
          </h3>
          
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-4 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium text-lg">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Activity Name */}
            <div>
              <label className="block text-brand-dark font-bold mb-1 text-base">Activity Name *</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Afternoon Walk, Take Vitamin B"
                className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-lg text-slate-800 focus:outline-none focus:border-brand-sage font-medium"
              />
            </div>

            {/* Time Select */}
            <div>
              <label className="block text-brand-dark font-bold mb-1 text-base">Scheduled Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-lg text-slate-800 focus:outline-none focus:border-brand-sage font-bold"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-brand-dark font-bold mb-2 text-base">Select Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-brand-sage bg-brand-sage text-white shadow-sm' 
                        : 'border-brand-border bg-white text-brand-secondary hover:border-brand-sage'
                    }`}
                  >
                    <CatIcon className={`w-6 h-6 mb-1 ${isSelected ? 'text-white' : cat.color}`} />
                    <span className="text-xs font-bold text-center leading-tight">{cat.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-brand-dark font-bold mb-1 text-base">Helper Notes / Reminders (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Drink at least 8 oz, take with a light meal, use the walking cane."
              className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-lg text-slate-800 focus:outline-none focus:border-brand-sage"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-[#E5E2D9] text-brand-dark hover:bg-[#D1CFC7] font-bold px-6 py-3 rounded-xl transition-colors text-base cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-sage text-white font-bold px-8 py-3 rounded-xl hover:bg-[#4E6D60] transition-colors text-base shadow-sm flex items-center gap-2 cursor-pointer"
            >
              Save to Schedule
            </button>
          </div>
        </form>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" id="schedule-list-container">
        {sortedSchedule.length === 0 ? (
          <div className="text-center py-12 px-4 bg-brand-soft rounded-2xl border border-dashed border-brand-border">
            <Calendar className="w-16 h-16 text-brand-secondary mx-auto mb-3" />
            <p className="text-xl font-medium text-brand-dark">Your wellness schedule is currently empty.</p>
            <p className="text-brand-secondary mt-1">Click the 'Add Activity' button above to create items.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSchedule.map((item) => {
              const catConfig = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[9]; // Other
              const CatIcon = catConfig.icon;
              
              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
                    item.completed 
                      ? 'bg-[#F9F9F7] border-brand-border text-slate-400 opacity-70' 
                      : 'bg-white border-brand-border text-slate-800'
                  }`}
                  id={`schedule-item-${item.id}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Completion Checkbox Button - BIG for elderly */}
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        item.completed 
                          ? 'bg-brand-sage border-brand-sage text-white' 
                          : 'border-brand-border bg-white text-transparent hover:border-brand-sage'
                      }`}
                      title={item.completed ? "Mark incomplete" : "Mark completed"}
                    >
                      <CheckCircle className="w-5 h-5 shrink-0" />
                    </button>

                    <div>
                      {/* Time and Category Pill */}
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-bold text-2xl tracking-tight font-mono text-brand-sage flex items-center gap-1.5">
                          <Clock className="w-5 h-5 text-brand-secondary" />
                          {item.time}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catConfig.bgColor} ${catConfig.color}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                          {item.category}
                        </span>
                        {item.completed && (
                          <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Label - large text */}
                      <h4 className={`font-bold ${getTextClass()} ${item.completed ? 'line-through text-slate-400' : 'text-brand-dark'}`}>
                        {item.label}
                      </h4>

                      {/* Notes - helper info */}
                      {item.notes && (
                        <p className="text-brand-secondary text-base mt-1.5 flex items-center gap-1.5 font-medium">
                          <Info className="w-4 h-4 shrink-0 text-brand-secondary" />
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 self-end sm:self-center mt-3 sm:mt-0 shrink-0">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                      title="Remove from schedule"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer statistics */}
      <div className="bg-brand-soft border-t border-brand-border p-4 shrink-0 flex justify-between items-center text-sm font-semibold text-brand-secondary">
        <div>
          Total scheduled items: <span className="text-brand-dark font-bold">{schedule.length}</span>
        </div>
        <div>
          Completed today: <span className="text-brand-sage font-bold">{schedule.filter(s => s.completed).length} / {schedule.length}</span>
        </div>
      </div>
    </div>
  );
}
