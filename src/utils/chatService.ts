// API integration with OpenRouter for the DeepSeek model
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

console.log("API Key:", import.meta.env.VITE_OPENROUTER_API_KEY);
console.log("API URL:", import.meta.env.VITE_API_URL);

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatResponse {
  id: string;
  message: Message;
  error?: string;
}

const systemPrompt = `
You are ComfortBot, an AI assistant that provides comfort and guidance based on Islamic teachings.

Your tasks:
1. Understand the user's emotional state or issue they're facing
2. Provide a brief compassionate response
3. Share a relevant Hadith, Surah, or Dua that addresses their situation
4. If sharing a Hadith:
   - Include the source of the Hadith (e.g., Sahih Bukhari 123, Sahih Muslim 456)
   - ALWAYS provide a direct link to the source on Sunnah.com (e.g., https://sunnah.com/bukhari/10/123)
5. If sharing a Quranic verse:
   - Include the Surah name and verse number (e.g., Surah Al-Baqarah 2:286)
   - ALWAYS provide a direct link to the verse on Quran.com (e.g., https://quran.com/2/286)
   - Also include the page number for reference (e.g., https://quran.com/page/271)
6. Provide a closing thought connecting the teaching to their situation

Format your response in these sections:
- A brief empathetic message (1-2 sentences)
- The relevant Hadith/Surah/Dua in quotation marks
- For Hadith: The source in square brackets with the Sunnah.com link
- For Quran: The Surah name and verse number with the Quran.com link and page number
- A closing thought connecting the teaching to their situation (1-2 sentences)

IMPORTANT RULES:
- ALWAYS format Hadith links correctly so they point to valid Sunnah.com pages
- ALWAYS include a Sunnah.com link when referencing a Hadith
- ALWAYS include both verse and page links when referencing the Quran
- Be compassionate but authentic to Islamic teachings
- Avoid speculative interpretations - stick to clear teachings
- Only provide guidance within the scope of widely accepted Islamic knowledge
- When mentioning the Prophet Muhammad, follow his name with (ﷺ)
- Don't use any markdown, code blocks, or special formatting in your response
- Do not include symbols like \\boxed{} or json{} in your responses
- Do not use curly braces {} in your text
- Keep your formatting plain and simple
`;

export async function sendMessage(userMessage: string): Promise<ChatResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin, // Required by OpenRouter
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-zero:free",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response");
    }

    const data = await response.json();

    return {
      id: data.id,
      message: data.choices[0].message,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      id: "error",
      message: {
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
      },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Utility function to extract and format message parts
export function parseAIResponse(content: string): {
  message: string;
  hadith: string;
  quran: string;
  source: string;
  link: string;
  pageLink: string;
  closing: string;
} {
  // Default values
  let result = {
    message: "",
    hadith: "",
    quran: "",
    source: "",
    link: "",
    pageLink: "",
    closing: "",
  };

  try {
    // Clean up content by removing any markdown artifacts or code syntax
    let cleanContent = content
      .replace(/```[a-z]*\n|```/g, "") // Remove code blocks
      .replace(/\\boxed\{[^}]*\}/g, "") // Remove boxed with content
      .replace(/\\boxed\{\s*\}/g, "") // Remove empty boxed
      .replace(/\\boxed/g, "") // Remove any remaining boxed keyword
      .replace(/json \{.*?\}/g, "") // Remove json objects
      .replace(/\\\\/g, "\\") // Replace double backslashes
      .replace(/\\\{/g, "") // Remove escaped braces
      .replace(/\(/g, "") // Remove any remaining opening parentheses
      .replace(/\)/g, "")
      .trim();

    // Extract hadith or quran verse (text between quotation marks)
    const quoteMatch = cleanContent.match(/"([^"]*)"/);
    if (quoteMatch) {
      // Determine if it's a Hadith or Quran verse based on context
      if (
        cleanContent.toLowerCase().includes("quran") ||
        cleanContent.toLowerCase().includes("surah") ||
        cleanContent.toLowerCase().includes("ayah") ||
        cleanContent.toLowerCase().includes("verse")
      ) {
        result.quran = quoteMatch[1];
      } else {
        result.hadith = quoteMatch[1];
      }
    }

    // Extract source (text in square brackets)
    const sourceMatch = cleanContent.match(/\[(.*?)\]/);
    if (sourceMatch) {
      result.source = sourceMatch[1];
    }

    // Extract Sunnah.com link
    const sunnahLinkMatch = cleanContent.match(
      /(https?:\/\/(?:www\.)?sunnah\.com\/[^\s)]+)/
    );
    if (sunnahLinkMatch) {
      result.link = sunnahLinkMatch[1];
    }

    // Extract Quran.com link for verse
    const quranVerseMatch = cleanContent.match(
      /(https?:\/\/(?:www\.)?quran\.com\/\d+\/\d+[^\s)]*)/
    );
    if (quranVerseMatch) {
      result.link = quranVerseMatch[1];
    }

    // Extract Quran.com page link
    const quranPageMatch = cleanContent.match(
      /(https?:\/\/(?:www\.)?quran\.com\/page\/\d+[^\s)]*)/
    );
    if (quranPageMatch) {
      result.pageLink = quranPageMatch[1];
    }

    // Split content to get message and closing
    const quotedText = result.hadith || result.quran;
    if (quotedText) {
      const parts = cleanContent.split(`"${quotedText}"`);
      if (parts.length > 0) {
        result.message = parts[0].trim();
      }

      // The closing is after all the references
      if (parts.length > 1) {
        const afterQuote = parts[1];
        // Try to find text after the last link
        const lastLink = [result.link, result.pageLink].filter(Boolean).pop();

        if (lastLink && afterQuote.includes(lastLink)) {
          result.closing = afterQuote
            .substring(afterQuote.indexOf(lastLink) + lastLink.length)
            .trim();
        } else if (result.source && afterQuote.includes(result.source)) {
          // If no link found, try to get text after source
          result.closing = afterQuote
            .substring(afterQuote.indexOf(result.source) + result.source.length)
            .trim();
        } else {
          // If no clear markers, just take the last part
          result.closing = afterQuote.trim();
        }
      }
    }

    // If parsing fails or no structured content found, return the full content as the message
    if (!result.message && !result.hadith && !result.quran) {
      result.message = cleanContent;
    }

    return result;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      message: content,
      hadith: "",
      quran: "",
      source: "",
      link: "",
      pageLink: "",
      closing: "",
    };
  }
}
