'use client';
export default function CheckoutCityField({ form, errors, cityDesktopOpen, cityDesktopPopoverRef, cityDesktopInputRef, cityQuery, setCityQuery, filteredCities, openCityPicker, cityMobileOpen, handleCitySelect }) {
  return (
    <div className="checkout__field checkout__field--full checkout__cityField">
      <button
        type="button"
        className={`checkout__input checkout__cityBtn${errors.cityId ? ' checkout__input--error' : ''}`}
        onClick={openCityPicker}
        aria-label="Ciudad"
        aria-expanded={cityDesktopOpen || cityMobileOpen}
      >
        <span className={form.cityName ? '' : 'checkout__cityPlaceholder'}>{form.cityName || 'Ciudad'}</span>
        <span aria-hidden="true" className="checkout__cityChevron">▾</span>
      </button>
      {errors.cityId && <span className="checkout__error">{errors.cityId}</span>}
      {cityDesktopOpen && (
        <div className="checkout__cityPopover" ref={cityDesktopPopoverRef} role="listbox" aria-label="Lista de ciudades">
          <input
            ref={cityDesktopInputRef}
            className="checkout__input checkout__citySearchInline"
            type="search"
            placeholder="Buscar ciudad…"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
          />
          <div className="checkout__cityListInline">
            {filteredCities.map((c) => (
              <button key={c.id} type="button" className="checkout__cityOption" onClick={() => handleCitySelect(c)} role="option" aria-selected={String(form.cityId) === String(c.id)}>
                <span>{c.name}</span>
                <span className="checkout__cityDept">{c?.region?.name || ''}</span>
              </button>
            ))}
            {filteredCities.length === 0 ? <p className="checkout__cityEmpty">No encontramos esa ciudad.</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
