import './Footer.css';

function Footer({ sponsors }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
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
        <div className="footer__divider" />
        <p className="footer__copyright">
          © {new Date().getFullYear()} Cómprale a Córdoba · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}

export default Footer;
