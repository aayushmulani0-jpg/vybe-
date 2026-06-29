import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import WeeklyDrops from '../components/home/WeeklyDrops';
import ProductCarousel from '../components/home/ProductCarousel';
import BrandStory from '../components/home/BrandStory';
import ProductCard from '../components/ui/ProductCard';
import { API_URL } from '../config';

gsap.registerPlugin(ScrollTrigger);

// Custom Banner Carousel Component
function HeroBannerCarousel({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const currentBanner = banners[currentIndex];
    const autoPlayEnabled = currentBanner?.autoPlaySettings?.enabled ?? true;
    const duration = currentBanner?.autoPlaySettings?.duration || 5000;

    if (!autoPlayEnabled) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, duration);

    return () => clearInterval(timer);
  }, [currentIndex, banners]);

  if (!banners || banners.length === 0) {
    // Fallback static hero if no banners
    return (
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/60 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=2000" 
            alt="Default Hero" 
            className="w-full h-full object-cover filter grayscale opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-secondary uppercase tracking-tighter leading-none mb-4">
            Premium Streetwear
          </h1>
          <Button variant="accent" size="lg">Shop Now</Button>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-primary">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img 
            src={currentBanner.desktopImage || currentBanner.mobileImage} 
            alt={currentBanner.title} 
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {currentBanner.subtitle && (
              <p className="text-accent uppercase tracking-widest text-sm md:text-base font-bold mb-4">
                {currentBanner.subtitle}
              </p>
            )}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white uppercase tracking-tighter leading-none mb-8">
              {currentBanner.title}
            </h1>
            
            {currentBanner.ctaText && (
              <Link to={currentBanner.ctaUrl || '/shop'}>
                <Button variant="accent" size="lg" className="shadow-[0_0_20px_rgba(163,255,18,0.3)] hover:shadow-[0_0_30px_rgba(163,255,18,0.5)] transition-all">
                  {currentBanner.ctaText}
                </Button>
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 left-0 w-full z-20 flex justify-center gap-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-accent w-8' : 'bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Dynamic Collections Component
function DynamicCollections({ collections }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="py-20 space-y-24 bg-primary border-t border-white/5">
      {collections.map(collection => (
        <section key={collection._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary uppercase tracking-tight">
                {collection.name}
              </h2>
              {collection.type === 'New Drop' && (
                <span className="inline-block mt-3 px-3 py-1 bg-accent/20 text-accent border border-accent/50 text-xs font-bold uppercase tracking-wider rounded-full">
                  New Drop 🔥
                </span>
              )}
            </div>
            <Link to={`/shop?collection=${collection._id}`} className="hidden sm:block text-accent hover:text-white transition-colors uppercase tracking-widest text-sm font-bold">
              View All →
            </Link>
          </div>

          {collection.bannerImage && (
             <div className="w-full h-[300px] md:h-[400px] mb-12 rounded-xl overflow-hidden relative group">
               <img src={collection.bannerImage} alt={collection.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80" />
               <div className="absolute bottom-8 left-8">
                  <p className="text-gray-300 max-w-xl text-lg font-body">{collection.description}</p>
               </div>
             </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {collection.products?.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} collectionName={collection.name} />
            ))}
            
            {(!collection.products || collection.products.length === 0) && (
              <p className="text-gray-500 font-body italic col-span-full">No products in this collection yet.</p>
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link to={`/shop?collection=${collection._id}`}>
              <Button variant="outline" className="w-full">View Collection</Button>
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/banners/active`).then(res => res.json()).catch(() => ({ success: false })),
      fetch(`${API_URL}/collections/active`).then(res => res.json()).catch(() => ({ success: false })),
      fetch(`${API_URL}/products`).then(res => res.json()).catch(() => ([]))
    ]).then(([bannersData, collectionsData, productsData]) => {
      if (bannersData.success) setBanners(bannersData.banners);
      if (collectionsData.success) setCollections(collectionsData.collections);
      if (Array.isArray(productsData)) setAllProducts(productsData);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center text-accent uppercase tracking-widest font-heading">Loading...</div>;
  }

  const bestSellers = allProducts.filter(p => p.isBestSeller);
  const recommended = allProducts.filter(p => p.isRecommended);
  const newArrivals = allProducts.filter(p => p.isNewArrival);

  return (
    <div className="w-full">
      <HeroBannerCarousel banners={banners} />

      {/* Marquee Section */}
      <section className="py-6 bg-accent text-primary overflow-hidden border-y border-white/10">
        <div className="whitespace-nowrap flex font-heading font-bold uppercase text-2xl tracking-widest">
           <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 15, repeat: Infinity }}
            className="flex space-x-12 shrink-0"
           >
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-12">
                  <span>New Drops Every Week</span>
                  <span className="text-primary/50">✦</span>
                  <span>Premium Quality</span>
                  <span className="text-primary/50">✦</span>
                </div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* Dynamic Product Tag Carousels */}
      {newArrivals.length > 0 && (
        <ProductCarousel title="New Arrivals" products={newArrivals} bgClass="bg-primary" />
      )}
      
      {bestSellers.length > 0 && (
        <ProductCarousel title="Best Sellers" products={bestSellers} bgClass="bg-neutral-900" />
      )}
      
      {recommended.length > 0 && (
        <ProductCarousel title="Recommended for You" products={recommended} bgClass="bg-primary" />
      )}
      
      {/* Fallback to WeeklyDrops if no tag carousels are active and no collections */}
      {newArrivals.length === 0 && bestSellers.length === 0 && recommended.length === 0 && collections.length === 0 && (
        <WeeklyDrops />
      )}

      {/* Manual Admin Collections */}
      {collections.length > 0 && (
        <DynamicCollections collections={collections} />
      )}

      <BrandStory />
    </div>
  );
}
