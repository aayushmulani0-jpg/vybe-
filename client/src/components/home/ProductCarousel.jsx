import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import ProductCard from '../ui/ProductCard';

export default function ProductCarousel({ title, products, bgClass = "bg-neutral-900" }) {
  if (!products || products.length === 0) return null;

  return (
    <section className={`py-20 ${bgClass} border-t border-white/5`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary uppercase tracking-tighter mb-4">
          {title}
        </h2>
        <div className="w-16 h-1 bg-accent mx-auto"></div>
      </div>

      <div className="w-full">
        <div>
          <Swiper
            key={products.map(p => p._id || p.id).join('-')}
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={1.2}
            loop={false}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4.2 },
            }}
            className="px-4 sm:px-6 lg:px-8 pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id || product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
