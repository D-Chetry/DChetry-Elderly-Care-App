import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route for Chat Assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, schedule } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGeminiClient();

    // Format schedule for context
    const scheduleContext = schedule && Array.isArray(schedule)
      ? schedule.map((item: any) => `- [${item.time}] ${item.label} (${item.category})`).join("\n")
      : "No schedule configured.";

    const systemInstruction = `You are a warm, extremely polite, patient, and friendly wellness assistant for an elderly person.
Your tone should be highly supportive, encouraging, reassuring, and comforting.
Use simple, clear, large-print-friendly language. Avoid medical jargon or complex explanations.
You have access to their current wellness schedule. Refer to this schedule when appropriate (e.g., reminding them of a medication or hydration break).

Their current schedule:
${scheduleContext}

Be compassionate and conversational. Keep your answers relatively short (2-3 sentences where possible) and very easy to read on a screen. Encourage gentle physical activity, hydration, and positive mental stimulation. Always sign off with a caring phrase.`;

    // Map history to Google GenAI contents format if needed, or build contents array
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      }
    }
    
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I am here for you. How can I help you today?";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while communicating with the wellness assistant.",
    });
  }
});

// Vite middleware or static files setup
async function setupServer() {
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
    console.log(`Elderly Wellness Support server running on http://localhost:${PORT}`);
  });
}

setupServer();
