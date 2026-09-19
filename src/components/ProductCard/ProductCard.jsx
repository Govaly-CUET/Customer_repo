import './ProductCard.css';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function ProductCard({ p }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const fav = isWishlisted(p._id);

  const images = p.images?.length ? p.images : ['/favicon.svg'];

  return (
    <div className="pcard">
      {/* Product Image */}
      <div className="pcard-media">
        <Link
          to={`/product/${p.slug}`}
          className="pcard-image-link"
          aria-label={p.name}
        >
          <img
            src={images[0]}
            alt={p.name}
            loading="lazy"
            className={p.stock === 0 ? 'stock-out-image' : ''}
          />
        </Link>

        {/* Image dots */}
        {images.length > 1 && (
          <div className="pcard-dots">
            {images.slice(0, 5).map((_, index) => (
              <span
                key={index}
                className={`pcard-dot ${index === 0 ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={`pcard-heart ${fav ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(p);
          }}
          aria-label="Wishlist"
          title="Wishlist"
        >
          <Heart
            size={27}
            strokeWidth={2}
            fill={fav ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Product Information */}
      <div className="pcard-body">
        <Link
          to={`/product/${p.slug}`}
          className="pcard-name"
          title={p.name}
        >
          {p.name}
        </Link>

        {/* ONLY BASE PRICE */}
        <div className="pcard-price">
          <span className="pcard-current-price">
            ৳{Number(p.price || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}