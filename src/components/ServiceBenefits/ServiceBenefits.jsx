import './ServiceBenefits.css';

export default function ServiceBenefits({ media = [] }) {
  const benefits = [
    {
      mediaTitles: ['cash on delivery'],
      title: 'Cash On Delivery',
    },
    {
      mediaTitles: [
        'delivery within 48hrs',
        'delivery within 48 hours',
      ],
      title: 'Delivery Within 48hrs',
    },
    {
      mediaTitles: ['best price deal'],
      title: 'Best Price Deal',
    },
  ];

  return (
    <section className="service-benefits">
      <div className="service-benefits-grid">

        {benefits.map((benefit) => {
          const image = media.find((item) => {
            const mediaTitle = item.title
              ?.trim()
              .toLowerCase();

            return benefit.mediaTitles.some(
              (title) =>
                mediaTitle === title.toLowerCase()
            );
          });

          return (
            <div
              className="service-benefit-card"
              key={benefit.title}
            >
              <div className="service-benefit-icon">
                {image?.url && (
                  <img
                    src={image.url}
                    alt={
                      image.altText ||
                      benefit.title
                    }
                  />
                )}
              </div>

              <div className="service-benefit-title">
                {benefit.title}
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}