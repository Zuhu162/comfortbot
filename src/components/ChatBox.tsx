import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import { sendMessage } from "@/utils/chatService";
import { Separator } from "@/components/ui/separator";

interface Message {
  content: string;
  role: "user" | "assistant";
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [hasConversationStarted, setHasConversationStarted] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = { content, role: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setHasConversationStarted(true);

    try {
      // Get AI response
      const response = await sendMessage(content);

      // Add AI response to chat
      if (response.message) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { content: response.message.content, role: "assistant" },
          ]);
          setIsLoading(false);
        }, 500); // Small delay for better UX
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          content:
            "I'm sorry, I encountered an issue processing your request. Please try again.",
          role: "assistant",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setHasConversationStarted(false);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <ChatHeader
        onNewChat={handleNewChat}
        conversationStarted={hasConversationStarted}
      />

      <div
        id="chat-container"
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-1 py-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4 py-12 animate-fade-in">
            <div className="max-w-md space-y-4">
              <div className="font-serif text-3xl text-comfort-800 mb-6">
                السلام عليكم
              </div>
              <p className="text-comfort-600">
                Share your thoughts, concerns, or questions, and I'll provide
                comfort and guidance based on Islamic teachings, including
                relevant Hadiths and Quranic verses.
              </p>
              <div className="hadith-container mt-10 mx-auto max-w-sm border-l-4 border-comfort-600 bg-comfort-50 rounded-r-lg">
                <div className="pl-4 py-3 pr-3">
                  <p className="hadith-text whitespace-pre-line text-comfort-900">
                    The Prophet (ﷺ) said, "None of you will have faith till he
                    wishes for his (Muslim) brother what he likes for himself."
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="hadith-source text-comfort-600 text-sm">
                      Source: Sahih al-Bukhari 13
                    </span>
                    <a
                      href="https://sunnah.com/bukhari:13"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 rounded-full bg-comfort-600 text-white hover:bg-comfort-700 transition-colors duration-200">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                role={message.role}
                animate={index === messages.length - 1}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="px-5 py-4 rounded-2xl bg-comfort-100">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {hasConversationStarted && (
        <div className="mt-auto pt-4">
          <Separator className="mb-4 bg-comfort-100" />
        </div>
      )}

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatBox;
