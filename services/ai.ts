import { GoogleGenAI, Type } from "@google/genai";
import { Issue, User, EmailNotification } from "../types.ts";

// Always use named parameter and process.env.API_KEY directly
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIssue = async (title: string, description: string, base64Image?: string) => {
  const ai = getAI();
  try {
    const parts: any[] = [{ text: `Infrastructure Analysis Request:
    Issue: ${title}
    Context: ${description}
    
    Categorize this issue for a Bengaluru ward management system. Ensure priority is realistic. 
    If this seems fake or prank-related, categorize as General and set priority to Low.` }];
    
    if (base64Image) {
      const imageData = base64Image.split(',')[1];
      const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];
      parts.push({
        inlineData: {
          data: imageData,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "One sentence summary of the issue." },
            category: { type: Type.STRING, enum: ["Roads", "Waste Management", "Lighting", "Water", "Public Safety", "Parks", "Sewage"] },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["summary", "category", "priority"]
        }
      }
    });

    // Access text property directly
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("AI Analysis failed:", e);
    return {
      summary: "Report submitted for manual categorization.",
      category: "General",
      priority: "Medium"
    };
  }
};

export const composeSmartNotification = async (
  action: 'LOGIN' | 'STATUS_CHANGE' | 'NEW_REPORT' | 'REPORT_CONFIRMATION',
  data: { issue?: Issue; user?: User; ward?: string; email?: string }
): Promise<EmailNotification | null> => {
  const ai = getAI();
  
  const prompts: Record<string, string> = {
    'LOGIN': `Draft a concise security login alert for citizen ${data.user?.name}.`,
    'STATUS_CHANGE': `Draft a professional update for a citizen. Their issue "${data.issue?.title}" is now "${data.issue?.status}".`,
    'NEW_REPORT': `Draft a priority dispatch for the councillor of ${data.ward}. A new "${data.issue?.priority}" priority report: "${data.issue?.title}" was submitted.`,
    'REPORT_CONFIRMATION': `Draft a polite confirmation for citizen ${data.user?.name}. Their report "${data.issue?.title}" was received and categorized as ${data.issue?.category}.`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompts[action] }] }
    });

    return {
      to: data.email || data.user?.email || 'user@example.com',
      subject: `[Fix My Ward] ${action.replace('_', ' ')}`,
      body: response.text || "Automatic system update.",
      type: action === 'LOGIN' ? 'SECURITY' : 'UPDATE'
    };
  } catch (e) {
    return null;
  }
};