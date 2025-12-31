
import { GoogleGenAI } from "@google/genai";
import { Issue, IssueStatus, User } from "../types";

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'SECURITY' | 'DISPATCHED' | 'RECEIVED' | 'UPDATE' | 'RESET';
}

export type NotificationAction = 
  | 'NEW_REPORT' 
  | 'STATUS_CHANGE' 
  | 'LOGIN_ALERT' 
  | 'PASSWORD_RESET' 
  | 'REPORT_RESULT_TO_CITIZEN';

export const composeAndSendEmail = async (
  recipientEmail: string, 
  action: NotificationAction,
  data: { issue?: Issue; user?: User; resetLink?: string }
): Promise<EmailNotification | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let prompt = "";
  let subject = "";
  let type: EmailNotification['type'] = 'UPDATE';

  switch (action) {
    case 'LOGIN_ALERT':
      subject = `[Security] New Login Detected for ${data.user?.username}`;
      type = 'SECURITY';
      prompt = `Compose a short, professional security alert email for user ${data.user?.name} (@${data.user?.username}). Notify them that a login occurred on Fix My Ward from a new browser session. If it wasn't them, they should contact support.`;
      break;
    
    case 'PASSWORD_RESET':
      subject = `Reset your Fix My Ward Password`;
      type = 'RESET';
      prompt = `Compose a helpful password reset email for ${data.user?.name}. Include this temporary secure link: ${data.resetLink}. Tell them the link expires in 15 minutes.`;
      break;

    case 'NEW_REPORT':
      subject = `[Official] New Infrastructure Report: ${data.issue?.title}`;
      type = 'DISPATCHED';
      prompt = `Draft a professional email to a Ward Councillor. 
                Issue: ${data.issue?.title}
                Analysis: ${data.issue?.aiAnalysis}
                Ward: ${data.issue?.ward}
                Reported by: ${data.issue?.reportedBy} (@${data.user?.username})
                Action required: Please review and assign a field team.`;
      break;

    case 'REPORT_RESULT_TO_CITIZEN':
      subject = `Your Report Analysis: ${data.issue?.title}`;
      type = 'RECEIVED';
      prompt = `Compose a "Thank You" receipt for citizen ${data.issue?.reportedBy}. 
                Confirm their report "${data.issue?.title}" was received.
                Detail the AI Analysis: "${data.issue?.aiAnalysis}".
                Explain that their Ward Councillor has been notified and will provide updates.`;
      break;

    case 'STATUS_CHANGE':
      subject = `Update on Report: ${data.issue?.title}`;
      type = 'UPDATE';
      prompt = `Compose a polite update for ${data.issue?.reportedBy}. 
                Their report "${data.issue?.title}" status is now: ${data.issue?.status}. 
                Ward: ${data.issue?.ward}.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: { temperature: 0.7 }
    });

    const notification: EmailNotification = {
      to: recipientEmail,
      subject,
      body: response.text || "Automatic notification from Fix My Ward.",
      type
    };

    // Simulate network delay for "sending" via virtual SMTP
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log(`%c📧 SMTP DISPATCH [${type}]`, "color: #10b981; font-weight: bold;");
    console.log(`From: noreply@fixmyward.in\nTo: ${notification.to}\nSubject: ${notification.subject}`);

    return notification;
  } catch (error) {
    console.error("Notification dispatch failed", error);
    return null;
  }
};
