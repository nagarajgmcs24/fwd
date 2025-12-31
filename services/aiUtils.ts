
import { GoogleGenAI, Type } from "@google/genai";
import { Issue, User, EmailNotification } from "../types.ts";

// Fix initialization using named parameter and direct process.env access
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIssue = async (title: string, description: string, base64Image?: string) => {
  const ai = getAI();
  try {
    const parts: any[] = [{ text: `Analyze infrastructure issue: Title: ${title}, Description: ${description}` }];
    if (base64Image) {
      parts.push({ inlineData: { data: base64Image.split(',')[1], mimeType: base64Image.split(',')[0].split(':')[1].split(';')[0] } });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      // Use correct contents structure as per guidelines
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            priority: { type: Type.STRING }
          },
          required: ["summary", "category", "priority"]
        }
      }
    });
    // Access text property directly
    return JSON.parse(response.text || "{}");
  } catch (e) { 
    console.error("AI analysis failed in utils:", e);
    return null; 
  }
};

export const composeEmail = async (action: string, data: any): Promise<EmailNotification | null> => {
  const ai = getAI();
  const prompts: any = {
    'LOGIN': `Draft a security alert for ${data.user?.name} regarding a new login.`,
    'STATUS': `Notify citizen about their report "${data.issue?.title}" moving to ${data.issue?.status}.`,
    'NEW': `Notify councillor ${data.ward} about a new report: ${data.issue?.title}.`
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      // Use correct contents structure
      contents: { parts: [{ text: prompts[action] || "Compose notification." }] }
    });
    return {
      to: data.email,
      subject: `[Fix My Ward] ${action} Notification`,
      // Access text property directly
      body: response.text || "Update from your ward.",
      type: action === 'LOGIN' ? 'SECURITY' : 'UPDATE'
    };
  } catch (e) { 
    console.error("AI email composition failed in utils:", e);
    return null; 
  }
};
