import './Listing.css';
import { useEffect, useMemo, useState } from 'react';
import {
  useParams,
  useSearchParams,
  Link,
} from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';

import api from '../../api.js';
import {
  flattenCategories,
  normalizeProductList,
} from '../../adapters.js';

import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { Spinner } from '../../components/ui/ui.jsx';
import { useStore } from '../../context/StoreContext.jsx';

const PRICE_LIMIT = 20000;

const SORTS = [
  ['popular', 'Top Sold'],
  ['new', 'Newest first'],
  ['price_asc', 'Price: Low to High'],
  ['price_desc', 'Price: High to Low'],
  ['rating', 'Top Rated'],
];

export default function Listing() {
  const { slug: catSlug } = useParams();
  const [sp, setSp] = useSearchParams();
  const { toast } = useStore();

  const [cats, setCats] = useState([]);
  const [category, setCategory] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = sp.get('search') || '';
  const isSearchPage = Boolean(search.trim());

  const page = Number(sp.get('page')) || 1;
  const sort = sp.get('sort') || 'popular';

  const selCats = (sp.get('category') || '')
    .split(',')
    .filter(Boolean);

  const min = sp.get('min') || '';
  const max = sp.get('max') || '';
  const size = sp.get('size') || '';

  /* =========================
     LOAD CATEGORIES
  ========================= */

  useEffect(() => {
    api
      .get('/customer/categories')
      .then(({ data }) => {
        setCats(flattenCategories(data.data));
      })
      .catch(() => {});
  }, []);

  /* =========================
     LOAD CURRENT CATEGORY
  ========================= */

  useEffect(() => {
    setCategory(null);

    if (!catSlug) return;

    api
      .get(`/customer/categories/${catSlug}`)
      .then(({ data }) => {
        setCategory(data.data);
      })
      .catch(() => {});
  }, [catSlug]);

  /* =========================
     PRODUCT PARAMETERS
  ========================= */

  const params = useMemo(() => {
    const p = {
      page,
      sort,
      limit: 24,
    };

    if (search) {
      p.search = search;
    }

    if (catSlug || selCats.length) {
      p.category = catSlug || selCats.join(',');
    }

    if (isSearchPage) {
      if (min) p.min = min;
      if (max) p.max = max;
      if (size) p.size = size;
    }

    return p;
  }, [
    page,
    sort,
    search,
    catSlug,
    selCats.join(','),
    min,
    max,
    size,
    isSearchPage,
  ]);

  /* =========================
     LOAD PRODUCTS
  ========================= */

  useEffect(() => {
    setLoading(true);

    api
      .get('/customer/products', {
        params,
      })
      .then(({ data }) => {
        setData({
          ...data,
          items: normalizeProductList(data.items),
        });
      })
      .catch(() => {
        toast('Could not load products', 'err');
      })
      .finally(() => {
        setLoading(false);
      });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [params]);

  /* =========================
     URL PATCH
  ========================= */

  const patch = (obj, resetPage = true) => {
    const next = new URLSearchParams(sp);

    Object.entries(obj).forEach(([key, value]) => {
      if (
        value === '' ||
        value === null ||
        value === undefined
      ) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (resetPage) {
      next.delete('page');
    }

    setSp(next);
  };

  const toggleIn = (key, list, value) => {
    const next = list.includes(value)
      ? list.filter((x) => x !== value)
      : [...list, value];

    patch({
      [key]: next.join(','),
    });
  };

  /* =========================
     CATEGORY STRUCTURE
  ========================= */

  const parents = cats.filter((c) => c.isParent);

  const childrenOf = (parentSlug) =>
    cats.filter(
      (c) =>
        !c.isParent &&
        c.parent === parentSlug
    );

  /* =========================
     SEARCH FILTER CHIPS
  ========================= */

  const activeChips = isSearchPage
    ? [
        ...selCats.map((c) => ({
          label:
            cats.find((x) => x.slug === c)?.name || c,

          clear: () =>
            toggleIn(
              'category',
              selCats,
              c
            ),
        })),

        ...(min || max
          ? [
              {
                label: `৳${min || 0} – ৳${max || '∞'}`,

                clear: () =>
                  patch({
                    min: '',
                    max: '',
                  }),
              },
            ]
          : []),

        ...(size
          ? [
              {
                label: `Size: ${size}`,

                clear: () =>
                  patch({
                    size: '',
                  }),
              },
            ]
          : []),

        ...(search
          ? [
              {
                label: `"${search}"`,

                clear: () =>
                  patch({
                    search: '',
                  }),
              },
            ]
          : []),
      ]
    : [];

  /* =========================
     PRODUCTS
  ========================= */

  const products = data?.items || [];

  const title = category
    ? category.name
    : search
      ? `Search results for "${search}"`
      : 'All Products';

  /* =========================
     RETURN
  ========================= */

  return (
    <div className="listing-page">

      {/* ==================================================
          SEARCH PAGE
      ================================================== */}

      {isSearchPage ? (
        <div className="search-page">

          <div className="search-heading">

            <div className="search-heading-left">

              <h1>
                Search results for{' '}
                <span>"{search}"</span>
              </h1>

              {data && (
                <p>
                  {data.total || 0} products found
                </p>
              )}

            </div>

            <div className="search-sort">
              <label>Sort by</label>

              <select
                value={sort}
                onChange={(e) =>
                  patch({
                    sort: e.target.value,
                  })
                }
              >
                {SORTS.map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="search-layout">

            {/* FILTERS */}

            <aside className="search-filters">

              <div className="filter-header">

                <h3>Filters</h3>

                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        category: '',
                        min: '',
                        max: '',
                        size: '',
                      })
                    }
                  >
                    Clear all
                  </button>
                )}

              </div>

              {activeChips.length > 0 && (
                <div className="filter-group">

                  <h4>Applied</h4>

                  <div className="filter-chips">

                    {activeChips.map(
                      (chip, index) => (
                        <button
                          type="button"
                          className="filter-chip"
                          key={index}
                          onClick={chip.clear}
                        >
                          {chip.label}
                          <X size={13} />
                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* CATEGORY */}

              <div className="filter-group">

                <h4>Categories</h4>

                <div className="filter-category-list">

                  {parents.map(
                    (parent, parentIndex) => (
                      <div
                        className="filter-parent"
                        key={
                          parent.slug ||
                          parent._id ||
                          `parent-${parentIndex}`
                        }
                      >

                        <Link
                          to={`/category/${parent.slug}`}
                          className="filter-parent-link"
                        >
                          {parent.name}
                        </Link>

                        <div className="filter-children">

                          {childrenOf(
                            parent.slug
                          ).map(
                            (child, childIndex) => (
                              <label
                                key={
                                  child.slug ||
                                  child._id ||
                                  `${parent.slug}-${childIndex}`
                                }
                                className="filter-checkbox"
                              >

                                <input
                                  type="checkbox"
                                  checked={selCats.includes(
                                    child.slug
                                  )}
                                  onChange={() =>
                                    toggleIn(
                                      'category',
                                      selCats,
                                      child.slug
                                    )
                                  }
                                />

                                <span>
                                  {child.name}
                                </span>

                              </label>
                            )
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* PRICE */}

              <div className="filter-group">

                <h4>Price</h4>

                <div className="price-range-label">
                  <strong>৳{Number(min || 0).toLocaleString()}</strong>
                  <strong>৳{Number(max || PRICE_LIMIT).toLocaleString()}</strong>
                </div>

                <div className="price-range">
                  <div className="price-range-track" />
                  <input
                    className="price-range-input price-range-min"
                    type="range"
                    min="0"
                    max={PRICE_LIMIT}
                    step="100"
                    value={min || 0}
                    aria-label="Minimum price"
                    onChange={(event) => {
                      const value = Math.min(
                        Number(event.target.value),
                        Number(max || PRICE_LIMIT)
                      );
                      patch({ min: value ? String(value) : '' });
                    }}
                  />
                  <input
                    className="price-range-input price-range-max"
                    type="range"
                    min="0"
                    max={PRICE_LIMIT}
                    step="100"
                    value={max || PRICE_LIMIT}
                    aria-label="Maximum price"
                    onChange={(event) => {
                      const value = Math.max(
                        Number(event.target.value),
                        Number(min || 0)
                      );
                      patch({ max: value < PRICE_LIMIT ? String(value) : '' });
                    }}
                  />
                </div>

                {(min || max) && (
                  <button
                    type="button"
                    className="price-clear"
                    onClick={() => patch({ min: '', max: '' })}
                  >
                    Clear price
                  </button>
                )}

              </div>

            </aside>

            {/* SEARCH PRODUCTS */}

            <main className="search-products">

              {loading ? (
                <div className="listing-loading">
                  <Spinner />
                </div>
              ) : !products.length ? (

                <div className="listing-empty">

                  <div className="empty-icon">
                    🔎
                  </div>

                  <h2>Nothing matched</h2>

                  <p>
                    Try removing a filter or search
                    for something else.
                  </p>

                  <Link
                    to="/products"
                    className="empty-link"
                  >
                    Browse all products
                  </Link>

                </div>

              ) : (

                <>
                  <div className="search-product-grid">

                    {products.map((product) => (
                      <ProductCard
                        p={product}
                        key={product._id}
                        compact
                      />
                    ))}

                  </div>

                  {data?.pages > 1 && (
                    <Pagination
                      page={page}
                      pages={data.pages}
                      patch={patch}
                    />
                  )}

                </>

              )}

            </main>

          </div>

        </div>

      ) : (

        /* ==================================================
           CATEGORY PAGE
        ================================================== */

        <div className="category-page">

          {/* BANNER */}

          {category?.banner && (
            <div className="category-banner">

              <img
                src={category.banner}
                alt={category.name}
              />

            </div>
          )}

          {/* TITLE */}

          <div className="category-title-bar">

            <div className="category-title-inner">

              <div className="category-title-breadcrumb">

                <Link to="/">Home</Link>

                <ChevronRight size={13} />

                <span>Category</span>

              </div>

              <div className="category-title-content">
                <h1>{title}</h1>

                <div className="search-sort category-sort">
                  <label htmlFor="category-sort">Sort by</label>

                  <select
                    id="category-sort"
                    value={sort}
                    onChange={(e) =>
                      patch({
                        sort: e.target.value,
                      })
                    }
                  >
                    {SORTS.map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </div>

          {loading ? (

            <div className="listing-loading category-loading">
              <Spinner />
            </div>

          ) : !products.length ? (

            <div className="listing-empty category-empty">

              <div className="empty-icon">
                🛍️
              </div>

              <h2>No products found</h2>

              <p>
                There are no products available
                in this category yet.
              </p>

              <Link
                to="/products"
                className="empty-link"
              >
                Browse all products
              </Link>

            </div>

          ) : (

            <>

              <section className="category-section for-you-section">

                <div className="category-section-header">

                  {/* <h2>All Products</h2> */}

                </div>

                <div className="for-you-grid">

                  {products.map((product) => (
                    <div
                      className="for-you-card"
                      key={product._id}
                    >
                      <ProductCard
                        p={product}
                        compact
                      />
                    </div>
                  ))}

                </div>

                {data?.pages > 1 && (
                  <Pagination
                    page={page}
                    pages={data.pages}
                    patch={patch}
                  />
                )}

              </section>

            </>

          )}

        </div>

      )}

    </div>
  );
}


/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  pages,
  patch,
}) {
  return (
    <div className="pager">

      <button
        type="button"
        disabled={page <= 1}
        onClick={() =>
          patch(
            {
              page: String(page - 1),
            },
            false
          )
        }
      >
        ‹
      </button>

      {Array.from(
        {
          length: Math.min(7, pages),
        },
        (_, index) => {

          const currentPage =
            Math.max(
              1,
              Math.min(
                pages - 6,
                page - 3
              )
            ) + index;

          if (currentPage > pages) {
            return null;
          }

          return (
            <button
              type="button"
              key={currentPage}
              className={
                currentPage === page
                  ? 'on'
                  : ''
              }
              onClick={() =>
                patch(
                  {
                    page: String(currentPage),
                  },
                  false
                )
              }
            >
              {currentPage}
            </button>
          );
        }
      )}

      <button
        type="button"
        disabled={page >= pages}
        onClick={() =>
          patch(
            {
              page: String(page + 1),
            },
            false
          )
        }
      >
        ›
      </button>

    </div>
  );
}