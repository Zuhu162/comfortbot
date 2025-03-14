import React from "react";
import ChatBox from "@/components/ChatBox";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-comfort-50 to-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="mt-4 text-xs text-comfort-500 text-center mb-4">
        <p></p>
      </div>
      <div className="w-full max-w-4xl h-[85vh] glass-morph rounded-2xl p-6 sm:p-8 shadow-lg border border-comfort-100">
        <ChatBox />
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-comfort-500 text-center">
        <p>ComfortBot respects your privacy. No conversations are stored.</p>
        <p>
          ComfortBot utilizes the DeepSeek R1 API model to generate responses
          based on your input. However, it is not a substitute for consulting a
          qualified Islamic scholar for religious guidance or rulings.
        </p>
      </div>
    </div>
  );
};

export default Index;
