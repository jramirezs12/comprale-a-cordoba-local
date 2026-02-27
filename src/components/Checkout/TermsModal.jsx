'use client';

import { useEffect } from 'react';
import './TermsModal.css';

function normalizeTermsHtml(html) {
  const input = String(html || '');

  // SSR safe
  if (typeof window === 'undefined') return input;

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');

  // Remove potentially unsafe tags
  const blocked = doc.querySelectorAll('script, iframe, object, embed, form, input, button, textarea, select, style');
  blocked.forEach((n) => n.remove());

  // Make links safe + clickable
  const links = doc.querySelectorAll('a[href]');
  links.forEach((a) => {
    let href = a.getAttribute('href') || '';

    // If link is like "www.mitimiti.com", make it https://
    if (/^www\./i.test(href)) href = `https://${href}`;

    // If missing protocol and looks like domain, also prefix https
    if (!/^https?:\/\//i.test(href) && /^[\w-]+\.[\w.-]+/i.test(href)) {
      href = `https://${href}`;
    }

    a.setAttribute('href', href);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  // Prevent huge <br> runs from looking odd: keep them but wrap in container (CSS handles spacing)
  return doc.body.innerHTML || input;
}

export default function TermsModal({ open, title = 'Términos y Condiciones', html, onClose }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const safeHtml = normalizeTermsHtml(html);

  return (
    <div className="terms-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="terms-modal__overlay" onClick={onClose} aria-hidden="true" />

      <div className="terms-modal__panel">
        <div className="terms-modal__header">
          <h3 className="terms-modal__title">{title}</h3>
          <button className="terms-modal__close" type="button" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="terms-modal__body">
          <div className="terms-modal__content" dangerouslySetInnerHTML={{ __html: safeHtml }} />
        </div>

        <div className="terms-modal__footer">
          <button className="terms-modal__ok" type="button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}