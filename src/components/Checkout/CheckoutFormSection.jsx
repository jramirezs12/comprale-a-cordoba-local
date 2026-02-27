'use client';
import { ID_TYPES, PAYMENT_METHODS } from '../../hooks/useCheckoutForm';
import CheckoutCityField from './CheckoutCityField';

export default function CheckoutFormSection({ form, errors, handleChange, setTermsOpen, cityProps }) {
  return (
    <section className="checkout__col checkout__col--form" aria-labelledby="form-title">
      <h2 className="checkout__col-title" id="form-title">Datos de envío</h2>

      <div className="checkout__row checkout__row--names">
        <div className="checkout__field">
          <input name="firstName" type="text" className={`checkout__input${errors.firstName ? ' checkout__input--error' : ''}`} value={form.firstName} onChange={handleChange} placeholder="Nombre*" aria-label="Nombre" autoComplete="given-name" />
          {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
        </div>
        <div className="checkout__field">
          <input name="lastName" type="text" className={`checkout__input${errors.lastName ? ' checkout__input--error' : ''}`} value={form.lastName} onChange={handleChange} placeholder="Apellidos*" aria-label="Apellidos" autoComplete="family-name" />
          {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="checkout__field checkout__field--full">
        <input name="email" type="email" className={`checkout__input${errors.email ? ' checkout__input--error' : ''}`} value={form.email} onChange={handleChange} placeholder="Correo" aria-label="Correo" autoComplete="email" />
        {errors.email && <span className="checkout__error">{errors.email}</span>}
      </div>

      <div className="checkout__row">
        <div className="checkout__field">
          <select name="idType" className="checkout__input checkout__select" value={form.idType} onChange={handleChange} aria-label="Tipo de identificación">
            {ID_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div className="checkout__field">
          <input name="idNumber" type="text" className={`checkout__input${errors.idNumber ? ' checkout__input--error' : ''}`} value={form.idNumber} onChange={handleChange} placeholder="Número de identificación" aria-label="Número de identificación" />
          {errors.idNumber && <span className="checkout__error">{errors.idNumber}</span>}
        </div>
      </div>

      <div className="checkout__field checkout__field--full">
        <input name="phone" type="tel" className={`checkout__input${errors.phone ? ' checkout__input--error' : ''}`} value={form.phone} onChange={handleChange} placeholder="Teléfono" aria-label="Teléfono" autoComplete="tel" />
        {errors.phone && <span className="checkout__error">{errors.phone}</span>}
      </div>

      <CheckoutCityField form={form} errors={errors} {...cityProps} handleCitySelect={cityProps.onCitySelect} />

      <div className="checkout__field checkout__field--full">
        <input name="address" type="text" className={`checkout__input${errors.address ? ' checkout__input--error' : ''}`} value={form.address} onChange={handleChange} placeholder="Dirección" aria-label="Dirección" autoComplete="street-address" />
        {errors.address && <span className="checkout__error">{errors.address}</span>}
      </div>

      <div className="checkout__field checkout__field--full">
        <input name="department" type="text" className="checkout__input checkout__input--readonly" value={form.department} readOnly placeholder="Departamento" aria-label="Departamento" />
      </div>

      <label className={`checkout__checkbox${errors.acceptTerms ? ' checkout__checkbox--error' : ''}`}>
        <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
        <span>Aceptar{' '}<button type="button" className="checkout__link checkout__link--btn" onClick={() => setTermsOpen(true)}>Términos y Condiciones</button></span>
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
        {PAYMENT_METHODS.map((m) => (<span key={m} className="checkout__payment-logo">{m}</span>))}
      </div>
    </section>
  );
}
