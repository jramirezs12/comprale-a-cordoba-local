import './HowItWorks.css';

const steps = [
  {
    number: 1,
    line1: 'Elige un negocio',
    line2: 'y lo que quieras comprar.',
  },
  {
    number: 2,
    line1: 'Compra de forma',
    line2: 'directa y transparente.',
  },
  {
    number: 3,
    line1: 'Recibe tu producto sin costo',
    line2: 'a través de Inter Rapidísimo.',
  },
  {
    number: 4,
    line1: 'Tu compra llega y el negocio',
    line2: 'recibe ingresos para seguir.',
  },
];

function HowItWorks({ sectionRef }) {
  return (
    <section className="how-it-works" ref={sectionRef} id="como-funciona">
      <h2 className="how-it-works__title">Así ayudaremos a Córdoba</h2>

      <div className="how-it-works__steps">
        {steps.map((step) => (
          <div className="how-it-works__step" key={step.number}>
            <div className="how-it-works__step-number">{step.number}.</div>

            <div className="how-it-works__step-text">
              <p className="how-it-works__step-line">{step.line1}</p>
              <p className="how-it-works__step-line">{step.line2}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;