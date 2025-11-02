// Moved to lazy dynamic import to avoid runtime errors in the browser when @google/genai
// is not available or when an API key isn't provided via environment.
import type { GenerateContentResponse } from "@google/genai";
import type { TestSpec, GeneratedTest } from '../types';

const getClient = async () => {
  // Prefer dynamic import to avoid bundling node-only libs into the browser bundle.
  try {
    // Safely resolve an API key from common env locations. Use try/catch because
    // referencing `import.meta` may throw in some non-bundler environments at runtime.
    let apiKey: string | undefined = undefined;

    // 1) Browser-local storage: prompt the user if needed
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('GEMINI_API_KEY');
        if (stored && stored.trim()) {
          apiKey = stored.trim();
        } else {
          // Prompt the user for the key (developer requested behavior)
          const input = window.prompt('Enter Gemini API key (leave blank to disable AI features):', '');
          if (input && input.trim()) {
            window.localStorage.setItem('GEMINI_API_KEY', input.trim());
            apiKey = input.trim();
          }
        }
      }
    } catch (e) {
      // ignore storage/prompt errors
    }

    // 2) Server-side environment (process.env)
    try {
      if (!apiKey && typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) {
        apiKey = (process as any).env.GEMINI_API_KEY;
      }
    } catch (e) {
      // ignore
    }

    // 3) Bundler-provided env (e.g. Vite import.meta.env)
    try {
      if (!apiKey) {
        apiKey = (import.meta as any)?.env?.GEMINI_API_KEY;
      }
    } catch (e) {
      // ignore
    }

    if (!apiKey) return null;
    const mod = await import('@google/genai');
    const GoogleGenAI = mod.GoogleGenAI;
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini client not available:', err);
    return null;
  }
};

/**
 * Recommends an execution mode (headless vs. headful).
 */
export const getExecutionModeSuggestion = async (testDescription: string): Promise<string> => {
  try {
    const ai = await getClient();
    if (!ai) return 'AI features not available in this runtime. Please set GEMINI_API_KEY on the server or run in a Node environment.';

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

    const mode = (response as any).text?.trim?.().toLowerCase?.() || '';
    const justification = (justificationResponse as any).text?.trim?.() || '';

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
    const ai = await getClient();
    if (!ai) return 'AI features not available in this runtime. Please set GEMINI_API_KEY on the server or run in a Node environment.';

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

    return (response as any).text?.trim?.() || '';

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
    const ai = await getClient();
    if (!ai) return 'AI features not available in this runtime. Please set GEMINI_API_KEY on the server or run in a Node environment.';

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
          type: (ai as any).Type?.OBJECT || 'object',
        }
      }
    });

    const jsonText = (response as any).text?.trim?.() || '';
    let parsed = {} as any;
    try { parsed = JSON.parse(jsonText); } catch (e) { parsed = { github_actions: jsonText, jenkinsfile: '' }; }

    return `### GitHub Actions (.github/workflows/test.yml)\n\n\`\`\`yaml\n${parsed.github_actions || ''}\n\`\`\`\n\n### Jenkinsfile\n\n\`\`\`groovy\n${parsed.jenkinsfile || ''}\n\`\`\``;

  } catch (error) {
    console.error("Error generating CI/CD config:", error);
    return "An error occurred while generating the configuration.";
  }
};

/**
 * Generates a structured test from a natural language description.
 */
export const generateTestFromNaturalLanguage = async (description: string) => {
    try {
        const ai = await getClient();
        if (!ai) return { testName: 'Unavailable', humanReadableSteps: ['AI unavailable in this runtime.'], testSpec: { steps: [], browser: 'chrome', timeoutMs: 10000, autoWait: true } };

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
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = (response as any).text?.trim?.() || '{}';
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating test:', error);
        return { testName: 'Error', humanReadableSteps: ['An error occurred while generating the test.'], testSpec: { steps: [], browser: 'chrome', timeoutMs: 10000, autoWait: true } };
    }
};
