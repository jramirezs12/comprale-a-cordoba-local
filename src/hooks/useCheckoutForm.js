'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAllCities } from './useAllCities';
import { useShippingQuote } from './useShippingQuote';
import graphqlGuestClient from '../lib/graphqlGuestClient';
import { CREATE_GUEST_CART, ADD_PRODUCTS_TO_CART, CREATE_CHECKOUT_PAYMENT } from '../graphql/checkout/mutations';

export const ID_TYPES = ['C.C', 'C.E', 'Pasaporte', 'NIT'];
export const PAYMENT_METHODS = ['Nequi', 'VISA', 'Mastercard', 'G Pay', 'Pay'];

function stableCartSignature(items) {
  return (items || [])
    .map((i) => `${i?.product?.sku || i?.product?.id}:${i?.quantity || 0}`)
    .sort()
    .join('|');
}

export function useCheckoutForm() {
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
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [cityDesktopOpen, setCityDesktopOpen] = useState(false);
  const [cityMobileOpen, setCityMobileOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const cityDesktopPopoverRef = useRef(null);
  const cityDesktopInputRef = useRef(null);
  const cityMobileSheetRef = useRef(null);
  const cityMobileInputRef = useRef(null);
  const summaryRef = useRef(null);
  const syncNonceRef = useRef(0);
  const swipeStartYRef = useRef(null);
  const swipeDeltaRef = useRef(0);

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => String(c?.name || '').toLowerCase().includes(q));
  }, [cities, cityQuery]);

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

  // Desktop: close city popover on outside click / ESC
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

  // Mobile: keep city modal ABOVE keyboard via VisualViewport
  useEffect(() => {
    if (!cityMobileOpen) return;

    const root = document.documentElement;

    const updateKb = () => {
      const vv = window.visualViewport;
      if (!vv) {
        root.style.setProperty('--kb', '0px');
        return;
      }
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

  return {
    // Form state
    form,
    errors,
    processing,
    submitError,
    termsOpen,
    setTermsOpen,
    // Cart summary
    items,
    total,
    shippingCost,
    grandTotal,
    cartSyncing,
    shippingLoading,
    canSubmit,
    updateQuantity,
    // City picker state
    cityDesktopOpen,
    setCityDesktopOpen,
    cityMobileOpen,
    setCityMobileOpen,
    cityQuery,
    setCityQuery,
    filteredCities,
    cityDesktopPopoverRef,
    cityDesktopInputRef,
    cityMobileSheetRef,
    cityMobileInputRef,
    // Mobile summary state
    mobileSummaryOpen,
    summaryRef,
    // Handlers
    handleChange,
    handleCitySelect,
    openCityPicker,
    handleSubmit,
    animateSummaryTo,
    handleSummaryTouchStart,
    handleSummaryTouchMove,
    handleSummaryTouchEnd,
    // Navigation
    router,
  };
}
