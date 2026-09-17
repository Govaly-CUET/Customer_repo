import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronRight, BadgePercent } from 'lucide-react';
import api from '../api.js';
import { normalizeProduct, normalizeProductList } from '../adapters.js';
import { useStore } from '../context/StoreContext.jsx';
import { RatingStars, Spinner } from '../components/ui.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const loadAll = () => {
    setData(null);
    setNotFound(false);
    setQty(1);
    setImgIdx(0);
    api
      .get(`/customer/products/${slug}`)
      .then(({ data }) => {
        const product = normalizeProduct(data.data);
        return Promise.all([
          product,
          api.get(`/customer/products/${slug}/reviews`).then((r) => r.data.data).catch(() => []),
          api.get('/customer/products', { params: { category: product.category, limit: 8 } })
            .then((r) => normalizeProductList(r.data.items).filter((x) => x._id !== product._id))
            .catch(() => []),
        ]);
      })
      .then(([product, reviews, related]) => setData({ product, reviews, related }))
      .catch(() => setNotFound(true));
  };

  useEffect(loadAll, [slug]);

  if (notFound)
    return (
      <div className="container empty">
        <h3>Product not found</h3>
        <p>It may have been removed. <Link className="link-brand" to="/products">Continue shopping →</Link></p>
      </div>
    );
  if (!data) return <Spinner />;

  const { product: p, reviews, related } = data;
  const fav = isWishlisted(p._id);
  const gallery = (p.images?.length ? p.images : [p.images?.[0]]).filter(Boolean);

  const buyNow = () => {
    addToCart(p, null, qty, true, null);
    nav('/cart');
  };

  return (
    <div className="container">
      <div className="crumbs" style={{ padding: '12px 4px 0', color: 'var(--muted)', fontSize: 12.5 }}>
        <Link to="/">Home</Link> <ChevronRight size={11} style={{ display: 'inline' }} />
        <Link to={`/category/${p.category}`}>{p.categoryName || p.category.replace(/-/g, ' ')}</Link>
      </div>

      <div className="pdp">
        <div className="pdp-gallery">
          {gallery.length > 1 && (
            <div className="pdp-thumbs">
              {gallery.map((src, i) => (
                <button key={i} className={`pdp-thumb${imgIdx === i ? ' on' : ''}`} onClick={() => setImgIdx(i)} aria-label={`View image ${i + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="pdp-main-img">
            <img src={gallery[imgIdx] || gallery[0]} alt={p.name} />
          </div>
        </div>

        <div>
          <Link to={`/seller/${p.seller}`} className="pdp-brand">{(p.seller || 'govaly').replace(/-/g, ' ')}</Link>
          <h1 className="pdp-name">{p.name}</h1>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span className="rating-pill"><span>★</span> {p.rating.toFixed(1)}</span>
            <span className="mut" style={{ fontSize: 12.5 }}>{p.numReviews} ratings · {p.sold}+ sold · {p.stock} in stock</span>
          </div>

          <div className="pdp-prices">
            <b>৳{p.price.toLocaleString('en-IN')}</b>
          </div>
          <div className="pdp-incl">Inclusive of all taxes</div>

          <div className="row" style={{ gap: 14 }}>
            <b style={{ fontSize: 13 }}>Qty</b>
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase">+</button>
            </div>
            {p.stock < 12 && <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 12.5 }}>Only {p.stock} left!</span>}
          </div>

          <div className="pdp-actions">
            <button className="btn btn-primary" style={{ flex: 1, minWidth: 170 }} onClick={() => addToCart(p, null, qty, false, null)}>
              <ShoppingBag size={17} /> ADD TO CART
            </button>
            <button className="btn btn-dark" style={{ flex: 1, minWidth: 140 }} onClick={buyNow}>⚡ BUY NOW</button>
            <button className={`btn btn-outline${fav ? '' : ''}`} style={{ minWidth: 52, padding: 11 }} onClick={() => toggleWishlist(p)} aria-label="Wishlist">
              <Heart size={17} fill={fav ? 'currentColor' : 'none'} color={fav ? 'var(--brand)' : undefined} />
            </button>
          </div>

          <div className="pdp-usp">
            <div><Truck size={16} /> Delivery within 48 hrs</div>
            <div><RotateCcw size={16} /> 7-day instant return</div>
            <div><ShieldCheck size={16} /> 100% authentic</div>
            <div><BadgePercent size={16} /> Cash on delivery</div>
          </div>
        </div>
      </div>

      <div className="pdp-sec">
        <h3>Product Details</h3>
        <p>{p.description}</p>
        <div className="row" style={{ marginTop: 14, gap: 18, flexWrap: 'wrap', color: 'var(--ink-2)', fontSize: 13 }}>
          <span><b>Seller:</b> {(p.seller || 'govaly').replace(/-/g, ' ')}</span>
          <span><b>Category:</b> {p.category.replace(/-/g, ' ')}</span>
          <span><b>SKU:</b> {p.slug.slice(0, 14).toUpperCase()}</span>
          <span><b>In stock:</b> {p.stock}</span>
        </div>
      </div>

      <div className="pdp-sec">
        <div className="spread" style={{ marginBottom: 8 }}>
          <h3>Reviews & Ratings ({p.numReviews})</h3>
          <div className="row"><RatingStars value={p.rating} size={16} /> <b>{p.rating.toFixed(1)}/5</b></div>
        </div>
        {reviews.map((r) => (
          <div className="review" key={r._id}>
            <div className="review-head">
              <RatingStars value={r.rating} size={12} />
              <span className="mut" style={{ fontSize: 12 }}>by {r.customer?.name || 'Customer'}</span>
              <time style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--muted)' }}>
                {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </time>
            </div>
            {r.comment && <p>{r.comment}</p>}
          </div>
        ))}

        <p className="mut" style={{ fontSize: 12.5, marginTop: 12 }}>
          Reviews and ratings are provided by customers and shown from the database.
        </p>
      </div>

      {related.length > 0 && (
        <section className="section container" style={{ marginTop: 14 }}>
          <div className="section-head"><h2>You May Also Like</h2></div>
          <div className="grid">
            {related.slice(0, 10).map((r) => <ProductCard p={r} key={r._id} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
