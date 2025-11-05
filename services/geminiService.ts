
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, type BaseContent, ContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPlatformGuidelines = (platforms: Platform[]): string => {
  const guidelines = {
    [Platform.Facebook]: "- Facebook: Casual, engaging, and friendly tone. Can be slightly longer. Ask a question to encourage comments.",
    [Platform.Instagram]: "- Instagram: A visually-driven caption for an image or video. Use relevant emojis and a block of 5-7 popular hashtags.",
    [Platform.LinkedIn]: "- LinkedIn: Professional, business-oriented tone. Use 2-3 relevant hashtags. Keep it concise and impactful.",
    [Platform.TikTok]: "- TikTok: A short, punchy, and trendy caption. Include 3-5 trending hashtags relevant to the content.",
    [Platform.YouTube]: "- YouTube: Create a catchy video title and a descriptive video description. Format the output STRICTLY as 'Title: [Your Title]\\nDescription: [Your Description]'. The title should be under 70 characters.",
    [Platform.Snapchat]: "- Snapchat: A very short, informal, and fun caption, like a text to a friend. Maximum 1-2 sentences.",
    [Platform.X]: "- X: A concise post, under 280 characters. Use 1-2 relevant hashtags. Can be conversational or a direct statement.",
    [Platform.Pinterest]: "- Pinterest: A descriptive pin title and description. Focus on keywords people would search for. Title should be catchy. Format the output as 'Title: [Your Title]\\nDescription: [Your Description]'.",
    [Platform.Threads]: "- Threads: A conversational and engaging post. Can be longer than on X. Use a friendly tone and ask questions to start a dialogue.",
    [Platform.Bluesky]: "- Bluesky: A concise and conversational post, under 300 characters. Use 1-2 relevant hashtags. The tone is often more relaxed and community-focused.",
  };

  return platforms.map(p => guidelines[p]).join('\n');
};

const getPromptPrefix = (contentType: ContentType, hasMedia: boolean): string => {
    switch (contentType) {
        case ContentType.Image:
            return hasMedia
                ? 'You are an expert social media manager. Based on the provided image and its description, write engaging posts.'
                : 'You are an expert social media manager. Your task is to write engaging posts for an image. The image is described as follows:';
        case ContentType.Video:
            return hasMedia
                ? 'You are an expert social media manager. Based on the provided video and its description, write engaging titles and descriptions.'
                : 'You are an expert social media manager. Your task is to write engaging titles and descriptions for a video. The video is described as follows:';
        case ContentType.Text:
        default:
            return 'You are an expert social media manager. Your task is to adapt a single piece of content for various social media platforms, optimizing it for each platform\'s audience, tone, and format. Base content to adapt:';
    }
};

export const generateSocialPosts = async (baseContent: BaseContent, platforms: Platform[], contentType: ContentType): Promise<any> => {
  if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
  if (platforms.length === 0) return {};

  const platformGuidelines = getPlatformGuidelines(platforms);
  const hasMedia = !!(baseContent.assetData && baseContent.assetMimeType);
  const promptPrefix = getPromptPrefix(contentType, hasMedia);

  const textPart = { text: `
    ${promptPrefix} "${baseContent.description}"

    Generate posts for the following platforms: ${platforms.join(', ')}.

    Please adhere to these platform-specific guidelines:
    ${platformGuidelines}

    Return the response ONLY as a JSON object that follows the provided schema. The keys must be the platform names from the list above.
  `};
  
  let contents;

  if (hasMedia) {
    const mediaPart = {
      inlineData: {
        mimeType: baseContent.assetMimeType!,
        data: baseContent.assetData!,
      },
    };
    contents = { parts: [mediaPart, textPart] };
  } else {
    contents = { parts: [textPart] };
  }

  const responseSchemaProperties = platforms.reduce((acc, platform) => {
    acc[platform] = { type: Type.STRING };
    return acc;
  }, {} as Record<string, { type: Type.STRING }>);

  const schema = { type: Type.OBJECT, properties: responseSchemaProperties };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    throw new Error("Failed to generate content. Please check the console for details.");
  }
};

export const generatePostIdeas = async (topic: string): Promise<string[]> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    if (!topic.trim()) return [];

    const prompt = `You are a creative social media strategist. Generate 5 distinct and engaging post ideas for the topic: "${topic}". For each idea, provide a short, compelling angle or hook. Return the response as a JSON array of strings.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                temperature: 0.8,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating ideas from Gemini:", error);
        throw new Error("Failed to generate ideas. Please check the console for details.");
    }
};

export const generateHashtags = async (postContent: string, platform: Platform): Promise<string[]> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    if (!postContent.trim()) return [];

    const prompt = `Given the following social media post for ${platform}, suggest a list of 5-7 relevant and trending hashtags. Post: "${postContent}". Return the response as a JSON array of hashtag strings (e.g., ["#digitalmarketing", "#seo"]).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                temperature: 0.5,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating hashtags from Gemini:", error);
        throw new Error("Failed to generate hashtags. Please check the console for details.");
    }
};
