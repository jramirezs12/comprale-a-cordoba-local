'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
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

const DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
  'Vaupés', 'Vichada',
];

const DEFAULT_CARRIER_CODE = 'envios';
const DEFAULT_METHOD_CODE = 'inter';
const DEFAULT_PAYMENT_CODE = 'payzen_standard';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, updateQuantity, clearCart } = useCart();

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    cedula: 'Cédula de ciudadanía', cedNum: '',
    phone: '', department: '', city: '', address: '',
    sameAddress: true, acceptTerms: false, acceptData: false,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((e) => { const n = { ...e }; delete n[name]; return n; });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email inválido';
    if (!form.firstName.trim()) newErrors.firstName = 'Requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'Requerido';
    if (!form.cedNum.trim()) newErrors.cedNum = 'Requerido';
    if (!form.phone.trim()) newErrors.phone = 'Requerido';
    if (!form.department) newErrors.department = 'Requerido';
    if (!form.city.trim()) newErrors.city = 'Requerido';
    if (!form.address.trim()) newErrors.address = 'Requerido';
    if (!form.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos';
    return newErrors;
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
    try {
      // 1. Create guest cart
      const cartData = await graphqlGuestClient.request(CREATE_GUEST_CART);
      const cartId = cartData.createEmptyCart;

      // 2. Add products to cart (prefer dropshipping mutation; fall back to standard)
      const dropshippingItems = items.map((i) => ({
        sku: String(i.product.id),
        quantity: i.quantity,
        dropper_price: i.product.price,
      }));
      try {
        await graphqlGuestClient.request(DROPSHIPPING_ADD_PRODUCTS_TO_CART, {
          cartId,
          cartItems: dropshippingItems,
        });
      } catch {
        // Fall back to standard addProductsToCart if dropshipping mutation is unavailable
        const standardItems = items.map((i) => ({ sku: String(i.product.id), quantity: i.quantity }));
        await graphqlGuestClient.request(ADD_PRODUCTS_TO_CART, { cartId, cartItems: standardItems });
      }

      // 3. Set guest email
      await graphqlGuestClient.request(SET_GUEST_EMAIL, { cartId, email: form.email });

      const addressArgs = {
        cartId,
        firstname: form.firstName,
        lastname: form.lastName,
        street: form.address,
        city: form.city,
        region: form.department,
        postcode: '000000',
        telephone: form.phone,
      };

      // 4. Set shipping address
      const shippingResult = await graphqlGuestClient.request(SET_SHIPPING_ADDRESS, addressArgs);

      // 5. Set billing address (same as shipping when sameAddress is true)
      await graphqlGuestClient.request(SET_BILLING_ADDRESS, addressArgs);

      // 6. Set shipping method – use first available or fall back to default
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

      // 7. Set payment method (payzen_standard; fall back to first available or free)
      try {
        await graphqlGuestClient.request(SET_PAYMENT_METHOD, {
          cartId,
          code: DEFAULT_PAYMENT_CODE,
        });
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
        <h1 className="checkout__title">Finalizar compra</h1>
        {submitError && (
          <div style={{ background: 'rgba(232,54,61,0.15)', border: '1px solid #e8363d', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#e8363d' }}>
            {submitError}
          </div>
        )}
        <form className="checkout__grid" onSubmit={handleSubmit} noValidate>

          {/* Column 1: Address */}
          <section className="checkout__col checkout__col--address" aria-labelledby="address-title">
            <h2 className="checkout__col-title" id="address-title">Mis direcciones</h2>

            <div className="checkout__field checkout__field--full">
              <label className="checkout__label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className={`checkout__input${errors.email ? ' checkout__input--error' : ''}`}
                value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
              {errors.email && <span className="checkout__error">{errors.email}</span>}
            </div>

            <div className="checkout__row">
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="firstName">Nombre</label>
                <input id="firstName" name="firstName" type="text" className={`checkout__input${errors.firstName ? ' checkout__input--error' : ''}`}
                  value={form.firstName} onChange={handleChange} placeholder="Nombre" />
                {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
              </div>
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="lastName">Apellido</label>
                <input id="lastName" name="lastName" type="text" className={`checkout__input${errors.lastName ? ' checkout__input--error' : ''}`}
                  value={form.lastName} onChange={handleChange} placeholder="Apellido" />
                {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="checkout__row">
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="cedula">Tipo de identificación</label>
                <select id="cedula" name="cedula" className="checkout__input checkout__select"
                  value={form.cedula} onChange={handleChange}>
                  <option>Cédula de ciudadanía</option>
                  <option>Cédula de extranjería</option>
                  <option>Pasaporte</option>
                  <option>NIT</option>
                </select>
              </div>
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="cedNum">Número de identificación</label>
                <input id="cedNum" name="cedNum" type="text" className={`checkout__input${errors.cedNum ? ' checkout__input--error' : ''}`}
                  value={form.cedNum} onChange={handleChange} placeholder="Número" />
                {errors.cedNum && <span className="checkout__error">{errors.cedNum}</span>}
              </div>
            </div>

            <div className="checkout__row">
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="phone">Teléfono</label>
                <input id="phone" name="phone" type="tel" className={`checkout__input${errors.phone ? ' checkout__input--error' : ''}`}
                  value={form.phone} onChange={handleChange} placeholder="3001234567" />
                {errors.phone && <span className="checkout__error">{errors.phone}</span>}
              </div>
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="department">Departamento</label>
                <select id="department" name="department" className={`checkout__input checkout__select${errors.department ? ' checkout__input--error' : ''}`}
                  value={form.department} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="checkout__error">{errors.department}</span>}
              </div>
            </div>

            <div className="checkout__row">
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="city">Ciudad</label>
                <input id="city" name="city" type="text" className={`checkout__input${errors.city ? ' checkout__input--error' : ''}`}
                  value={form.city} onChange={handleChange} placeholder="Ciudad" />
                {errors.city && <span className="checkout__error">{errors.city}</span>}
              </div>
              <div className="checkout__field">
                <label className="checkout__label" htmlFor="address">Dirección</label>
                <input id="address" name="address" type="text" className={`checkout__input${errors.address ? ' checkout__input--error' : ''}`}
                  value={form.address} onChange={handleChange} placeholder="Calle, Carrera, etc." />
                {errors.address && <span className="checkout__error">{errors.address}</span>}
              </div>
            </div>

            <label className={`checkout__checkbox${errors.acceptTerms ? ' checkout__checkbox--error' : ''}`}>
              <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
              <span>Acepto los <a href="#" className="checkout__link">Términos y Condiciones</a></span>
            </label>
            {errors.acceptTerms && <span className="checkout__error">{errors.acceptTerms}</span>}

            <label className="checkout__checkbox">
              <input type="checkbox" name="acceptData" checked={form.acceptData} onChange={handleChange} />
              <span>Autorizo el tratamiento de mis datos personales de acuerdo con la política de privacidad</span>
            </label>
          </section>

          {/* Column 2: Shipping & Payment */}
          <section className="checkout__col checkout__col--payment" aria-labelledby="payment-title">
            <h2 className="checkout__col-title" id="payment-title">Método de envío y pago</h2>

            <div className="checkout__section-label">Método de envío</div>
            <div className="checkout__shipping-card">
              <div className="checkout__shipping-radio">
                <span className="checkout__radio-dot" aria-hidden="true" />
              </div>
              <div className="checkout__shipping-info">
                <span className="checkout__shipping-name">Interrapidísimo</span>
                <span className="checkout__shipping-price">Gratis $0</span>
              </div>
            </div>

            <div className="checkout__section-label" style={{ marginTop: '24px' }}>Métodos de pago</div>
            <div className="checkout__payment-card">
              <p className="checkout__payment-text">Pago en línea</p>
              <div className="checkout__payment-logos" aria-label="Métodos de pago aceptados">
                {['PSE', 'Nequi', 'VISA', 'Mastercard', 'Google Pay'].map((m) => (
                  <span key={m} className="checkout__payment-logo">{m}</span>
                ))}
              </div>
            </div>

            <label className="checkout__toggle-row">
              <input type="checkbox" name="sameAddress" checked={form.sameAddress} onChange={handleChange} />
              <span>La dirección de envío y facturación son la misma</span>
            </label>
          </section>

          {/* Column 3: Order summary */}
          <section className="checkout__col checkout__col--summary" aria-labelledby="summary-title">
            <h2 className="checkout__col-title" id="summary-title">Sus artículos y envío</h2>

            <ul className="checkout__items" aria-label="Artículos en el carrito">
              {items.map(({ product, quantity: qty }) => (
                <li key={product.id} className="checkout__item">
                  <img className="checkout__item-img" src={product.image} alt={product.name} />
                  <div className="checkout__item-info">
                    <p className="checkout__item-name">{product.name}</p>
                    <p className="checkout__item-shipping">Envío por Inter Rapidísimo</p>
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

            <hr className="checkout__divider" />

            <div className="checkout__summary">
              <div className="checkout__summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="checkout__summary-row">
                <span>Costo de envío</span>
                <span>$0</span>
              </div>
              <hr className="checkout__divider" />
              <div className="checkout__summary-row checkout__summary-row--total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button type="submit" className="checkout__pay-btn" disabled={processing} aria-busy={processing}>
              {processing ? 'Procesando…' : 'Pagar'}
            </button>
            <p className="checkout__legal">
              Al realizar tu pago aceptas nuestros términos y condiciones. Tu información está protegida con cifrado SSL.
            </p>
          </section>
        </form>
      </main>
    </div>
  );
}
