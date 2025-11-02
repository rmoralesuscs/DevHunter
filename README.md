<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dn8I1T7G7MF68jqzdyj4n6wOCdlzOoRr

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `<!-- File: `index.html` -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>AuraTest AI Dashboard</title>
    <!-- remove CDN tailwind for production; keep only if you want quick dev styling -->
    <!-- Add any head scripts/config here -->
    <!-- Vite injects HMR client automatically; include app entry below -->
  </head>
  <body class="bg-gray-900 text-gray-200">
    <div id="root"></div>

    <!-- Vite HMR client is injected automatically; ensure your app entry is explicit -->
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
