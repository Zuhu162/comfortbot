
import React, { useEffect, useRef, useState } from "react";
import { parseAIResponse } from "@/utils/chatService";
import { cn } from "@/lib/utils";
import { BookOpen, BookText } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  animate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, animate = true }) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      setVisible(true);
    }
  }, [animate]);

  useEffect(() => {
    if (messageRef.current && visible) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visible, content]);

  // Helper function to format text
  const formatText = (text: string): string => {
    return text
      .replace(/\\n\\n/g, "\n\n") // Replace escaped newlines with actual newlines
      .replace(/\\n/g, "\n") // Replace single escaped newlines
      .replace(/\\boxed\{[^}]*\}/g, "") // Remove boxed json syntax with content
      .replace(/\\boxed\{\s*\}/g, "") // Remove empty boxed json syntax
      .replace(/\\boxed/g, "") // Remove any remaining boxed keyword
      .replace(/\{To /g, "To ") // Remove opening braces from common phrases
      .replace(/\\\{/g, "") // Remove escaped opening braces
      .replace(/\\\}/g, "") // Remove escaped closing braces
      .replace(/\{/g, "") // Remove any remaining opening braces
      .replace(/\}/g, "") // Remove any remaining closing braces
      .replace(/json \{/g, "") // Remove json syntax
      .replace(/\\\\/g, "\\") // Replace double backslashes with single
      .replace(/\(ﷺ\)/g, " (ﷺ)") // Add space before Prophet's name symbol if needed
      .trim();
  };

  if (role === "user") {
    return (
      <div
        ref={messageRef}
        className={cn(
          "flex justify-end mb-4 transition-all duration-300 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <div className="max-w-3/4 px-5 py-3 rounded-2xl bg-comfort-700 text-white shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  // Parse and format the AI response
  const formattedContent = formatText(content);
  const { message, hadith, quran, source, link, pageLink, closing } = parseAIResponse(formattedContent);

  return (
    <div
      ref={messageRef}
      className={cn(
        "flex justify-start mb-6 transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <div className="max-w-4/5 space-y-4">
        {message && (
          <div className="px-5 py-3 rounded-2xl bg-comfort-100 text-comfort-900 shadow-sm whitespace-pre-line">
            {message}
          </div>
        )}

        {hadith && (
          <div className="hadith-container mx-2 border-l-4 border-comfort-600 bg-comfort-50 rounded-r-lg">
            <div className="pl-4 py-3 pr-3">
              <div className="flex items-center gap-2 mb-2 text-comfort-700">
                <BookText size={18} />
                <span className="text-sm font-semibold">Hadith</span>
              </div>
              <p className="hadith-text whitespace-pre-line text-comfort-900">{hadith}</p>
              
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {source && <span className="hadith-source text-comfort-600 text-sm">Source: {source}</span>}
                
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-full bg-comfort-600 text-white hover:bg-comfort-700 transition-colors duration-200 flex items-center gap-1"
                  >
                    Read More
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {quran && (
          <div className="quran-container mx-2 border-l-4 border-comfort-500 bg-comfort-50/70 rounded-r-lg">
            <div className="pl-4 py-3 pr-3">
              <div className="flex items-center gap-2 mb-2 text-comfort-600">
                <BookOpen size={18} />
                <span className="text-sm font-semibold">Quran</span>
              </div>
              <p className="quran-text whitespace-pre-line text-comfort-900 italic">{quran}</p>
              
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {source && <span className="quran-source text-comfort-600 text-sm">{source}</span>}
                
                <div className="flex flex-wrap gap-2">
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 rounded-full bg-comfort-500 text-white hover:bg-comfort-600 transition-colors duration-200"
                    >
                      View Verse
                    </a>
                  )}
                  
                  {pageLink && (
                    <a
                      href={pageLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1 rounded-full bg-comfort-400 text-comfort-900 hover:bg-comfort-500 hover:text-white transition-colors duration-200"
                    >
                      View Page
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {closing && (
          <div className="px-5 py-3 rounded-2xl bg-comfort-100 text-comfort-900 shadow-sm whitespace-pre-line">
            {closing}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
