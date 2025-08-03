
// Mock API functions to simulate the Flask backend behavior
const MESSAGE_WEBHOOK_URL = "https://alpharc.app.n8n.cloud/webhook/9b07fb75-bc10-4c31-ae17-2055bbcc5018";

interface Session {
  chat: Array<{ user?: string; bot?: string }>;
  start_time: number;
}

// In-memory session storage (in a real app, this would be handled by your backend)
const sessions: Record<string, Session> = {};

export const sendMessage = async (sessionId: string, message: string): Promise<string> => {
  // Initialize session if it doesn't exist
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      chat: [],
      start_time: Date.now()
    };
  }

  const session = sessions[sessionId];

  if (message === "__init__") {
    try {
      const response = await fetch(MESSAGE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: "new_session", 
          session_id: sessionId 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const botReply = await response.text();
      session.chat.push({ bot: botReply });
      return botReply;
    } catch (error) {
      const errorMessage = `Error loading welcome message: ${error}`;
      session.chat.push({ bot: errorMessage });
      return "Hello! How can I help you today?";
    }
  } else {
    try {
      const response = await fetch(MESSAGE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message, 
          session_id: sessionId 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const botReply = await response.text();
      
      session.chat.push({ user: message });
      session.chat.push({ bot: botReply });

      // Handle session end
      if (message.toLowerCase().trim() === "__end__") {
        delete sessions[sessionId];
      }

      return botReply;
    } catch (error) {
      const errorMessage = `Bot error: ${error}`;
      session.chat.push({ user: message });
      session.chat.push({ bot: errorMessage });
      return "I'm sorry, I'm having trouble right now. Please try again later.";
    }
  }
};

export const endSession = (sessionId: string): void => {
  if (sessions[sessionId]) {
    delete sessions[sessionId];
  }
};

export const generateSessionId = (): string => {
  return `session-${Math.random().toString(36).substr(2, 9)}`;
};
