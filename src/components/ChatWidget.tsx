
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 animate-in slide-in-from-bottom-5 duration-300">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
      
      {/* Chat Button */}
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
