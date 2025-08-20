# Marp Editor

A web-based editor for creating Marp presentations. This editor provides a user-friendly interface for managing slides, applying templates, and editing markdown content with a live preview.

## Running Locally

**Prerequisites:** [Node.js](https://nodejs.org/) must be installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the application and make it accessible in your browser, typically at `http://localhost:5173`.