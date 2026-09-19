import './Home.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../api.js';
import { flattenCategories, normalizeProductList } from '../../adapters.js';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { Spinner } from '../../components/ui/ui.jsx';
import HeroBanner from '../../components/HeroBanner/HeroBanner.jsx';
import CategoryCarousel from '../../components/CategoryCarousel/CategoryCarousel.jsx';

// IMPORTANT:
// Use the SAME useStore import/path that your existing Header.jsx uses.
import { useStore } from '../../context/StoreContext.jsx';


/* =========================================================
   SHOP BY CATEGORY
   ========================================================= */

function ShopByCategory({ subs }) {
  if (!subs) return <Spinner />;
  if (!subs.length) return null;

  return (
    <section className="section container">

      <h3
        className="sec-title"
        style={{ marginBottom: 12 }}
      >
        Shop by Category
      </h3>

      <div
        className="cat-scroll"
        style={{ flexWrap: 'wrap' }}
      >
        {subs.map((c) => (
          <Link
            className="cat-item"
            to={`/category/${c.slug}`}
            key={c.slug}
          >
            <span className="cat-imgwrap">
              <img
                src={c.image || '/favicon.svg'}
                alt={c.name}
                loading="lazy"
              />
            </span>

            <span>
              {c.name}
            </span>
          </Link>
        ))}
      </div>

    </section>
  );
}


/* =========================================================
   PRODUCT TABS
   ========================================================= */

function ProductTabs({ parents }) {
  const [tab, setTab] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    {
      key: '',
      label: 'For You',
    },

    ...parents.map((p) => ({
      key: p.slug,
      label: p.name,
    })),
  ];


  useEffect(() => {
    setLoading(true);

    api
      .get('/customer/products', {
        params: {
          category: tab || undefined,
          limit: 12,
          sort: 'popular',
        },
      })

      .then(({ data }) => {
        setItems(
          normalizeProductList(data.items)
        );
      })

      .catch(() => {
        setItems([]);
      })

      .finally(() => {
        setLoading(false);
      });

  }, [tab]);


  return (
    <section
      className="section container home-product-tabs"
      style={{ paddingBottom: 6, backgroundColor: "transparent"}}
    >

      {/* Product Tabs */}
      <div className="tabs">

        {tabs.map((t, index) => (
          <button
            key={`${t.key || 'all'}-${index}`}
            type="button"
            className={`tab${
              tab === t.key
                ? ' on'
                : ''
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}

      </div>


      {/* Products */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid">

          {items.map((p) => (
            <ProductCard
              p={p}
              key={p._id}
              compact
            />
          ))}

        </div>
      )}


      {/* View All */}
      <div
        className="center"
        style={{
          padding: '2px 0 18px',
        }}
      >
        <Link
          className="btn btn-outline btn-sm"
          to={`/products${
            tab
              ? `?category=${tab}`
              : ''
          }`}
        >
          View All Products
        </Link>
      </div>

    </section>
  );
}


/* =========================================================
   HOME
   ========================================================= */

export default function Home() {

  const { user } = useStore();

  const [cats, setCats] = useState(null);


  /* =======================================================
     LOAD CATEGORIES
     ======================================================= */

  useEffect(() => {

    api
      .get('/customer/categories')

      .then(({ data }) => {
        setCats(
          flattenCategories(data.data)
        );
      })

      .catch(() => {
        setCats([]);
      });

  }, []);


  /* =======================================================
     LOADING
     ======================================================= */

  if (!cats) {
    return <Spinner />;
  }


  /* =======================================================
     CATEGORY TYPES
     ======================================================= */

  const parents = cats.filter(
    (c) => c.isParent
  );

  const subs = cats.filter(
    (c) => !c.isParent
  );


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="home-page">

      {/* =================================================
          HERO BANNER
          927 × 370
          Login / Sign Up shown only for guests
          ================================================= */}

      <HeroBanner user={user} />


      {/* =================================================
          SHOP BY CATEGORY
          ================================================= */}

      {/* <ShopByCategory
        subs={subs}
      /> */}

      <CategoryCarousel categories={subs} />


      {/* =================================================
          PRODUCT TABS + PRODUCTS
          ================================================= */}

      <ProductTabs
        parents={parents}
      />

    </div>
  );
}
