import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../api.js';
import { flattenCategories, normalizeProductList } from '../adapters.js';
import ProductCard from '../components/ProductCard.jsx';
import { Spinner } from '../components/ui.jsx';

const SORTS = [
  ['popular', 'Top Sold'],
  ['rating', 'Top Rated'],
  ['new', 'Newest first'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
];

export default function CategoryPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setNotFound(false);

    api.get(`/customer/categories/${slug}`)
      .then(({ data }) => {
        if (!live) return;
        if (data.isParent) {
          // parent categories open their full listing, filtered to just that top-level category
          nav(`/products?category=${data.data.slug}`, { replace: true });
          return;
        }
        setCategory(data.data);
        return api.get('/customer/products', { params: { category: slug, sort, limit: 60 } });
      })
      .then(({ data }) => {
        if (!live) return;
        setProducts(normalizeProductList(data.items));
        setLoading(false);
      })
      .catch(() => live && (setNotFound(true), setLoading(false)));

    return () => { live = false; };
  }, [slug, sort]);

  // sibling sub-categories (for the chips row)
  const [siblings, setSiblings] = useState([]);
  useEffect(() => {
    api.get('/customer/categories').then(({ data }) => {
      const cs = flattenCategories(data.data);
      const me = cs.find((c) => c.slug === slug);
      if (!me) return;
      setSiblings(cs.filter((c) => !c.isParent && c.parent === me.parent && c.slug !== slug));
    }).catch(() => {});
  }, [slug]);

  if (loading) return <Spinner />;
  if (notFound || !category)
    return (
      <div className="container empty">
        <h3>Category not found</h3>
        <p><Link className="link-brand" to="/products">Browse all products →</Link></p>
      </div>
    );

  return (
    <div className="container">
      {siblings.length > 0 && (
        <div className="chips" style={{ paddingTop: 14 }}>
          <Link className="chip" style={{ border: '1px solid var(--brand-100)', cursor: 'pointer' }} to={`/products?category=${category.parentSlug}`}>
            All {category.parentName}
          </Link>
          {siblings.map((s) => (
            <Link className="chip" style={{ border: '1px solid var(--brand-100)', cursor: 'pointer' }} to={`/category/${s.slug}`} key={s.slug}>
              {s.name}
            </Link>
          ))}
        </div>
      )}
      {category.image && (
        <div className="cat-banner"><img src={category.image} alt={category.name} /></div>
      )}

      <div className="section-head" style={{ paddingTop: 18 }}>
        <div>
          <h2 style={{ fontSize: 26 }}>{category.name}</h2>
          <small>Cash on delivery · Delivery within 48 hrs · 7-day return</small>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort category products">
            {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <Link className="view-all" to={`/products?category=${category.slug}`}>
            All {category.name} <ChevronRight size={13} style={{ display: 'inline' }} />
          </Link>
        </div>
      </div>

      {!products.length ? (
        <p className="mut" style={{ padding: '14px 4px' }}>No products here yet.</p>
      ) : (
        <div className="grid" style={{ paddingTop: 8 }}>
          {products.map((p) => <ProductCard p={p} key={p._id} compact />)}
        </div>
      )}
    </div>
  );
}
