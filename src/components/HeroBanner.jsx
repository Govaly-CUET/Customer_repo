import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import './HeroBanner.css';

export default function HeroBanner({ user }) {
  const { media } = useStore();
  const heroImage = media['top banner']?.url || 'https://cdn.saleecom.com/upload/images/695f8531183bf1873295d9e2/b2b489fb-a412-4532-b811-569cbbcd0468-6e2d.webp?resolution=7200_2880';

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
            className="hero-banner-auth-link"
          >
            <User size={18} />
            <span>Login</span>
          </Link>

          <span className="hero-banner-divider">|</span>

          <Link
            to="/register"
            className="hero-banner-auth-link"
          >
            Sign Up
          </Link>
        </div>
      )}

    </section>
  );
}