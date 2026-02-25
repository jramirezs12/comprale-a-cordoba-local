'use client';

import { useState } from 'react';
import CategoryDrawer from './CategoryDrawer';
import './MenuDropdown.css';

function MenuDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="menu-dropdown">
      <button
        type="button"
        className="menu-dropdown__trigger"
        onClick={() => setOpen(true)}
        aria-label="Abrir categorías"
        aria-expanded={open}
      >
        <span className="menu-dropdown__bar" />
        <span className="menu-dropdown__bar" />
        <span className="menu-dropdown__bar" />
      </button>

      <CategoryDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default MenuDropdown;