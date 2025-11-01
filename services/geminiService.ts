import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { TestSpec, GeneratedTest } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is available.
  console.warn("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Recommends an execution mode (headless vs. headful).
 */
export const getExecutionModeSuggestion = async (testDescription: string): Promise<string> => {
  try {
    const prompt = `Based on the following test description, recommend "headless" or "headful" execution mode. Headless is faster and better for CI. Headful is necessary for tests involving complex user interactions like drag-and-drop, canvas drawing, or visual-only validation. Provide a one-sentence justification.

Test Description: "${testDescription}"

Recommendation (return only "headless" or "headful"):`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const justificationPrompt = `Based on the following test description, provide a one-sentence justification for why you recommended the execution mode.

Test Description: "${testDescription}"

Justification:`;

    const justificationResponse: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: justificationPrompt,
    });

    const mode = response.text.trim().toLowerCase();
    const justification = justificationResponse.text.trim();

    if (mode.includes('headless') || mode.includes('headful')) {
      return `**Recommendation:** ${mode.includes('headless') ? 'Headless' : 'Headful'}. \n**Justification:** ${justification}`;
    }
    return "Could not determine a recommendation. Please provide more detail.";

  } catch (error) {
    console.error("Error getting execution mode suggestion:", error);
    return "An error occurred while getting the suggestion.";
  }
};

/**
 * Analyzes a UI screenshot and provides a summary.
 */
export const getMediaSummary = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const prompt = "Analyze this UI screenshot from a test run. Describe what the UI is showing and identify any potential issues like error messages, broken layouts, or anomalies. Provide the summary as a short, bulleted list.";
    
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] }
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error getting media summary:", error);
    return "An error occurred while analyzing the image.";
  }
};


/**
 * Generates a CI/CD configuration file.
 */
export const getCiCdConfig = async (
  testName: string,
  platform: string,
  browser: string,
  mode: string
): Promise<string> => {
  try {
    const prompt = `Generate a simple CI/CD pipeline configuration for a test run.

Test Name: "${testName}"
Platform: ${platform}
Browser: ${browser}
Execution Mode: ${mode}

Generate a GitHub Actions YAML file and a Jenkinsfile (declarative pipeline) for this configuration.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            github_actions: {
              type: Type.STRING,
              description: "The full YAML content for a GitHub Actions workflow file."
            },
            jenkinsfile: {
              type: Type.STRING,
              description: "The full Groovy content for a declarative Jenkinsfile."
            }
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    return `### GitHub Actions (.github/workflows/test.yml)\n\n\`\`\`yaml\n${parsed.github_actions}\n\`\`\`\n\n### Jenkinsfile\n\n\`\`\`groovy\n${parsed.jenkinsfile}\n\`\`\``;

  } catch (error) {
    console.error("Error generating CI/CD config:", error);
    return "An error occurred while generating the configuration.";
  }
};

/**
 * Generates a structured test from a natural language description.
 */
export const generateTestFromNaturalLanguage = async (description: string): Promise<GeneratedTest> => {
    const prompt = `
    You are an expert Playwright test generator. Your task is to convert a user's natural language description into a structured, executable test specification.

    User Input: "${description}"

    Follow these rules:
    1.  Generate a concise, descriptive 'testName' (e.g., "Google Search for 'Debra Molinski'").
    2.  Create 'humanReadableSteps' as an array of strings. Each string should be a simple, clear description of a single user action (e.g., "Navigate to https://www.google.com").
    3.  Create a 'testSpec' object with an array of 'steps'. Each step must be a JSON object with an 'action' and its required parameters.
    4.  Use efficient and resilient locators. Prefer role, text, or stable attributes over brittle XPaths.
    5.  Supported actions are: 'navigate', 'type', 'click', 'press', 'assertText'.
    6.  For "search for X", the steps should be typing into a search field and then pressing 'Enter'.
    7.  Do not use any actions not listed.
    
    Example Input: "go to google.com, search for 'Playwright', and check that the first result is 'Fast and reliable end-to-end testing for modern web apps | Playwright'"
    Example Output (JSON):
    {
        "testName": "Google Search for Playwright",
        "humanReadableSteps": [
            "Navigate to https://www.google.com",
            "Type 'Playwright' into the search box",
            "Press the Enter key",
            "Verify the first result text contains 'Fast and reliable end-to-end testing for modern web apps | Playwright'"
        ],
        "testSpec": {
            "steps": [
                { "action": "navigate", "url": "https://www.google.com" },
                { "action": "type", "locator": "[name='q']", "text": "Playwright" },
                { "action": "press", "locator": "[name='q']", "key": "Enter" },
                { "action": "assertText", "locator": "h3 >> nth=0", "expected": "Fast and reliable end-to-end testing for modern web apps | Playwright" }
            ],
            "browser": "chrome",
            "timeoutMs": 10000,
            "autoWait": true
        }
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    testName: { type: Type.STRING },
                    humanReadableSteps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    testSpec: {
                        type: Type.OBJECT,
                        properties: {
                            steps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        action: { type: Type.STRING },
                                        url: { type: Type.STRING, nullable: true },
                                        locator: { type: Type.STRING, nullable: true },
                                        text: { type: Type.STRING, nullable: true },
                                        key: { type: Type.STRING, nullable: true },
                                        expected: { type: Type.STRING, nullable: true }
                                    },
                                    required: ['action']
                                }
                            },
                            browser: { type: Type.STRING },
                            timeoutMs: { type: Type.INTEGER },
                            autoWait: { type: Type.BOOLEAN }
                        },
                        required: ['steps', 'browser', 'timeoutMs', 'autoWait']
                    }
                },
                required: ['testName', 'humanReadableSteps', 'testSpec']
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};
