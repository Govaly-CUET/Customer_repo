import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import BottomNav from '../components/BottomNav/BottomNav.jsx';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { Toasts, RequireAuth } from '../components/Guards/Guards.jsx';

import Home from '../pages/Home/Home.jsx';
import Listing from '../pages/Listing/Listing.jsx';
import CategoryPage from '../pages/CategoryPage/CategoryPage.jsx';
import SellerPage from '../pages/SellerPage/SellerPage.jsx';
import ProductDetail from '../pages/ProductDetail/ProductDetail.jsx';
import Cart from '../pages/Cart/Cart.jsx';
import Checkout from '../pages/Checkout/Checkout.jsx';
import Payment from '../pages/Payment/Payment.jsx';
import OrderSuccess from '../pages/OrderSuccess/OrderSuccess.jsx';
import Orders from '../pages/Orders/Orders.jsx';
import Wishlist from '../pages/Wishlist/Wishlist.jsx';

import Auth from '../pages/Auth/Auth.jsx';

import Profile from '../pages/Profile/Profile.jsx';
import InfoPage from '../pages/InfoPages/InfoPages.jsx';
import {
  NotFound,
  ServerError,
  ServerDown,
} from '../pages/Errors/Errors.jsx';

import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary.jsx';

const AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
]);

const LAST_NON_AUTH_ROUTE_KEY = 'govaly:last-non-auth-route';

function getLastNonAuthRoute() {
  const saved = sessionStorage.getItem(LAST_NON_AUTH_ROUTE_KEY);
  return saved && !AUTH_PATHS.has(saved) ? saved : '/';
}

function BackgroundRoute({ path }) {
  if (path === '/') return <Home />;
  if (path === '/cart') return <Cart />;
  if (path === '/wishlist') return <Wishlist />;
  if (path === '/orders') return <Orders />;
  if (path === '/about') return <InfoPage page="about" />;
  if (path === '/contact') return <InfoPage page="contact" />;
  if (path === '/faq') return <InfoPage page="faq" />;
  if (path === '/returns') return <InfoPage page="returns" />;
  if (path === '/shipping') return <InfoPage page="shipping" />;
  if (path === '/terms') return <InfoPage page="terms" />;
  if (path === '/privacy') return <InfoPage page="privacy" />;
  if (path === '/report') return <InfoPage page="report" />;
  if (path === '/sitemap') return <InfoPage page="sitemap" />;
  if (path === '/checkout') return <RequireAuth><Checkout /></RequireAuth>;
  if (path === '/payment') return <RequireAuth><Payment /></RequireAuth>;
  if (path === '/profile' || path.startsWith('/profile/')) return <RequireAuth><Profile /></RequireAuth>;
  if (path.startsWith('/product/')) return <ProductDetail />;
  if (path.startsWith('/category/')) return <CategoryPage />;
  if (path.startsWith('/seller/')) return <SellerPage />;
  if (path.startsWith('/products')) return <Listing />;
  if (path.startsWith('/order-success/')) return <RequireAuth><OrderSuccess /></RequireAuth>;
  if (path === '/404') return <NotFound />;
  if (path === '/500') return <ServerError />;
  if (path === '/502') return <ServerDown code="502" />;
  if (path === '/503') return <ServerDown code="503" />;
  if (path === '/504') return <ServerDown code="504" />;
  if (path === '/505') return <ServerDown code="505" />;
  return <Home />;
}

function AuthRoute({ mode }) {
  const location = useLocation();

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('govaly:open-auth', {
        detail: { mode },
      })
    );
  }, [mode]);

  const backgroundLocation = location.state?.backgroundLocation;
  const lastRoute = backgroundLocation?.pathname || getLastNonAuthRoute();

  return (
    <>
      <BackgroundRoute path={lastRoute} />
      <div style={{ display: 'none' }} aria-hidden="true" />
    </>
  );
}

function ScrollTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname, search]);

  return null;
}

export default function App() {
  const location = useLocation();
  const routeLocation =
    location.state?.backgroundLocation || location;

  useEffect(() => {
    if (!AUTH_PATHS.has(location.pathname) && !location.pathname.startsWith('/reset-password/')) {
      sessionStorage.setItem(LAST_NON_AUTH_ROUTE_KEY, location.pathname || '/');
    }
  }, [location.pathname]);

  return (
    <>
      <ScrollTop />

      <Header />

      <main className="page">
        <ErrorBoundary>
          <Routes location={routeLocation}>
            {/* Main pages */}
            <Route path="/" element={<Home />} />

            <Route path="/products" element={<Listing />} />

            <Route
              path="/category/:slug"
              element={<CategoryPage />}
            />

            <Route
              path="/seller/:slug"
              element={<SellerPage />}
            />

            <Route
              path="/product/:slug"
              element={<ProductDetail />}
            />

            {/* Customer */}
            <Route path="/cart" element={<Cart />} />

            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />

            <Route
              path="/payment"
              element={
                <RequireAuth>
                  <Payment />
                </RequireAuth>
              }
            />

            <Route
              path="/order-success/:orderId"
              element={
                <RequireAuth>
                  <OrderSuccess />
                </RequireAuth>
              }
            />

            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <Orders />
                </RequireAuth>
              }
            />

            <Route path="/wishlist" element={<Wishlist />} />

            {/*
              Keep the URL routes for the existing modal-based auth flow.
              The actual UI stays in the global Auth component below.
            */}
            <Route path="/login" element={<AuthRoute mode="login" />} />
            <Route path="/register" element={<AuthRoute mode="register" />} />
            <Route path="/forgot-password" element={<AuthRoute mode="forgot" />} />
            <Route path="/reset-password/:token" element={<AuthRoute mode="forgot" />} />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            <Route
              path="/profile/:section"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            {/* Info / policy / company pages */}
            <Route
              path="/about"
              element={<InfoPage page="about" />}
            />

            <Route
              path="/contact"
              element={<InfoPage page="contact" />}
            />

            <Route
              path="/faq"
              element={<InfoPage page="faq" />}
            />

            <Route
              path="/returns"
              element={<InfoPage page="returns" />}
            />

            <Route
              path="/shipping"
              element={<InfoPage page="shipping" />}
            />

            <Route
              path="/terms"
              element={<InfoPage page="terms" />}
            />

            <Route
              path="/privacy"
              element={<InfoPage page="privacy" />}
            />

            <Route
              path="/report"
              element={<InfoPage page="report" />}
            />

            <Route
              path="/sitemap"
              element={<InfoPage page="sitemap" />}
            />

            {/* Error pages */}
            <Route path="/404" element={<NotFound />} />

            <Route
              path="/500"
              element={<ServerError />}
            />

            <Route
              path="/502"
              element={<ServerDown code="502" />}
            />

            <Route
              path="/503"
              element={<ServerDown code="503" />}
            />

            <Route
              path="/504"
              element={<ServerDown code="504" />}
            />

            <Route
              path="/505"
              element={<ServerDown code="505" />}
            />

            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer />

      <BottomNav />

      <Toasts />

      {/* =====================================================
          GLOBAL AUTH MODAL
          ===================================================== */}
      <Auth />
    </>
  );
}