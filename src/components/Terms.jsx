import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'
import './Terms.css'

export function Terms ({ onPickTerm, onPickTermWithDestination }) {
  const [terms, setTerms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(200) // Start with 200
  const [clickedTerm, setClickedTerm] = useState(null) // Track clicked term
  const [selectedLetter, setSelectedLetter] = useState('ALL') // Filter by first letter
  const [modalTerm, setModalTerm] = useState(null) // Term for modal selection

  const handleTermClick = (term) => {
    setClickedTerm(term)
    setTimeout(() => setClickedTerm(null), 1000) // Clear after 1s
    // Show modal to choose destination
    setModalTerm(term)
  }

  const handleDestinationChoice = (destination) => {
    if (modalTerm && onPickTermWithDestination) {
      onPickTermWithDestination(modalTerm, destination)
    }
    setModalTerm(null) // Close modal
  }

  useEffect(() => {
    let alive = true
    const ac = new AbortController()
    const load = async () => {
      setLoading(true)
      setErr('')
      try {
        const res = await fetch(`${API_BASE}/terms`, { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!alive) return
        setTerms(Array.isArray(data?.terms) ? data.terms : [])
      } catch (e) {
        if (!alive) return
        setErr(`Failed to fetch terms: ${e?.message || e}`)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false; ac.abort() }
  }, [])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    let result = terms
    
    // Filter by selected letter
    if (selectedLetter !== 'ALL') {
      result = result.filter(t => t.charAt(0).toUpperCase() === selectedLetter)
    }
    
    // Filter by search term
    if (s) {
      result = result.filter(t => t.toLowerCase().includes(s))
    }
    
    return result
  }, [terms, search, selectedLetter])

  // Group terms by first letter for statistics
  const termsByLetter = useMemo(() => {
    const grouped = {}
    terms.forEach(term => {
      const firstLetter = term.charAt(0).toUpperCase()
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = 0
      }
      grouped[firstLetter]++
    })
    return grouped
  }, [terms])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const displayedTerms = filtered.slice(0, displayLimit)
  const hasMore = filtered.length > displayLimit

  const loadMore = () => {
    setDisplayLimit(prev => Math.min(prev + 200, filtered.length))
  }

  const handleSearch = async () => {
    setIsSearching(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    setIsSearching(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className='terms'>
      {/* Alphabetical Filter */}
      <div className="terms-alphabet-filter">
        <button
          onClick={() => {
            setSelectedLetter('ALL')
            setDisplayLimit(200)
          }}
          className={`terms-letter-btn ${selectedLetter === 'ALL' ? 'active' : ''}`}
        >
          ALL
        </button>
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => {
              setSelectedLetter(letter)
              setDisplayLimit(200)
            }}
            className={`terms-letter-btn ${selectedLetter === letter ? 'active' : ''}`}
            disabled={!termsByLetter[letter]}
            title={termsByLetter[letter] ? `${termsByLetter[letter]} terms` : 'No terms'}
          >
            {letter}
            {termsByLetter[letter] && (
              <span className="terms-letter-count">{termsByLetter[letter]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="terms-search-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Search brain terms…'
          className='terms-search-input'
          disabled={isSearching}
        />
        <button 
          className="terms-search-button"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <span className="terms-search-spinner"></span>
              Searching...
            </>
          ) : (
            <>
              <svg className="terms-search-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search
            </>
          )}
        </button>
      </div>

      <div className='terms__controls'>
        <button
          onClick={() => setSearch('')}
          className='btn btn--primary'
        >
          Clear
        </button>
      </div>

      {loading && (
        <div className='terms__skeleton'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='terms__skeleton-row' />
          ))}
        </div>
      )}

      {err && (
        <div className='alert alert--error'>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className='terms__list'>
          {filtered.length === 0 ? (
            <div className='terms__empty'>No terms found</div>
          ) : (
            <>
              <div className='terms__stats' style={{ 
                padding: '8px 12px', 
                marginBottom: '12px', 
                background: 'rgba(0, 255, 230, 0.05)', 
                border: '1px solid var(--cyan-dim)', 
                borderRadius: '4px',
                fontSize: '13px',
                color: 'var(--cyan-bright)'
              }}>
                Showing {displayedTerms.length} of {filtered.length} terms
                {selectedLetter !== 'ALL' && <span style={{ color: 'var(--text-secondary)' }}> (letter: {selectedLetter})</span>}
                {search && <span style={{ color: 'var(--text-secondary)' }}> (search: "{search}")</span>}
                {(selectedLetter !== 'ALL' || search) && <span style={{ color: 'var(--text-secondary)' }}> from {terms.length} total</span>}
              </div>
              <ul className='terms__ul'>
                {displayedTerms.map((t, idx) => (
                  <li key={`${t}-${idx}`} className='terms__li'>
                    <a
                      href="#"
                      className='terms__name'
                      title={`Click to search: ${t}`}
                      aria-label={`Add term ${t} to search query`}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        handleTermClick(t);
                      }}
                      style={clickedTerm === t ? {
                        background: 'rgba(0, 255, 230, 0.3)',
                        borderColor: 'var(--cyan-bright)',
                        color: 'var(--cyan-bright)',
                        transform: 'scale(1.02)'
                      } : {}}
                    >
                      {clickedTerm === t && <span style={{ marginRight: '6px' }}>✓</span>}
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
              
              {hasMore && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  marginTop: '16px'
                }}>
                  <button
                    onClick={loadMore}
                    className='btn btn--primary'
                    style={{
                      padding: '10px 24px',
                      fontSize: '14px'
                    }}
                  >
                    Load More ({filtered.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Destination Choice Modal */}
      {modalTerm && (
        <div className="terms-modal-overlay" onClick={() => setModalTerm(null)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h3>Select Destination</h3>
              <button 
                className="terms-modal-close"
                onClick={() => setModalTerm(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="terms-modal-body">
              <p className="terms-modal-term">"{modalTerm}"</p>
              <p className="terms-modal-text">Where would you like to explore this term?</p>
              <div className="terms-modal-buttons">
                <button
                  className="terms-modal-btn terms-modal-btn--studies"
                  onClick={() => handleDestinationChoice('studies')}
                >
                  <svg className="terms-modal-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <div>
                    <div className="terms-modal-btn-title">Research Studies</div>
                    <div className="terms-modal-btn-desc">View published papers and experiments</div>
                  </div>
                </button>
                <button
                  className="terms-modal-btn terms-modal-btn--locations"
                  onClick={() => handleDestinationChoice('locations')}
                >
                  <svg className="terms-modal-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="terms-modal-btn-title">Brain Locations</div>
                    <div className="terms-modal-btn-desc">Explore 3D brain coordinates and images</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

