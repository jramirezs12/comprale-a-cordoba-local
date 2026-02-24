import Image from 'next/image';
import './Footer.css';

function Footer({ sponsors }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__organizer">
          <span className="footer__organizer-label">Organizado por</span>
          <Image
            src="/brand/inter.svg"
            alt="Inter Rapidísimo"
            className="footer__organizer-logo"
            width={160}
            height={44}
          />
        </div>

        {sponsors && sponsors.length > 0 && (
          <div className="footer__partners">
            <p className="footer__tagline">Con el apoyo de</p>
            <div className="footer__logos">
              {sponsors.map((sponsor) => (
                <div className="footer__logo-item" key={sponsor.id}>
                  <img
                    src={sponsor.logo}
                    alt={`Logo de ${sponsor.name}`}
                    className="footer__logo-img"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="footer__divider" />
        <p className="footer__copyright">
          © {new Date().getFullYear()} Cómprale a Córdoba · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}

export default Footer;
