import './Home.css';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../api.js';
import {
  flattenCategories,
  normalizeProductList,
} from '../../adapters.js';

import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { Spinner } from '../../components/ui/ui.jsx';
import HeroBanner from '../../components/HeroBanner/HeroBanner.jsx';
import CategoryCarousel from '../../components/CategoryCarousel/CategoryCarousel.jsx';
import ServiceBenefits from '../../components/ServiceBenefits/ServiceBenefits.jsx';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const tabs = [
    {
      key: '',
      label: 'For You',
    },

    ...parents.map((p) => ({
      key: p._id || p.slug,
      label: p.name,
    })),
  ];


  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get('/customer/products', {
        params: {
          category: tab || undefined,
          limit: 12,
          page,
          sort: 'new',
        },
      })

      .then(({ data }) => {
        if (cancelled) return;

        const nextItems = normalizeProductList(data.items);
        setItems((currentItems) => (
          page === 1
            ? nextItems
            : [...currentItems, ...nextItems]
        ));
        setHasMore(page < (data.pages || 1));
      })

      .catch(() => {
        if (cancelled) return;
        if (page === 1) setItems([]);
        setHasMore(false);
      })

      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, page]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || !hasMore) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage((currentPage) => currentPage + 1);
      }
    }, { rootMargin: '240px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const selectTab = (nextTab) => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    setLoading(true);
    setTab(nextTab);
  };


  return (
    <section
      className="section container home-product-tabs"
      style={{
        paddingBottom: 6,
        backgroundColor: 'transparent',
      }}
    >

      {/* =================================================
          PRODUCT TABS
          ================================================= */}

      <div className="tabs">

        {tabs.map((t, index) => (
          <button
            key={`${t.key || 'all'}-${index}`}
            type="button"
            className={`tab${
              tab === t.key ? ' on' : ''
            }`}
            onClick={() => selectTab(t.key)}
          >
            {t.label}
          </button>
        ))}

      </div>


      {/* =================================================
          PRODUCTS
          ================================================= */}

      {loading && page === 1 ? (
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

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="home-products-loading"
          aria-live="polite"
        >
          {loading && <Spinner />}
        </div>
      )}


      {/* =================================================
          VIEW ALL
          ================================================= */}

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

  // NEW: Media state
  const [media, setMedia] = useState([]);


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
     LOAD CUSTOMER MEDIA
     ======================================================= */

  useEffect(() => {

    api
      .get('/customer/media')

      .then(({ data }) => {
        setMedia(data.data || []);
      })

      .catch(() => {
        setMedia([]);
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
          ================================================= */}

      <HeroBanner user={user} />


      {/* =================================================
          SHOP BY CATEGORY
          ================================================= */}

      <CategoryCarousel
        categories={subs}
      />


      {/* =================================================
          SERVICE BENEFITS
          Images come from backend / Cloudinary
          ================================================= */}

      <ServiceBenefits
        media={media}
      />


      {/* =================================================
          PRODUCT TABS + PRODUCTS
          ================================================= */}

      <ProductTabs
        parents={parents}
      />


    </div>
  );
}