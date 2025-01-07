import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, BarChart2, FileText, Download, X } from 'lucide-react';

const Tooltip = ({ children, text }) => (
  <div className="group relative flex items-center">
    {children}
    <span className="absolute bottom-full right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
      {text}
    </span>
  </div>
);

const Sidebar = ({ isOpen, onClose, articles }) => {
  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-700">Related Articles</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <ul className="space-y-2">
          {articles.map((article, index) => (
            <li key={index} className="text-indigo-600 hover:text-indigo-800">
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="block py-2 px-3 rounded hover:bg-indigo-50 transition-colors duration-200">
                {index + 1}. {article.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TopicNode = ({ name, level, volume, children, searchTerm, parentExpanded = true, articleCount, articles }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (level === 0) {
      setIsVisible(true);
      setIsExpanded(true);
    } else if (level === 1) {
      const shouldBeVisible = searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase());
      setIsVisible(shouldBeVisible);
      if (searchTerm !== '' && shouldBeVisible) {
        setIsExpanded(true);
      }
    } else {
      setIsVisible(parentExpanded);
    }
  }, [searchTerm, name, level, parentExpanded]);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getLevelStyle = (level) => {
    const styles = [
      'text-xl font-bold text-indigo-700',
      'text-lg font-semibold text-indigo-600',
      'text-md font-medium text-indigo-500',
      'text-sm font-normal text-indigo-400'
    ];
    return styles[level] || styles[styles.length - 1];
  };

  const getLevelBadgeColor = (level) => {
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600', 'bg-red-100 text-red-600'];
    return colors[level] || colors[colors.length - 1];
  };

  const sortedChildren = useMemo(() => {
    if (!children) return [];
    if (level === 0) {
      // Sort L1 by volume
      return [...children].sort((a, b) => (b.volume || 0) - (a.volume || 0));
    } else if (level === 1 || level === 2) {
      // Sort L2 and L3 by articleCount
      return [...children].sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
    }
    return children;
  }, [children, level]);

  const handleArticleClick = (e) => {
    e.stopPropagation();
    setIsSidebarOpen(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`mb-2 ${level === 0 ? 'bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg overflow-hidden' : ''}`}>
      <div
        className={`flex items-center cursor-pointer py-4 px-6 hover:bg-indigo-50 transition-all duration-300 ${getLevelStyle(level)}`}
        onClick={toggleExpand}
        style={{ paddingLeft: level === 0 ? '16px' : `${level * 24}px` }}
      >
        <div className="flex items-center flex-grow">
          {children && (
            <span className={`${level === 0 ? 'ml-2 mr-4' : 'mr-3'} transition-transform duration-300 ${isExpanded ? 'transform rotate-90' : ''}`}>
              <ChevronRight size={20} />
            </span>
          )}
          <span className={`${getLevelBadgeColor(level)} text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3`}>
            {level}
          </span>
          <span>{name.replace(/^\d+\s-\s/, '')}</span>
        </div>
        <div className="flex items-center space-x-4">
          {level === 1 && volume && (
            <Tooltip text="Monthly search volume">
              <div className="flex items-center space-x-2">
                <BarChart2 size={16} className="text-indigo-400" />
                <span className="text-sm text-indigo-400 font-normal">
                  {volume.toLocaleString()}
                </span>
              </div>
            </Tooltip>
          )}
          {(level === 2 || level === 3) && articleCount !== undefined && (
            <Tooltip text="Click to view related articles">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={handleArticleClick}>
                <FileText size={16} className="text-indigo-400" />
                <span className="text-sm text-indigo-400 font-normal">
                  {articleCount}
                </span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      {children && (
        <div className={`ml-6 ${level >= 2 ? 'border-l border-indigo-100 pl-4' : ''} ${isExpanded ? '' : 'hidden'}`}>
          {sortedChildren.map((child, index) => (
            <TopicNode key={index} {...child} searchTerm={searchTerm} parentExpanded={isExpanded} />
          ))}
        </div>
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} articles={articles || []} />
    </div>
  );
};

const LinkedInPulseTopicsHierarchy = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const data = {
    name: "0 - LinkedIn Pulse Core Topics",
    level: 0,
    children: [
      {
        name: "1 - Career",
        level: 1,
        volume: 1000000,
        children: [
          {
            name: "2 - Career Change",
            level: 2,
            articleCount: 150,
            articles: [
              { title: "Best Google Career Certifications for Your Resume", link: "#" },
              { title: "Top 5 Career Change Strategies for 2024", link: "#" },
              { title: "How to Successfully Pivot Your Career", link: "#" },
            ],
            children: [
              { name: "3 - Career Change Strategies", level: 3, articleCount: 75, articles: [
                { title: "Effective Networking for Career Changers", link: "#" },
                { title: "Skills Assessment for Career Transitions", link: "#" },
              ] },
              { name: "3 - Crafting Resumes for Career Change", level: 3, articleCount: 45, articles: [
                { title: "Highlighting Transferable Skills on Your Resume", link: "#" },
                { title: "Resume Formats for Career Changers", link: "#" },
              ] }
            ]
          },
          {
            name: "2 - Career Development",
            level: 2,
            articleCount: 200,
            articles: [
              { title: "10 Ways to Accelerate Your Career Growth", link: "#" },
              { title: "The Importance of Continuous Learning in Career Development", link: "#" },
            ],
            children: [
              { name: "3 - Career Development Strategies", level: 3, articleCount: 100, articles: [
                { title: "Setting SMART Career Goals", link: "#" },
                { title: "Building a Personal Brand for Career Success", link: "#" },
              ] },
              { name: "3 - Crafting Resumes for Career Development", level: 3, articleCount: 80, articles: [
                { title: "Showcasing Career Progression on Your Resume", link: "#" },
                { title: "Tailoring Your Resume for Internal Promotions", link: "#" },
              ] }
            ]
          }
        ]
      },
      {
        name: "1 - Leadership",
        level: 1,
        volume: 750000,
        children: [
          {
            name: "2 - Team Management",
            level: 2,
            articleCount: 180,
            articles: [
              { title: "Effective Team Building Strategies", link: "#" },
              { title: "Managing High-Performance Teams", link: "#" },
            ],
            children: [
              { name: "3 - Remote Team Leadership", level: 3, articleCount: 90, articles: [
                { title: "Best Practices for Leading Remote Teams", link: "#" },
                { title: "Tools for Effective Remote Team Management", link: "#" },
              ] },
              { name: "3 - Conflict Resolution", level: 3, articleCount: 70, articles: [
                { title: "Techniques for Resolving Workplace Conflicts", link: "#" },
                { title: "Creating a Positive Team Culture to Minimize Conflicts", link: "#" },
              ] }
            ]
          },
          {
            name: "2 - Strategic Leadership",
            level: 2,
            articleCount: 160,
            articles: [
              { title: "Developing a Strategic Mindset", link: "#" },
              { title: "Long-term Planning for Business Success", link: "#" },
            ],
            children: [
              { name: "3 - Vision Setting", level: 3, articleCount: 65, articles: [
                { title: "Creating a Compelling Vision for Your Organization", link: "#" },
                { title: "Aligning Team Goals with Organizational Vision", link: "#" },
              ] },
              { name: "3 - Change Management", level: 3, articleCount: 85, articles: [
                { title: "Leading Organizational Change Effectively", link: "#" },
                { title: "Overcoming Resistance to Change in the Workplace", link: "#" },
              ] }
            ]
          }
        ]
      }
    ]
  };

  const generateCSV = (data) => {
    const rows = [];
    const addRow = (level1, level2, level3, volume, articleCount) => {
      rows.push([level1, level2, level3, volume, articleCount].join(','));
    };

    const traverse = (node, level1 = '', level2 = '', level3 = '') => {
      if (node.level === 1) {
        level1 = node.name.replace(/^\d+\s-\s/, '');
        addRow(level1, '', '', node.volume, '');
      } else if (node.level === 2) {
        level2 = node.name.replace(/^\d+\s-\s/, '');
        addRow(level1, level2, '', '', node.articleCount);
      } else if (node.level === 3) {
        level3 = node.name.replace(/^\d+\s-\s/, '');
        addRow(level1, level2, level3, '', node.articleCount);
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, level1, level2, level3));
      }
    };

    traverse(data);
    return ['Level 1,Level 2,Level 3,Search Volume,Article Count', ...rows].join('\n');
  };

  const downloadCSV = () => {
    const csv = generateCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'linkedin_pulse_topics.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">REI Topics Hierarchy</h1>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-center">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Search main topics to explore the hierarchy..."
              className="w-full py-3 px-4 pr-10 rounded-full bg-white bg-opacity-20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" size={20} />
          </div>
          <button
            onClick={downloadCSV}
            className="bg-white text-indigo-600 py-2 px-4 rounded-full flex items-center hover:bg-indigo-100 transition-colors duration-300"
          >
            <Download size={20} className="mr-2" />
            Download CSV
          </button>
        </div>
        <div className="p-6">
          <TopicNode {...data} searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
};

export default LinkedInPulseTopicsHierarchy;