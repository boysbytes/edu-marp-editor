/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Download, Settings, FileText, Columns2, Columns3, Layout, Menu, ZoomIn, ZoomOut, Shrink } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarpEditor = () => {
  const [slides, setSlides] = useState([
    {
      id: Date.now(),
      type: 'cover',
      content: '# My Presentation\n\n## Subtitle\n\n**Author Name**\n\n*Date*'
    }
  ]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [fontSize, setFontSize] = useState(32);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState(null);

  // State for resizable panels
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [editorRatio, setEditorRatio] = useState(0.5);
  const editorContainerRef = useRef(null);

  // State for preview zoom
  const [zoomLevel, setZoomLevel] = useState('fit'); // 'fit' or a number
  const [fitScale, setFitScale] = useState(1); // The calculated scale to fit the container


  const aspectRatios = {
    '16:9': { width: 16, height: 9, name: '16:9 (Widescreen)' },
    '4:3': { width: 4, height: 3, name: '4:3 (Standard)' },
    '16:10': { width: 16, height: 10, name: '16:10 (WUXGA)' }
  };

  const calculateContentDimensions = () => {
    const ratio = aspectRatios[aspectRatio];
    const baseWidth = 1280;
    const baseHeight = (baseWidth * ratio.height) / ratio.width;
    
    const contentWidth = baseWidth * 0.8;
    const contentHeight = baseHeight * 0.8;
    
    const avgCharWidth = fontSize * 0.6;
    const lineHeight = fontSize * lineSpacing;
    
    const charsPerLine = Math.floor(contentWidth / avgCharWidth);
    const linesPerSlide = Math.floor(contentHeight / lineHeight);
    
    return {
      contentWidth: Math.round(contentWidth),
      contentHeight: Math.round(contentHeight),
      charsPerLine,
      linesPerSlide,
      slideWidth: baseWidth,
      slideHeight: Math.round(baseHeight)
    };
  };

  const contentDims = useMemo(() => calculateContentDimensions(), [aspectRatio, fontSize, lineSpacing]);
  
  const previewContainerRef = useRef(null);
  
  useLayoutEffect(() => {
    const calculateFitScale = () => {
      if (!previewContainerRef.current) return;

      const container = previewContainerRef.current;
      const availableWidth = container.clientWidth - 16;
      const availableHeight = container.clientHeight - 16;
      
      const { slideWidth, slideHeight } = contentDims;
      if (!slideWidth || !slideHeight) return;

      const scaleX = availableWidth / slideWidth;
      const scaleY = availableHeight / slideHeight;
      
      setFitScale(Math.max(0.01, Math.min(scaleX, scaleY)));
    };
    
    calculateFitScale();

    const resizeObserver = new ResizeObserver(calculateFitScale);
    if (previewContainerRef.current) {
        resizeObserver.observe(previewContainerRef.current);
    }
    
    return () => resizeObserver.disconnect();
}, [contentDims]);

  const finalPreviewScale = useMemo(() => {
    if (zoomLevel === 'fit') {
      return fitScale;
    }
    return zoomLevel;
  }, [zoomLevel, fitScale]);

  const ZOOM_STEP = 0.1;

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const current = prev === 'fit' ? fitScale : prev;
      return Math.min(3, current + ZOOM_STEP); // Cap at 300%
    });
  }, [fitScale]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const current = prev === 'fit' ? fitScale : prev;
      return Math.max(0.1, current - ZOOM_STEP); // Floor at 10%
    });
  }, [fitScale]);

  const handleZoomFit = useCallback(() => {
    setZoomLevel('fit');
  }, []);


  const templates = {
    cover: {
      name: 'Cover Slide',
      icon: Layout,
      content: '# Presentation Title\n\n## Subtitle\n\n**Author Name**\n\n*Date*'
    },
    titleParagraph: {
      name: 'Title + Paragraph',
      icon: FileText,
      content: '# Slide Title\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    twoColumns: {
      name: 'Title + 2 Columns',
      icon: Columns2,
      content: '# Slide Title\n\n<div class="columns">\n\n<div class="col">\n\n## Left Column\n\n- Point 1\n- Point 2\n- Point 3\n\n</div>\n\n<div class="col">\n\n## Right Column\n\n- Point A\n- Point B\n- Point C\n\n</div>\n\n</div>'
    },
    threeColumns: {
      name: 'Title + 3 Columns',
      icon: Columns3,
      content: '# Slide Title\n\n<div class="columns">\n\n<div class="col">\n\n## Column 1\n\n- Item 1\n- Item 2\n\n</div>\n\n<div class="col">\n\n## Column 2\n\n- Item A\n- Item B\n\n</div>\n\n<div class="col">\n\n## Column 3\n\n- Item X\n- Item Y\n\n</div>\n\n</div>'
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedSlide(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e) => {
      e.preventDefault();
  };

  const handleDrop = (e, index) => {
      const newSlides = [...slides];
      const draggedItem = newSlides[draggedSlide];
      newSlides.splice(draggedSlide, 1);
      newSlides.splice(index, 0, draggedItem);
      setSlides(newSlides);
      setSelectedSlide(index);
      setDraggedSlide(null);
  };

  const addSlide = (templateType) => {
    const newSlide = {
      id: Date.now(),
      type: templateType,
      content: templates[templateType].content
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setSelectedSlide(newSlides.length - 1);
  };

  const updateSlideContent = (content) => {
    const updatedSlides = slides.map((slide, index) => 
      index === selectedSlide ? { ...slide, content } : slide
    );
    setSlides(updatedSlides);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
    if (selectedSlide >= index) {
      setSelectedSlide(Math.max(0, selectedSlide - 1));
    }
  };

  const generateMarpFile = () => {
    const styleBlock = `
<style>
section {
  font-size: ${fontSize}px;
  line-height: ${lineSpacing};
}
.columns {
  display: flex;
  gap: 2rem;
}
.columns > .col {
  flex: 1;
}
</style>
`;

    const frontMatter = `---
marp: true
theme: default
paginate: true
breaks: true
---
${styleBlock}
`;
    const slideContents = slides.map(slide => slide.content).join('\n\n---\n\n');
    return frontMatter + slideContents;
  };

  const downloadMarp = () => {
    const marpContent = generateMarpFile();
    const blob = new Blob([marpContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    
    // Configure marked to handle line breaks like Marp's `breaks: true` for consistency.
    const markedOptions = {
      breaks: true,
      gfm: true, // Use GitHub Flavored Markdown
    };

    // Convert Markdown to HTML using the 'marked' library.
    const dirtyHTML = marked.parse(markdown, markedOptions);

    // Sanitize the HTML using DOMPurify to prevent XSS attacks.
    // Allow 'div' tags and 'class' attributes for multi-column layouts.
    const cleanHTML = DOMPurify.sanitize(dirtyHTML, {
      ADD_TAGS: ['div'],
      ADD_ATTR: ['class'],
    });

    return cleanHTML;
  };

  // --- Resizer Logic ---
  const startSidebarResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + e.clientX - startX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);

  const startEditorResize = useCallback((e) => {
    e.preventDefault();

    // When resizing starts, lock the current zoom level if it's in "fit" mode.
    // This stops the slide from resizing along with the panel, matching the user's
    // expectation of resizing "just the panel".
    if (zoomLevel === 'fit') {
      setZoomLevel(fitScale);
    }

    if (!editorContainerRef.current) return;
    
    const isHorizontal = window.innerWidth >= 1024; // lg breakpoint
    const rect = editorContainerRef.current.getBoundingClientRect();

    const handleMouseMove = (e) => {
      let newRatio;
      if (isHorizontal) {
        const newWidth = e.clientX - rect.left;
        newRatio = newWidth / rect.width;
      } else {
        const newHeight = e.clientY - rect.top;
        newRatio = newHeight / rect.height;
      }

      if (newRatio >= 0.1 && newRatio <= 0.9) {
        setEditorRatio(newRatio);
      }
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [zoomLevel, fitScale]);
  // --- End Resizer Logic ---


  const currentSlide = slides[selectedSlide];

  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex overflow-hidden">
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
      <div
        className={`absolute top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col z-40
                   transform transition-transform duration-300 ease-in-out flex-shrink-0
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                   md:relative md:translate-x-0`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Marp Editor</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Slides</h3>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedSlide === index 
                    ? 'bg-blue-50 border-2 border-blue-300' 
                    : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                } ${draggedSlide === index ? 'opacity-50' : ''}`}
                onClick={() => setSelectedSlide(index)}
                aria-current={selectedSlide === index}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Slide {index + 1}</span>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="text-red-400 hover:text-red-600 text-xl font-bold leading-none"
                      aria-label={`Delete slide ${index + 1}`}
                    >
                      &times;
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {templates[slide.type]?.name || 'Custom Slide'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Add Slide</h3>
          <div className="space-y-2">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => addSlide(key)}
                className="w-full flex items-center gap-3 p-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <template.icon size={18} className="text-gray-500" />
                <span>{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div
        onMouseDown={startSidebarResize}
        className="flex-shrink-0 w-1.5 bg-gray-200 hover:bg-blue-500 cursor-col-resize hidden md:block transition-colors"
        aria-label="Resize sidebar"
        role="separator"
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
               <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
              <h2 className="font-medium text-gray-900">
                Slide {selectedSlide + 1} of {slides.length}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded hidden sm:inline">
                {templates[currentSlide?.type]?.name || 'Custom'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle settings panel"
                aria-expanded={showSettings}
              >
                <Settings size={20} />
              </button>
              <button
                onClick={downloadMarp}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Export Marp
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <label htmlFor="aspect-ratio-select" className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                <select id="aspect-ratio-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(aspectRatios).map(([key, ratio]) => <option key={key} value={key}>{ratio.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="font-size-range" className="block text-sm font-medium text-gray-700 mb-1">Content Font Size</label>
                <div className="flex items-center"><input id="font-size-range" type="range" min="10" max="48" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-24" /><span className="text-sm text-gray-600 ml-2 w-8 text-center">{fontSize}px</span></div>
              </div>
              <div>
                <label htmlFor="line-spacing-range" className="block text-sm font-medium text-gray-700 mb-1">Content Line Spacing</label>
                <div className="flex items-center"><input id="line-spacing-range" type="range" min="1" max="2.5" step="0.1" value={lineSpacing} onChange={(e) => setLineSpacing(Number(e.target.value))} className="w-24" /><span className="text-sm text-gray-600 ml-2 w-8 text-center">{lineSpacing.toFixed(1)}</span></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Content Guidelines (for {aspectRatio})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div><span className="font-medium">Slide Size:</span> {contentDims.slideWidth} &times; {contentDims.slideHeight}px</div>
                <div><span className="font-medium">Content Area:</span> {contentDims.contentWidth} &times; {contentDims.contentHeight}px</div>
                <div><span className="font-medium">Est. Chars/Line:</span> ~{contentDims.charsPerLine}</div>
                <div><span className="font-medium">Est. Lines/Slide:</span> ~{contentDims.linesPerSlide}</div>
              </div>
            </div>
          </div>
        )}

        <div ref={editorContainerRef} className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="flex flex-col min-h-0 min-w-0" style={{ flex: editorRatio }}>
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0"><h3 className="text-sm font-medium text-gray-700">Markdown Editor</h3></div>
            <textarea value={currentSlide?.content || ''} onChange={(e) => updateSlideContent(e.target.value)} className="flex-1 p-4 font-mono resize-none focus:outline-none w-full h-full bg-gray-50 text-base" placeholder="Start writing your slide content in Markdown..." aria-label="Markdown content for the current slide" />
          </div>
          
          <div
            onMouseDown={startEditorResize}
            className="flex-shrink-0 bg-gray-200 hover:bg-blue-500 cursor-row-resize lg:cursor-col-resize h-1.5 lg:h-auto lg:w-1.5 transition-colors"
            aria-label="Resize editor panel"
            role="separator"
          />

          <div className="flex flex-col min-h-0 min-w-0 lg:border-l border-t border-gray-200 lg:border-t-0" style={{ flex: 1 - editorRatio }}>
             <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Preview</h3>
              <div className="flex items-center gap-1">
                <button onClick={handleZoomOut} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors" aria-label="Zoom out">
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm w-16 text-center tabular-nums text-gray-700 font-medium">
                  {zoomLevel === 'fit' ? 'Fit' : `${Math.round(zoomLevel * 100)}%`}
                </span>
                <button onClick={handleZoomIn} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors" aria-label="Zoom in">
                  <ZoomIn size={18} />
                </button>
                <button onClick={handleZoomFit} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors" aria-label="Fit to screen">
                  <Shrink size={18} />
                </button>
              </div>
            </div>
            <div ref={previewContainerRef} className="flex-1 bg-gray-200 p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-auto">
              <div
                className="bg-white shadow-lg overflow-hidden flex-shrink-0"
                style={{
                  width: `${contentDims.slideWidth}px`,
                  height: `${contentDims.slideHeight}px`,
                  transform: `scale(${finalPreviewScale})`,
                  transformOrigin: 'center center',
                }}
              >
                <div
                  className="prose max-w-none w-full h-full p-4 sm:p-6 md:p-8 overflow-hidden flex flex-col justify-center"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineSpacing,
                  }}
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(currentSlide?.content) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MarpEditor />
  </React.StrictMode>
);