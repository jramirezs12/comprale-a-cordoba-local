import Image from 'next/image';
import './Footer.css';

function Footer({ sponsors }) {
  return (
    <footer className="footer" aria-label="Pie de página">
      <div className="footer__inner">
        {/* top divider */}
        <div className="footer__rule" />

        {/* Organizer row */}
        <div className="footer__organizer">
          <span className="footer__organizer-label">Organiza:</span>
          <Image
            src="/brand/inter.svg"
            alt="Inter Rapidísimo"
            className="footer__organizer-logo"
            width={170}
            height={44}
            priority={false}
          />
        </div>

        {/* mid divider */}
        <div className="footer__rule" />

        {/* Sponsors row */}
        {sponsors && sponsors.length > 0 && (
          <div className="footer__sponsors" aria-label="Aliados">
            <span className="footer__sponsors-label">Apoya:</span>

            <div className="footer__sponsors-logos" aria-label="Logos de aliados">
              {sponsors.map((sponsor) => (
                <div className="footer__sponsor" key={sponsor.id} title={sponsor.name}>
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="footer__sponsor-img"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* bottom divider */}
        <div className="footer__rule footer__rule--bottom" />

        <p className="footer__copyright">
          © {new Date().getFullYear()} Cómprale a Córdoba · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}

export default Footer;