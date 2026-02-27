'use client';

import Navbar from '../Navbar/Navbar';
import TermsModal from './TermsModal';
import { TERMS_AND_CONDITIONS_HTML } from '../../constants/termsAndConditions';
import { formatPrice } from '../../utils/format';
import { useCheckoutForm, ID_TYPES, PAYMENT_METHODS } from '../../hooks/useCheckoutForm';
import './Checkout.css';

export default function CheckoutForm() {
  const {
    form,
    errors,
    processing,
    submitError,
    termsOpen,
    setTermsOpen,
    items,
    total,
    shippingCost,
    grandTotal,
    cartSyncing,
    shippingLoading,
    canSubmit,
    updateQuantity,
    cityDesktopOpen,
    cityMobileOpen,
    setCityMobileOpen,
    cityQuery,
    setCityQuery,
    filteredCities,
    cityDesktopPopoverRef,
    cityDesktopInputRef,
    cityMobileSheetRef,
    cityMobileInputRef,
    mobileSummaryOpen,
    summaryRef,
    handleChange,
    handleCitySelect,
    openCityPicker,
    handleSubmit,
    animateSummaryTo,
    handleSummaryTouchStart,
    handleSummaryTouchMove,
    handleSummaryTouchEnd,
    router,
  } = useCheckoutForm();

  if (items.length === 0 && !processing) {
    return (
      <div className="checkout">
        <Navbar />
        <main className="checkout__empty">
          <p>Tu carrito está vacío.</p>
          <button className="checkout__back-btn" onClick={() => router.push('/')}>
            Volver al inicio
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="checkout">
      <Navbar />

      <TermsModal open={termsOpen} html={TERMS_AND_CONDITIONS_HTML} onClose={() => setTermsOpen(false)} />

      {/* ✅ Mobile city modal ONLY */}
      {cityMobileOpen && (
        <div className="checkout__cityModal" role="dialog" aria-modal="true" aria-label="Seleccionar ciudad">
          <button
            type="button"
            className="checkout__cityBackdrop"
            onClick={() => {
              setCityMobileOpen(false);
              setCityQuery('');
            }}
            aria-label="Cerrar"
          />
          <div className="checkout__citySheet" ref={cityMobileSheetRef}>
            <div className="checkout__citySheetHead">
              <p className="checkout__citySheetTitle">Ciudad</p>
              <button
                type="button"
                className="checkout__cityClose"
                onClick={() => {
                  setCityMobileOpen(false);
                  setCityQuery('');
                }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <input
              ref={cityMobileInputRef}
              className="checkout__input checkout__citySearch"
              type="search"
              placeholder="Buscar ciudad…"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              autoFocus
            />

            <div className="checkout__cityList" role="listbox" aria-label="Lista de ciudades">
              {filteredCities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="checkout__cityOption"
                  onClick={() => handleCitySelect(c)}
                  role="option"
                  aria-selected={String(form.cityId) === String(c.id)}
                >
                  <span>{c.name}</span>
                  <span className="checkout__cityDept">{c?.region?.name || ''}</span>
                </button>
              ))}
              {filteredCities.length === 0 ? <p className="checkout__cityEmpty">No encontramos esa ciudad.</p> : null}
            </div>
          </div>
        </div>
      )}

      <main className="checkout__main">
        {submitError && (
          <div className="checkout__submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form className="checkout__grid" onSubmit={handleSubmit} noValidate>
          {/* Left */}
          <section className="checkout__col checkout__col--form" aria-labelledby="form-title">
            <h2 className="checkout__col-title" id="form-title">
              Datos de envío
            </h2>

            <div className="checkout__row checkout__row--names">
              <div className="checkout__field">
                <input
                  name="firstName"
                  type="text"
                  className={`checkout__input${errors.firstName ? ' checkout__input--error' : ''}`}
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Nombre*"
                  aria-label="Nombre"
                  autoComplete="given-name"
                />
                {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
              </div>

              <div className="checkout__field">
                <input
                  name="lastName"
                  type="text"
                  className={`checkout__input${errors.lastName ? ' checkout__input--error' : ''}`}
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Apellidos*"
                  aria-label="Apellidos"
                  autoComplete="family-name"
                />
                {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="checkout__field checkout__field--full">
              <input
                name="email"
                type="email"
                className={`checkout__input${errors.email ? ' checkout__input--error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="Correo"
                aria-label="Correo"
                autoComplete="email"
              />
              {errors.email && <span className="checkout__error">{errors.email}</span>}
            </div>

            <div className="checkout__row">
              <div className="checkout__field">
                <select
                  name="idType"
                  className="checkout__input checkout__select"
                  value={form.idType}
                  onChange={handleChange}
                  aria-label="Tipo de identificación"
                >
                  {ID_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checkout__field">
                <input
                  name="idNumber"
                  type="text"
                  className={`checkout__input${errors.idNumber ? ' checkout__input--error' : ''}`}
                  value={form.idNumber}
                  onChange={handleChange}
                  placeholder="Número de identificación"
                  aria-label="Número de identificación"
                />
                {errors.idNumber && <span className="checkout__error">{errors.idNumber}</span>}
              </div>
            </div>

            <div className="checkout__field checkout__field--full">
              <input
                name="phone"
                type="tel"
                className={`checkout__input${errors.phone ? ' checkout__input--error' : ''}`}
                value={form.phone}
                onChange={handleChange}
                placeholder="Teléfono"
                aria-label="Teléfono"
                autoComplete="tel"
              />
              {errors.phone && <span className="checkout__error">{errors.phone}</span>}
            </div>

            {/* ✅ City field with DESKTOP inline popover */}
            <div className="checkout__field checkout__field--full checkout__cityField">
              <button
                type="button"
                className={`checkout__input checkout__cityBtn${errors.cityId ? ' checkout__input--error' : ''}`}
                onClick={openCityPicker}
                aria-label="Ciudad"
                aria-expanded={cityDesktopOpen || cityMobileOpen}
              >
                <span className={form.cityName ? '' : 'checkout__cityPlaceholder'}>{form.cityName || 'Ciudad'}</span>
                <span aria-hidden="true" className="checkout__cityChevron">
                  ▾
                </span>
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
                      <button
                        key={c.id}
                        type="button"
                        className="checkout__cityOption"
                        onClick={() => handleCitySelect(c)}
                        role="option"
                        aria-selected={String(form.cityId) === String(c.id)}
                      >
                        <span>{c.name}</span>
                        <span className="checkout__cityDept">{c?.region?.name || ''}</span>
                      </button>
                    ))}
                    {filteredCities.length === 0 ? <p className="checkout__cityEmpty">No encontramos esa ciudad.</p> : null}
                  </div>
                </div>
              )}
            </div>

            <div className="checkout__field checkout__field--full">
              <input
                name="address"
                type="text"
                className={`checkout__input${errors.address ? ' checkout__input--error' : ''}`}
                value={form.address}
                onChange={handleChange}
                placeholder="Dirección"
                aria-label="Dirección"
                autoComplete="street-address"
              />
              {errors.address && <span className="checkout__error">{errors.address}</span>}
            </div>

            <div className="checkout__field checkout__field--full">
              <input
                name="department"
                type="text"
                className="checkout__input checkout__input--readonly"
                value={form.department}
                readOnly
                placeholder="Departamento"
                aria-label="Departamento"
              />
            </div>

            <label className={`checkout__checkbox${errors.acceptTerms ? ' checkout__checkbox--error' : ''}`}>
              <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
              <span>
                Aceptar{' '}
                <button type="button" className="checkout__link checkout__link--btn" onClick={() => setTermsOpen(true)}>
                  Términos y Condiciones
                </button>
              </span>
            </label>
            {errors.acceptTerms && <span className="checkout__error">{errors.acceptTerms}</span>}

            <label className={`checkout__checkbox${errors.acceptData ? ' checkout__checkbox--error' : ''}`}>
              <input type="checkbox" name="acceptData" checked={form.acceptData} onChange={handleChange} />
              <span>Autorizo el tratamiento de mis datos personales</span>
            </label>
            {errors.acceptData && <span className="checkout__error">{errors.acceptData}</span>}

            <hr className="checkout__form-divider" />
            <p className="checkout__payment-label">Pago en línea</p>
            <div className="checkout__payment-logos" aria-label="Métodos de pago aceptados">
              {PAYMENT_METHODS.map((m) => (
                <span key={m} className="checkout__payment-logo">
                  {m}
                </span>
              ))}
            </div>
          </section>

          {/* Desktop summary */}
          <section className="checkout__col checkout__col--summary checkout__summary-desktop" aria-label="Resumen de compra">
            <h2 className="checkout__summary-title">Resumen de compra</h2>

            <div className="checkout__summary-scroll">
              <ul className="checkout__items" aria-label="Artículos en el carrito">
                {items.map(({ product, quantity: qty }) => (
                  <li key={product.id} className="checkout__item">
                    <img className="checkout__item-img" src={product.image} alt={product.name} />
                    <div className="checkout__item-info">
                      <p className="checkout__item-name">{product.name}</p>
                      <div className="checkout__item-qty" role="group" aria-label={`Cantidad de ${product.name}`}>
                        <button type="button" className="checkout__qty-btn" onClick={() => updateQuantity(product.id, qty - 1)} aria-label="Reducir">
                          −
                        </button>
                        <span aria-live="polite">{qty}</span>
                        <button type="button" className="checkout__qty-btn" onClick={() => updateQuantity(product.id, qty + 1)} aria-label="Aumentar">
                          +
                        </button>
                      </div>
                    </div>
                    <p className="checkout__item-price">{formatPrice(product.price * qty)}</p>
                  </li>
                ))}
              </ul>

              <a href="/" className="checkout__add-more">
                + Agregar más productos
              </a>
            </div>

            <div className="checkout__summary-bottom">
              <hr className="checkout__divider" />

              <div className="checkout__summary">
                <div className="checkout__summary-row">
                  <span>Costo de envío</span>
                  <span>{cartSyncing || shippingLoading ? '...' : shippingCost !== null ? formatPrice(shippingCost) : '$0'}</span>
                </div>

                <div className="checkout__summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <hr className="checkout__divider" />

              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>

              <button
                type="submit"
                className="checkout__pay-btn"
                disabled={!canSubmit}
                aria-busy={processing}
                aria-disabled={!canSubmit}
                title={!canSubmit ? 'Completa todos los campos requeridos para continuar.' : undefined}
              >
                {processing ? 'Procesando…' : 'Pagar'}
              </button>
            </div>
          </section>

          {/* Mobile bottom sheet summary */}
          <section
            ref={summaryRef}
            className={`checkout__col checkout__col--summary checkout__summary-mobile${
              mobileSummaryOpen ? ' checkout__col--summary-open' : ' checkout__col--summary-collapsed'
            }`}
            aria-labelledby="summary-title-mobile"
            onTouchStart={handleSummaryTouchStart}
            onTouchMove={handleSummaryTouchMove}
            onTouchEnd={handleSummaryTouchEnd}
          >
            <button type="button" className="checkout__sheet-tapArea" onClick={() => animateSummaryTo(!mobileSummaryOpen)} aria-label="Abrir o cerrar resumen">
              <div className="checkout__sheet-handle" aria-hidden="true" />
            </button>

            <div className="checkout__summary-head">
              <h2 className="checkout__summary-title" id="summary-title-mobile">
                Resumen
              </h2>

              <button type="button" className="checkout__summary-toggle" onClick={() => animateSummaryTo(!mobileSummaryOpen)} aria-expanded={mobileSummaryOpen}>
                {mobileSummaryOpen ? 'Ocultar detalle' : `Detalle (${items.length})`}
                <svg className="checkout__summary-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <div className={`checkout__summary-collapsible${mobileSummaryOpen ? ' checkout__summary-collapsible--open' : ''}`}>
              <ul className="checkout__items" aria-label="Artículos en el carrito">
                {items.map(({ product, quantity: qty }) => (
                  <li key={product.id} className="checkout__item">
                    <img className="checkout__item-img" src={product.image} alt={product.name} />
                    <div className="checkout__item-info">
                      <p className="checkout__item-name">{product.name}</p>
                      <div className="checkout__item-qty" role="group" aria-label={`Cantidad de ${product.name}`}>
                        <button type="button" className="checkout__qty-btn" onClick={() => updateQuantity(product.id, qty - 1)} aria-label="Reducir">
                          −
                        </button>
                        <span aria-live="polite">{qty}</span>
                        <button type="button" className="checkout__qty-btn" onClick={() => updateQuantity(product.id, qty + 1)} aria-label="Aumentar">
                          +
                        </button>
                      </div>
                    </div>
                    <p className="checkout__item-price">{formatPrice(product.price * qty)}</p>
                  </li>
                ))}
              </ul>

              <a href="/" className="checkout__add-more">
                + Agregar más productos
              </a>

              <hr className="checkout__divider" />
            </div>

            <div className="checkout__summary-sticky">
              <div className="checkout__summary">
                <div className="checkout__summary-row">
                  <span>Costo de envío</span>
                  <span>{cartSyncing || shippingLoading ? '...' : shippingCost !== null ? formatPrice(shippingCost) : '$0'}</span>
                </div>

                <div className="checkout__summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <hr className="checkout__divider" />

              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>

              <button
                type="submit"
                className="checkout__pay-btn"
                disabled={!canSubmit}
                aria-busy={processing}
                aria-disabled={!canSubmit}
                title={!canSubmit ? 'Completa todos los campos requeridos para continuar.' : undefined}
              >
                {processing ? 'Procesando…' : 'Pagar'}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
