import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { LocationData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyLandmarkFromDrawing = async (base64ImageData: string): Promise<Omit<LocationData, 'imageUrls'>> => {
    const prompt = `
    Analyze this user's sketch of a famous landmark.
    1. Identify the landmark and its location (city, country).
    2. Provide a fun, one-sentence description for the landmark and its coordinates.
    3. Suggest a mini-tour of 3 other interesting, nearby places a tourist could visit. For each place, provide its name, its coordinates (latitude and longitude), and a brief, enticing one-sentence description.
    4. If you can't identify the drawing, make a polite, creative guess but state that you are unsure.
    `;

    const imagePart = {
        inlineData: {
            mimeType: 'image/png',
            data: base64ImageData,
        },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The full name of the identified landmark (e.g., 'Eiffel Tower, Paris')." },
                    description: { type: Type.STRING, description: "A short, fun, one-sentence description of the landmark." },
                    latitude: { type: Type.NUMBER, description: "The latitude of the landmark." },
                    longitude: { type: Type.NUMBER, description: "The longitude of the landmark." },
                    journey: {
                        type: Type.ARRAY,
                        description: "A list of 3 nearby points of interest for a mini-tour.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the nearby place." },
                                description: { type: Type.STRING, description: "A one-sentence description of the nearby place." },
                                latitude: { type: Type.NUMBER, description: "The latitude of the nearby place." },
                                longitude: { type: Type.NUMBER, description: "The longitude of the nearby place." }
                            },
                             required: ["name", "description", "latitude", "longitude"]
                        }
                    },
                },
                required: ["name", "description", "latitude", "longitude", "journey"],
            },
        },
    });

    const jsonString = response.text;
    if (!jsonString) {
        throw new Error("API returned an empty response.");
    }
    
    return JSON.parse(jsonString) as Omit<LocationData, 'imageUrls'>;
};


export const generateLandmarkImage = async (base64ImageData: string, landmarkName: string): Promise<string | null> => {
    try {
        const prompt = `Generate a beautiful 3D isometric illustration of ${landmarkName}. The style should be clean, vibrant, and suitable for a travel app. Use the provided user's sketch as a style reference for the composition, but create a high-quality, detailed isometric artwork.`;
        
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: 'image/png',
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, { text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }

        return null;
    } catch (error) {
        console.error("Error generating landmark image:", error);
        return null;
    }
};

export const generateImageForLocation = async (locationName: string): Promise<string | null> => {
    try {
        const prompt = `Generate a beautiful, vibrant 3D isometric illustration of ${locationName}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error generating image for ${locationName}:`, error);
        return null;
    }
};

export const generateExplanation = async (sectionName: string): Promise<string> => {
    try {
        const prompt = `Generate a short, friendly, one-sentence explanation for the "${sectionName}" section of a creative travel discovery app. The tone should be encouraging and helpful.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating explanation for ${sectionName}:`, error);
        return `Learn more about the ${sectionName} here.`; // Fallback text
    }
};