import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandStory() {
  const containerRef = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const texts = textRefs.current;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 1,
        }
      });

      texts.forEach((text, i) => {
        if (i === 0) return; // First text is already visible
        
        tl.to(texts[i - 1], { opacity: 0, y: -50, duration: 1 })
          .fromTo(text, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, "<");
      });

      return () => tl.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Decorative Particle Field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-accent rounded-full opacity-50 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[60%] left-[8%] w-1.5 h-1.5 bg-white rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] right-[12%] w-2.5 h-2.5 bg-accent/80 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[75%] right-[20%] w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[45%] left-[50%] w-1 h-1 bg-white rounded-full opacity-60 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none z-0">
        <h1 className="text-[25vw] font-heading font-black text-secondary uppercase tracking-tighter leading-none text-center blur-sm">
          VYBE
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="relative h-[200px] flex items-center justify-center">
          <div 
            ref={el => textRefs.current[0] = el}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary uppercase tracking-wider mb-6">
              Why We Started
            </h2>
            <p className="text-gray-400 font-body text-lg md:text-2xl leading-relaxed">
              We were tired of paying premium prices for basic blanks. Streetwear shouldn't be a luxury reserved for the few.
            </p>
          </div>

          <div 
            ref={el => textRefs.current[1] = el}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 translate-y-[50px]"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-accent uppercase tracking-wider mb-6 italic">
              Premium Quality
            </h2>
            <p className="text-gray-400 font-body text-lg md:text-2xl leading-relaxed">
              Every tee is crafted from 220 GSM bio-washed combed cotton. Thick, durable, and designed to drape perfectly.
            </p>
          </div>

          <div 
            ref={el => textRefs.current[2] = el}
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 translate-y-[50px]"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary uppercase tracking-wider mb-6">
              Community First
            </h2>
            <p className="text-gray-400 font-body text-lg md:text-2xl leading-relaxed">
              We drop new designs every week. Built by the culture, for the culture. Welcome to the movement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
