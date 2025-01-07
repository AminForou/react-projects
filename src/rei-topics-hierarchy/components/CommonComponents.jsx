import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, X } from 'lucide-react';

export const Tooltip = ({ children, text }) => (
  <div className="group relative flex items-center">
    {children}
    <span className="absolute bottom-full right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
      {text}
    </span>
  </div>
);

export const Sidebar = ({ isOpen, onClose, articles, title, breadcrumb }) => {
  const [width, setWidth] = useState(320);
  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 200) {
      setWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={sidebarRef}
      style={{ width }}
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 border-b border-indigo-200">
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-2">Path:</span>
          {breadcrumb.slice(1).map((item, index) => (
            <React.Fragment key={index}>
              <span className="font-medium text-indigo-600">{item}</span>
              {index < breadcrumb.length - 2 && (
                <ChevronRight size={16} className="mx-2 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-700">
            Related Articles to {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <ul className="space-y-2">
          {articles.map((article, index) => (
            <li key={index} className="text-indigo-600 hover:text-indigo-800">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 rounded hover:bg-indigo-50 transition-colors duration-200"
              >
                {index + 1}. {article.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div
        ref={resizerRef}
        className="absolute top-0 left-0 w-2 h-full cursor-ew-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
