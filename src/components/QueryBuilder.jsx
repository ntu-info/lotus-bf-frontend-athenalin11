import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api';
import './QueryBuilder.css';

export function QueryBuilder({ query, setQuery }) {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const append = (token) => setQuery((q) => (q ? `${q} ${token}` : token));

  // AJAX autocomplete - fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = query.trim();
      
      // Don't fetch if empty or contains operators
      if (!trimmed || trimmed.length < 2 || /\b(AND|OR|NOT|\(|\))\b/.test(trimmed)) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Extract last word for autocomplete
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (lastWord.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      
      try {
        // Fetch matching terms from API
        const res = await fetch(`${API_BASE}/terms?search=${encodeURIComponent(lastWord)}`);
        if (res.ok) {
          const data = await res.json();
          const terms = Array.isArray(data) ? data : (data.terms || []);
          // Filter terms that start with or contain the search string
          const filtered = terms.filter(t => 
            t.toLowerCase().includes(lastWord.toLowerCase())
          );
          setSuggestions(filtered.slice(0, 8)); // Show max 8 suggestions
          setShowSuggestions(filtered.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (e) {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce 300ms
    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    // Handle arrow keys and enter for suggestions
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const selectSuggestion = (suggestion) => {
    const words = query.trim().split(/\s+/);
    words[words.length - 1] = suggestion;
    setQuery(words.join(' '));
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setShowSuggestions(false); // Close suggestions on search
    setIsSearching(true);
    // 模擬 AJAX 請求延遲
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSearching(false);
  };

  return (
    <div className="card qb-card">
      <div className="card__title">Search Query</div>
      
      {/* 長條型搜尋框 with Autocomplete */}
      <div className="qb-search-bar" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Enter search query, e.g.: memory AND emotion OR [-22,-4,18]"
          className="qb-search-input"
          disabled={isSearching}
          autoComplete="off"
        />
        <button 
          onClick={handleSearch}
          className={`qb-search-button ${isSearching ? 'qb-search-button--loading' : ''}`}
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="qb-search-loading">
              <span className="qb-search-spinner"></span>
              Searching...
            </span>
          ) : (
            <span className="qb-search-text">
              <svg className="qb-search-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search
            </span>
          )}
        </button>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="qb-suggestions"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--cyan-dim)',
              borderRadius: '4px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 255, 230, 0.15)'
            }}
          >
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`qb-suggestion-item ${idx === selectedIndex ? 'qb-suggestion-item--selected' : ''}`}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  backgroundColor: idx === selectedIndex ? 'rgba(0, 255, 230, 0.1)' : 'transparent',
                  borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                  color: idx === selectedIndex ? 'var(--cyan-bright)' : 'var(--text-primary)',
                  fontSize: '14px',
                  transition: 'all 0.15s ease'
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for suggestions */}
        {loading && (
          <div style={{
            position: 'absolute',
            right: '120px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--cyan-bright)',
            fontSize: '12px'
          }}>
            <span className="qb-search-spinner" style={{ width: '12px', height: '12px' }}></span>
          </div>
        )}
      </div>

      {/* Operators */}
      <div className="qb-operators">
        <div className="qb-operators-label">Quick Operators:</div>
        <div className="qb-operators-buttons">
          {[
            { label: 'AND', onClick: () => append('AND') },
            { label: 'OR', onClick: () => append('OR') },
            { label: 'NOT', onClick: () => append('NOT') },
            { label: '(', onClick: () => append('(') },
            { label: ')', onClick: () => append(')') },
            { label: 'Clear', onClick: () => setQuery('') },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.onClick}
              className="qb-operator-btn"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {query && (
        <div className="qb-current-query">
          <span className="qb-current-query-label">Current Query:</span>
          <code className="qb-current-query-code">{query}</code>
        </div>
      )}
    </div>
  );
}
