import { GoogleGenAI, Type } from "@google/genai";
import { Issue, User, EmailNotification } from "../types.ts";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeIssue = async (title: string, description: string, base64Image?: string) => {
  const ai = getAI();
  try {
    const parts: any[] = [{ text: `Analyze infrastructure issue for a Bengaluru ward: Title: ${title}, Description: ${description}` }];
    
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
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["summary", "category", "priority"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("AI Analysis failed:", e);
    return {
      summary: "Manual review required.",
      category: "General",
      priority: "Medium"
    };
  }
};

export const composeSmartNotification = async (
  action: 'LOGIN' | 'STATUS_CHANGE' | 'NEW_REPORT' | 'REPORT_RESULT',
  data: { issue?: Issue; user?: User; ward?: string; email?: string }
): Promise<EmailNotification | null> => {
  const ai = getAI();
  
  const prompts: Record<string, string> = {
    'LOGIN': `Draft a formal security alert for ${data.user?.name} about a recent login to Fix My Ward.`,
    'STATUS_CHANGE': `Notify a citizen that their infrastructure report "${data.issue?.title}" has been moved to status: ${data.issue?.status}. Be professional and encouraging.`,
    'NEW_REPORT': `Draft a notification for the councillor of ${data.ward} about a new citizen report regarding "${data.issue?.title}". Highlight the priority: ${data.issue?.priority}.`,
    'REPORT_RESULT': `Draft a confirmation for a citizen that their report "${data.issue?.title}" has been successfully submitted and categorized by AI. Summary: ${data.issue?.aiAnalysis}`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompts[action] || "Compose ward notification." }] }
    });

    return {
      to: data.email || data.user?.email || data.issue?.reportedByEmail || 'support@fixmyward.in',
      subject: `[Fix My Ward] ${action.replace('_', ' ')}`,
      body: response.text || "System update processed.",
      type: action === 'LOGIN' ? 'SECURITY' : 'UPDATE'
    };
  } catch (e) {
    console.error("Smart notification failed:", e);
    return null;
  }
};