import { GoogleGenAI, Type } from "@google/genai";
import dotenv, { parse } from "dotenv";

dotenv.config();

const key = process.env.APIKEY;
const ai = new GoogleGenAI({
  apiKey: key,
});

const get_num_tokens = async (meetingNotes) => {
  try {
    const num_tokens = await ai.models.countTokens({
      model: "gemini-2.0-flash",
      contents: `Parse these meeting notes and extract key information: 
    Meeting Notes:
    ${meetingNotes}
    incase any property of actionItems is missing return NULL`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
            },
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: {
                    type: Type.STRING,
                  },
                  owner: {
                    type: Type.STRING,
                  },
                  due: {
                    type: Type.STRING,
                  },
                },
                propertyOrdering: ["task", "owner", "due"],
              },
            },
          },
          propertyOrdering: ["summary", "decisions", "actionItems"],
        },
      },
    });
    return num_tokens;
  } catch (e) {
    throw new Error("Failed to count tokens");
  }
};

async function parseMeetingNotes(meetingNotes) {
  try {
    const num_tokens = await get_num_tokens(meetingNotes);

    if (num_tokens.totalTokens > 1000000) {
      throw new Error(
        `Token limit exceeded: ${num_tokens.totalTokens} tokens. Maximum allowed is 1,000,000.`
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Parse these meeting notes and extract key information: 
    Meeting Notes:
    ${meetingNotes}
    incase any property of actionItems is missing return NULL, add the key decisions in decision property`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
            },
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: {
                    type: Type.STRING,
                  },
                  owner: {
                    type: Type.STRING,
                  },
                  due: {
                    type: Type.STRING,
                  },
                },
                propertyOrdering: ["task", "owner", "due"],
              },
            },
          },
          propertyOrdering: ["summary", "decisions", "actionItems"],
        },
      },
    });

    return response.text;
  } catch (error) {
    if (error.status) {
      switch (error.status) {
        case 400:
          throw new Error(
            `Bad Request: ${error.message || "Invalid request parameters"}`
          );
        case 429:
          throw new Error("Rate limit exceeded. Please try again later.");
        case 499:
          throw new Error("Request was cancelled by client");
        case 500:
          throw new Error(
            "Internal server error. Please retry after a few seconds."
          );
        case 503:
          throw new Error("Network error. Please retry after a few seconds.");
        case 504:
          throw new Error("Request timeout. Consider increasing the deadline.");
        default:
          throw new Error(`API Error (${error.status}): ${error.message}`);
      }
    }

    if (
      error.message.includes("Token limit exceeded") ||
      error.message.includes("Failed to count tokens")
    ) {
      throw error;
    }
    throw error;
  }
}

export default parseMeetingNotes;
