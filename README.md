I'll edit the README to include information about the screenshots and add a setup guide for OpenRouter API keys. Here's the updated version:

# ComfortBot: Islamic Guidance & Comfort

ComfortBot is an AI-powered chat application that provides comfort, guidance, and wisdom based on Islamic teachings. The application responds to users' emotional needs and concerns by sharing relevant Hadiths, Quranic verses, and spiritual advice.

## Screenshots

![ComfortBot Main Interface](public/ss1.png)
_ComfortBot's main chat interface showing conversation with Islamic guidance_

![ComfortBot Mobile View](public/ss2.png)
_Responsive mobile view of ComfortBot with example conversation_

![ComfortBot Hadith Reference](public/ss3.png)
_Example of ComfortBot providing a Hadith with proper citation and reference_

## Features

- Conversational UI for expressing concerns and seeking guidance
- AI responses with relevant Islamic teachings
- Properly formatted Hadiths with sources and references
- Links to original sources for further reading
- Clean, responsive design for all devices

## Technical Implementation

The application is built using:

- React & TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- OpenRouter API with DeepSeek model for AI responses

## Setup Guide

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Set up your OpenRouter API key:
   - Visit https://openrouter.ai/ and create an account
   - Generate a new API key from your dashboard
   - Create a `.env` file in the root directory with:
     ```
     OPENROUTER_API_KEY=your_api_key_here
     NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
     ```
4. Start the development server
   ```
   npm run dev
   ```

## Usage Guide

1. Open the application in your browser
2. Type your concern, question, or emotional state in the chat input
3. Receive a compassionate response with relevant Islamic guidance
4. Click on "Read More" links to access the original sources
5. Start a new conversation when needed

## Example Prompts for ComfortBot

- "I'm feeling anxious about my future"
- "How can I deal with the loss of a loved one?"
- "I'm struggling with my faith"
- "Feeling angry about the political situation in my country"
- "How can I improve my relationship with my parents?"
- "I need guidance on how to be more patient"
- "How can I overcome negative thoughts?"
- "What does Islam teach about gratitude?"

## Development Notes

### System Prompt

The AI is guided by a carefully crafted system prompt that instructs it to:

```
1. Understand the user's emotional state or issue they're facing
2. Provide a brief compassionate response
3. Share a relevant Hadith, Surah, or Dua that addresses their situation
4. Include the source of the Hadith (e.g., Sahih Bukhari, Sahih Muslim)
5. Provide a direct link to the source on Sunnah.com
```

### Challenges Faced

1. **Response Formatting Issues**:

   - The AI model occasionally included syntax artifacts like escaped braces (`\{`, `\}`) and formatting commands (`\boxed{}`) in its responses
   - Solution: Enhanced text cleaning in both the ChatMessage component and parseAIResponse utility function

2. **Parsing Complex Responses**:

   - Extracting the different parts of the response (message, hadith, source, link, closing) required careful regex pattern matching
   - Solution: Improved the pattern matching logic and added additional cleanup steps

3. **Layout and Presentation**:

   - Designing a clear separation between user messages, AI messages, and quoted hadiths
   - Solution: Custom styling with distinct visual elements for each component (bubbles, borders, colors)

4. **Responsive Design**:

   - Ensuring readability on all device sizes
   - Solution: Tailwind CSS responsive classes and careful component sizing

5. **API Integration**:
   - Managing API response errors and loading states
   - Solution: Comprehensive error handling and loading indicators

## Future Enhancements

- Audio recitation of Hadiths and Quranic verses
- Support for multiple languages
- User authentication to save conversation history
- Topic categorization for spiritual guidance
- Expanded reference database including additional authentic sources

## License

This project is open source and available under the MIT License.
