import { Link } from 'react-router-dom';
import './Footer.css';

/* =========================================================
   GOVALY LOGO
   ========================================================= */

const GOVALY_LOGO =
  'https://govaly.com.bd/assets/logo/govaly-new-short.png';

/* =========================================================
   PAYMENT SECTION IMAGE
   Complete payment section including:
   Pay With + payment logos + SSLCOMMERZ
   ========================================================= */

const PAYMENT_SECTION_IMAGE =
  'https://govaly.com.bd/assets/logo/SSLCommerze_desktop.png';

/* =========================================================
   APPLE LOGO
   ========================================================= */

const APPLE_LOGO =
  'https://govaly.com.bd/assets/icons/Apple_logo.svg';

/* =========================================================
   GOVALY POLICIES
   ========================================================= */

const POLICIES = [
  {
    label: 'Return & Refund Policy',
    href: '/policy/return-refund',
  },
  {
    label: 'Exchange Policy',
    href: '/policy/exchange',
  },
  {
    label: 'Shipping & Delivery Policy',
    href: '/policy/shipping-delivery',
  },
  {
    label: 'Cancellation Policy',
    href: '/policy/cancellation',
  },
  {
    label: 'Privacy Policy',
    href: '/policy/privacy',
  },
  {
    label: 'Terms & Conditions',
    href: '/policy/terms',
  },
];

/* =========================================================
   GOVALY SELLER
   ========================================================= */

const SELLERS = [
  {
    label: 'Become A Seller',
    href: '/policy/terms',
  },
  {
    label: 'Seller Policy',
    href: '/policy/terms',
  },
  {
    label: 'Product Policy',
    href: '/policy/terms',
  },
  {
    label: 'Pickup & Delivery Policy',
    href: '/policy/shipping-delivery',
  },
  {
    label: 'Payment Policy',
    href: '/policy/terms',
  },
  {
    label: 'Seller Exchange & Return Policy',
    href: '/policy/exchange',
  },
];

/* =========================================================
   SOCIAL LINKS
   ========================================================= */

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/govaly.shop',
    d: 'M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V14h2.7v8h3.4z',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/govalyshopping',
    d: 'M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 4.3c2.5 0 2.8 0 3.8.1.9 0 1.4.2 1.8.3.4.2.7.4 1 .7.3.3.5.6.7 1 .1.3.3.9.3 1.8 0 1 0 1.3 0 3.8s0 2.8-.1 3.8c0 .9-.2 1.4-.3 1.8a2.9 2.9 0 0 1-1.7 1.7c-.4.1-1 .3-1.8.3-1 0-1.3.1-3.8.1s-2.8 0-3.8-.1c-.9 0-1.4-.2-1.8-.3a2.9 2.9 0 0 1-1.7-1.7c-.1-.4-.3-1-.3-1.8 0-1-.1-1.3-.1-3.8s0-2.8.1-3.8c0-.9.2-1.4.3-1.8.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.4-.1 1-.3 1.8-.3 1-.1 1.3-.1 3.8-.1z',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@govalyshopping',
    d: 'M16.6 5.8a4.8 4.8 0 0 1-1-1.5 4.7 4.7 0 0 1-.4-1.8h-3v12a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .8.1V9a5.6 5.6 0 1 0 4.7 5.5V8.9a7.7 7.7 0 0 0 4.4 1.4v-3a4.8 4.8 0 0 1-3-1.5z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com',
    d: 'M22 12s0-3.3-.4-4.9c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.3c-.9.2-1.6.9-1.8 1.8C2 8.7 2 12 2 12s0 3.3.4 4.9c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.3c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.9.4-4.9zM10 15.5v-7l6 3.5-6 3.5z',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/8801907104920',
    d: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.1.5.2.6.4 0 .1 0 .8-.2 1.5z',
  },
];

/* =========================================================
   FOOTER COLUMN
   ========================================================= */

function FooterColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h4>{title}</h4>

      <ul>
        {links.map((item) => (
          <li key={item.label}>
            <Link to={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">

      {/* =====================================================
          TOP FOOTER CONTENT
          ===================================================== */}

      <div className="container">

        <div className="footer-grid">

          {/* =================================================
              BRAND + APP DOWNLOAD
              ================================================= */}

          <div className="footer-brand">
            <div className="fbrand">
              <Link to="/" className="footer-logo-link" aria-label="Govaly Home">
                <img
                  src={GOVALY_LOGO}
                  alt="Govaly"
                  className="footer-logo"
                />
              </Link>

              <div className="footer-brand-info">
                <p className="footer-brand-name">Govaly</p>

                <p className="footer-tagline">
                  Bangladesh&apos;s Favorite Online Fashion Mall
                </p>

                <p className="footer-dbid">
                  <strong>DBID</strong> - 751626035
                </p>
              </div>
            </div>

            {/* =================================================
                MOBILE APP DOWNLOAD
                ================================================= */}

            <div className="footer-app">

              <p className="footer-app-title">
                Download <span>Govaly</span> Mobile App
              </p>

              <div className="footer-app-buttons">

                {/* Google Play */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.govaly.govalybd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-store-btn"
                  aria-label="Download Govaly from Google Play"
                >

                  <svg
                    width="24"
                    height="26"
                    viewBox="0 0 23 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M16.6973 17.3389L2.54102 25.3848C1.9062 25.7447 1.32406 25.8045 0.87793 25.6133L12.9238 13.5654L16.6973 17.3389ZM12.2168 12.8584L0.183594 24.8936C0.0656134 24.6263 0 24.2986 0 23.917V1.80176C0 1.42057 0.0655179 1.09267 0.183594 0.825195L12.2168 12.8584ZM22.042 11.416C23.439 12.21 23.439 13.5097 22.042 14.3047L17.5996 16.8271L13.6309 12.8584L17.5977 8.89062L22.042 11.416ZM0.878906 0.106445C1.32496 -0.0846281 1.90655 -0.0246067 2.54102 0.335938L16.6963 8.37793L12.9238 12.1514L0.878906 0.106445Z"
                      fill="#191919"
                    />
                  </svg>

                  <div className="app-store-text">
                    <p>GET IT ON</p>
                    <p>Google Play</p>
                  </div>

                </a>

                {/* Apple App Store */}
                <a
                  href="https://apps.apple.com/app/govaly/id6757096963"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-store-btn"
                  aria-label="Download Govaly from App Store"
                >

                  <img
                    src={APPLE_LOGO}
                    alt="Apple"
                    className="apple-logo"
                  />

                  <div className="app-store-text">
                    <p>Download on the</p>
                    <p>App Store</p>
                  </div>

                </a>

              </div>

            </div>

          </div>

          {/* =================================================
              GOVALY POLICIES
              ================================================= */}

          <FooterColumn
            title="Govaly Policies"
            links={POLICIES}
          />

          {/* =================================================
              GOVALY SELLER
              ================================================= */}

          <FooterColumn
            title="Govaly Seller"
            links={SELLERS}
          />

          {/* =================================================
              SOCIAL LINKS
              ================================================= */}

          <div className="footer-column">

            <h4>Social Links</h4>

            <ul className="footer-socials">

              {SOCIALS.map((social) => (
                <li key={social.label}>

                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    aria-label={social.label}
                  >

                    <svg
                      viewBox="0 0 24 24"
                      className="footer-social-icon"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d={social.d} />
                    </svg>

                    <span>{social.label}</span>

                  </a>

                </li>
              ))}

            </ul>

          </div>

        </div>

      </div>

      {/* =====================================================
          PAYMENT SECTION
          ===================================================== */}

      <div className="payment-strip">

        <div className="container">

          <div className="payment-image-wrapper">

            <img
              src={PAYMENT_SECTION_IMAGE}
              alt="Payment Methods and SSLCOMMERZ"
              className="payment-section-image"
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          COPYRIGHT
          ===================================================== */}

      <div className="footer-bottom">
        © {currentYear} Govaly Limited
      </div>

    </footer>
  );
}