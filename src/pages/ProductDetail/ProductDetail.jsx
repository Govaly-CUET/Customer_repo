import './ProductDetail.css';

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Share2,
  Store,
  PackageCheck,
} from 'lucide-react';

import api from '../../api.js';
import {
  normalizeProduct,
  normalizeProductList,
} from '../../adapters.js';

import { useStore } from '../../context/StoreContext.jsx';
import { RatingStars, Spinner } from '../../components/ui/ui.jsx';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();

  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  // =====================================================
  // ALL HOOKS MUST BE HERE
  // =====================================================

  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    setData(null);
    setNotFound(false);
    setQty(1);
    setActiveTab('description');
    setShowFullDescription(false);
    setSelectedSize(null);

    const loadProduct = async () => {
      try {
        const response = await api.get(
          `/customer/products/${slug}`
        );

        const product = normalizeProduct(
          response.data.data
        );

        const reviewsPromise = api
          .get(`/customer/products/${slug}/reviews`)
          .then((res) => res.data?.data || [])
          .catch(() => []);

        const relatedPromise = api
          .get('/customer/products', {
            params: {
              category: product.category,
              subcategory: product.subcategory,
              limit: 8,
            },
          })
          .then((res) => {
            const items = res.data?.items || [];

            return normalizeProductList(items).filter(
              (item) => item._id !== product._id
            );
          })
          .catch(() => []);

        const [reviews, related] = await Promise.all([
          reviewsPromise,
          relatedPromise,
        ]);

        if (cancelled) return;

        setData({
          product,
          reviews,
          related,
        });
      } catch (error) {
        if (cancelled) return;

        console.error(
          '[ProductDetail] Failed to load product:',
          error
        );

        setNotFound(true);
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // =====================================================
  // LOADING / NOT FOUND
  // =====================================================

  if (notFound) {
    return (
      <div className="container empty pdp-empty">
        <h3>Product not found</h3>

        <p>
          It may have been removed.{' '}
          <Link
            className="link-brand"
            to="/products"
          >
            Continue shopping →
          </Link>
        </p>
      </div>
    );
  }

  if (!data) {
    return <Spinner />;
  }

  // =====================================================
  // PRODUCT DATA
  // =====================================================

  const {
    product: p,
    reviews = [],
    related = [],
  } = data;

  const fav = isWishlisted(p._id);

  const productRating = Number(p.rating || 0);

  const numReviews = Number(
    p.numReviews ?? reviews.length ?? 0
  );

  const stock = Number(p.stock || 0);

  // =====================================================
  // ONE PRODUCT IMAGE ONLY
  // =====================================================

  const productImage =
    p.images?.[0] ||
    p.image ||
    '/placeholder-product.png';

  // =====================================================
  // SIZE OPTIONS
  // =====================================================

  const sizeOptions =
    p.sizes ||
    p.availableSizes ||
    p.sizeOptions ||
    p.variants
      ?.map((variant) => variant.size)
      ?.filter(Boolean) ||
    [];

  const uniqueSizes = [
    ...new Set(
      sizeOptions
        .map((size) => String(size).trim())
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // RATING DISTRIBUTION
  // ACTUAL REVIEWS ONLY
  // =====================================================

  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (star) => {
      const count = reviews.filter(
        (review) =>
          Number(review.rating) === star
      ).length;

      return {
        star,
        count,
        percentage: reviews.length
          ? Math.round(
              (count / reviews.length) * 100
            )
          : 0,
      };
    }
  );

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const description =
    p.description ||
    'No product description available.';

  // =====================================================
  // CATEGORY
  // =====================================================

  const categoryName =
    p.categoryName ||
    p.category?.replace(/-/g, ' ') ||
    'Products';

  // =====================================================
  // SELLER
  // ONLY USED IN SHOP CARD
  // =====================================================

  const sellerName =
    (p.seller || 'Govaly')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  // =====================================================
  // BUY NOW
  // =====================================================

  const buyNow = () => {
    if (stock <= 0) return;

    addToCart(
      p,
      selectedSize,
      qty,
      true,
      null
    );

    nav('/cart');
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (stock <= 0) return;

    addToCart(
      p,
      selectedSize,
      qty,
      false,
      null
    );
  };

  // =====================================================
  // SHARE
  // =====================================================

  const handleShare = async () => {
    const shareData = {
      title: p.name,
      text: p.name,
      url: window.location.href,
    };

    try {
      if (
        navigator.share &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share(shareData);
      } else if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert('Product link copied.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error(
          '[ProductDetail] Share failed:',
          error
        );
      }
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="pdp-page">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

    


      {/* =================================================
          MAIN PRODUCT SECTION
      ================================================= */}

      <section className="container pdp-main">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="pdp-left">

          {/* PRODUCT IMAGE */}

          <div className="pdp-image-wrap">

            <img
              src={productImage}
              alt={p.name}
              className="pdp-product-image"
            />

          </div>


          {/* =================================================
              DESCRIPTION / REVIEWS
          ================================================= */}

          <div className="pdp-bottom-content">

            {/* TABS */}

            <div className="pdp-tabs">

              <button
                type="button"
                className={
                  activeTab === 'description'
                    ? 'pdp-tab active'
                    : 'pdp-tab'
                }
                onClick={() =>
                  setActiveTab('description')
                }
              >
                Description
              </button>


              <button
                type="button"
                className={
                  activeTab === 'reviews'
                    ? 'pdp-tab active'
                    : 'pdp-tab'
                }
                onClick={() =>
                  setActiveTab('reviews')
                }
              >
                Product Reviews

                {numReviews > 0 && (
                  <span className="pdp-review-badge">
                    {numReviews > 9
                      ? '9+'
                      : numReviews}
                  </span>
                )}

              </button>

            </div>


            {/* =================================================
                DESCRIPTION TAB
            ================================================= */}

            {activeTab === 'description' && (
              <div className="pdp-description-area">

                <div
                  className={
                    showFullDescription
                      ? 'pdp-description-box expanded'
                      : 'pdp-description-box'
                  }
                >

                  <div className="pdp-description-text">
                    {description}
                  </div>

                  {!showFullDescription && (
                    <div className="pdp-description-fade" />
                  )}

                </div>


                {!showFullDescription &&
                  description.length > 300 && (
                    <button
                      type="button"
                      className="pdp-see-more"
                      onClick={() =>
                        setShowFullDescription(true)
                      }
                    >
                      See More
                    </button>
                  )}

              </div>
            )}


            {/* =================================================
                REVIEWS TAB
            ================================================= */}

            {activeTab === 'reviews' && (
              <div className="pdp-reviews-area">

                <h2 className="pdp-reviews-title">
                  Product Reviews ({numReviews})
                </h2>


                {reviews.length === 0 ? (
                  <div className="pdp-no-reviews">
                    No reviews yet.
                  </div>
                ) : (

                  <div className="pdp-review-list">

                    {reviews.map((review) => {

                      const customerName =
                        review.customer?.name ||
                        review.customerName ||
                        review.user?.name ||
                        'Customer';

                      const reviewDate =
                        review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : '';

                      return (
                        <article
                          className="pdp-review-card"
                          key={review._id}
                        >

                          <div className="pdp-review-top">

                            <div>

                              <h4>
                                {customerName}
                              </h4>

                              <div className="pdp-review-meta">

                                {review.size && (
                                  <span>
                                    Size: {review.size}
                                  </span>
                                )}

                                {reviewDate && (
                                  <span>
                                    {reviewDate}
                                  </span>
                                )}

                              </div>

                            </div>


                            <div className="pdp-review-rating">

                              <span>
                                ★
                              </span>

                              {Number(
                                review.rating || 0
                              ).toFixed(1)}

                            </div>

                          </div>


                          {review.comment && (
                            <p className="pdp-review-comment">
                              {review.comment}
                            </p>
                          )}

                        </article>
                      );
                    })}

                  </div>

                )}

              </div>
            )}

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <aside className="pdp-right">

          {/* =================================================
              TITLE + SHARE
          ================================================= */}

          <div className="pdp-title-row">

            <h1 className="pdp-title">
              {p.name}
            </h1>

            <button
              type="button"
              className="pdp-share"
              onClick={handleShare}
              aria-label="Share product"
            >
              <Share2 size={19} />
            </button>

          </div>


          {/* =================================================
              RATING / SOLD / STOCK
          ================================================= */}

          <div className="pdp-meta-row">

            <span className="pdp-rating">
              ★ {productRating.toFixed(1)}
            </span>

            <span>
              {numReviews} Reviews
            </span>

            <span>•</span>

            <span>
              Sold {p.sold || 0}
            </span>

            <span>•</span>

            <span>
              Stock {stock}
            </span>

          </div>


          {/* =================================================
              SINGLE PRICE
          ================================================= */}

          <div className="pdp-price">
            ৳
            {Number(
              p.price || 0
            ).toLocaleString('en-IN')}
          </div>


          {/* =================================================
              SIZE
          ================================================= */}

          {uniqueSizes.length > 0 && (
            <div className="pdp-size-section">

              <div className="pdp-size-header">

                <span>
                  Select Size
                </span>

                <button
                  type="button"
                  className="pdp-size-guide"
                >
                  Size Guide
                </button>

              </div>


              <div className="pdp-size-list">

                {uniqueSizes.map((size) => (

                  <button
                    type="button"
                    key={size}
                    className={
                      selectedSize === size
                        ? 'pdp-size-button active'
                        : 'pdp-size-button'
                    }
                    onClick={() =>
                      setSelectedSize(size)
                    }
                  >
                    {size}
                  </button>

                ))}

              </div>

            </div>
          )}


          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="pdp-quantity-row">

            <span className="pdp-quantity-label">
              Quantity
            </span>

            <div className="pdp-quantity">

              <button
                type="button"
                onClick={() =>
                  setQty((value) =>
                    Math.max(
                      1,
                      value - 1
                    )
                  )
                }
                disabled={qty <= 1}
              >
                −
              </button>

              <span>
                {qty}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQty((value) =>
                    Math.min(
                      stock > 0
                        ? stock
                        : 10,
                      value + 1
                    )
                  )
                }
                disabled={
                  stock <= 0 ||
                  qty >= stock
                }
              >
                +
              </button>

            </div>

          </div>


          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="pdp-actions">

            <button
              type="button"
              className="pdp-buy-button"
              onClick={buyNow}
              disabled={stock <= 0}
            >
              Buy Now
            </button>


            <button
              type="button"
              className="pdp-cart-button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
            >

              <ShoppingBag size={18} />

              Add to Cart

            </button>


            <button
              type="button"
              className={
                fav
                  ? 'pdp-wishlist-button active'
                  : 'pdp-wishlist-button'
              }
              onClick={() =>
                toggleWishlist(p)
              }
              aria-label="Wishlist"
            >

              <Heart
                size={20}
                fill={
                  fav
                    ? 'currentColor'
                    : 'none'
                }
              />

            </button>

          </div>


          {/* =================================================
              SERVICE + SHOP
              SELLER ONLY APPEARS HERE
          ================================================= */}

          <div className="pdp-service-shop">

            <div className="pdp-services">

              <div className="pdp-service-item">

                <Truck size={18} />

                <div>

                  <strong>
                    Delivery
                  </strong>

                  <span>
                    Fast delivery to your address
                  </span>

                </div>

              </div>


              <div className="pdp-service-item">

                <RotateCcw size={18} />

                <div>

                  <strong>
                    Return & Exchange
                  </strong>

                  <span>
                    Easy return within 7 days
                  </span>

                </div>

              </div>


              <div className="pdp-service-item">

                <PackageCheck size={18} />

                <div>

                  <strong>
                    Promised Delivery
                  </strong>

                  <span>
                    Delivery as promised
                  </span>

                </div>

              </div>


              <div className="pdp-service-item">

                <CreditCard size={18} />

                <div>

                  <strong>
                    Payment
                  </strong>

                  <span>
                    Cash on delivery available
                  </span>

                </div>

              </div>


              <div className="pdp-service-item">

                <ShieldCheck size={18} />

                <div>

                  <strong>
                    Authentic Product
                  </strong>

                  <span>
                    100% authentic product
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                SHOP CARD
            ================================================= */}

            <Link
              to={`/seller/${p.seller}`}
              className="pdp-shop-card"
            >

              <div className="pdp-shop-icon">
                <Store size={21} />
              </div>

              <div className="pdp-shop-text">

                <span>
                  Shop
                </span>

                <strong>
                  {sellerName}
                </strong>

              </div>

              <ChevronRight size={18} />

            </Link>

          </div>


          {/* =================================================
              RATING & REVIEWS SUMMARY
          ================================================= */}

          <div className="pdp-rating-summary">

            <h3>
              Rating & Reviews
            </h3>


            <div className="pdp-rating-summary-content">

              {/* SCORE */}

              <div className="pdp-rating-score">

                <strong>
                  {productRating.toFixed(1)}
                </strong>

                <RatingStars
                  value={productRating}
                  size={17}
                />

                <span>
                  {numReviews} Reviews
                </span>

              </div>


              {/* RATING BARS */}

              <div className="pdp-rating-bars">

                {ratingDistribution.map(
                  ({
                    star,
                    count,
                    percentage,
                  }) => (

                    <div
                      className="pdp-rating-bar-row"
                      key={star}
                    >

                      <span>
                        {star}★
                      </span>

                      <div className="pdp-rating-track">

                        <div
                          className="pdp-rating-fill"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>

                      <span className="pdp-rating-count">
                        {count}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </aside>

      </section>


      {/* =================================================
          SIMILAR PRODUCTS
      ================================================= */}

      {related.length > 0 && (
        <section className="container pdp-similar">

          <div className="pdp-section-heading">

            <h2>
              Similar Products
            </h2>

            <Link to="/products">
              View All
            </Link>

          </div>


          <div className="pdp-similar-grid">

            {related
              .slice(0, 6)
              .map((product) => (
                <ProductCard
                  key={product._id}
                  p={product}
                  compact
                />
              ))}

          </div>

        </section>
      )}

    </main>
  );
}