import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Chat API functions
const MESSAGE_WEBHOOK_URL = "https://alpharc.app.n8n.cloud/webhook/9b07fb75-bc10-4c31-ae17-2055bbcc5018";

interface Session {
  chat: Array<{ user?: string; bot?: string }>;
  start_time: number;
}

const sessions: Record<string, Session> = {};

const sendMessage = async (sessionId: string, message: string): Promise<string> => {
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

const endSession = (sessionId: string): void => {
  if (sessions[sessionId]) {
    delete sessions[sessionId];
  }
};

const generateSessionId = (): string => {
  return `session-${Math.random().toString(36).substr(2, 9)}`;
};

// Components
interface Message {
  id: string;
  type: 'user' | 'bot' | 'typing';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem("chatSessionId", newSessionId);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      initializeChat();
    }
  }, [sessionId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const botReply = await sendMessage(sessionId, "__init__");

      setMessages([{
        id: Date.now().toString(),
        type: 'bot',
        content: botReply,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages([{
        id: Date.now().toString(),
        type: 'bot',
        content: "Hello! How can I help you today?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: 'typing',
      content: 'Typing...',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      const botReply = await sendMessage(sessionId, messageToSend);

      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.type !== 'typing');
        return [...filteredMessages, {
          id: Date.now().toString(),
          type: 'bot',
          content: botReply,
          timestamp: new Date()
        }];
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.type !== 'typing');
        return [...filteredMessages, {
          id: Date.now().toString(),
          type: 'bot',
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (sessionId) {
        endSession(sessionId);
      }
    };
  }, [sessionId]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-80 h-96 flex flex-col overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-blue-100">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
        >
          <Minimize2 size={14} />
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : message.type === 'typing'
                    ? 'bg-gray-100 text-gray-500 italic rounded-bl-md animate-pulse'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {message.type === 'typing' ? (
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send
        </p>
      </div>
    </div>
  );
};

export const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 animate-in slide-in-from-bottom-5 duration-300">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
      
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-white ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-0' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <MessageCircle size={20} />
        )}
      </button>
    </div>
  );
};