import { QuickPrompt } from "./types";

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "task-1",
    title: "दिन की प्लानिंग",
    description: "आज के कार्यों की कुशल व्यवस्थित सूची बनाएं",
    prompt: "मुझे आज कई सारे कार्य करने हैं। कृपया मेरे लिए एक कुशल और शांतिपूर्ण 'Daily Task Planner' योजना तैयार करें ताकि मैं हर काम पूरा कर सकूं।",
    category: "tasks"
  },
  {
    id: "task-2",
    title: "सुबह की रूटीन",
    description: "एक ऊर्जावान और अनुशासित सुबह की योजना",
    prompt: "एक उत्कृष्ट 'Productive Morning Routine' का शेड्यूल बनाएं जो मुझे मानसिक और शारीरिक रूप से ऊर्जावान रखे।",
    category: "tasks"
  },
  {
    id: "learn-1",
    title: "नया कौशल सीखें",
    description: "किसी कठिन विषय को बच्चों की तरह समझें",
    prompt: "मुझे 'Artificial Intelligence' (AI) के मूलभूत सिद्धांत बेहद साधारण भाषा में उदाहरण देकर समझाएं।",
    category: "learning"
  },
  {
    id: "learn-2",
    title: "पढ़ाई का शेड्यूल",
    description: "परीक्षा या नए हुनर के लिए स्टडी प्लान",
    prompt: "मैं अगले 30 दिनों में कोडिंग (Python) सीखना चाहता हूं। कृपया मेरे लिए एक व्यावहारिक डेली स्टडी प्लैनर शेड्यूल तैयार करें।",
    category: "learning"
  },
  {
    id: "tech-1",
    title: "कोडिंग एरर ठीक करें",
    description: "अपने कोड की समस्या का समाधान पाएं",
    prompt: "मेरे कोड में कभी-कभी अनपेक्षित एरर आते हैं। कृपया मुझे समझाएं कि कोडिंग में डिबगिंग (Debugging) करने का सबसे उत्तम तरीका क्या है?",
    category: "tech"
  },
  {
    id: "tech-2",
    title: "स्मार्टफोन सेफ्टी",
    description: "अपने डिवाइस को सुरक्षित और स्मूथ रखें",
    prompt: "मुझे अपने मोबाइल फ़ोन और निजी डेटा को ऑनलाइन हैकर्स और मैलवेयर से पूरी तरह सुरक्षित रखने के लिए 5 मुख्य टिप्स दें।",
    category: "tech"
  },
  {
    id: "job-1",
    title: "रेज़्यूमे (Resume) टिप्स",
    description: "अपने बायोडाटा को उत्कृष्ट बनाएं",
    prompt: "एक फ्रेशर सॉफ्टवेयर इंजीनियर के लिए 'ATS-friendly Resume' बनाने के मुख्य नियम क्या हैं? किन बातों का ध्यान रखना ज़रूरी है?",
    category: "jobs"
  },
  {
    id: "job-2",
    title: "इंटरव्यू की तैयारी",
    description: "कठिन सवालों का आत्मविश्वास से जवाब दें",
    prompt: "इंटरव्यू में पूछे जाने वाले सबसे आम सवाल 'Tell me about yourself' (अपने बारे में बताएं) का एक प्रभावशाली और पेशेवर जवाब हिंदी में कैसे तैयार करें?",
    category: "jobs"
  },
  {
    id: "fit-1",
    title: "वर्कआउट प्लान",
    description: "घर पर बिना उपकरणों के फिट रहें",
    prompt: "मैं घर पर रहकर ही फिट होना चाहता हूं। मेरे लिए बिना किसी जिम उपकरण के 'Full Body Home Workout Routine' बनाएं।",
    category: "fitness"
  },
  {
    id: "fit-2",
    title: "स्वस्थ आहार चार्ट",
    description: "पोषण से भरपूर शाकाहारी डाइट प्लान",
    prompt: "एक स्वस्थ और ऊर्जावान जीवनशैली के लिए साधारण भारतीय 'Balanced Vegetarian Diet Plan' तैयार करें जो घर पर आसानी से उपलब्ध हो।",
    category: "fitness"
  },
  {
    id: "plan-1",
    title: "बचत और बजटिंग",
    description: "पैसे बचाने की अनूठी 50-30-20 योजना",
    prompt: "अपनी मासिक आय (Income) को सही ढंग से मैनेज करने के लिए '50-30-20 rule' क्या है और मैं इसे कैसे लागू कर सकता हूं?",
    category: "planning"
  },
  {
    id: "plan-2",
    title: "आदत ट्रैकर (Habit Builder)",
    description: "21 दिनों में सकारात्म्क आदतें अपनाएं",
    prompt: "एक बेहतरीन 'Atomic Habit' प्रणाली का उपयोग करके प्रतिदिन जल्दी उठने या किताबें पढ़ने की आदत कैसे विकसित करें?",
    category: "planning"
  }
];

export const CATEGORY_META = {
  tasks: {
    label: "Daily Tasks & Planner",
    icon: "ClipboardList",
    color: "from-amber-500/20 to-orange-500/10 border-amber-200 text-amber-700",
    textClass: "text-amber-800"
  },
  learning: {
    label: "Skills & Learning",
    icon: "GraduationCap",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-200 text-blue-700",
    textClass: "text-blue-800"
  },
  tech: {
    label: "Technology Support",
    icon: "Cpu",
    color: "from-purple-500/20 to-fuchsia-500/10 border-purple-200 text-purple-700",
    textClass: "text-purple-800"
  },
  jobs: {
    label: "Career & Resume",
    icon: "Briefcase",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-200 text-emerald-700",
    textClass: "text-emerald-800"
  },
  fitness: {
    label: "Fitness & Diet",
    icon: "Dumbbell",
    color: "from-rose-500/20 to-pink-500/10 border-rose-200 text-rose-700",
    textClass: "text-rose-800"
  },
  planning: {
    label: "Planning & Budgets",
    icon: "Compass",
    color: "from-sky-500/20 to-cyan-500/10 border-sky-200 text-sky-700",
    textClass: "text-sky-800"
  }
};
