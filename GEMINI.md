
# Project Overview

This project is a web-based editor for creating Marp presentations. It provides a user-friendly interface for managing slides, applying templates, and editing markdown content with a live preview. The editor is built with React and Vite, and it uses the `marked` library to render markdown and `dompurify` to sanitize the HTML.

The application is structured as a single-page application with a main component, `MarpEditor`, which manages the state of the presentation. The editor supports features like adding, deleting, and reordering slides, as well as customizing the presentation's aspect ratio, font size, and line spacing. It also includes a feature to export the presentation as a Marp markdown file.

# Building and Running

To build and run this project locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following line:
    ```
    GEMINI_API_KEY=your_api_key
    ```
    Replace `your_api_key` with your actual Gemini API key.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server and open the application in your default browser.

4.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the production-ready files.

5.  **Preview the production build:**
    ```bash
    npm run preview
    ```
    This will serve the production build locally for testing.

# Development Conventions

*   **Component-based architecture:** The application is built using React components, with the main logic encapsulated in the `MarpEditor` component in `index.jsx`.
*   **Styling:** The project uses inline styles and CSS classes for styling.
*   **State management:** The component's state is managed using React hooks (`useState`, `useMemo`, `useRef`, `useLayoutEffect`, `useCallback`).
*   **Dependencies:** The project uses `react`, `react-dom`, `lucide-react`, `marked`, and `dompurify`. Development dependencies include `vite`, `typescript`, and `@types/node`.
*   **Build tool:** The project uses Vite for building and development. The configuration is in `vite.config.ts`.
*   **Code style:** The code follows standard JavaScript and React conventions.
