import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import './HeroBanner.css';

export default function HeroBanner({ user }) {
  const { media } = useStore();
  const location = useLocation();
  const heroImage = media['top banner']?.url;

  // Page media is controlled from the database. Do not show a bundled or
  // third-party fallback after an admin removes the corresponding record.
  if (!heroImage) return null;

  return (
    <section className="hero-banner">

      <img
        src={heroImage}
        alt="Govaly Fashion"
        className="hero-banner-image"
      />

      {!user && (
        <div className="hero-banner-auth">
          <Link
            to="/login"
            state={{ backgroundLocation: location }}
            className="hero-banner-auth-link"
          >
            <User size={18} />
            <span>Login</span>
          </Link>

          <span className="hero-banner-divider">|</span>

          <Link
            to="/register"
            state={{ backgroundLocation: location }}
            className="hero-banner-auth-link"
          >
            Sign Up
          </Link>
        </div>
      )}

    </section>
  );
}
