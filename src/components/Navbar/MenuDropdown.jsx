'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import './MenuDropdown.css';

const menuItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Negocios', path: '/' },
  { label: 'Categorías', path: '/' },
  { label: 'Cómo funciona', path: '/' },
  { label: 'Contacto', path: '/' },
];

function MenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="menu-dropdown" ref={dropdownRef}>
      <button
        className="menu-dropdown__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        <span className="menu-dropdown__bar" />
        <span className="menu-dropdown__bar" />
        <span className="menu-dropdown__bar" />
      </button>

      {isOpen && (
        <ul className="menu-dropdown__list" role="menu">
          {menuItems.map((item) => (
            <li key={item.label} className="menu-dropdown__item" role="menuitem">
              <Link href={item.path} onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MenuDropdown;
