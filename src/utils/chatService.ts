// API integration with OpenRouter for the DeepSeek model
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

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
1. Understand the user's emotional state or issue they're facing.
2. Provide a brief compassionate response.
3. Share a relevant Hadith, Quranic verse, or Dua that addresses their situation.
4. If sharing a Hadith:
   - Include the source of the Hadith (e.g., Sahih Bukhari 123, Sahih Muslim 456).
   - ALWAYS provide a direct link to the source on Sunnah.com (e.g., https://sunnah.com/bukhari/10/123).
5. If sharing a Quranic verse:
   - Include the Surah name and verse number (e.g., Surah Al-Baqarah 2:286).
   - ALWAYS provide a direct link to the verse on Quran.com (e.g., https://quran.com/2/286).
   - ALWAYS include the page number for reference (e.g., https://quran.com/page/271).
6. Provide a closing thought connecting the teaching to their situation.

Format your response in these sections:
- A brief empathetic message (3-4 sentences).
- The relevant Hadith/Surah/Dua in quotation marks.
- For Hadith: The source in plain text with the Sunnah.com link.
- For Quran: The Surah name and verse number with the Quran.com link and page number.
- A closing thought connecting the teaching to their situation (3-4 sentences).

IMPORTANT RULES:
- ALWAYS format Hadith links correctly so they point to valid Sunnah.com pages.
- ALWAYS include a Sunnah.com link when referencing a Hadith.
- ALWAYS include a Quran.com link when referencing a Quranic verse.
- ALWAYS include both verse and page links when referencing the Quran.
- Be compassionate but authentic to Islamic teachings.
- Avoid speculative interpretations - stick to clear teachings.
- Only provide guidance within the scope of widely accepted Islamic knowledge.
- When mentioning the Prophet Muhammad, follow his name with (ﷺ).
- Do not use any markdown, code blocks, or special formatting in your response.
- Do not include symbols like \\boxed{} or json{} in your responses.
- Do not use curly braces {} in your text.
- Do not use square brackets [] in your text.
- Do not use parentheses () in your text.
- Keep your formatting plain and simple.
- ALWAYS ensure Quranic verses are linked to Quran.com and Hadith are linked to Sunnah.com.
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
      .replace(/\\\}/g, "") // Remove escaped braces
      .replace(/\{/g, "") // Remove any remaining braces
      .replace(/\}/g, "") // Remove any remaining braces
      .replace(/\([^)]*\)/g, "") // Remove content within parentheses
      .replace(/\(/g, "") // Remove any remaining opening parentheses
      .replace(/\)/g, "") // Remove any remaining closing parentheses
      .replace(/\[[^\]]*\]/g, "") // Remove content within square brackets
      .replace(/\[/g, "") // Remove any remaining opening square brackets
      .replace(/\]/g, "") // Remove any remaining closing square brackets
      .trim();

    // Extract the empathetic message (before the first Hadith or Quran reference)
    const messageMatch = cleanContent.match(
      /^(.*?)(?=The Prophet Muhammad said:|Additionally, a relevant Quranic verse)/s
    );
    if (messageMatch) {
      result.message = messageMatch[0].trim();
    }

    // Extract Hadith
    const hadithMatch = cleanContent.match(
      /The Prophet Muhammad said: '(.*?)'/s
    );
    if (hadithMatch) {
      result.hadith = hadithMatch[1].trim();
    }

    // Extract Hadith source and link
    const hadithSourceMatch = cleanContent.match(
      /This Hadith is found in (.*?)\. You can read it here: (https:\/\/sunnah\.com\/[^\s]+)/s
    );
    if (hadithSourceMatch) {
      result.source = hadithSourceMatch[1].trim();
      result.link = hadithSourceMatch[2].trim();
    }

    // Extract Quranic verse
    const quranMatch = cleanContent.match(
      /Additionally, a relevant Quranic verse.*?'(.*?)'/s
    );
    if (quranMatch) {
      result.quran = quranMatch[1].trim();
    }

    // Extract Quranic verse source and links
    const quranSourceMatch = cleanContent.match(
      /You can read this verse here: (https:\/\/quran\.com\/[^\s]+).*?The page number for this verse is on page (\d+)/s
    );
    if (quranSourceMatch) {
      result.link = quranSourceMatch[1].trim();
      result.pageLink = `https://quran.com/page/${quranSourceMatch[2].trim()}`;
      result.source =
        cleanContent.match(/This verse is found in (.*?)\./s)?.[1]?.trim() ||
        "";
    }

    // Extract closing thought
    const closingMatch = cleanContent.match(/In closing, (.*)/s);
    if (closingMatch) {
      result.closing = closingMatch[1].trim();
    }

    // If no structured content is found, return the full content as the message
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
