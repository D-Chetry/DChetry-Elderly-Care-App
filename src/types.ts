export type ScheduleCategory =
  | 'Study'
  | 'Recreation'
  | 'Entertainment'
  | 'Refreshments and Snack'
  | 'Medication'
  | 'Meals'
  | 'Hydration'
  | 'Physical Therapy'
  | 'WakeUp'
  | 'Other';

export interface ScheduledItem {
  id: string;
  time: string; // "HH:MM" 24-hour format
  label: string;
  category: ScheduleCategory;
  completed: boolean;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  avatarColor: string;
  textSize: 'large' | 'extra-large' | 'normal';
  voiceEnabled: boolean;
}
