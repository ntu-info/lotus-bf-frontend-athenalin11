import { API_BASE } from '../api'
import { useState } from 'react'
import './LocationDecoder.css'

export function LocationDecoder({ onSelectTerm }) {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [z, setZ] = useState(0)
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleDecode = async () => {
    setLoading(true)
    setErr('')
    setHasSearched(true)
    
    try {
      // Fetch all terms first
      const termsRes = await fetch(`${API_BASE}/terms`)
      const termsData = await termsRes.json()
      const allTerms = termsData?.terms || []
      
      // Check a reasonable sample of terms for demo
      const matchingTerms = []
      const radius = 10 // Search within 10mm
      const checkLimit = 100 // Check first 100 terms for performance
      
      setErr(`Checking ${Math.min(checkLimit, allTerms.length)} terms (this may take a moment)...`)
      
      for (let i = 0; i < Math.min(checkLimit, allTerms.length); i++) {
        const term = allTerms[i]
        
        try {
          const locRes = await fetch(
            `${API_BASE}/query/${encodeURIComponent(term)}/locations?limit=50`,
            { signal: AbortSignal.timeout(3000) } // 3 second timeout per term
          )
          
          if (!locRes.ok) continue
          
          const locData = await locRes.json()
          const locations = locData?.results || []
          
          // Check if any location is within radius of our coordinate
          const hasMatch = locations.some(loc => {
            const dx = (loc.x || 0) - x
            const dy = (loc.y || 0) - y
            const dz = (loc.z || 0) - z
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
            return distance <= radius
          })
          
          if (hasMatch) {
            matchingTerms.push(term)
          }
        } catch (e) {
          // Skip failed queries (timeout or network error)
          continue
        }
        
        // Update progress every 10 terms
        if ((i + 1) % 10 === 0) {
          setErr(`Checked ${i + 1}/${Math.min(checkLimit, allTerms.length)} terms... Found ${matchingTerms.length} matches so far.`)
        }
      }
      
      setTerms(matchingTerms)
      setErr('')
      
      if (matchingTerms.length === 0) {
        setErr(`No terms found within ${radius}mm of coordinates (${x}, ${y}, ${z}). Checked ${Math.min(checkLimit, allTerms.length)} terms. Try different coordinates or a larger brain region.`)
      }
    } catch (e) {
      setErr(`Failed to decode location: ${e?.message || e}`)
      setTerms([])
    } finally {
      setLoading(false)
    }
  }

  const handlePresetLocation = (preset) => {
    setX(preset.x)
    setY(preset.y)
    setZ(preset.z)
  }

  const presets = [
    { name: 'Amygdala (L)', x: -24, y: -4, z: -18, desc: 'Emotion processing' },
    { name: 'Amygdala (R)', x: 24, y: -4, z: -18, desc: 'Emotion processing' },
    { name: 'Hippocampus (L)', x: -28, y: -20, z: -12, desc: 'Memory formation' },
    { name: 'Visual Cortex', x: 0, y: -90, z: 0, desc: 'Visual processing' },
    { name: 'Motor Cortex', x: -42, y: -22, z: 58, desc: 'Movement control' },
    { name: 'Prefrontal (L)', x: -40, y: 46, z: 4, desc: 'Decision making' },
    { name: 'Broca\'s Area', x: -44, y: 12, z: 20, desc: 'Language production' },
    { name: 'Wernicke\'s Area', x: -56, y: -40, z: 20, desc: 'Language comprehension' },
  ]

  return (
    <div className='location-decoder'>
      <div className="decoder-header">
        <h3 className="decoder-title">Reverse Location Lookup</h3>
        <p className="decoder-subtitle">Enter brain coordinates to find related terms</p>
      </div>

      {/* Coordinate Input */}
      <div className="decoder-inputs">
        <div className="decoder-input-group">
          <label className="decoder-label">X (Left/Right)</label>
          <input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value) || 0)}
            className="decoder-input"
            step="1"
          />
        </div>
        <div className="decoder-input-group">
          <label className="decoder-label">Y (Post/Ant)</label>
          <input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value) || 0)}
            className="decoder-input"
            step="1"
          />
        </div>
        <div className="decoder-input-group">
          <label className="decoder-label">Z (Inf/Sup)</label>
          <input
            type="number"
            value={z}
            onChange={(e) => setZ(Number(e.target.value) || 0)}
            className="decoder-input"
            step="1"
          />
        </div>
        <button
          onClick={handleDecode}
          disabled={loading}
          className="decoder-button"
        >
          {loading ? (
            <>
              <span className="decoder-spinner"></span>
              Searching...
            </>
          ) : (
            <>
              <svg className="decoder-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Find Terms
            </>
          )}
        </button>
      </div>

      {/* Preset Locations */}
      <div className="decoder-presets">
        <div className="decoder-presets-header">
          <svg className="decoder-presets-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="decoder-presets-label">Quick Brain Regions:</span>
        </div>
        <div className="decoder-presets-grid">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetLocation(preset)}
              className="decoder-preset-btn"
              title={`${preset.desc}\n(${preset.x}, ${preset.y}, ${preset.z})`}
            >
              <div className="decoder-preset-name">{preset.name}</div>
              <div className="decoder-preset-coords">
                ({preset.x}, {preset.y}, {preset.z})
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="decoder-loading">
          <div className="decoder-loading-bar"></div>
          <p>Searching through brain function database...</p>
          <p className="decoder-loading-note">
            (Checking proximity within 10mm radius)
          </p>
        </div>
      )}

      {/* Error Message */}
      {err && !loading && (
        <div className="decoder-error">
          <svg className="decoder-error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {err}
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && terms.length > 0 && (
        <div className="decoder-results">
          <div className="decoder-results-header">
            <svg className="decoder-results-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <h4>Found {terms.length} Related Terms</h4>
            <p>at coordinates ({x}, {y}, {z})</p>
          </div>
          
          <ul className="decoder-results-list">
            {terms.map((term, idx) => (
              <li key={`${term}-${idx}`} className="decoder-result-item">
                <span className="decoder-result-term">{term}</span>
                <button
                  onClick={() => onSelectTerm?.(term)}
                  className="decoder-result-btn"
                  title="Use this term for search"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Use Term
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasSearched && (
        <div className="decoder-empty">
          <svg className="decoder-empty-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p>Enter brain coordinates and click "Find Terms"</p>
          <p className="decoder-empty-hint">Or try one of the preset locations above</p>
        </div>
      )}
    </div>
  )
}
