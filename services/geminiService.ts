import { GoogleGenAI, Type } from "@google/genai";
import type { RouteData, TransportMode } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const pointSchema = {
    type: Type.OBJECT,
    properties: {
        lat: { type: Type.NUMBER, description: "Latitude" },
        lng: { type: Type.NUMBER, description: "Longitude" }
    },
    required: ["lat", "lng"]
};

const routeSchema = {
    type: Type.OBJECT,
    properties: {
        overview: { type: Type.STRING, description: "A brief summary of the route including total distance and estimated time." },
        path: {
            type: Type.ARRAY,
            description: "An array of {lat, lng} coordinates representing the route path.",
            items: pointSchema
        },
        steps: {
            type: Type.ARRAY,
            description: "Turn-by-turn instructions for the route.",
            items: {
                type: Type.OBJECT,
                properties: {
                    instruction: { type: Type.STRING },
                    distance: { type: Type.STRING }
                },
                required: ["instruction", "distance"]
            }
        },
        safetyPoints: {
            type: Type.ARRAY,
            description: "Points of interest related to safety along the route, including contextual data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    location: pointSchema,
                    type: { type: Type.STRING, enum: ["police_presence", "well_lit", "low_crime_zone"] },
                    description: { type: Type.STRING },
                    historicalTrend: { type: Type.STRING, enum: ["Improving", "Stable", "Declining"], description: "The safety trend for this location." },
                    userReports: { type: Type.INTEGER, description: "Number of recent user-reported incidents." }
                },
                required: ["location", "type", "description"]
            }
        },
        roadIssues: {
            type: Type.ARRAY,
            description: "Points of interest related to road damage.",
            items: {
                type: Type.OBJECT,
                properties: {
                    location: pointSchema,
                    type: { type: Type.STRING, enum: ["pothole", "damaged_road"] },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                },
                required: ["location", "type", "description", "severity"]
            }
        },
        bounds: {
            type: Type.OBJECT,
            description: "The bounding box for the entire route, covering the most south-west and north-east points.",
            properties: {
                southWest: pointSchema,
                northEast: pointSchema
            },
            required: ["southWest", "northEast"]
        }
    },
    required: ["overview", "path", "steps", "safetyPoints", "roadIssues", "bounds"]
};


export const fetchSafeRoute = async (start: string, end: string, mode: TransportMode): Promise<RouteData> => {
    const systemInstruction = `You are an expert route planning AI for India, with a specialization in user safety and road conditions. Your task is to generate a route plan in a structured JSON format. The route should prioritize safety by preferring streets with known police presence, good lighting, and lower crime rates. You must also identify and report road quality issues like potholes. For each safety point, you MUST provide additional context, such as historical safety trends ('Improving', 'Stable', 'Declining') and a simulated number of recent user-reported incidents. All coordinates for the route path and points of interest must be real-world WGS84 latitude and longitude coordinates. You must also calculate a bounding box that encompasses the entire route.`;

    const prompt = `Generate the safest route from "${start}" to "${end}" in India for a user who is ${mode}. The user's top priority is safety. Provide a detailed route including safety points with historical context and road condition issues. The entire output must be a single JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: routeSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as RouteData;
        return parsedData;

    } catch (error) {
        console.error("Error fetching or parsing route data from Gemini:", error);
        throw new Error("Failed to generate route from AI model.");
    }
};