import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './CategoryCarousel.css';

export default function CategoryCarousel({ categories }) {
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const mobileRef = useRef(null);

  if (!categories || !categories.length) {
    return null;
  }

  /*
   * Backend categories are already supplied to this component.
   *
   * Desktop:
   *   Row 1
   *   Row 2
   *
   * Mobile:
   *   One horizontal scrolling row
   */
  const row1 = categories.filter((category) => Number(category.carousal) === 1);
  const row2 = categories.filter((category) => Number(category.carousal) === 2);

  if (!row1.length && !row2.length) return null;

  const CategoryCard = ({ category, index }) => {
    const slug =
      category.slug ||
      category._id ||
      String(category.name || '')
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return (
      <Link
        key={
          category._id ||
          category.slug ||
          `${category.name}-${index}`
        }
        to={`/category/${slug}`}
        className="govaly-category-slide"
      >
        <div className="govaly-category-card">
          <div className="govaly-category-image">
            <img
              src={category.image || '/favicon.svg'}
              alt={category.name}
              loading="lazy"
            />
          </div>
        </div>

        <div className="govaly-category-name">
          {category.name}
        </div>
      </Link>
    );
  };

  return (
    <section className="govaly-category-section">
      {/* =================================================
          DESKTOP
          ================================================= */}
      <div className="govaly-category-desktop">

        <div
          className="govaly-category-row"
          ref={row1Ref}
        >
          {row1.map((category, index) => (
            <CategoryCard
              key={
                category._id ||
                category.slug ||
                `${category.name}-row1-${index}`
              }
              category={category}
              index={index}
            />
          ))}
        </div>

        {row2.length > 0 && (
          <div
            className="govaly-category-row"
            ref={row2Ref}
          >
            {row2.map((category, index) => (
              <CategoryCard
                key={
                  category._id ||
                  category.slug ||
                  `${category.name}-row2-${index}`
                }
                category={category}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* =================================================
          MOBILE
          ================================================= */}
      <div
        className="govaly-category-mobile"
        ref={mobileRef}
      >
        {[...row1, ...row2].map((category, index) => (
          <CategoryCard
            key={
              category._id ||
              category.slug ||
              `${category.name}-mobile-${index}`
            }
            category={category}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}