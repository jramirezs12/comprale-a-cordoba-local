import Image from 'next/image';
import './Footer.css';

const SUPPORT_LOGOS = [
  { src: '/brand/gobernacion-cordoba.png', alt: 'Gobernación de Córdoba' },
  { src: '/brand/desarrollo-economico.svg', alt: 'Secretaría de Desarrollo Económico y Agroindustrial' },
];

const MEDIA_LOGOS = [
  { src: '/brand/Forbes.svg', alt: 'Forbes' },
  { src: '/brand/Caracol.svg', alt: 'Caracol' },
  { src: '/brand/ultima-hora.svg', alt: 'Última Hora' },
  { src: '/brand/el-titular.png', alt: 'El Titular' },
  { src: '/brand/accion-interna.svg', alt: 'Acción Interna' },
];

function Footer({ sponsors }) {
  return (
    <footer className="footer" aria-label="Pie de página">
      {/* top divider (full width) */}
      <div className="footer__rule" />

      {/* Organizer row (centered like design) */}
      <div className="footer__container">
        <div className="footer__organizer">
          <span className="footer__organizer-label">Organiza:</span>
          <Image
            src="/brand/interrapidisimo.svg"
            alt="Inter Rapidísimo"
            className="footer__organizer-logo"
            width={190}
            height={48}
            priority={false}
          />
        </div>
      </div>

      {/* mid divider (full width) */}
      <div className="footer__rule" />

      {/* Sponsors + Media row (FULL BLEED) */}
      <div className="footer__row footer__row--bleed" aria-label="Aliados y medios">
        <div className="footer__row-inner">
          <span className="footer__row-label">Apoya:</span>

          <div className="footer__row-logos" aria-label="Logos">
            {SUPPORT_LOGOS.map((logo) => (
              <div className="footer__logo" key={logo.src} title={logo.alt}>
                <img src={logo.src} alt={logo.alt} className="footer__logo-img" loading="lazy" />
              </div>
            ))}

            {sponsors?.length > 0 &&
              sponsors.map((s) => (
                <div className="footer__logo" key={s.id} title={s.name}>
                  <img src={s.logo} alt={s.name} className="footer__logo-img" loading="lazy" />
                </div>
              ))}

            <span className="footer__row-label footer__row-label--inline">Medios aliados:</span>

            {MEDIA_LOGOS.map((logo) => (
              <div className="footer__logo" key={logo.src} title={logo.alt}>
                <img src={logo.src} alt={logo.alt} className="footer__logo-img" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ removed bottom divider */}

      {/* Copyright (centered) */}
      <div className="footer__container">
        <p className="footer__copyright">
          © {new Date().getFullYear()} Cómprale a Córdoba · Todos los derechos reservados · Inter Rapidísimo
        </p>
      </div>
    </footer>
  );
}

export default Footer;