import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import ProductCard from '../ui/ProductCard';

const BEST_SELLERS = [
  {
    id: 101,
    name: "Classic Box Fit - Black",
    price: 499,
    mrp: 699,
    colors: 5,
    isNew: false,
    stock: 200,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 102,
    name: "Signature Logo Hoodie",
    price: 1299,
    mrp: 1999,
    colors: 2,
    isNew: false,
    stock: 45,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1556821840-02c34273574c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 103,
    name: "Heavyweight Blank - White",
    price: 499,
    mrp: 699,
    colors: 5,
    isNew: false,
    stock: 120,
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 104,
    name: "Acid Wash Graphic Tee",
    price: 649,
    mrp: 899,
    colors: 1,
    isNew: true,
    stock: 30,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 105,
    name: "Cargo Parachute Pants",
    price: 1499,
    mrp: 2499,
    colors: 2,
    isNew: false,
    stock: 15,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800"
  }
];

export default function BestSellers() {
  return (
    <section className="py-20 bg-neutral-900 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary uppercase tracking-tighter mb-4">
          Best Sellers
        </h2>
        <div className="w-16 h-1 bg-accent mx-auto"></div>
      </div>

      <div className="w-full">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={1.2}
          loop={true}
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
          {BEST_SELLERS.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
