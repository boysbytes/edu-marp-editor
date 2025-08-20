# Marp Editor

A web-based editor for creating Marp presentations with a user-friendly interface. Built with React and TypeScript, it provides tools for managing slides, applying templates, and editing markdown content with real-time preview.

## Features

- Rich markdown editor with live preview
- Multiple slide templates (Cover, Title + Paragraph, 2-Column, 3-Column)
- Customizable aspect ratios (16:9, 4:3, 16:10)
- Adjustable font size and line spacing
- Responsive design for desktop and mobile
- Real-time preview with zoom controls
- Slide management with drag-and-drop reordering
- Export presentations as Marp markdown files
- Resizable sidebar and editor panels
- HTML sanitization for security

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/boysbytes/edu-marp-editor.git
   cd edu-marp-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage

### Creating a Presentation

1. Add slides using the sidebar with different templates
2. Edit content in markdown format in the editor panel
3. Preview changes in real-time in the preview panel
4. Customize settings like aspect ratio and font size
5. Export as a Marp markdown file

### Available Templates

- Cover Slide: Title page with presentation metadata
- Title + Paragraph: Standard content slide
- 2-Column Layout: Split content for comparisons
- 3-Column Layout: Three-column content organization

### Controls

- Drag and drop slides in the sidebar to reorder them
- Resize sidebar and editor panels as needed
- Use zoom controls in the preview panel

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure

```
├── index.html          # Main HTML file
├── index.jsx           # Main React component
├── index.css           # Global styles
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
├── metadata.json       # App metadata
└── README.md           # This file
```

### Technology Stack

- Frontend Framework: React 19.1.1
- Build Tool: Vite 6.2.0
- Language: TypeScript/JavaScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Markdown Processing: Marked
- HTML Sanitization: DOMPurify

## Acknowledgments

- Built with [Marp](https://marp.app/) for presentation rendering
- Icons provided by [Lucide](https://lucide.dev/)
- Markdown processing by [Marked](https://marked.js.org/)
- HTML sanitization by [DOMPurify](https://github.com/cure53/DOMPurify)
