import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Get key securely from server environment
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Helper function to retry content generation with exponential backoff and random jitter
  async function generateWithRetry(aiClient: any, model: string, contentsPay: any, configPay: any): Promise<any> {
    const maxRetries = 2;
    let lastErr: any = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = Math.pow(2, attempt) * 450 + Math.random() * 200;
          console.log(`[Retry Engine] Retrying model ${model} in ${backoff.toFixed(0)}ms. Attempt ${attempt}/${maxRetries} due to temporary delay.`);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
        return await aiClient.models.generateContent({
          model,
          contents: contentsPay,
          config: configPay,
        });
      } catch (err: any) {
        lastErr = err;
        const errMsgText = err.message || "";
        const errStatus = err.status || "";
        const errMsgFull = typeof err === "object" ? JSON.stringify(err) : String(err);

        // Check for 429 Rate Limit (Resource Exhausted) / Quota Limits
        const isQuotaOrRateLimit =
          errStatus === 429 ||
          errMsgText.includes("429") ||
          errMsgText.includes("RESOURCE_EXHAUSTED") ||
          errMsgText.includes("quota") ||
          errMsgText.includes("limit") ||
          errMsgFull.includes("429") ||
          errMsgFull.includes("RESOURCE_EXHAUSTED") ||
          errMsgFull.includes("quota") ||
          errMsgFull.includes("limit");

        if (isQuotaOrRateLimit) {
          console.warn(`[Retry Engine] Model ${model} returned quota/rate-limit (429/RESOURCE_EXHAUSTED). Instantly skipping same-model retries to try next model.`);
          throw err; // throw immediately to allow outer model-fallback loop to try a different model
        }

        // Check for 503 Service Unavailable / Overloading
        const isTransient =
          errStatus === 503 ||
          errMsgText.includes("503") ||
          errMsgText.includes("UNAVAILABLE") ||
          errMsgText.includes("high demand") ||
          errMsgText.includes("temporary") ||
          errMsgFull.includes("503") ||
          errMsgFull.includes("UNAVAILABLE") ||
          errMsgFull.includes("high demand") ||
          errMsgFull.includes("temporary");

        console.warn(`[Retry Engine] Attempt ${attempt} for model ${model} failed. Transient=${isTransient}. Error:`, errMsgText);
        if (!isTransient) {
          throw err; // Stop retrying if error is terminal
        }
      }
    }
    throw lastErr;
  }

  // API Route for chat assistance
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, useWebSearch, memoryProfile } = req.body;
      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API Key is not set in environment. Please add GEMINI_API_KEY in the Settings secrets configuration panel.",
        });
      }

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Format messages into Content format for Gemini (role: "user" | "model", parts: [{ text: string }])
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const tools: any[] = [];
      if (useWebSearch) {
        tools.push({ googleSearch: {} });
      }

      let response;
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-3.1-pro-preview"
      ];
      let lastError: any = null;

      let dynamicInstruction =
        "You are Aira, an advanced and highly intelligent personal AI assistant, similar to Jarvis. " +
        "Your tone must be professional, supportive, intelligent, and highly capable. " +
        "Rule: You must ALWAYS reply in natural, simple Hindi (using the Devanagari script, e.g., 'नमस्ते! मैं अइरा हूँ। आज हम किस प्रोजेक्ट पर काम कर रहे हैं?'), unless the user explicitly requests another language. " +
        "Ensure you use clean, elegant Hindi conversational structures enriched with relevant, everyday English words for modern terminology (e.g., plans, schedule, fitness, tech, coding, targets, resume, milestones) so it sounds extremely contemporary, intelligent, and humanly professional. " +
        "You always address the user by their name if it is recorded in the Memory Profile. " +
        "Be concise, helpful, and highly proactive. Introduce next actionable steps or prompt constructive questions at the end of your messages when appropriate. " +
        "You excel at and manage the following core assistant capabilities seamlessly:\n" +
        "1. Personal Assistant & Custom Daily Planning (Generate hourly/weekly schedules, prioritize tasks, manage notes)\n" +
        "2. Help with Coding, Software, & Technology (Explain concepts simply, review logic, write code)\n" +
        "3. Learning & Study Progress (Design roadmap plans and tracking milestones)\n" +
        "4. Career Planning & Job Advice (Professional resume guidance, mock interview preparation, skill development)\n" +
        "5. Health and Fitness Guidance (Custom habits, workout outlines, diet recommendations, timers/reminders)\n" +
        "6. Smart Tools Integrations (Providing calculations, dates/times, and Google Search results representation on request).\n" +
        "You are a true personal companion and assistant, not just a basic chatbot. Deliver direct, high-value, organized bullet-point advice.";

      if (memoryProfile) {
        dynamicInstruction += "\n\nUser's Long-Term Memory Profile (Kripya iska dhyan rakhein, user ko unke naam se sambodhit karein, saved facts ya progress yaad dilayein, and design incredibly cohesive personalized responses):\n";
        if (memoryProfile.userName) {
          dynamicInstruction += `- Name (नाम): ${memoryProfile.userName}\n`;
        }
        if (memoryProfile.userGoals && memoryProfile.userGoals.length > 0) {
          dynamicInstruction += `- Active Targets/Goals (सक्रिय लक्ष्य): ${memoryProfile.userGoals.join(", ")}\n`;
        }
        if (memoryProfile.learningProgress && memoryProfile.learningProgress.length > 0) {
          dynamicInstruction += `- Study & Skill Progress (अध्ययन प्रगति): ${memoryProfile.learningProgress.join(", ")}\n`;
        }
        if (memoryProfile.summarizedFacts && memoryProfile.summarizedFacts.length > 0) {
          dynamicInstruction += `- Saved Facts from previous chats (याद रखे गए तथ्य): ${memoryProfile.summarizedFacts.join("; ")}\n`;
        }
      }

      const baseConfig: any = {
        systemInstruction: dynamicInstruction,
      };
      if (tools.length > 0) {
        baseConfig.tools = tools;
      }

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying model: ${modelName}`);
          response = await generateWithRetry(ai, modelName, contents, baseConfig);
          if (response) {
            console.log(`Successfully generated content using: ${modelName}`);
            break; // Success!
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} ultimately failed after retries. Moving to next model. Error:`, err.message || err);
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error("All fallback models and retries failed due to temporary load spike.");
      }

      const replyText = response.text || "माफ़ कीजिये, मैं अभी उत्तर देने में असमर्थ हूँ। कृपया पुनः प्रयास करें।";
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        reply: replyText,
        groundingSources: searchChunks
          .map((chunk: any) => ({
            uri: chunk.web?.uri || "",
            title: chunk.web?.title || "",
          }))
          .filter((item: any) => item.uri && item.title),
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({ error: err.message || "Aira encountered an error while processing." });
    }
  });

  // API Route to process and summarize long-term memories / facts dynamically in background
  app.post("/api/summarize-facts", async (req, res) => {
    const { messages, currentMemory } = req.body || {};
    try {
      if (!apiKey) {
        return res.status(200).json({ memoryProfile: currentMemory }); // Bypasses gracefully if API key isn't set or configured
      }

      const formattedHistory = (messages || [])
        .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
      const memoryString = JSON.stringify(currentMemory || {});

      const systemInstruction = 
        "You are Aira's core background memory processor. Your single goal is to extract key facts, goals, and learning milestones from the given conversation and merge/update them with the user's existing memory profile.\n\n" +
        "You must return a valid JSON object ONLY. Do NOT include any markdown backticks, explanations, comments or HTML tags. Just raw JSON text.\n\n" +
        "Schema:\n" +
        "{\n" +
        '  "userName": "string containing user name if mentioned, otherwise retain the existing userName from current memory",\n' +
        '  "userGoals": ["array of user\'s high-level long term goals/tasks. Merge new targets mentioned and clean duplicates"],\n' +
        '  "learningProgress": ["array of topics being learned. Merge new progress or concepts and clean duplicates"],\n' +
        '  "summarizedFacts": ["array of general facts (e.g., age, job preferences, constraints, diet likes/dislikes) of the user. Merge new facts and remove redundant ones"]\n' +
        "}\n\n" +
        "Write targets, learning milestones, and facts briefly, cleanly and professionally in Romanized Hindi/Hinglish or simple Hindi text (e.g. 'React basic concepts complete', 'Java developer job preparation'). Keep arrays focused (maximum 5 items per array).";

      const prompt = `Current User Memory Profile:\n${memoryString}\n\nNew Conversation Turn:\n${formattedHistory}\n\nPlease analyze, update name if mentioned, merge goals, progress and facts and output the new updated JSON representation. Output raw JSON ONLY.`;

      // Format contents for generation
      const extractionContents = [{ role: "user", parts: [{ text: prompt }] }];
      const extractionConfig = {
        systemInstruction,
        responseMimeType: "application/json"
      };

      let geminiResponse;
      const extractionModels = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest"
      ];
      let lastErr: any = null;

      for (const modelName of extractionModels) {
        try {
          console.log(`[Background Memory API] Trying model: ${modelName}`);
          geminiResponse = await generateWithRetry(ai, modelName, extractionContents, extractionConfig);
          if (geminiResponse) {
            console.log(`[Background Memory API] Successfully analyzed with: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`[Background Memory API] Model ${modelName} failed or limits reached. Moving to next extraction model. Error:`, err.message || err);
          lastErr = err;
        }
      }

      if (!geminiResponse) {
        throw lastErr || new Error("All memory extraction models failed.");
      }

      const replyText = geminiResponse.text?.trim() || "";
      // Clean up in case there are markdown formatting blocks
      const cleanedJsonText = replyText.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsedMemory = JSON.parse(cleanedJsonText);
      
      // Ensure all fields are formatted properly
      const unifiedMemory = {
        userName: parsedMemory.userName || currentMemory?.userName || "",
        userGoals: Array.isArray(parsedMemory.userGoals) ? parsedMemory.userGoals.slice(0, 6) : (currentMemory?.userGoals || []),
        learningProgress: Array.isArray(parsedMemory.learningProgress) ? parsedMemory.learningProgress.slice(0, 6) : (currentMemory?.learningProgress || []),
        summarizedFacts: Array.isArray(parsedMemory.summarizedFacts) ? parsedMemory.summarizedFacts.slice(0, 6) : (currentMemory?.summarizedFacts || [])
      };

      res.json({ memoryProfile: unifiedMemory });
    } catch (e: any) {
      console.warn("Memory background parsing had a minor hiccup:", e.message || e);
      res.json({ memoryProfile: currentMemory }); // Always fallback gracefully in background
    }
  });

  // Handle Vite setup based on env
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
