import { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import { Terms } from './components/Terms';
import { QueryBuilder } from './components/QueryBuilder';
import { Studies } from './components/Studies';
import { NiiViewer } from './components/NiiViewer';
import { useUrlQueryState } from './hooks/useUrlQueryState';

export default function App() {
  const [currentPage, setCurrentPage] = useState('terms');
  const [query, setQuery] = useUrlQueryState('q');

  // Handle term selection with destination choice
  const handlePickTermWithDestination = (term, destination) => {
    setQuery(term); // Set the term as query
    setCurrentPage(destination); // Navigate to chosen page (studies or locations)
  };

  // Legacy handler for backward compatibility
  const handlePickTerm = (term) => {
    setQuery(term);
    setCurrentPage('studies');
  };

  return (
    <div className="app">
      {/* Header with integrated navigation */}
      <header className="hero-header">
        <div className="hero-header__bg"></div>
        <div className="hero-header__content">
          <h1 className="hero-title">LoTUS-BF</h1>
          <p className="hero-subtitle">Neuroscience Brain Function Search Engine</p>
          
          {/* 導航整合進 header */}
          <div className="hero-nav">
            <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <main className="app__main">
        <div className="app__content">
          {currentPage === 'terms' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Search Terms</h2>
                <p className="section-desc">Browse and search brain function keywords</p>
              </div>
              <Terms 
                onPickTerm={handlePickTerm}
                onPickTermWithDestination={handlePickTermWithDestination}
              />
            </div>
          )}

          {currentPage === 'studies' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Research Studies</h2>
                <p className="section-desc">Build queries and explore research data</p>
              </div>
              <QueryBuilder query={query} setQuery={setQuery} />
              <Studies query={query} />
            </div>
          )}

          {currentPage === 'locations' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Brain Locations</h2>
                <p className="section-desc">3D visualization of brain activation coordinates</p>
              </div>
              
              <QueryBuilder query={query} setQuery={setQuery} />
              <NiiViewer query={query} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
