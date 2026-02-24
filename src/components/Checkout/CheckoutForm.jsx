'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAllCities } from '../../hooks/useAllCities';
import { useShippingQuote } from '../../hooks/useShippingQuote';
import graphqlGuestClient from '../../lib/graphqlGuestClient';
import {
  CREATE_GUEST_CART,
  DROPSHIPPING_ADD_PRODUCTS_TO_CART,
  ADD_PRODUCTS_TO_CART,
  SET_GUEST_EMAIL,
  SET_SHIPPING_ADDRESS,
  SET_BILLING_ADDRESS,
  SET_SHIPPING_METHODS,
  SET_PAYMENT_METHOD,
  PLACE_ORDER,
  REGISTRATE_PAYMENT,
} from '../../graphql/checkout/mutations';
import Navbar from '../Navbar/Navbar';
import './Checkout.css';

const DEFAULT_CARRIER_CODE = 'envios';
const DEFAULT_METHOD_CODE = 'inter';
const DEFAULT_PAYMENT_CODE = 'payzen_standard';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

const ID_TYPES = ['Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte', 'NIT'];

const PAYMENT_METHODS = ['PSE', 'Nequi', 'VISA', 'Mastercard', 'Daviplata'];

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, updateQuantity, clearCart } = useCart();
  const { data: citiesData } = useAllCities();

  const cities = useMemo(
    () => citiesData?.allCities?.items || [],
    [citiesData]
  );

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    idType: 'Cédula de ciudadanía',
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

  // Shipping quote – powered by react-query (no manual setState in effects)
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const firstProductId = items[0]?.product?.id;
  const { data: quoteData, isFetching: shippingLoading } = useShippingQuote({
    destinationCityName: form.cityName || undefined,
    productId: firstProductId,
    qty: totalQty,
  });
  const shippingCost = form.cityName && firstProductId ? (quoteData?.shippingQuote?.price ?? null) : null;
  const grandTotal = total + (shippingCost || 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'cityId') {
      const city = cities.find((c) => c.id === value) || null;
      setForm((f) => ({
        ...f,
        cityId: value,
        cityName: city?.name || '',
        department: city?.region?.name || '',
        regionId: city?.region?.id || '',
      }));
    } else {
      setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Requerido';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (!form.idNumber.trim()) errs.idNumber = 'Requerido';
    if (!form.phone.trim()) errs.phone = 'Requerido';
    if (!form.cityId) errs.cityId = 'Selecciona una ciudad';
    if (!form.address.trim()) errs.address = 'Requerido';
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

    // Split fullName into firstname / lastname for address fields
    const nameParts = form.fullName.trim().split(/\s+/);
    const firstname = nameParts[0] || form.fullName.trim();
    const lastname = nameParts.slice(1).join(' ') || '';

    try {
      // 1. Create guest cart
      const cartData = await graphqlGuestClient.request(CREATE_GUEST_CART);
      const cartId = cartData.createEmptyCart;

      // 2. Add products to cart (prefer dropshipping; fall back to standard)
      const dropshippingItems = items.map((i) => ({
        sku: String(i.product.sku || i.product.id),
        quantity: i.quantity,
        dropper_price: i.product.price,
      }));
      try {
        await graphqlGuestClient.request(DROPSHIPPING_ADD_PRODUCTS_TO_CART, {
          cartId,
          cartItems: dropshippingItems,
        });
      } catch {
        const standardItems = items.map((i) => ({
          parent_sku: i.product.parent_sku || i.product.sku || String(i.product.id),
          sku: i.product.sku || String(i.product.id),
          quantity: i.quantity,
        }));
        await graphqlGuestClient.request(ADD_PRODUCTS_TO_CART, { cartId, cartItems: standardItems });
      }

      // 3. Set guest email
      await graphqlGuestClient.request(SET_GUEST_EMAIL, { cartId, email: form.email });

      const addressArgs = {
        cartId,
        firstname,
        lastname,
        street: form.address,
        city: form.cityName,
        region: form.department,
        postcode: '000000',
        telephone: form.phone,
      };

      // 4. Set shipping address
      const shippingResult = await graphqlGuestClient.request(SET_SHIPPING_ADDRESS, addressArgs);

      // 5. Set billing address
      await graphqlGuestClient.request(SET_BILLING_ADDRESS, addressArgs);

      // 6. Set shipping method
      const availableMethods =
        shippingResult?.setShippingAddressesOnCart?.cart?.shipping_addresses?.[0]
          ?.available_shipping_methods || [];
      const selectedMethod =
        availableMethods.find(
          (m) => m.carrier_code === DEFAULT_CARRIER_CODE && m.method_code === DEFAULT_METHOD_CODE
        ) ||
        availableMethods[0] ||
        { carrier_code: DEFAULT_CARRIER_CODE, method_code: DEFAULT_METHOD_CODE };

      await graphqlGuestClient.request(SET_SHIPPING_METHODS, {
        cartId,
        carrierCode: selectedMethod.carrier_code,
        methodCode: selectedMethod.method_code,
      });

      // 7. Set payment method
      try {
        await graphqlGuestClient.request(SET_PAYMENT_METHOD, { cartId, code: DEFAULT_PAYMENT_CODE });
      } catch {
        await graphqlGuestClient.request(SET_PAYMENT_METHOD, { cartId, code: 'free' });
      }

      // 8. Place order
      const orderData = await graphqlGuestClient.request(PLACE_ORDER, { cartId });
      const orderNumber = orderData?.placeOrder?.order?.order_number || '';

      // 9. Register payment to get redirect URL
      let paymentUrl = null;
      if (orderNumber) {
        try {
          const paymentData = await graphqlGuestClient.request(REGISTRATE_PAYMENT, {
            orderId: String(orderNumber),
          });
          paymentUrl = paymentData?.registratePayment?.url_payment || null;
        } catch {
          // registratePayment may not be available; proceed to confirmation
        }
      }

      // 10. Clear cart and redirect
      clearCart();
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        router.push(`/checkout/confirmation?order=${orderNumber}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
      setProcessing(false);
    }
  };

  if (items.length === 0 && !processing) {
    return (
      <div className="checkout">
        <Navbar />
        <main className="checkout__empty">
          <p>Tu carrito está vacío.</p>
          <button className="checkout__back-btn" onClick={() => router.push('/')}>Volver al inicio</button>
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

          {/* Left column: form card */}
          <section className="checkout__col checkout__col--form" aria-labelledby="form-title">
            <h2 className="checkout__col-title" id="form-title">Datos de envío</h2>

            {/* 1. Nombre completo */}
            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="fullName">Nombre completo</label>
              <input
                id="fullName" name="fullName" type="text"
                className={`checkout__input${errors.fullName ? ' checkout__input--error' : ''}`}
                value={form.fullName} onChange={handleChange}
                placeholder="Nombre y apellido"
                autoComplete="name"
              />
              {errors.fullName && <span className="checkout__error" role="alert">{errors.fullName}</span>}
            </div>

            {/* 2. Correo */}
            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="email">Correo</label>
              <input
                id="email" name="email" type="email"
                className={`checkout__input${errors.email ? ' checkout__input--error' : ''}`}
                value={form.email} onChange={handleChange}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
              {errors.email && <span className="checkout__error" role="alert">{errors.email}</span>}
            </div>

            {/* 3. Tipo de ID + Número de ID */}
            <div className="checkout__row">
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="idType">Tipo de identificación</label>
                <select
                  id="idType" name="idType"
                  className="checkout__input checkout__select"
                  value={form.idType} onChange={handleChange}
                >
                  {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="idNumber">Número de identificación</label>
                <input
                  id="idNumber" name="idNumber" type="text"
                  className={`checkout__input${errors.idNumber ? ' checkout__input--error' : ''}`}
                  value={form.idNumber} onChange={handleChange}
                  placeholder="Número"
                />
                {errors.idNumber && <span className="checkout__error" role="alert">{errors.idNumber}</span>}
              </div>
            </div>

            {/* 4. Teléfono */}
            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="phone">Teléfono</label>
              <input
                id="phone" name="phone" type="tel"
                className={`checkout__input${errors.phone ? ' checkout__input--error' : ''}`}
                value={form.phone} onChange={handleChange}
                placeholder="3001234567"
                autoComplete="tel"
              />
              {errors.phone && <span className="checkout__error" role="alert">{errors.phone}</span>}
            </div>

            {/* 5. Ciudad */}
            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="cityId">Ciudad</label>
              <select
                id="cityId" name="cityId"
                className={`checkout__input checkout__select${errors.cityId ? ' checkout__input--error' : ''}`}
                value={form.cityId} onChange={handleChange}
              >
                <option value="">Seleccionar ciudad</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.cityId && <span className="checkout__error" role="alert">{errors.cityId}</span>}
            </div>

            {/* 6. Dirección */}
            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="address">Dirección</label>
              <input
                id="address" name="address" type="text"
                className={`checkout__input${errors.address ? ' checkout__input--error' : ''}`}
                value={form.address} onChange={handleChange}
                placeholder="Calle, Carrera, etc."
                autoComplete="street-address"
              />
              {errors.address && <span className="checkout__error" role="alert">{errors.address}</span>}
            </div>

            {/* 7. Departamento (auto-filled from city) */}
            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="department">Departamento</label>
              <input
                id="department" name="department" type="text"
                className="checkout__input checkout__input--readonly"
                value={form.department}
                readOnly
                placeholder="Se completa al seleccionar ciudad"
                aria-readonly="true"
              />
            </div>

            {/* 8. Checkbox: Términos y Condiciones */}
            <label className={`checkout__checkbox${errors.acceptTerms ? ' checkout__checkbox--error' : ''}`}>
              <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
              <span>Aceptar <a href="#" className="checkout__link">Términos y Condiciones</a></span>
            </label>
            {errors.acceptTerms && <span className="checkout__error" role="alert">{errors.acceptTerms}</span>}

            {/* 9. Checkbox: Autorizo tratamiento de datos */}
            <label className={`checkout__checkbox${errors.acceptData ? ' checkout__checkbox--error' : ''}`}>
              <input type="checkbox" name="acceptData" checked={form.acceptData} onChange={handleChange} />
              <span>Autorizo el tratamiento de mis datos personales</span>
            </label>
            {errors.acceptData && <span className="checkout__error" role="alert">{errors.acceptData}</span>}

            {/* 10. Divider + "Pago en línea" + payment icons */}
            <hr className="checkout__form-divider" />
            <p className="checkout__payment-label">Pago en línea</p>
            <div className="checkout__payment-logos" aria-label="Métodos de pago aceptados">
              {PAYMENT_METHODS.map((m) => (
                <span key={m} className="checkout__payment-logo">{m}</span>
              ))}
            </div>
          </section>

          {/* Right column: order summary */}
          <section className="checkout__col checkout__col--summary" aria-labelledby="summary-title">
            <h2 className="checkout__summary-title" id="summary-title">Resumen de compra</h2>

            <ul className="checkout__items" aria-label="Artículos en el carrito">
              {items.map(({ product, quantity: qty }) => (
                <li key={product.id} className="checkout__item">
                  <img className="checkout__item-img" src={product.image} alt={product.name} />
                  <div className="checkout__item-info">
                    <p className="checkout__item-name">{product.name}</p>
                    <div className="checkout__item-qty" role="group" aria-label={`Cantidad de ${product.name}`}>
                      <button type="button" className="checkout__qty-btn" onClick={() => updateQuantity(product.id, qty - 1)} aria-label="Reducir">−</button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" className="checkout__qty-btn" onClick={() => updateQuantity(product.id, qty + 1)} aria-label="Aumentar">+</button>
                    </div>
                  </div>
                  <p className="checkout__item-price">{formatPrice(product.price * qty)}</p>
                </li>
              ))}
            </ul>

            <a href="/" className="checkout__add-more">+ Agregar más productos</a>

            <hr className="checkout__divider" />

            <div className="checkout__summary">
              <div className="checkout__summary-row">
                <span>Costo de envío</span>
                <span>
                  {shippingLoading
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

            <button
              type="submit"
              className="checkout__pay-btn"
              disabled={processing}
              aria-busy={processing}
            >
              {processing ? 'Procesando…' : 'Pagar'}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}
