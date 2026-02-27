'use client';

const SELLER_PLACEHOLDER = 'https://via.placeholder.com/900x900?text=Negocio';

function SellerTile({ seller, onBuy }) {
  const name = seller?.name || 'Negocio';
  const image = seller?.image || SELLER_PLACEHOLDER;

  return (
    <article className="sellers-tile" aria-label={`Negocio ${name}`}>
      <button className="sellers-tile__media" onClick={onBuy} type="button" aria-label={`Ver ${name}`}>
        <img className="sellers-tile__img" src={image} alt={`Portada de ${name}`} loading="lazy" />
        <div className="sellers-tile__shade" />
        <h3 className="sellers-tile__name">{name}</h3>
      </button>

      <button className="sellers-tile__btn" type="button" onClick={onBuy} aria-label={`Comprar en ${name}`}>
        Comprar
      </button>
    </article>
  );
}

export default SellerTile;
