'use client';

import Navbar from '../Navbar/Navbar';
import TermsModal from './TermsModal';
import { TERMS_AND_CONDITIONS_HTML } from '../../constants/termsAndConditions';
import { useCheckoutForm } from '../../hooks/useCheckoutForm';
import CheckoutItem from './CheckoutItem';
import CheckoutCityMobileModal from './CheckoutCityMobileModal';
import CheckoutFormSection from './CheckoutFormSection';
import CheckoutSummaryTotals from './CheckoutSummaryTotals';
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

  const cityProps = {
    cityDesktopOpen,
    cityDesktopPopoverRef,
    cityDesktopInputRef,
    cityQuery,
    setCityQuery,
    filteredCities,
    openCityPicker,
    cityMobileOpen,
    onCitySelect: handleCitySelect,
  };

  const summaryProps = {
    total,
    shippingCost,
    grandTotal,
    cartSyncing,
    shippingLoading,
    canSubmit,
    processing,
  };

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

      <CheckoutCityMobileModal
        open={cityMobileOpen}
        cityQuery={cityQuery}
        setCityQuery={setCityQuery}
        filteredCities={filteredCities}
        cityMobileSheetRef={cityMobileSheetRef}
        cityMobileInputRef={cityMobileInputRef}
        onClose={() => setCityMobileOpen(false)}
        onSelect={handleCitySelect}
        selectedCityId={form.cityId}
      />

      <main className="checkout__main">
        {submitError && (
          <div className="checkout__submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form className="checkout__grid" onSubmit={handleSubmit} noValidate>
          <CheckoutFormSection
            form={form}
            errors={errors}
            handleChange={handleChange}
            setTermsOpen={setTermsOpen}
            cityProps={cityProps}
          />

          {/* Desktop summary */}
          <section className="checkout__col checkout__col--summary checkout__summary-desktop" aria-label="Resumen de compra">
            <h2 className="checkout__summary-title">Resumen de compra</h2>
            <div className="checkout__summary-scroll">
              <ul className="checkout__items" aria-label="Artículos en el carrito">
                {items.map(({ product, quantity: qty }) => (
                  <CheckoutItem key={product.id} product={product} quantity={qty} onUpdateQuantity={updateQuantity} />
                ))}
              </ul>
              <a href="/" className="checkout__add-more">+ Agregar más productos</a>
            </div>
            <div className="checkout__summary-bottom">
              <CheckoutSummaryTotals {...summaryProps} />
            </div>
          </section>

          {/* Mobile bottom sheet summary */}
          <section
            ref={summaryRef}
            className={`checkout__col checkout__col--summary checkout__summary-mobile${mobileSummaryOpen ? ' checkout__col--summary-open' : ' checkout__col--summary-collapsed'}`}
            aria-labelledby="summary-title-mobile"
            onTouchStart={handleSummaryTouchStart}
            onTouchMove={handleSummaryTouchMove}
            onTouchEnd={handleSummaryTouchEnd}
          >
            <button type="button" className="checkout__sheet-tapArea" onClick={() => animateSummaryTo(!mobileSummaryOpen)} aria-label="Abrir o cerrar resumen">
              <div className="checkout__sheet-handle" aria-hidden="true" />
            </button>

            <div className="checkout__summary-head">
              <h2 className="checkout__summary-title" id="summary-title-mobile">Resumen</h2>
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
                  <CheckoutItem key={product.id} product={product} quantity={qty} onUpdateQuantity={updateQuantity} />
                ))}
              </ul>
              <a href="/" className="checkout__add-more">+ Agregar más productos</a>
              <hr className="checkout__divider" />
            </div>

            <div className="checkout__summary-sticky">
              <CheckoutSummaryTotals {...summaryProps} />
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
