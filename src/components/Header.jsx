import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  MessageCircle,
  Headphones,
  Mail,
  Phone,
  ChevronDown,
  Bell,
  BadgeCheck,
  ShoppingCart,
  MapPin,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Smartphone,
} from 'lucide-react';

import { useStore } from '../context/StoreContext.jsx';
import api from '../api.js';
import { flattenCategories } from '../adapters.js';

import './Header.css';


/* =========================================================
   LOGO
   ========================================================= */

export function Logo({ light = false }) {
  const { media } = useStore();
  return (
    <span className="logo">
      <img
        src={media.logo?.url || '/img/brand/govaly-logo.png'}
        alt="Govaly"
        className={`logo-img${light ? ' logo-img-light' : ''}`}
      />
    </span>
  );
}


/* =========================================================
   SEARCH SUGGESTIONS
   ========================================================= */

function SearchSuggest({ q, cats, onPick }) {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = q.trim();

    if (!s) {
      setProducts([]);
      setOpen(false);
      return;
    }

    const t = setTimeout(() => {
      api
        .get('/customer/products', {
          params: {
            search: s,
            limit: 5,
          },
        })
        .then(({ data }) => {
          setProducts(data.items || []);
          setOpen(true);
        })
        .catch(() => { });
    }, 220);

    return () => clearTimeout(t);
  }, [q]);

  const s = q.trim().toLowerCase();

  const categories = s
    ? cats
      .filter((c) =>
        c.name.toLowerCase().includes(s)
      )
      .slice(0, 5)
    : [];

  const has = categories.length || products.length;

  if (!open || !has) return null;

  return (
    <div
      className="search-sug"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Categories */}

      {categories.length > 0 && (
        <>
          <div className="sug-head">
            Categories
          </div>

          {categories.map((c) => (
            <button
              key={c.slug || c._id}
              className="sug-row"
              onClick={() =>
                onPick({
                  type: 'cat',
                  slug: c.slug,
                })
              }
            >
              <Search
                size={14}
                className="sug-ic"
              />

              <span className="sug-name">
                {c.name}
              </span>

              <span className="sug-tag">
                {c.isParent
                  ? 'Category'
                  : 'Sub-category'}
              </span>
            </button>
          ))}
        </>
      )}

      {/* Products */}

      {products.length > 0 && (
        <>
          <div className="sug-head">
            Products
          </div>

          {products.map((p) => (
            <button
              key={p.slug || p._id}
              className="sug-row"
              onClick={() =>
                onPick({
                  type: 'prod',
                  slug: p.slug,
                })
              }
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt=""
                  className="sug-thumb"
                />
              ) : (
                <span className="sug-thumb sug-thumb-empty" />
              )}

              <span className="sug-name">
                {p.name}
              </span>

              <b className="sug-price">
                ৳{p.sale_price}
              </b>
            </button>
          ))}
        </>
      )}

      {/* See all */}

      <button
        className="sug-row sug-all"
        onClick={() =>
          onPick({
            type: 'search',
          })
        }
      >
        <Search
          size={14}
          className="sug-ic"
        />

        See all results for "
        {q.trim()}
        "
      </button>
    </div>
  );
}


/* =========================================================
   ACCOUNT MENU
   ========================================================= */

function AccountMenu() {
  const { user, logout } = useStore();

  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  const nav = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      close
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        close
      );
  }, []);

  /* Not logged in */

  if (!user) {
    return (
      <Link
        className="nav-icon account-login"
        to="/login"
        title="Account"
      >
        <span className="account-login-icon">
          <User size={24} />
        </span>

        <span>Account</span>
      </Link>
    );
  }

  const items = [
    [
      ShoppingCart,
      'My Orders',
      '/profile/orders',
    ],
    [
      Heart,
      'My Wishlist',
      '/profile/wishlist',
    ],
    [
      MapPin,
      'My Addresses',
      '/profile/addresses',
    ],
    [
      User,
      'Account Information',
      '/profile/account',
    ],
    [
      Settings,
      'Settings',
      '/profile/settings',
    ],
    [
      HelpCircle,
      'Govaly Helpline',
      '/profile/helpline',
    ],
  ];

  return (
    <div
      className="acct-wrap"
      ref={ref}
    >
      {/* Account button */}

      <button
        className="nav-icon acct-btn"
        onClick={() =>
          setOpen(!open)
        }
        aria-expanded={open}
      >
        <span className="acct-avatar">
          {user.name?.[0]?.toUpperCase() || 'G'}
        </span>

        <span className="acct-hi">
          <span>
            Hi, {user.name?.split(' ')[0]}
          </span>

          <b>
            Account
            <ChevronDown size={16} />
          </b>
        </span>
      </button>

      {/* Dropdown */}

      {open && (
        <div className="acct-menu">

          <div className="acct-head">
            <div>
              <b className="acct-user-name">
                {user.name}

                <BadgeCheck
                  size={14}
                  color="#1d9bf0"
                />
              </b>

              <span className="mut">
                {user.email}
              </span>
            </div>

            <Bell
              size={17}
              color="#777"
            />
          </div>

          {items.map(
            ([Ic, label, to]) => (
              <button
                key={to}
                className="acct-item"
                onClick={() => {
                  setOpen(false);
                  nav(to);
                }}
              >
                <Ic size={16} />

                {label}
              </button>
            )
          )}

          <button
            className="acct-item acct-out"
            onClick={() => {
              setOpen(false);
              logout();
              nav('/');
            }}
          >
            <LogOut size={16} />

            Log Out
          </button>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   MOBILE DRAWER
   ========================================================= */

function MobileDrawer({
  open,
  onClose,
  categories = [],
  user,
  logout,
  nav,
}) {
  const [acc, setAcc] = useState(null);

  if (!open) return null;

  const slugify = (value = '') =>
    String(value)
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  return (
    <>
      <div
        className="drawer-veil"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="drawer drawer-categories-only"
        aria-label="Categories"
      >
        {/* Header */}
        <div className="drawer-category-header">
          <span>Categories</span>

          <button
            type="button"
            className="drawer-category-close"
            onClick={onClose}
            aria-label="Close categories"
          >
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        {/* Category list */}
        <div className="drawer-category-list">
          {/* For You */}
          <Link
            to="/products"
            onClick={onClose}
            className="drawer-category-row drawer-category-for-you"
          >
            <span>For You</span>
          </Link>

          {/* Backend categories */}
          {categories.map((category, index) => {
            const categoryKey =
              category._id ||
              category.slug ||
              `${slugify(category.name)}-${index}`;

            const categorySlug =
              category.slug || slugify(category.name);

            const subcategories = Array.isArray(category.subcategory)
              ? category.subcategory
              : Array.isArray(category.children)
                ? category.children
                : [];

            const hasChildren = subcategories.length > 0;
            const isOpen = acc === categoryKey;

            return (
              <div
                key={categoryKey}
                className="drawer-category-group"
              >
                <button
                  type="button"
                  className={`drawer-category-row ${
                    isOpen ? 'is-open' : ''
                  }`}
                  onClick={() =>
                    setAcc(isOpen ? null : categoryKey)
                  }
                  aria-expanded={isOpen}
                >
                  <span>{category.name}</span>

                  {hasChildren && (
                    <ChevronDown
                      size={20}
                      strokeWidth={2}
                      className={`drawer-category-chevron ${
                        isOpen ? 'rotated' : ''
                      }`}
                    />
                  )}
                </button>

                {isOpen && hasChildren && (
                  <div className="drawer-subcategory-list">
                    <Link
                      to={`/category/${categorySlug}`}
                      onClick={onClose}
                      className="drawer-subcategory-link drawer-see-all"
                    >
                      See All
                    </Link>

                    {subcategories.map((sub, subIndex) => {
                      const subName =
                        sub?.name || `Subcategory ${subIndex + 1}`;

                      /*
                       * The current backend subcategory objects contain
                       * name/image/_id but not slug. We therefore keep the
                       * displayed name directly from the backend and use
                       * its slug when one exists. Otherwise use a stable
                       * name-based route fallback.
                       */
                      const subSlug =
                        sub?.slug || slugify(subName);

                      return (
                        <Link
                          key={
                            sub?._id ||
                            sub?.slug ||
                            `${categoryKey}-sub-${subIndex}`
                          }
                          to={`/category/${subSlug}`}
                          onClick={onClose}
                          className="drawer-subcategory-link"
                        >
                          {subName}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support / seller section */}
        <div className="drawer-support">
          <a
            className="drawer-support-card"
            href="https://wa.me/8801907104920"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="drawer-support-left">
              <Headphones size={19} />
              <span>Govaly Helpline</span>
            </span>
            <span className="drawer-support-external">↗</span>
          </a>

          <a
            className="drawer-support-card"
            href="mailto:support@govaly.com.bd"
          >
            <span className="drawer-support-left">
              <Mail size={19} />
              <span>support@govaly.com.bd</span>
            </span>
            <span className="drawer-support-external">↗</span>
          </a>

          <a
            className="drawer-support-card"
            href="tel:+8801969901212"
          >
            <span className="drawer-support-left">
              <Phone size={19} />
              <span>01969901212</span>
            </span>
            <span className="drawer-support-external">↗</span>
          </a>

          <a
            className="drawer-support-card"
            href="https://wa.me/8801907104920"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="drawer-support-left">
              <MessageCircle size={20} />
              <span>01907104920</span>
            </span>
            <span className="drawer-support-external">↗</span>
          </a>

          <Link
            className="drawer-support-card"
            to="/seller/register"
            onClick={onClose}
          >
            <span className="drawer-support-left">
              <StoreIcon />
              <span>Become A Seller</span>
            </span>
            <span className="drawer-support-external">↗</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

function StoreIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10l2-6h14l2 6" />
      <path d="M4 10v9h16v-9" />
      <path d="M3 10c0 1.7 1.2 3 3 3s3-1.3 3-3c0 1.7 1.2 3 3 3s3-1.3 3-3c0 1.7 1.2 3 3 3s3-1.3 3-3" />
      <path d="M8 19v-4h8v4" />
    </svg>
  );
}

/* =========================================================
   MAIN HEADER
   ========================================================= */

export default function Header() {

  const {
    user,
    cartQty,
    wishlist,
    logout,
  } = useStore();

  const [q, setQ] =
    useState('');

  const [cats, setCats] =
    useState([]);

  // Original nested category tree from the backend.
  // Used by the categories drawer.
  const [categoryTree, setCategoryTree] =
    useState([]);

  const [drawer, setDrawer] =
    useState(false);

  const nav =
    useNavigate();

  const { pathname } =
    useLocation();


  /* =====================================================
     LOAD CATEGORIES
     ===================================================== */

  useEffect(() => {

    api
      .get('/customer/categories')
      .then(({ data }) => {
        const rawCategories = data.data || [];

        // Original nested data -> Categories drawer.
        setCategoryTree(rawCategories);

        // Existing flattened data -> search suggestions.
        setCats(
          flattenCategories(rawCategories)
        );
      })
      .catch(() => {
        setCategoryTree([]);
        setCats([]);
      });

  }, []);


  /* =====================================================
     SEARCH
     ===================================================== */

  const submit = (e) => {

    e.preventDefault();

    const search =
      q.trim();

    nav(
      `/products?search=${encodeURIComponent(
        search
      )}`
    );
  };


  /* =====================================================
     SEARCH PICK
     ===================================================== */

  const pick =
    useCallback(
      (s) => {

        if (
          s.type === 'cat'
        ) {
          nav(
            `/category/${s.slug}`
          );

        } else if (
          s.type === 'prod'
        ) {
          nav(
            `/product/${s.slug}`
          );

        } else {
          nav(
            `/products?search=${encodeURIComponent(
              q.trim()
            )}`
          );
        }

      },
      [nav, q]
    );


  /* =====================================================
     CATEGORY DATA
     ===================================================== */

  const showSellerBar = pathname === '/' && !user;


  return (
    <>

      {/* =================================================
          TOP SELLER BAR
          ================================================= */}

      {showSellerBar && (
        <div className="seller-topbar">

        <div className="seller-topbar-inner">

          <Link
            to="/seller/register"
            className="seller-link"
          >
            Become a Seller
          </Link>

          <span className="seller-divider" />

          <Link
            to="/seller/login"
            className="seller-link"
          >
            Login as Seller
          </Link>

        </div>

        </div>
      )}


      {/* =================================================
          MAIN NAVBAR
          ================================================= */}

      <header className="nav-wrap">

        <div className="container nav">

          {/* Hamburger */}

          <button
            className="burger"
            onClick={() =>
              setDrawer(true)
            }
            aria-label="Open menu"
          >
            <Menu size={35} />
          </button>


          {/* Logo */}

          <Link
            to="/"
            aria-label="Govaly home"
            className="header-logo-link"
          >
            <Logo light />
          </Link>


          {/* Search */}

          <form
            className="nav-search"
            onSubmit={submit}
            autoComplete="off"
          >

            <Search
              size={18}
              className="search-icon"
            />

            <input
              placeholder="Search products..."
              value={q}
              onChange={(e) =>
                setQ(
                  e.target.value
                )
              }
              aria-label="Search products"
            />

            <button type="submit">
              Search
            </button>

            <SearchSuggest
              q={q}
              cats={cats}
              onPick={pick}
            />

          </form>


          {/* Right actions */}

          <div className="nav-actions">

            {/* Download app */}

            <a
              href="/download-app"
              className="app-download"
            >

              <span className="app-phone">
                <Smartphone
                  size={27}
                  strokeWidth={1.8}
                />
              </span>

              <span className="app-text">
                Download the
                <br />
                Govaly App
              </span>

            </a>


            <span className="nav-sep" />


            {/* Wishlist */}

            <Link
              className="nav-icon"
              to="/wishlist"
              title="Wishlist"
            >

              <span className="nav-icon-wrap">

                <Heart size={27} />

                {wishlist.length >
                  0 && (
                    <b className="nav-badge">
                      {wishlist.length >
                        99
                        ? '99+'
                        : wishlist.length}
                    </b>
                  )}

              </span>

              <span>
                Wishlist
              </span>

            </Link>


            {/* Cart */}

            <Link
              className="nav-icon"
              to="/cart"
              title="Cart"
            >

              <span className="nav-icon-wrap">

                <ShoppingBag
                  size={27}
                />

                {cartQty > 0 && (
                  <b className="nav-badge">
                    {cartQty > 99
                      ? '99+'
                      : cartQty}
                  </b>
                )}

              </span>

              <span>
                Cart
              </span>

            </Link>


            <span className="nav-sep" />


            {/* Account */}

            <AccountMenu />

          </div>

        </div>

      </header>




      {/* =================================================
          MOBILE DRAWER
          ================================================= */}

      <MobileDrawer
        open={drawer}
        onClose={() =>
          setDrawer(false)
        }
        categories={categoryTree}
        user={user}
        logout={logout}
        nav={nav}
      />

    </>
  );
}