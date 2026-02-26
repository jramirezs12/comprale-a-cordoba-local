'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAllCities } from '../../hooks/useAllCities';
import { useShippingQuote } from '../../hooks/useShippingQuote';
import graphqlGuestClient from '../../lib/graphqlGuestClient';
import {
  CREATE_GUEST_CART,
  ADD_PRODUCTS_TO_CART,
  CREATE_CHECKOUT_PAYMENT,
} from '../../graphql/checkout/mutations';
import Navbar from '../Navbar/Navbar';
import './Checkout.css';

const DEFAULT_CARRIER_CODE = 'envios';
const DEFAULT_METHOD_CODE = 'inter';
const DEFAULT_PAYMENT_CODE = 'payzen_standard';

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

  const cities = useMemo(() => citiesData?.allCities?.items || [], [citiesData]);

  const [form, setForm] = useState({
    fullName: '',
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

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Cart used ONLY for shipping estimation (to avoid duplication issues)
  const [estimateCartId, setEstimateCartId] = useState('');
  const [cartSyncing, setCartSyncing] = useState(false);
  const syncNonceRef = useRef(0);

  // Build a signature so we can re-sync when items/qty change
  const cartSignature = useMemo(() => stableCartSignature(items), [items]);

  // Keep estimate cart rebuilt when items change (safe without update/remove mutations)
  useEffect(() => {
    let cancelled = false;

    async function rebuildEstimateCart() {
      if (!items?.length) {
        setEstimateCartId('');
        return;
      }

      // If user hasn't selected city/address yet, we still rebuild the cart so that
      // once they select city/address the estimate can run instantly.
      setCartSyncing(true);
      const nonce = ++syncNonceRef.current;

      try {
        const cartData = await graphqlGuestClient.request(CREATE_GUEST_CART);
        const newCartId = cartData?.createGuestCart?.cart?.id;
        if (!newCartId) throw new Error('No se pudo crear el carrito para cotización.');

        // Add items once to this fresh cart
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
        if (userErrors.length) throw new Error(userErrors[0]?.message || 'Error agregando productos al carrito (cotización).');

        // Only apply if latest run
        if (!cancelled && nonce === syncNonceRef.current) {
          setEstimateCartId(newCartId);
        }
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

  // Estimator: runs when estimateCartId + city + address are present
  const { data: estimateData, isFetching: shippingLoading } = useShippingQuote({
    cartId: estimateCartId,
    city: form.cityName,
    street: form.address ? [form.address] : [],
  });

  // RESPONSE IS ARRAY: estimateShippingMethods: [{ amount { value } }]
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
    if (!form.fullName.trim()) errs.fullName = 'Requerido';
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

    const nameParts = form.fullName.trim().split(/\s+/);
    const firstname = nameParts[0] || form.fullName.trim();
    const lastname = nameParts.slice(1).join(' ') || '';

    try {
      // Checkout cart (separate from estimate cart)
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

            <div className="checkout__field checkout__field--full">
              <input
                name="fullName"
                type="text"
                className={`checkout__input${errors.fullName ? ' checkout__input--error' : ''}`}
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nombre completo*"
                aria-label="Nombre completo"
                autoComplete="name"
              />
              {errors.fullName && <span className="checkout__error">{errors.fullName}</span>}
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

            <div className="checkout__field checkout__field--full">
              <select
                name="cityId"
                className={`checkout__input checkout__select${errors.cityId ? ' checkout__input--error' : ''}`}
                value={form.cityId}
                onChange={handleChange}
                aria-label="Ciudad"
              >
                <option value="">Ciudad</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.cityId && <span className="checkout__error">{errors.cityId}</span>}
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
                <a href="#" className="checkout__link">
                  Términos y Condiciones
                </a>
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

          {/* Right */}
          <section className="checkout__col checkout__col--summary" aria-labelledby="summary-title">
            <h2 className="checkout__summary-title" id="summary-title">
              Resumen de compra
            </h2>

            <ul className="checkout__items" aria-label="Artículos en el carrito">
              {items.map(({ product, quantity: qty }) => (
                <li key={product.id} className="checkout__item">
                  <img className="checkout__item-img" src={product.image} alt={product.name} />

                  <div className="checkout__item-info">
                    <p className="checkout__item-name">{product.name}</p>
                    <div className="checkout__item-qty" role="group" aria-label={`Cantidad de ${product.name}`}>
                      <button
                        type="button"
                        className="checkout__qty-btn"
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        aria-label="Reducir"
                      >
                        −
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        className="checkout__qty-btn"
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        aria-label="Aumentar"
                      >
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

            <div className="checkout__summary-spacer" />

            <div className="checkout__summary">
              <div className="checkout__summary-row">
                <span>Costo de envío</span>
                <span>
                  {cartSyncing || shippingLoading
                    ? '...'
                    : shippingCost !== null
                      ? formatPrice(shippingCost)
                      : '$0'}
                </span>
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

            <button type="submit" className="checkout__pay-btn" disabled={processing} aria-busy={processing}>
              {processing ? 'Procesando…' : 'Pagar'}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}