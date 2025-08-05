import React, { useState, useEffect, useRef } from "react";

// Standalone Chatbot Component - Copy this entire file to use anywhere
// No external dependencies required except React

interface ChatbotConfig {
  webhookUrl: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  autoOpenDelay?: number;
  position?: 'bottom-right' | 'bottom-left';
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'typing';
  content: string;
  timestamp: Date;
}

interface Session {
  chat: Array<{ user?: string; bot?: string }>;
  start_time: number;
}

const sessions: Record<string, Session> = {};

const sendMessage = async (sessionId: string, message: string, webhookUrl: string): Promise<string> => {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      chat: [],
      start_time: Date.now()
    };
  }

  const session = sessions[sessionId];

  if (message === "__init__") {
    try {
      const response = await fetch(webhookUrl, {
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
      console.error('Webhook error:', error);
      const errorMessage = "Hello! I'm having trouble connecting to my backend right now, but I'm here to help!";
      session.chat.push({ bot: errorMessage });
      return errorMessage;
    }
  } else {
    try {
      const response = await fetch(webhookUrl, {
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
      console.error('Webhook error:', error);
      const errorMessage = "I'm sorry, I'm having trouble connecting right now. Please check that your webhook URL is correct and try again.";
      session.chat.push({ user: message });
      session.chat.push({ bot: errorMessage });
      return errorMessage;
    }
  }
};

const generateSessionId = (): string => {
  return `session-${Math.random().toString(36).substr(2, 9)}`;
};

// Inline styles to avoid external CSS dependencies
const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '24px',
    zIndex: 50,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  chatWindow: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '350px',
    height: '450px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    border: 'none',
    marginBottom: '16px'
  },
  header: {
    background: 'linear-gradient(135deg, #d946ef, #a855f7, #8b5cf6)',
    color: 'white',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    border: '2px solid rgba(255, 255, 255, 0.5)'
  },
  headerText: {
    margin: 0
  },
  title: {
    fontWeight: '700',
    fontSize: '16px',
    margin: 0,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  subtitle: {
    fontSize: '13px',
    opacity: 0.9,
    margin: 0,
    fontWeight: '500'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  messageWrapper: {
    display: 'flex'
  },
  userMessageWrapper: {
    justifyContent: 'flex-end'
  },
  botMessageWrapper: {
    justifyContent: 'flex-start'
  },
  message: {
    maxWidth: '80%',
    padding: '12px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: 1.4
  },
  userMessage: {
    background: 'linear-gradient(135deg, #d946ef, #a855f7)',
    color: 'white',
    borderBottomRightRadius: '6px',
    boxShadow: '0 2px 8px rgba(217, 70, 239, 0.3)'
  },
  botMessage: {
    backgroundColor: '#f8fafc',
    color: '#374151',
    borderBottomLeftRadius: '6px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  typingMessage: {
    backgroundColor: '#f8fafc',
    color: '#a855f7',
    fontStyle: 'italic',
    borderBottomLeftRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #e2e8f0'
  },
  typingDots: {
    display: 'flex',
    gap: '3px'
  },
  typingDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#a855f7',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out'
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  inputWrapper: {
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  sendButton: {
    background: 'linear-gradient(135deg, #d946ef, #a855f7)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(217, 70, 239, 0.3)'
  },
  helpText: {
    fontSize: '12px',
    color: '#a855f7',
    textAlign: 'center' as const,
    marginTop: '8px'
  },
  toggleButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px'
  }
};

// Add keyframes for typing animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
  }
  .typing-dot-1 { animation-delay: -0.32s; }
  .typing-dot-2 { animation-delay: -0.16s; }
  .typing-dot-3 { animation-delay: 0s; }
`;
document.head.appendChild(styleSheet);

const ChatWindow: React.FC<{ 
  config: ChatbotConfig; 
  onClose: () => void; 
}> = ({ config, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      const storedMessages = localStorage.getItem(`chatMessages_${storedSessionId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem("chatSessionId", newSessionId);
    }
  }, []);

  useEffect(() => {
    if (sessionId && messages.length === 0) {
      initializeChat();
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`chatMessages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      const typingMessage: Message = {
        id: `typing-init-${Date.now()}`,
        type: 'typing',
        content: 'Typing...',
        timestamp: new Date()
      };
      setMessages([typingMessage]);

      const botReply = await sendMessage(sessionId, "__init__", config.webhookUrl);

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
      const botReply = await sendMessage(sessionId, messageToSend, config.webhookUrl);

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

  return (
    <div style={styles.chatWindow}>
      <div style={{...styles.header, background: `linear-gradient(to right, ${config.primaryColor || '#2563eb'}, ${config.primaryColor || '#1d4ed8'})`}}>
        <div style={styles.headerContent}>
          <div style={styles.avatar}>
            <span>🤖</span>
          </div>
          <div style={styles.headerText}>
            <h3 style={styles.title}>{config.title || 'AI Assistant'}</h3>
            <p style={styles.subtitle}>{config.subtitle || 'Online'}</p>
          </div>
        </div>
        <button
          style={styles.closeButton}
          onClick={onClose}
          onMouseOver={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          ✕
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.messageWrapper,
              ...(message.type === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper)
            }}
          >
            <div
              style={{
                ...styles.message,
                ...(message.type === 'user' 
                  ? styles.userMessage 
                  : message.type === 'typing'
                  ? styles.typingMessage
                  : styles.botMessage
                )
              }}
            >
              {message.type === 'typing' ? (
                <div style={styles.typingDots}>
                  <div style={{...styles.typingDot}} className="typing-dot-1"></div>
                  <div style={{...styles.typingDot}} className="typing-dot-2"></div>
                  <div style={{...styles.typingDot}} className="typing-dot-3"></div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            style={{
              ...styles.sendButton,
              opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
              cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
          >
            ➤
          </button>
        </div>
        <p style={styles.helpText}>
          Press Enter to send
        </p>
      </div>
    </div>
  );
};

export const StandaloneChatbot: React.FC<ChatbotConfig> = (config) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const initializeOnVisit = async () => {
      if (!hasInitialized) {
        setHasInitialized(true);
        setTimeout(() => {
          setIsOpen(true);
        }, config.autoOpenDelay || 2000);
      }
    };

    initializeOnVisit();
  }, [hasInitialized, config.autoOpenDelay]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const positionStyle = config.position === 'bottom-left' ? { left: '24px' } : { right: '24px' };

  return (
    <div style={{...styles.container, ...positionStyle}}>
      {isOpen && (
        <ChatWindow config={config} onClose={() => setIsOpen(false)} />
      )}
      
      <button
        onClick={toggleChat}
        style={{
          ...styles.toggleButton,
          background: isOpen ? '#ef4444' : (config.primaryColor || 'linear-gradient(135deg, #d946ef, #a855f7)'),
          transform: !isOpen ? 'scale(1)' : 'scale(1)',
        }}
        onMouseOver={(e) => {
          if (!isOpen) {
            (e.target as HTMLElement).style.transform = 'scale(1.1)';
          }
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.transform = 'scale(1)';
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default StandaloneChatbot;