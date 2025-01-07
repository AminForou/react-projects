import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Globe, Cpu, Briefcase, BookOpen, Users, Package, FileText, Layers, Search, ExternalLink, DollarSign, Calculator, PieChart } from 'lucide-react';

const Node = ({ label, children, url, icon: Icon, isDummy, level }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (children) {
      setIsOpen(!isOpen);
    } else if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="ml-8 relative">
      <div 
        className={`flex items-center cursor-pointer p-2 rounded-lg transition-all duration-200 
          ${isOpen ? 'bg-blue-100' : 'hover:bg-gray-100'} 
          ${isDummy ? 'opacity-50' : ''}
          ${level === 3 ? 'hover:bg-blue-50 active:bg-blue-100' : ''}`}
        onClick={handleClick}
      >
        {children && (
          <span className="mr-2">
            {isOpen ? <ChevronDown size={18} className="text-blue-500" /> : <ChevronRight size={18} className="text-gray-500" />}
          </span>
        )}
        <div className={`flex items-center ${isOpen ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
          {Icon && <Icon size={18} className="mr-2 text-gray-500" />}
          {label}
        </div>
        {url && url !== '#' && (
          <ExternalLink size={14} className="ml-2 text-gray-400" />
        )}
      </div>
      {isOpen && children && (
        <div className="mt-2 border-l-2 border-blue-200">
          {children.map((child, index) => (
            <Node key={index} {...child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const WebsiteStructure = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    }
  }, [isDragging, startPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const websiteStructure = {
    label: 'QuickBooks Website',
    icon: Globe,
    url: 'https://quickbooks.intuit.com/',
    level: 0,
    children: [
      {
        label: 'AI-Powered Solutions',
        icon: Cpu,
        url: 'https://quickbooks.intuit.com/ai/',
        level: 1,
        children: [
          {
            label: 'AI Accounting',
            icon: Briefcase,
            url: 'https://quickbooks.intuit.com/ai/accounting/',
            level: 2,
            children: [
              { label: 'QuickBooks AI ProAdvisor', url: 'https://quickbooks.intuit.com/accountants/proadvisor/', level: 3 },
              { label: 'Intuit Assist', url: 'https://quickbooks.intuit.com/ai-accounting/', level: 3 },
              { label: 'Client Management', url: 'https://quickbooks.intuit.com/learn-support/en-uk/quickbooks-online-accountant/help-topic/advanced-accounting/client-management', level: 3 }
            ]
          },
          {
            label: 'AI Bookkeeping',
            icon: BookOpen,
            url: 'https://quickbooks.intuit.com/ai/bookkeeping/',
            level: 2,
            children: [
              { label: 'AI for Accountants and Bookkeepers', url: 'https://quickbooks.intuit.com/ca/resources/accounting/ai-for-accountants-bookkeepers/', level: 3 },
              { label: 'AI in QuickBooks', url: 'https://quickbooks.intuit.com/global/resources/bookkeeping/how-ai-is-making-quickbooks-more-intelligent/', level: 3 }
            ]
          },
          {
            label: 'AI for Small Business',
            icon: Users,
            url: 'https://quickbooks.intuit.com/ai/small-business/',
            level: 2,
            children: [
              { label: 'AI and Machine Learning Vision', url: 'https://quickbooks.intuit.com/blog/innovation/making-new-technology-work-small-businesses-intuits-vision-artificial-intelligence-machine-learning/', level: 3 },
              { label: 'Chata AI for SMBs', url: 'https://quickbooks.intuit.com/blog/news/national-small-business-week-2019-how-chata-ai-is-empowering-smbs-to-get-accounting-answers-using-ai/', level: 3 },
              { label: 'AI in Small Business', url: 'https://quickbooks.intuit.com/blog/thought-leadership/age-ai-really-mean-small-businesses/Thought/', level: 3 },
              { label: 'AI Cash Flow Management', url: 'https://quickbooks.intuit.com/ca/resources/news/intuit-infuses-quickbooks-software-with-ai-to-help-smbs-manage-cash-flow/', level: 3 },
              { label: 'AI for Canadian SMBs', url: 'https://quickbooks.intuit.com/ca/resources/news/quickbooks-brings-ai-to-canadian-small-businesses/?', level: 3 },
              { label: 'AI Tools for Business', url: 'https://quickbooks.intuit.com/ca/resources/running-a-business/how-to-incorporate-ai-tools-into-your-business/', level: 3 }
            ]
          },
          {
            label: 'AI in HR',
            icon: Users,
            url: 'https://quickbooks.intuit.com/ai/hr/',
            level: 2,
            children: [
              { label: 'AI Job Search Websites', url: 'https://quickbooks.intuit.com/global/resources/hr-and-management/25-best-job-search-websites-for-your-next-hire/', level: 3 }
            ]
          },
          {
            label: 'AI Inventory Management',
            icon: Package,
            url: 'https://quickbooks.intuit.com/ai/inventory/',
            level: 2,
            children: [
              { label: 'AI Inventory Tools', url: 'https://quickbooks.intuit.com/inventory-management/ai-inventory-management/', level: 3 }
            ]
          },
          {
            label: 'AI Invoicing',
            icon: FileText,
            url: 'https://quickbooks.intuit.com/ai/invoicing/',
            level: 2,
            children: [
              { label: 'AI Invoicing Templates', url: 'https://quickbooks.intuit.com/learn-support/en-us/reports-and-accounting/ai-invoicing-templates/00/1428352', level: 3 }
            ]
          },
          {
            label: 'AI Research',
            icon: Search,
            url: 'https://quickbooks.intuit.com/ai/research/',
            level: 2,
            children: [
              { label: 'AI and Machine Learning Report', url: 'https://quickbooks.intuit.com/blog/innovation/get-a-new-special-report-on-artificial-intelligence-and-machine-learning/', level: 3 }
            ]
          },
          {
            label: 'AI Technology',
            icon: Layers,
            url: 'https://quickbooks.intuit.com/ai/technology/',
            level: 2,
            children: [
              { label: 'AI Surveillance', url: 'https://quickbooks.intuit.com/blog/innovation/4-ways-to-know-if-someone-is-watching-you-on-your-camera/', level: 3 },
              { label: 'Machine Learning', url: 'https://quickbooks.intuit.com/blog/innovation/machine-learning-unlocking-the-power-of-millions-for-the-prosperity-of-one/', level: 3 },
              { label: 'AI Impact on Business', url: 'https://quickbooks.intuit.com/ca/resources/technology/how-artificial-intelligence-affect-business/', level: 3 },
              { label: 'Using AI in QuickBooks', url: 'https://quickbooks.intuit.com/learn-support/en-us/help-article/features/using-ai-quickbooks/L9I7YSKFD_US_en_US', level: 3 }
            ]
          },
          {
            label: 'Generative AI',
            icon: Cpu,
            url: 'https://quickbooks.intuit.com/ai/generative/',
            level: 2,
            children: [
              { label: 'Generative AI Overview', url: 'https://quickbooks.intuit.com/learn-support/articles/getting-the-most-out-of-quickbooks/5-things-everyone-should-know-about-generative-ai/05/1331594', level: 3 },
              { label: 'Generative AI Benefits', url: 'https://quickbooks.intuit.com/learn-support/articles/getting-the-most-out-of-quickbooks/benefits-of-generative-ai-for-small-businesses/05/1315263', level: 3 },
              { label: 'Practical Uses of Generative AI', url: 'https://quickbooks.intuit.com/learn-support/articles/getting-the-most-out-of-quickbooks/practical-uses-of-generative-ai/05/1331589', level: 3 },
              { label: 'What is Generative AI', url: 'https://quickbooks.intuit.com/learn-support/articles/getting-the-most-out-of-quickbooks/what-is-generative-ai/05/1331583', level: 3 }
            ]
          }
        ]
      },
      {
        label: 'Accounting and Bookkeeping',
        icon: BookOpen,
        url: 'https://quickbooks.intuit.com/accounting/',
        isDummy: true,
        level: 1,
        children: [
          { label: 'Financial Reporting', url: '#', level: 2 },
          { label: 'Bank Reconciliation', url: '#', level: 2 },
          { label: 'Chart of Accounts', url: '#', level: 2 },
        ]
      },
      {
        label: 'Invoicing and Payment',
        icon: DollarSign,
        url: 'https://quickbooks.intuit.com/invoicing/',
        isDummy: true,
        level: 1,
        children: [
          { label: 'Invoice Templates', url: '#', level: 2 },
          { label: 'Online Payments', url: '#', level: 2 },
          { label: 'Recurring Invoices', url: '#', level: 2 },
        ]
      },
      {
        label: 'Payroll and Taxes',
        icon: Calculator,
        url: 'https://quickbooks.intuit.com/payroll/',
        isDummy: true,
        level: 1,
        children: [
          { label: 'Employee Management', url: '#', level: 2 },
          { label: 'Tax Calculations', url: '#', level: 2 },
          { label: 'Direct Deposit', url: '#', level: 2 },
        ]
      },
      {
        label: 'Expense Tracking and Budgeting',
        icon: PieChart,
        url: 'https://quickbooks.intuit.com/expense-tracking/',
        isDummy: true,
        level: 1,
        children: [
          { label: 'Receipt Capture', url: '#', level: 2 },
          { label: 'Budget Planning', url: '#', level: 2 },
          { label: 'Expense Reports', url: '#', level: 2 },
        ]
      },
      {
        label: 'Inventory Management',
        icon: Package,
        url: 'https://quickbooks.intuit.com/inventory/',
        isDummy: true,
        level: 1,
        children: [
          { label: 'Stock Tracking', url: '#', level: 2 },
          { label: 'Purchase Orders', url: '#', level: 2 },
          { label: 'Inventory Valuation', url: '#', level: 2 },
        ]
      }
    ]
  };

  return (
    <div className="w-full h-screen bg-white overflow-hidden">
      <div 
        className="w-full h-full cursor-move bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="p-8 inline-block"
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        >
          <h1 className="text-2xl font-bold mb-2 text-gray-800 flex items-center">
            <Globe className="mr-2" /> Strategic SEO Link Graph Optimization for QuickBooks
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This visualization represents QuickBooks' hierarchical internal linking structure, 
            organizing content into L1 categories, L2 subcategories, and L3 specific topics to enhance 
            SEO performance and user navigation.
          </p>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Node {...websiteStructure} />
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 bg-white p-2 rounded-lg shadow-md text-sm text-gray-600">
        Click and drag to pan | Click nodes to expand/collapse | Click items to open links
      </div>
    </div>
  );
};

export default WebsiteStructure;