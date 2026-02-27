'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAllCities } from '../../hooks/useAllCities';
import { useShippingQuote } from '../../hooks/useShippingQuote';
import graphqlGuestClient from '../../lib/graphqlGuestClient';
import { CREATE_GUEST_CART, ADD_PRODUCTS_TO_CART, CREATE_CHECKOUT_PAYMENT } from '../../graphql/checkout/mutations';
import Navbar from '../Navbar/Navbar';
import TermsModal from './TermsModal';
import { TERMS_AND_CONDITIONS_HTML } from '../../constants/termsAndConditions';
import './Checkout.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);

const ID_TYPES = ['C.C', 'C.E', 'Pasaporte', 'NIT'];
const PAYMENT_METHODS = ['Nequi', 'VISA', 'Mastercard', 'G Pay', 'Pay'];

function stableCartSignature(items) {
  return (items || [])
    .map((i) => `${i?.product?.sku || i?.product?.id}:${i?.quantity || 0}`)
    .sort()
    .join('|');
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, updateQuantity, clearCart } = useCart();
  const { data: citiesData } = useAllCities();

  const cities = useMemo(() => {
    const list = citiesData?.allCities?.items || [];
    return [...list].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'es'));
  }, [citiesData]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    idType: 'C.C',
    idNumber: '',
    phone: '',
    cityId: '',
    cityName: '',
    address: '',
    department: '',
    regionId: '',
    acceptTerms: false,
    acceptData: false,
  });

  const [termsOpen, setTermsOpen] = useState(false);

  // ✅ Mobile summary bottom-sheet
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // ✅ City picker: separate states for desktop vs mobile
  const [cityDesktopOpen, setCityDesktopOpen] = useState(false);
  const [cityMobileOpen, setCityMobileOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const cityDesktopPopoverRef = useRef(null);
  const cityDesktopInputRef = useRef(null);

  const cityMobileSheetRef = useRef(null);
  const cityMobileInputRef = useRef(null);

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => String(c?.name || '').toLowerCase().includes(q));
  }, [cities, cityQuery]);

  // ✅ swipe handling (mobile)
  const summaryRef = useRef(null);
  const swipeStartYRef = useRef(null);
  const swipeDeltaRef = useRef(0);

  const animateSummaryTo = (open) => {
    const el = summaryRef.current;
    if (!el) {
      setMobileSummaryOpen(open);
      return;
    }
    el.classList.add('checkout__sheet-animating');
    window.requestAnimationFrame(() => setMobileSummaryOpen(open));
    window.setTimeout(() => el.classList.remove('checkout__sheet-animating'), 360);
  };

  const handleSummaryTouchStart = (e) => {
    const y = e.touches?.[0]?.clientY;
    if (typeof y !== 'number') return;
    swipeStartYRef.current = y;
    swipeDeltaRef.current = 0;
  };

  const handleSummaryTouchMove = (e) => {
    const startY = swipeStartYRef.current;
    const y = e.touches?.[0]?.clientY;
    if (typeof startY !== 'number' || typeof y !== 'number') return;
    swipeDeltaRef.current = y - startY;
  };

  const handleSummaryTouchEnd = () => {
    const delta = swipeDeltaRef.current;
    swipeStartYRef.current = null;
    swipeDeltaRef.current = 0;

    const THRESHOLD = 30;
    if (delta < -THRESHOLD) animateSummaryTo(true);
    if (delta > THRESHOLD) animateSummaryTo(false);
  };

  // ✅ Desktop: close city popover on outside click / ESC
  useEffect(() => {
    if (!cityDesktopOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setCityDesktopOpen(false);
    };

    const onPointerDown = (e) => {
      const pop = cityDesktopPopoverRef.current;
      if (!pop) return;
      if (pop.contains(e.target)) return;
      setCityDesktopOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);

    const t = window.setTimeout(() => {
      try {
        cityDesktopInputRef.current?.focus?.({ preventScroll: true });
      } catch {
        cityDesktopInputRef.current?.focus?.();
      }
    }, 0);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
      window.clearTimeout(t);
    };
  }, [cityDesktopOpen]);

  // ✅ Mobile: keep city modal ABOVE keyboard via VisualViewport -> sets CSS var --kb
  useEffect(() => {
    if (!cityMobileOpen) return;

    const root = document.documentElement;

    const updateKb = () => {
      const vv = window.visualViewport;
      if (!vv) {
        root.style.setProperty('--kb', '0px');
        return;
      }

      // difference between layout viewport and visual viewport + offsetTop
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--kb', `${kb}px`);
    };

    updateKb();

    window.visualViewport?.addEventListener('resize', updateKb);
    window.visualViewport?.addEventListener('scroll', updateKb);

    const t = window.setTimeout(() => {
      try {
        cityMobileInputRef.current?.focus?.({ preventScroll: true });
      } catch {
        cityMobileInputRef.current?.focus?.();
      }
      // bring sheet into view for some Android browsers
      cityMobileSheetRef.current?.scrollIntoView?.({ block: 'end', behavior: 'smooth' });
    }, 120);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateKb);
      window.visualViewport?.removeEventListener('scroll', updateKb);
      window.clearTimeout(t);
      root.style.setProperty('--kb', '0px');
    };
  }, [cityMobileOpen]);

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canSubmit = useMemo(() => {
    if (processing) return false;
    if (!items?.length) return false;
    if (!form.firstName.trim()) return false;
    if (!form.lastName.trim()) return false;
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return false;
    if (!form.idNumber.trim()) return false;
    if (!form.phone.trim()) return false;
    if (!form.cityId) return false;
    if (!form.address.trim()) return false;
    if (!form.regionId || !Number.isFinite(Number(form.regionId))) return false;
    if (!form.acceptTerms) return false;
    if (!form.acceptData) return false;
    return true;
  }, [processing, items, form]);

  const [estimateCartId, setEstimateCartId] = useState('');
  const [cartSyncing, setCartSyncing] = useState(false);
  const syncNonceRef = useRef(0);

  const cartSignature = useMemo(() => stableCartSignature(items), [items]);

  useEffect(() => {
    let cancelled = false;

    async function rebuildEstimateCart() {
      if (!items?.length) {
        setEstimateCartId('');
        return;
      }

      setCartSyncing(true);
      const nonce = ++syncNonceRef.current;

      try {
        const cartData = await graphqlGuestClient.request(CREATE_GUEST_CART);
        const newCartId = cartData?.createGuestCart?.cart?.id;
        if (!newCartId) throw new Error('No se pudo crear el carrito para cotización.');

        const cartItems = items.map((i) => ({
          parent_sku: i.product.parent_sku || null,
          sku: i.product.sku || i.product.id,
          quantity: i.quantity,
        }));

        const addRes = await graphqlGuestClient.request(ADD_PRODUCTS_TO_CART, {
          cartId: newCartId,
          cartItems,
        });

        const userErrors = addRes?.addProductsToCart?.user_errors || [];
        if (userErrors.length)
          throw new Error(userErrors[0]?.message || 'Error agregando productos al carrito (cotización).');

        if (!cancelled && nonce === syncNonceRef.current) setEstimateCartId(newCartId);
      } catch (e) {
        console.error('Estimate cart rebuild error:', e);
        if (!cancelled) setEstimateCartId('');
      } finally {
        if (!cancelled && nonce === syncNonceRef.current) setCartSyncing(false);
      }
    }

    rebuildEstimateCart();
    return () => {
      cancelled = true;
    };
  }, [cartSignature, items]);

  const { data: estimateData, isFetching: shippingLoading } = useShippingQuote({
    cartId: estimateCartId,
    city: form.cityName,
    street: form.address ? [form.address] : [],
  });

  const shippingCost = estimateData?.estimateShippingMethods?.[0]?.amount?.value ?? null;
  const grandTotal = total + (shippingCost || 0);

  const clearFieldError = (name) => {
    if (!errors[name]) return;
    setErrors((prev) => {
      const n = { ...prev };
      delete n[name];
      return n;
    });
  };

  const handleCitySelect = (city) => {
    setForm((f) => ({
      ...f,
      cityId: String(city?.id || ''),
      cityName: city?.name || '',
      department: city?.region?.name || '',
      regionId: city?.region?.id ? String(city.region.id) : '',
    }));
    clearFieldError('cityId');
    setCityDesktopOpen(false);
    setCityMobileOpen(false);
    setCityQuery('');
  };

  const openCityPicker = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      setCityMobileOpen(true);
    } else {
      setCityDesktopOpen(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'cityId') {
      const city = cities.find((c) => String(c.id) === String(value)) || null;

      setForm((f) => ({
        ...f,
        cityId: value,
        cityName: city?.name || '',
        department: city?.region?.name || '',
        regionId: city?.region?.id ? String(city.region.id) : '',
      }));

      clearFieldError('cityId');
      return;
    }

    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    clearFieldError(name);
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Requerido';
    if (!form.lastName.trim()) errs.lastName = 'Requerido';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (!form.idNumber.trim()) errs.idNumber = 'Requerido';
    if (!form.phone.trim()) errs.phone = 'Requerido';
    if (!form.cityId) errs.cityId = 'Selecciona una ciudad';
    if (!form.address.trim()) errs.address = 'Requerido';
    if (!form.regionId || !Number.isFinite(Number(form.regionId))) errs.cityId = 'Selecciona una ciudad válida';
    if (!form.acceptTerms) errs.acceptTerms = 'Debes aceptar los términos';
    if (!form.acceptData) errs.acceptData = 'Debes autorizar el tratamiento de datos';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setProcessing(true);
    setSubmitError('');

    const firstname = form.firstName.trim();
    const lastname = form.lastName.trim();

    try {
      const cartData = await graphqlGuestClient.request(CREATE_GUEST_CART);
      const checkoutCartId = cartData?.createGuestCart?.cart?.id;
      if (!checkoutCartId) throw new Error('No se pudo crear el carrito invitado.');

      const cartItems = items.map((i) => ({
        parent_sku: i.product.parent_sku || null,
        sku: i.product.sku || i.product.id,
        quantity: i.quantity,
      }));

      const addRes = await graphqlGuestClient.request(ADD_PRODUCTS_TO_CART, { cartId: checkoutCartId, cartItems });
      const userErrors = addRes?.addProductsToCart?.user_errors || [];
      if (userErrors.length) throw new Error(userErrors[0]?.message || 'Error agregando productos al carrito.');

      const regionIdInt = Number(form.regionId);

      const checkoutPaymentRes = await graphqlGuestClient.request(CREATE_CHECKOUT_PAYMENT, {
        cartId: checkoutCartId,
        email: form.email,
        firstname,
        lastname,
        street: form.address,
        city: form.cityName,
        regionId: regionIdInt,
        telephone: form.phone,
      });

      const payment = checkoutPaymentRes?.CreateCheckoutPayment?.payment || null;
      const paymentUrl = payment?.url_payment || null;

      clearCart();

      if (paymentUrl) window.location.href = paymentUrl;
      else throw new Error('No se recibió la URL de pago.');
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError(err?.message || 'Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
      setProcessing(false);
    }
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