import StatItem from './StatItem';
import './Stats.css';

function Stats({ stats }) {
  return (
    <section className="stats" id="estadisticas">
      <div className="stats__inner">
        <div className="stats__grid">
          <StatItem value={stats.buyers} label="COMPRADORES" format="number" />
          <StatItem value={stats.revenue} label="RECAUDOS" format="currency" />
          <StatItem value={stats.businesses} label="NEGOCIOS BENEFICIADOS" format="number" />
        </div>
      </div>
    </section>
  );
}

export default Stats;
