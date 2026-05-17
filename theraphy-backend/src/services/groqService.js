import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AVAILABLE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

const SYSTEM_PROMPT = `You are a supportive mental health assistant for a therapy management platform. 
Your role is to provide empathetic, helpful responses to users who may be experiencing anxiety, depression, 
or other mental health concerns. Always maintain a compassionate tone and encourage users to seek 
professional help when appropriate. Never provide medical advice or diagnosis. Keep responses 
concise, warm, and supportive (2-3 sentences).`;

export const generateAIResponse = async (userMessage, history = []) => {
  for (const model of AVAILABLE_MODELS) {
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-8).map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: model,
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content || "";
      
      return response;
    } catch (error) {
     
    }
  }

  return "I'm here to listen. Would you like to tell me more about what's on your mind?";
};

export const generateConversationTitle = async (firstMessage) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Generate a short, concise title (max 6 words) for a therapy conversation. Return only the title, no quotes or extra text.",
        },
        {
          role: "user",
          content: `First message: "${firstMessage}"`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 20,
    });

    const title = completion.choices[0]?.message?.content || "New Conversation";
    return title.replace(/["']/g, "").trim();
  } catch (error) {
    console.error("❌ Title generation error:", error.message);
    return "New Conversation";
  }
};