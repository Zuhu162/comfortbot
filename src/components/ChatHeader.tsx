
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
  conversationStarted: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, conversationStarted }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-comfort-500 mb-1 animate-fade-in">
          ComfortBot
        </p>
        <h1 className="text-2xl font-serif font-medium text-comfort-950 animate-slide-up">
          Islamic Guidance & Comfort
        </h1>
      </div>
      
      {conversationStarted && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-comfort-600 border-comfort-200 hover:bg-comfort-50 transition-all duration-300"
          onClick={onNewChat}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </Button>
      )}
    </div>
  );
};

export default ChatHeader;
