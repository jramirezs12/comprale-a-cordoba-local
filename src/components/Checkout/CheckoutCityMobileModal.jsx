'use client';
export default function CheckoutCityMobileModal({ open, cityQuery, setCityQuery, filteredCities, cityMobileSheetRef, cityMobileInputRef, onClose, onSelect, selectedCityId }) {
  if (!open) return null;
  return (
    <div className="checkout__cityModal" role="dialog" aria-modal="true" aria-label="Seleccionar ciudad">
      <button type="button" className="checkout__cityBackdrop" onClick={() => { onClose(); setCityQuery(''); }} aria-label="Cerrar" />
      <div className="checkout__citySheet" ref={cityMobileSheetRef}>
        <div className="checkout__citySheetHead">
          <p className="checkout__citySheetTitle">Ciudad</p>
          <button type="button" className="checkout__cityClose" onClick={() => { onClose(); setCityQuery(''); }} aria-label="Cerrar">✕</button>
        </div>
        <input ref={cityMobileInputRef} className="checkout__input checkout__citySearch" type="search" placeholder="Buscar ciudad…" value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} autoFocus />
        <div className="checkout__cityList" role="listbox" aria-label="Lista de ciudades">
          {filteredCities.map((c) => (
            <button key={c.id} type="button" className="checkout__cityOption" onClick={() => onSelect(c)} role="option" aria-selected={String(selectedCityId) === String(c.id)}>
              <span>{c.name}</span>
              <span className="checkout__cityDept">{c?.region?.name || ''}</span>
            </button>
          ))}
          {filteredCities.length === 0 ? <p className="checkout__cityEmpty">No encontramos esa ciudad.</p> : null}
        </div>
      </div>
    </div>
  );
}
