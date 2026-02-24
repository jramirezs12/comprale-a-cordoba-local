import StatItem from './StatItem';
import './Stats.css';

function Stats({ stats }) {
  return (
    <section className="stats" id="estadisticas">
      <div className="stats__inner">
        <h2 className="stats__title">El impacto de comprar local</h2>
        <div className="stats__grid">
          <StatItem value={stats.buyers} label="Compradores satisfechos" format="number" />
          <StatItem value={stats.revenue} label="En recaudos a negocios locales" format="currency" />
          <StatItem value={stats.businesses} label="Negocios beneficiados" format="number" />
        </div>
      </div>
    </section>
  );
}

export default Stats;
