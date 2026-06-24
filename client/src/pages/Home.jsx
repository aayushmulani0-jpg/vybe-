import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/ui/Button';
import WeeklyDrops from '../components/home/WeeklyDrops';
import BestSellers from '../components/home/BestSellers';
import BrandStory from '../components/home/BrandStory';
import WholesaleCTA from '../components/home/WholesaleCTA';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Basic GSAP animation for text reveal
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/60 z-10"></div>
          {/* We would replace this image with a real video like <video autoPlay loop muted className="object-cover w-full h-full" src="..." /> */}
          <img 
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=2000" 
            alt="Streetwear Hero" 
            className="w-full h-full object-cover filter grayscale opacity-50"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <div className="overflow-hidden mb-4">
            <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-secondary uppercase tracking-tighter leading-none">
              Premium Streetwear
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-accent uppercase tracking-tighter leading-none italic">
              Without Premium Prices.
            </h1>
          </div>
          
          <div className="overflow-hidden mb-12">
            <p className="hero-text text-lg md:text-xl text-gray-300 font-body max-w-2xl mx-auto">
              220 GSM Oversized Tees | Weekly Drops | Custom Printing
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0 hero-text">
            <Button variant="accent" size="lg">Shop Now</Button>
            <Button variant="outline" size="lg">Wholesale</Button>
            <Button variant="ghost" size="lg" className="border-b border-white/30 rounded-none hover:border-accent pb-1">
              Custom Printing
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-secondary flex flex-col items-center"
        >
          <span className="text-xs uppercase tracking-widest mb-2 opacity-50">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent to-transparent"></div>
        </motion.div>
      </section>

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

      {/* Weekly Drops Section */}
      <WeeklyDrops />

      {/* Best Sellers Section */}
      <BestSellers />

      {/* Brand Story Pinned Section */}
      <BrandStory />

      {/* Wholesale CTA Section */}
      <WholesaleCTA />

    </div>
  );
}
