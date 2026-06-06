export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO String
  groundingSources?: GroundingSource[];
}

export interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "tasks" | "learning" | "tech" | "jobs" | "fitness" | "planning";
}

export interface UserGoal {
  id: string;
  text: string;
  completed: boolean;
  category: "tasks" | "learning" | "tech" | "jobs" | "fitness" | "planning";
  createdAt: string;
}

export interface Reminder {
  id: string;
  taskText: string;
  time: string; // e.g. "17:45"
  active: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface MemoryProfile {
  userName: string;
  userGoals: string[];
  learningProgress: string[];
  summarizedFacts: string[];
}

