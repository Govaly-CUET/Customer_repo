import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function Wishlist() {
  const { wishlist, user, toggleWishlist, addToCart, toast } = useStore();

  return (
    <div className="container">
      {!wishlist.length ? (
        <div className="empty">
          <Heart size={52} strokeWidth={1.4} style={{ margin: '0 auto 10px', color: 'var(--brand)' }} />
          <h3>Your wishlist is empty</h3>
          <p>Tap the ♥ on any product to save it here{user ? '' : ' (login to sync across devices)'}.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 10 }}>Discover Products</Link>
        </div>
      ) : (
        <section className="section container" style={{ marginTop: 14 }}>
          <div className="section-head">
            <h2>My Wishlist <span className="mut" style={{ fontSize: 14 }}>({wishlist.length})</span></h2>
          </div>
          <div className="panel" style={{ padding: '4px 0' }}>
            {wishlist.map((p) => (
              <div className="wl-row" key={p._id}>
                <Link to={`/product/${p.slug}`}>
                  <img src={p.images?.[0]} alt={p.name} className="wl-thumb" />
                </Link>
                <Link to={`/product/${p.slug}`} className="wl-name">{p.name}</Link>
                <div className="wl-price">
                  <b>৳{p.price}</b>
                </div>
                <button className="trash" onClick={() => toggleWishlist(p)} aria-label="Remove">
                  <Trash2 size={16} />
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => { addToCart(p, null, 1, true); toast('Added to cart 🛍️', 'ok'); }}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
