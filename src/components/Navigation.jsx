import { useState } from 'react';
import './Navigation.css';

export default function Navigation({ currentPage, onPageChange }) {
  const pages = [
    { id: 'terms', label: 'Neural Terms', desc: 'Search by keywords' },
    { id: 'studies', label: 'Research Studies', desc: 'Browse publications' },
    { id: 'locations', label: 'Brain Locations', desc: 'Explore coordinates' }
  ];

  return (
    <nav className="nav">
      <div className="nav__container">
        {pages.map(page => (
          <button
            key={page.id}
            className={`nav__item ${currentPage === page.id ? 'nav__item--active' : ''}`}
            onClick={() => onPageChange(page.id)}
          >
            <span className="nav__label">{page.label}</span>
            <span className="nav__desc">{page.desc}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
