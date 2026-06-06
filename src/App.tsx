/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  ClipboardList,
  GraduationCap,
  Cpu,
  Briefcase,
  Dumbbell,
  Compass,
  Send,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  Globe,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  X,
  Mic,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Pause,
  CalendarClock,
  Brain,
  Database
} from "lucide-react";
import { Message, UserGoal, QuickPrompt, Reminder, MemoryProfile } from "./types";
import { QUICK_PROMPTS, CATEGORY_META } from "./data";

export default function App() {
  // Chat History State
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("aira-chats");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: `नमस्ते! मैं **अइरा (Aira)** हूँ, आपकी पर्सनल एआई असिस्टेंट। 🌸\n\nमैं आपकी रोज़मर्रा की लाइफ को आसान और ज़्यादा ख़ुशनुमा बनाने में मदद कर सकती हूँ। \n\n*   📂 **Dainik Karya (Tasks)**: आपका डेली शेड्यूल और प्लानर बनाना\n*   💡 **Skills & Learning**: कठिन से कठिन कांसेप्ट को आसान शब्दों में समझना\n*   💻 **Technology Support**: मोबाइल, कोडिंग और गैजेट्स के उपयोगी टिप्स\n*   💼 **Career & Jobs**: बेहतरीन रिज्यूमे और इंटरव्यू की तैयारी\n*   💪 **Fitness & Diet**: होम वर्कआउट और संतुलित भारतीय भोजन प्लान\n*   📊 **Budgets & Planning**: महीने के खर्च और बचत की योजना\n\nआप मुझसे कुछ भी पूछ सकते हैं या नीचे दिए गए किसी **Quick Topics** को चुनकर शुरुआत कर सकते हैं! ✨`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // Task & Routine State
  const [goals, setGoals] = useState<UserGoal[]>(() => {
    const saved = localStorage.getItem("aira-goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "g-1",
        text: "सुबह जल्दी उठकर 15 मिनट ध्यान (Meditation) करना",
        completed: true,
        category: "fitness",
        createdAt: new Date().toISOString(),
      },
      {
        id: "g-2",
        text: "आज के महत्वपूर्ण कार्यों की प्राथमिक सूची बनाना",
        completed: false,
        category: "tasks",
        createdAt: new Date().toISOString(),
      },
      {
        id: "g-3",
        text: "नया कोडिंग कांसेप्ट (React State) सीखना",
        completed: false,
        category: "learning",
        createdAt: new Date().toISOString(),
      }
    ];
  });

  // Input & UI States
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("tasks");
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCat, setNewGoalCat] = useState<"tasks" | "learning" | "tech" | "jobs" | "fitness" | "planning">("tasks");
  const [sysTimeStr, setSysTimeStr] = useState("");
  const [sysDateStr, setSysDateStr] = useState("");
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Reminders List State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("aira-reminders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "rem-1",
        taskText: "Aira Daily Status Planner (रिव्यू)",
        time: "10:00",
        active: true,
        triggered: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "rem-2",
        taskText: "पानी पीने का रिमाइंडर और हल्की स्ट्रेचिंग",
        time: "14:00",
        active: true,
        triggered: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "rem-3",
        taskText: "शाम का वर्कआउट / सेहत की सैर 🏃‍♂️",
        time: "18:00",
        active: true,
        triggered: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [newReminderText, setNewReminderText] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("09:00");

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Long-Term Memory Profile State
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile>(() => {
    const saved = localStorage.getItem("aira-memory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          userName: parsed.userName || "",
          userGoals: Array.isArray(parsed.userGoals) ? parsed.userGoals : [],
          learningProgress: Array.isArray(parsed.learningProgress) ? parsed.learningProgress : [],
          summarizedFacts: Array.isArray(parsed.summarizedFacts) ? parsed.summarizedFacts : []
        };
      } catch (e) {}
    }
    // Generates a cozy default profile with clean examples to suggest ideas
    return {
      userName: "",
      userGoals: ["React coding guidelines study", "Daily fitness target sync and tracking"],
      learningProgress: ["Vite standard dynamic setup", "Text to Speech synthesis set up"],
      summarizedFacts: ["Likes direct simple Hindi explanations with natural English words"]
    };
  });

  // Memory Editor Temp States for manual panel edits
  const [memoryTempGoal, setMemoryTempGoal] = useState("");
  const [memoryTempProgress, setMemoryTempProgress] = useState("");
  const [memoryTempFact, setMemoryTempFact] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save Chat, Goals, and Reminders to LocalStorage
  useEffect(() => {
    localStorage.setItem("aira-chats", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("aira-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("aira-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("aira-memory", JSON.stringify(memoryProfile));
  }, [memoryProfile]);

  // Real-time Clock in English + Hindi Days representation
  useEffect(() => {
    const daysInHindi = [
      "Ravivar (Sunday)",
      "Somvar (Monday)",
      "Mangalvar (Tuesday)",
      "Budhvar (Wednesday)",
      "Guruvar (Thursday)",
      "Shukravar (Friday)",
      "Shanivar (Saturday)"
    ];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      const dayName = daysInHindi[now.getDay()];
      const dateStr = `${now.getDate()} ${months[now.getMonth()]}`;

      setSysDateStr(`${dayName}, ${dateStr}`);
      setSysTimeStr(`${formattedHours}:${formattedMinutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Synth for Reminder Alarms (Self-contained)
  const playReminderSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Dual-tone high pitch chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // Pitch A5
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // Pitch C6

      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.6);
      osc2.stop(ctx.currentTime + 1.6);
    } catch (e) {
      console.warn("Audio chime block:", e);
    }
  };

  // Text to Speech voice output
  const speak = (textToSpeak: string) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis acts unsupported.");
      return;
    }
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      
      // Strip markdown symbols out for clean human reading
      const clean = textToSpeak
        .replace(/[*#`_\-]/g, " ")
        .replace(/\[.*?\]\(.*?\)/g, " ")
        .replace(/(\r\n|\n|\r)/gm, " ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean);
      
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.includes("hi") || v.lang.includes("HI"));
      if (hiVoice) {
        utterance.voice = hiVoice;
      }
      utterance.lang = "hi-IN";
      utterance.rate = 1.05;
      utterance.pitch = 1.1; // Friendly warm pitch tone

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis error:", e);
    }
  };

  // Speech Recognition (Voice Input)
  const startSpeechRecognition = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      triggerAlert("Aapka browser voice input coordinate support nahi karta. Google Chrome choose karein.", "error");
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Mute assistant when you start talking!
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.lang = "hi-IN"; // Sets spoken input matching both Hindi and English words comfortably
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        triggerAlert("🎙️ Aira sun rahi hai... Safed box ke liye bolna shuru karein!", "info");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => prev ? `${prev} ${transcript}` : transcript);
          triggerAlert(`"${transcript}" record ho gaya!`, "success");
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech error:", event);
        triggerAlert("Aanchal ki tarah bolen, sune mein thoda time laga. Kripya dubaara try karein.", "error");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech start error:", e);
      setIsListening(false);
    }
  };

  // Background Reminder Match Engine
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const HH = now.getHours().toString().padStart(2, "0");
      const MM = now.getMinutes().toString().padStart(2, "0");
      const currentFormattedTime = `${HH}:${MM}`; // "17:45"

      setReminders((prev) => {
        let changed = false;
        const mapped = prev.map((item) => {
          if (item.active && !item.triggered && item.time === currentFormattedTime) {
            changed = true;
            // Play alarm ring
            playReminderSound();
            // Show dynamic banner on-screen
            triggerAlert(`🔔 REMINDER: "${item.taskText}" ka sahi vakt ho gaya hai!`, "success");
            // Vocal assistance alert
            speak(`रिमाइंडर: ${item.taskText} का समय हो गया है।`);
            return { ...item, triggered: true };
          }
          return item;
        });

        if (changed) {
          localStorage.setItem("aira-reminders", JSON.stringify(mapped));
          return mapped;
        }
        return prev;
      });
    };

    // Check clock match every 8 seconds
    const interval = setInterval(checkReminders, 8000);
    return () => clearInterval(interval);
  }, []);

  // Show Temporary Alert
  const triggerAlert = (text: string, type: "success" | "error" | "info" = "success") => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Chat API Submitter
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const newChatHistory = [...messages, userMsg];
    setMessages(newChatHistory);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newChatHistory,
          useWebSearch,
          memoryProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kuch error achanak aa gaya hai.");
      }

      const replyMsg: Message = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        groundingSources: data.groundingSources,
      };

      setMessages((prev) => [...prev, replyMsg]);

      // Background summary fact pipeline trigger to process updates in background with client-side smart filtering
      try {
        const userTextLower = userMsg.content.toLowerCase();
        const keywords = [
          "naam", "name", "goal", "target", "milestone", "seekh", "learn", "study", "diet", 
          "gym", "fitness", "career", "job", "resume", "interview", "plan", "seekho", "progress",
          "yaad", "remember", "mita", "change", "habit", "schedule", "routine", "planner",
          "लक्ष्य", "नाम", "प्रगति", "करियर", "नौकरी", "फिटनेस"
        ];
        const isMemWorthUpdating = keywords.some(kw => userTextLower.includes(kw)) || Math.random() < 0.35;

        if (isMemWorthUpdating) {
          fetch("/api/summarize-facts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [userMsg, replyMsg],
              currentMemory: memoryProfile,
            }),
          })
            .then((res) => {
              if (res.ok) return res.json();
            })
            .then((bgData) => {
              if (bgData && bgData.memoryProfile) {
                setMemoryProfile(bgData.memoryProfile);
                console.log("Memory Profile synchronized in background!", bgData.memoryProfile);
              }
            })
            .catch((e) => console.warn("Background memories analysis error:", e));
        } else {
          console.log("Background memory sync bypassed to preserve Gemini API rate limit quota.");
        }
      } catch (e) {
        console.warn("Memory analyzer block error:", e);
      }
      
      if (speechEnabled) {
        speak(data.reply);
      }
    } catch (err: any) {
      console.error(err);
      triggerAlert(err.message || "Aira connect nahi ho payi. Network ya settings check karein.", "error");
      
      const errorReply: Message = {
        id: `m-err-${Date.now()}`,
        role: "assistant",
        content: `माफ़ कीजिये, मैं अभी उत्तर देने में असमर्थ हूँ। 😔\n\n*Error details: ${err.message || "Unknown error occurred"}*\n\nकृपया सुनिश्चित करें कि आपने **Settings secrets configuration panel** में अपना \`GEMINI_API_KEY\` सही तरीके से डाला है या कुछ समय बाद फिर से पूछें।`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear Chats & Restore default
  const handleClearChat = () => {
    if (window.confirm("Kya aap sach mein chat history dubaara suru karna chahte hain?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `नमस्ते! मैं दोबारा तैयार हूँ। मैं आपकी किस प्रकार मदद करूँ? नया सवाल पूछें या यहाँ गाइडेंस प्राप्त करें। ✨`,
          timestamp: new Date().toISOString(),
        }
      ]);
      triggerAlert("Conversations reset kar di gayi hain!", "success");
    }
  };

  // Add Task Functionality
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGoalText.trim();
    if (!trimmed) return;

    const newGoal: UserGoal = {
      id: `g-${Date.now()}`,
      text: trimmed,
      completed: false,
      category: newGoalCat,
      createdAt: new Date().toISOString()
    };

    setGoals((prev) => [newGoal, ...prev]);
    setNewGoalText("");
    triggerAlert("Naya task dainik checklist mein jod diya gaya!", "success");
  };

  // Toggle Task Completed
  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  // Delete Task
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    triggerAlert("Task hata diya gaya है।", "info");
  };

  // Map category code to Lucide Icon perfectly to render beautifully
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "tasks":
        return <ClipboardList className="w-5 h-5 text-amber-600" />;
      case "learning":
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case "tech":
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case "jobs":
        return <Briefcase className="w-5 h-5 text-emerald-600" />;
      case "fitness":
        return <Dumbbell className="w-5 h-5 text-rose-600" />;
      case "planning":
        return <Compass className="w-5 h-5 text-sky-600" />;
      default:
        return <ClipboardList className="w-5 h-5" />;
    }
  };

  // Active quick prompts filtering
  const filteredPrompts = QUICK_PROMPTS.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans flex flex-col p-3 md:p-6 select-none transition-colors duration-200">
      
      {/* Alert Banner */}
      {alertMsg && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 transition-all transform duration-300 animate-bounce ${
          alertMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : alertMsg.type === "error"
            ? "bg-rose-50 border-rose-100 text-rose-800"
            : "bg-blue-50 border-blue-100 text-blue-800"
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>
          <span className="text-sm font-medium">{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Outer elegant responsive container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        
        {/* Top Navbar matching the sleek prompt design precisely */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-105 transition-transform duration-200">
              <div className="w-5 h-5 bg-white rounded-full opacity-90 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="main-title" className="text-2xl font-bold tracking-tight text-slate-800 font-display">Aira AI</h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">v2.4</span>
              </div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest font-mono">Aapki Param Sahayak</p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-stretch sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs md:text-sm font-medium text-slate-600 shadow-inner">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{sysDateStr || "Somvar, 24 June"}</span>
              <span className="text-slate-300">|</span>
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-700 font-mono font-semibold">{sysTimeStr || "10:45 AM"}</span>
            </div>
            {/* Round Avatar with Initial User letter */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm" title="User Profile">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-50/50">
          
          {/* Left panel: Task Checklist & Quick topics Hub (col-span-5) */}
          <section className="lg:col-span-5 border-r border-slate-100 p-6 flex flex-col gap-6 overflow-y-auto max-h-[500px] lg:max-h-[calc(100vh-140px)]">
            
            {/* Interactive Dainik Planner Board */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Mera Daily Task Board</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Kaam pure karein aur trigger karein</p>
                  </div>
                </div>
                <span className="text-xs bg-orange-55 text-orange-700 bg-orange-50 font-bold px-2.5 py-1 rounded-full">
                  {goals.filter(g => g.completed).length}/{goals.length} Finished
                </span>
              </div>

              {/* Task Add Form */}
              <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Naya dainik karya jodein (e.g., Water 3L, Exercise)..."
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
                <select
                  value={newGoalCat}
                  onChange={(e: any) => setNewGoalCat(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-1.5 py-1.5 bg-slate-50 focus:outline-none text-slate-600"
                >
                  <option value="tasks">Tasks</option>
                  <option value="learning">Study</option>
                  <option value="tech">Tech</option>
                  <option value="jobs">Career</option>
                  <option value="fitness">Diet</option>
                  <option value="planning">Plan</option>
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 rounded-xl shadow-md transition-colors flex items-center justify-center text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Task list container */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {goals.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Abhi koi dainik task nahi hain. Naya jodein! ✅
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`flex justify-between items-center p-2.5 rounded-xl border transition-all duration-200 text-xs ${
                        goal.completed
                          ? "bg-slate-50/70 border-slate-105 opacity-60 line-through text-slate-400"
                          : "bg-white border-slate-100 text-slate-700 hover:border-slate-200 shadow-sm"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleGoal(goal.id)}
                        className="flex items-center gap-3 text-left flex-1"
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          goal.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-350 hover:bg-slate-50 text-slate-300"
                        }`}>
                          {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                        <span className="font-medium tracking-tight break-all leading-tight">
                          {goal.text}
                        </span>
                      </button>

                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 capitalize">
                          {goal.category}
                        </span>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-slate-350 hover:text-rose-500 p-1 rounded-md transition-colors"
                          title="Hataayein"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Interactive Dainik Auto-Reminders Board */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Dainik Alarm Reminders</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Bajeghanti dynamic alert voice alarms</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {reminders.filter(r => r.active).length} Active
                </span>
              </div>

              {/* Fast Alarm Reminders input form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const txt = newReminderText.trim();
                if (!txt) return;
                const newRem: Reminder = {
                  id: `rem-${Date.now()}`,
                  taskText: txt,
                  time: newReminderTime,
                  active: true,
                  triggered: false,
                  createdAt: new Date().toISOString()
                };
                setReminders(prev => [newRem, ...prev]);
                setNewReminderText("");
                triggerAlert(`Reminders set: "${txt}" at ${newReminderTime}!`, "success");
              }} className="flex flex-col gap-2 mb-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Reminder title (e.g. Davaai, exercise breaks)..."
                    value={newReminderText}
                    onChange={(e) => setNewReminderText(e.target.value)}
                    className="flex-1 text-[11px] border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium placeholder-slate-400"
                  />
                </div>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Samay:</span>
                    <input
                      type="time"
                      value={newReminderTime}
                      onChange={(e) => setNewReminderTime(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-0.5 bg-white text-slate-700 font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5px]" />
                    <span>Set Alarm</span>
                  </button>
                </div>
              </form>

              {/* Alarm task rows */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {reminders.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Koyi reminders list set nahi hai. Set karein upar se! ⏰
                  </div>
                ) : (
                  reminders.map((r) => (
                    <div
                      key={r.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                        r.triggered 
                          ? "bg-amber-50/55 border-amber-100/50 opacity-80" 
                          : "bg-white border-slate-100 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 font-medium">
                        {/* Active Toggle Trigger mark */}
                        <button
                          onClick={() => {
                            setReminders((prev) =>
                              prev.map((item) =>
                                item.id === r.id ? { ...item, active: !item.active } : item
                              )
                            );
                            triggerAlert(r.active ? "Reminder inactive temporarily" : "Reminder reactivated!", "info");
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            r.active ? "bg-indigo-500 border-indigo-500 text-white shadow-sm" : "border-slate-300 bg-slate-50 text-slate-300"
                          }`}
                        >
                          {r.active && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </button>

                        <div className="flex flex-col min-w-0">
                          <span className={`font-semibold text-slate-700 leading-tight truncate ${r.triggered ? "line-through text-slate-400" : ""}`}>
                            {r.taskText}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span className="font-bold text-indigo-600">{r.time}</span>
                            {r.triggered && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0.1 font-bold rounded">
                                🔔 TRIGGERED
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        {r.triggered && (
                          <button
                            onClick={() => {
                              setReminders((prev) =>
                                prev.map((item) =>
                                  item.id === r.id ? { ...item, triggered: false, active: true } : item
                                )
                              );
                              triggerAlert("Re-armed to active status!", "success");
                            }}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all"
                            title="Reset/Re-arm"
                          >
                            Re-arm
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReminders((prev) => prev.filter((item) => item.id !== r.id));
                            triggerAlert("Reminder delete ho gaya hai", "info");
                          }}
                          className="text-slate-350 hover:text-rose-500 p-1 rounded-md transition-colors"
                          title="Mitaayein"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Aira Long-Term Memory Vault Board */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <Brain className="w-4 h-4 text-indigo-700 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Aira's Memory Vault</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Auto-summarized facts & user profile</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Kya aap such mein Aira ki saari saved long-term memory mitaana chahte hain?")) {
                      setMemoryProfile({
                        userName: "",
                        userGoals: [],
                        learningProgress: [],
                        summarizedFacts: []
                      });
                      triggerAlert("Aira's memory has been securely reset!", "info");
                    }
                  }}
                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-xl transition-all"
                  title="Wipe memory vault"
                >
                  Clear Vault
                </button>
              </div>

              {/* UserName Entry section */}
              <div className="mb-3.5 pb-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-indigo-50/20 p-2.5 rounded-2xl">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6.5 h-6.5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 font-mono">My</div>
                  <div className="truncate text-xs">
                    <div className="text-[10px] text-slate-400 font-bold leading-none">Mera Naam (User)</div>
                    {memoryProfile.userName ? (
                      <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">{memoryProfile.userName}</span>
                    ) : (
                      <span className="italic text-slate-400 text-[11px] block mt-0.5">Naam set nahi hai (Aira auto-detect karegi)</span>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => {
                      const entry = window.prompt("Apna naam darj karein:", memoryProfile.userName);
                      if (entry !== null) {
                        setMemoryProfile(prev => ({ ...prev, userName: entry.trim() }));
                        triggerAlert("User name save ho gaya hai!", "success");
                      }
                    }}
                    className="text-[10px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-2 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Dynamic scroll lists wrapper */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                
                {/* User Goals Memorized block */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      🎯 Target Goals ({memoryProfile.userGoals.length})
                    </span>
                  </div>
                  
                  {/* Manual Add Goal */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!memoryTempGoal.trim()) return;
                    setMemoryProfile(prev => ({
                      ...prev,
                      userGoals: [...prev.userGoals, memoryTempGoal.trim()]
                    }));
                    setMemoryTempGoal("");
                    triggerAlert("Goal joda gaya!", "success");
                  }} className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="Add goal manually..."
                      value={memoryTempGoal}
                      onChange={(e) => setMemoryTempGoal(e.target.value)}
                      className="flex-1 text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                    />
                    <button type="submit" className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">+</button>
                  </form>

                  <div className="space-y-1">
                    {memoryProfile.userGoals.length === 0 ? (
                      <div className="text-[10px] italic text-slate-400 pl-1">Koi targets save nahi hain.</div>
                    ) : (
                      memoryProfile.userGoals.map((g, idx) => (
                        <div key={idx} className="group flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-700 hover:border-slate-200 transition-all">
                          <span className="truncate flex-1 pr-1">{g}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setMemoryProfile(prev => ({
                                  ...prev,
                                  userGoals: prev.userGoals.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-rose-450 hover:text-rose-600 transition-opacity ml-1 cursor-pointer"
                            title="Mitaan"
                          >
                            <X className="w-3 h-3 stroke-[2.5px]" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Study & Skill Progress Memorized block */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      📚 Study & Learning Progress ({memoryProfile.learningProgress.length})
                    </span>
                  </div>

                  {/* Manual Add Progress */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!memoryTempProgress.trim()) return;
                    setMemoryProfile(prev => ({
                      ...prev,
                      learningProgress: [...prev.learningProgress, memoryTempProgress.trim()]
                    }));
                    setMemoryTempProgress("");
                    triggerAlert("Learning progress update!", "success");
                  }} className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="Add study progress milestone..."
                      value={memoryTempProgress}
                      onChange={(e) => setMemoryTempProgress(e.target.value)}
                      className="flex-1 text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                    />
                    <button type="submit" className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">+</button>
                  </form>

                  <div className="space-y-1">
                    {memoryProfile.learningProgress.length === 0 ? (
                      <div className="text-[10px] italic text-slate-400 pl-1">Koi learning milestone save nahi hai.</div>
                    ) : (
                      memoryProfile.learningProgress.map((p, idx) => (
                        <div key={idx} className="group flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-700 hover:border-slate-200 transition-all">
                          <span className="truncate flex-1 pr-1">{p}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setMemoryProfile(prev => ({
                                  ...prev,
                                  learningProgress: prev.learningProgress.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-rose-450 hover:text-rose-600 transition-opacity ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3 stroke-[2.5px]" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Personal Summarized Facts block */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      💡 Personal Facts ({memoryProfile.summarizedFacts.length})
                    </span>
                  </div>

                  {/* Manual Add Fact */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!memoryTempFact.trim()) return;
                    setMemoryProfile(prev => ({
                      ...prev,
                      summarizedFacts: [...prev.summarizedFacts, memoryTempFact.trim()]
                    }));
                    setMemoryTempFact("");
                    triggerAlert("Fact joda gaya!", "success");
                  }} className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      placeholder="Add personal fact (e.g. Diet, job target)..."
                      value={memoryTempFact}
                      onChange={(e) => setMemoryTempFact(e.target.value)}
                      className="flex-1 text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                    />
                    <button type="submit" className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all">+</button>
                  </form>

                  <div className="space-y-1">
                    {memoryProfile.summarizedFacts.length === 0 ? (
                      <div className="text-[10px] italic text-slate-400 pl-1">Aira saari baatein dhyaan se sunkar yahan auto-save karegi!</div>
                    ) : (
                      memoryProfile.summarizedFacts.map((f, idx) => (
                        <div key={idx} className="group flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-700 hover:border-slate-200 transition-all">
                          <span className="truncate flex-1 pr-1">{f}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setMemoryProfile(prev => ({
                                  ...prev,
                                  summarizedFacts: prev.summarizedFacts.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-rose-450 hover:text-rose-600 transition-opacity ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3 stroke-[2.5px]" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Prompt categories segment from the design */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex-1 flex flex-col min-h-[280px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Quick Resource Topics</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Category chunein aur ready-made sawal puchein</p>
                </div>
              </div>

              {/* Categoric Pill Selection */}
              <div className="grid grid-cols-3 gap-1.5 mb-4 border-b border-slate-100 pb-3">
                {Object.entries(CATEGORY_META).map(([key, value]) => {
                  const isActive = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`text-[10px] md:text-xs font-semibold py-2 px-1 rounded-xl border text-center transition-all duration-200 capitalize flex flex-col items-center justify-center gap-1 ${
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "bg-slate-55 border-slate-100 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {renderCategoryIcon(key)}
                      <span>{key}</span>
                    </button>
                  );
                })}
              </div>

              {/* Ready-made Suggestions Filterable */}
              <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[190px]">
                {filteredPrompts.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setInput(item.prompt);
                      triggerAlert("Aapka chuna hua topic input bar mein likh diya gaya hai!", "info");
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 border border-slate-105 hover:border-indigo-200 transition-all active:scale-[0.98] group flex flex-col gap-1 shadow-sm"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {item.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <span className="text-[11px] text-slate-400 leading-normal font-medium">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right panel: Main Conversational Assistant (col-span-7) */}
          <section className="lg:col-span-7 flex flex-col h-[500px] lg:h-[calc(100vh-140px)] bg-slate-50/30">
            
            {/* Header / Search configuration Bar */}
            <div className="px-6 py-4 bg-white/95 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  Talk to Aira <span className="text-[11px] font-normal text-slate-400">({messages.length} messages)</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Replies are instantly framed in simple natural Hindi</p>
              </div>

              {/* Configuration Controls */}
              <div className="flex items-center gap-3">
                
                {/* Voice Response TTS Toggle switch */}
                <button
                  onClick={() => {
                    const nextVal = !speechEnabled;
                    setSpeechEnabled(nextVal);
                    if (!nextVal) {
                      window.speechSynthesis.cancel();
                    }
                    triggerAlert(
                      nextVal
                        ? "Aira audio voice response chalu ho gaya hai! 🔊"
                        : "Voice response mute ho gaya hai! 🔇",
                      "info"
                    );
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm ${
                    speechEnabled
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                  title={speechEnabled ? "Voice response enabled" : "Voice response disabled"}
                >
                  {speechEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Aira Voice: {speechEnabled ? "ON" : "OFF"}</span>
                </button>

                {/* Search Grounding Switch */}
                <button
                  onClick={() => {
                    const nextVal = !useWebSearch;
                    setUseWebSearch(nextVal);
                    triggerAlert(
                      nextVal
                        ? "Google Search Grounding chalu ho gyi hai!"
                        : "Search Grounding band kar di gayi hai.",
                      "info"
                    );
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm ${
                    useWebSearch
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                  title="Aira uses live search to answer with grounding links"
                >
                  <Globe className={`w-3.5 h-3.5 ${useWebSearch ? "text-emerald-700 animate-spin-slow" : "text-slate-400"}`} />
                  <span>Google Search</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${useWebSearch ? "bg-emerald-505 bg-emerald-600" : "bg-slate-300"}`}></span>
                </button>

                {/* Reset Conversation */}
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 shadow-sm"
                  title="Chat Reset Karein"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body view list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Role Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                      isUser 
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-200" 
                        : "bg-white border border-slate-100 text-indigo-600"
                    }`}>
                      {isUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                      )}
                    </div>

                    {/* Speech bubble */}
                    <div className="flex flex-col gap-1.5">
                      <div className={`p-4 rounded-[24px] text-sm leading-relaxed shadow-sm whitespace-pre-line relative ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                      }`}>
                        {m.content}
                        
                        {/* Playback Speaker control for Assistant speech */}
                        {!isUser && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => speak(m.content)}
                              className="text-[10px] sm:text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                              title="Bol kar sunaayein"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Bolein (Speak)</span>
                            </button>
                            <button
                              onClick={() => window.speechSynthesis.cancel()}
                              className="text-[10px] sm:text-xs font-semibold text-slate-400 hover:text-rose-500 px-2 py-1 rounded-xl transition-colors cursor-pointer"
                              title="Aawaz Rokein"
                            >
                              <VolumeX className="w-3 h-3" />
                              <span>Mute</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Display ground sources beautifully on search success */}
                      {!isUser && m.groundingSources && m.groundingSources.length > 0 && (
                        <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-xl p-2 mt-1">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1 mb-1">
                            <Search className="w-3 h-3 text-emerald-600" /> Grounding Sources & Facts:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.groundingSources.map((source, index) => (
                              <a
                                key={index}
                                href={source.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-white hover:bg-emerald-50 px-2.2 py-1 rounded-md border border-emerald-100 shadow-sm hover:scale-105 duration-100 transition-transform"
                              >
                                <span className="max-w-[140px] truncate">{source.title || "Ref Page"}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Date format stamp */}
                      <span className={`text-[10px] text-slate-400 font-mono ${isUser ? "text-right" : "text-left"}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing state with custom skeleton pulse representation */}
              {isGenerating && (
                <div className="flex gap-3 max-w-[60%] mr-auto items-start">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-md animate-bounce">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-[24px] rounded-tl-none text-sm w-full shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-indigo-500 uppercase tracking-widest font-mono">
                      <span>Aira soch rahi hai</span>
                      <span className="flex gap-1">
                        <span className="w-1 h-1 bg-current rounded-full animate-ping"></span>
                        <span className="w-1 h-1 bg-current rounded-full animate-ping delay-75"></span>
                        <span className="w-1 h-1 bg-current rounded-full animate-ping delay-150"></span>
                      </span>
                    </div>
                    {/* Animated Pulse Lines */}
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-100 rounded-full w-full animate-pulse"></div>
                      <div className="h-2 bg-slate-100 rounded-full w-5/6 animate-pulse delay-100"></div>
                      <div className="h-2 bg-slate-100 rounded-full w-2/3 animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Send footer precisely matching the gorgeous Sleek design HTML style */}
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100">
              
              {/* Interactive Special Commands Shortcut Tray */}
              <div className="mb-3.5">
                <div className="flex items-center gap-1.5 mb-2 pl-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Aira Assistant Commands (विशेष त्वरित कमांड्स):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto pr-1">
                  {[
                    { cmd: "Mera plan banao", icon: "📅", label: "Mera Plan", color: "hover:border-amber-300 hover:bg-amber-50 text-slate-800" },
                    { cmd: "Meri progress dikhao", icon: "📈", label: "Meri Progress", color: "hover:border-blue-300 hover:bg-blue-50 text-slate-800" },
                    { cmd: "Mera goal yaad rakho", icon: "🎯", label: "Goal Yaad Rakho", color: "hover:border-indigo-300 hover:bg-indigo-50 text-slate-800" },
                    { cmd: "Aaj kya seekhu?", icon: "💡", label: "Aaj Kya Seekhu?", color: "hover:border-emerald-300 hover:bg-emerald-50 text-slate-800" },
                    { cmd: "Meri to-do list dikhao", icon: "✅", label: "Meri To-Do List", color: "hover:border-fuchsia-300 hover:bg-fuchsia-50 text-slate-800" }
                  ].map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={() => {
                        setInput(btn.cmd);
                        handleSendMessage(btn.cmd);
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1 ${btn.color}`}
                    >
                      <span className="text-[12px]">{btn.icon}</span>
                      <span>"{btn.cmd}"</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative bg-white rounded-3xl border-2 border-indigo-100 p-1.5 flex items-center shadow-lg shadow-slate-200/50">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mr-1.5 hover:bg-slate-100 transition-colors cursor-help" title="Hindi-Devanagari keyboard mode active. Everyday simple Hindi combined with conversational English words.">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                </div>

                {/* Voice Input (Speech-to-Text) Microphone Trigger */}
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  disabled={isGenerating}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all mr-2 ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-100"
                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 cursor-pointer"
                  }`}
                  title={isListening ? "Listening active... Click again if finished" : "Bolein (Speak to Type in Hindi/English!)"}
                >
                  {isListening ? (
                    <div className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
                    </div>
                  ) : (
                    <Mic className="w-4.5 h-4.5 stroke-[2.5px]" />
                  )}
                </button>
                
                <input
                  type="text"
                  placeholder={isListening ? "Sun rahi hoon... Bolna jaari rakhein..." : "Mujhse sawal puchein... (e.g., 'Sitaar kaise bajaate hain?' ya 'Study planner banao')"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isGenerating) {
                      handleSendMessage(input);
                    }
                  }}
                  className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-400 px-2 focus:outline-none bg-transparent"
                  disabled={isGenerating}
                />

                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isGenerating}
                  className={`px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                    input.trim() && !isGenerating
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:scale-[1.02]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Bhejhein</span>
                </button>
              </div>

              {/* Suggestions quick tags below inputs */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs font-semibold text-slate-400">
                <div className="flex gap-1.5">
                  <span className="uppercase tracking-tighter hover:text-indigo-600 transition-colors">Aira-Smart</span>
                  <span>•</span>
                  <span className="uppercase tracking-tighter truncate max-w-[150px]">Active account: {localStorage.getItem("aira-chats") ? "Saved Locals" : "First Session"}</span>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => triggerAlert("AI state aur standard local storage normal mode par behtareen chal rhe hain.", "info")} className="uppercase tracking-tighter hover:text-indigo-600 transition-colors">System Help</button>
                  <button onClick={() => setInput("मुझे आज का दिन प्लान करने में मदद करें")} className="uppercase tracking-tighter hover:text-indigo-700 text-indigo-600 transition-colors">Start Day Plan</button>
                </div>
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  );
}

