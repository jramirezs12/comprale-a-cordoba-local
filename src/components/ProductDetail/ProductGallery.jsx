'use client';

export default function ProductGallery({ gallery, activeImg, onSelectImage, productName }) {
  return (
    <div className="pdp__image-section">
      {gallery.length > 1 && (
        <div className="pdp__thumbnails" role="group" aria-label="Galería de imágenes del producto">
          {gallery.map((src, i) => (
            <button key={i} className={`pdp__thumb-btn${activeImg === i ? ' pdp__thumb-btn--active' : ''}`} onClick={() => onSelectImage(i)} aria-label={`Ver imagen ${i + 1} de ${gallery.length}`} aria-pressed={activeImg === i} type="button">
              <img src={src} alt="" className="pdp__thumb-img" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      <div className="pdp__image-card">
        <img className="pdp__main-image" src={gallery[activeImg]} alt={productName || 'Producto'} />
      </div>
    </div>
  );
}
