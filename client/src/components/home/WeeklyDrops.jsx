import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from '../ui/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Akira Cyber Tee",
    price: 549,
    mrp: 699,
    colors: 2,
    isNew: true,
    stock: 50,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "Minimal Essential Oversized",
    price: 549,
    mrp: 699,
    colors: 4,
    isNew: true,
    stock: 8,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Tokyo Drift Graphic",
    price: 599,
    mrp: 799,
    colors: 1,
    isNew: true,
    stock: 15,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    name: "Vintage Washed Black",
    price: 499,
    mrp: 699,
    colors: 3,
    isNew: false,
    stock: 100,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"
  }
];

export default function WeeklyDrops() {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const container = containerRef.current;
      const scrollEl = scrollRef.current;

      let scrollTween = gsap.to(scrollEl, {
        x: () => -(scrollEl.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          end: () => "+=" + scrollEl.scrollWidth,
        }
      });

      return () => scrollTween.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 bg-primary overflow-hidden w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-secondary uppercase tracking-tighter">
              New Weekly <span className="text-accent italic">Drops</span>
            </h2>
            <p className="text-gray-400 mt-2 font-body max-w-md">
              Limited edition 220 GSM oversized tees. Once they're gone, they're gone forever.
            </p>
          </div>
          <div className="hidden md:block">
            {/* Optional Countdown */}
            <div className="text-right">
              <span className="text-xs text-accent uppercase tracking-widest block mb-1">Next Drop In</span>
              <div className="text-2xl font-heading font-bold text-secondary tracking-widest">
                48:22:15
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="md:h-[600px] w-full">
        <div 
          ref={scrollRef} 
          className="flex gap-8 px-4 md:px-8 w-max md:flex-nowrap flex-wrap justify-center"
        >
          {DUMMY_PRODUCTS.map((product) => (
            <div key={product.id} className="w-[300px] md:w-[400px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
          {/* Duplicate for visual length in demo */}
          {DUMMY_PRODUCTS.map((product) => (
            <div key={`${product.id}-dup`} className="w-[300px] md:w-[400px] shrink-0">
              <ProductCard product={{...product, id: product.id + 'dup'}} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
