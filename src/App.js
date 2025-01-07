import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import LinkedInTopicsHierarchy from './rei-topics-hierarchy/LinkedInTopicsHierarchy';
import QbLinksApp from './qb-links/QbLinksApp';
import LoginPage from './LoginPage';
import IpsyKeywords from './IPSY/ipsy-keywords';
import SitemapCreator from './Hyatt/SitemapCreator';
import UnknownCrawlAnalysis from './Hyatt/UnknownCrawlAnalysis';
import URLAnalysisDashboard from './ServiceNow/UrlStructureAnalyzer';
import SimpleURLAnalyzer from './ServiceNow/SimpleURLAnalyzer';

function App() {
  const [isAuthenticated, setAuth] = useState(false);

  console.log("App rendering. isAuthenticated:", isAuthenticated);

  return (
    <Router basename="/react-projects">
      <div className="min-h-screen">
        <header className="bg-indigo-800 text-white py-4 shadow-md">
          <div className="container mx-auto text-center">
            <h1 className="text-xl font-bold">React Projects Portal:</h1>
          </div>
        </header>

        <main className="container mx-auto mt-8">
          <Routes>
            <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Home />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Publicly accessible routes */}
            <Route path="/rei-topics-hierarchy/*" element={<LinkedInTopicsHierarchy />} />
            <Route path="/qb-links/*" element={<QbLinksApp />} />
            <Route path="/ipsy-keywords" element={<IpsyKeywords />} /> 
            <Route path="/sitemap-creator" element={<SitemapCreator />} />
            <Route path="/unknown-crawl-analysis" element={<UnknownCrawlAnalysis />} />
            <Route path="/url-analyzer" element={<URLAnalysisDashboard />} />
            <Route path="/simple-url-analyzer" element={<SimpleURLAnalyzer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  console.log("Home component rendering");
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-semibold text-gray-800">Welcome to My Page!</h2>
      <p className="text-lg text-gray-700 mt-4">Hi, I'm Amin. Explore my projects below and click on what interests you!</p>
      <div className="mt-8 space-y-4">
        <Link
          to="/rei-topics-hierarchy"
          className="inline-block bg-sky-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-sky-600 transition-transform transform hover:-translate-y-1"
        >
          LinkedIn Topics Hierarchy
        </Link>
        <br/>
        <Link
          to="/qb-links"
          className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-emerald-600 transition-transform transform hover:-translate-y-1"
        >
          QB Links
        </Link>
        <br/>
        <Link
          to="/ipsy-keywords"
          className="inline-block bg-pink-400 text-white px-6 py-3 rounded-lg shadow-md hover:bg-pink-500 transition-transform transform hover:-translate-y-1"
        >
          IPSY Keywords
        </Link>
        <br/>
        <Link
          to="/sitemap-creator"
          className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-600 transition-transform transform hover:-translate-y-1"
        >
          Sitemap Creator
        </Link>
        <br/>
        <Link
          to="/unknown-crawl-analysis"
          className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition-transform transform hover:-translate-y-1"
        >
          Unknown Crawl Analysis
        </Link>
        <br/>
        <Link
          to="/url-analyzer"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:-translate-y-1"
        >
          URL Structure Analyzer
        </Link>
        <br/>
        <Link
          to="/simple-url-analyzer"
          className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:-translate-y-1"
        >
          Simple URL Analyzer
        </Link>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-semibold text-gray-800">404 - Page Not Found</h2>
      <p className="text-lg text-gray-700 mt-4">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default App;
