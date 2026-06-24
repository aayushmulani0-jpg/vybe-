import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiPrinter, FiArrowRight } from 'react-icons/fi';
import Button from '../components/ui/Button';

export default function About() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'retail',
      icon: <FiShoppingBag className="w-8 h-8 text-accent" />,
      title: 'Retail Shop',
      description: 'Explore our latest drops of premium streetwear. Designed for the Gen Z aesthetic, our retail collection features high-quality 220 GSM oversized tees with exclusive graphic prints.',
      details: 'No minimum order. Fast shipping directly to you.',
      actionText: 'Shop Retail',
      action: () => navigate('/shop'),
      delay: 0.1,
    },
    {
      id: 'wholesale',
      icon: <FiPackage className="w-8 h-8 text-accent" />,
      title: 'Wholesale & Catalogue',
      description: 'Stock your store with our premium apparel. Our wholesale catalogue features the exact same high-quality products available in our retail shop, but offered at discounted bulk pricing.',
      details: 'Minimum Order Quantity (MOQ): 15 units.',
      actionText: 'View Catalog & Pricing',
      action: () => navigate('/wholesale'),
      delay: 0.2,
    },
    {
      id: 'printing',
      icon: <FiPrinter className="w-8 h-8 text-accent" />,
      title: 'Custom Print & Job Works',
      description: 'Start your own clothing brand or create custom merch. We offer premium DTF printing job works on our blank oversized tees with multiple print zone options.',
      details: 'Upload your designs and preview them live in 3D.',
      actionText: 'Custom Print',
      action: () => navigate('/custom'),
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen bg-primary pt-24 pb-20">
      {/* ── Hero Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-secondary uppercase tracking-tighter mb-6">
            About <span className="text-accent italic">Vybe</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto font-body text-lg leading-relaxed">
            Vybe is more than just a streetwear brand. We are a complete apparel solution offering premium, Gen Z-focused fashion. 
            Whether you're looking to buy the latest oversized graphic tees for yourself, source high-quality catalogue products in bulk for your retail store, 
            or print your own custom designs on our premium blanks, we've got you covered.
          </p>
        </motion.div>
      </section>

      {/* ── Our Services ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary uppercase tracking-wider mb-4">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: service.delay, duration: 0.5 }}
              className="bg-neutral-900 border border-white/10 rounded-lg p-8 flex flex-col hover:border-accent/50 transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-2xl font-heading font-bold text-secondary uppercase tracking-wider mb-3">
                {service.title}
              </h3>
              <p className="text-gray-400 font-body mb-6 flex-grow">
                {service.description}
              </p>
              
              <div className="bg-primary/50 border border-white/5 p-4 rounded-sm mb-8">
                <p className="text-accent text-sm font-body font-semibold">
                  {service.details}
                </p>
              </div>

              <Button
                variant={service.id === 'wholesale' ? 'accent' : 'outline'}
                className="w-full flex items-center justify-center gap-2 group"
                onClick={service.action}
              >
                {service.actionText}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-neutral-900 border border-white/10 rounded-lg p-10 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary uppercase tracking-wider mb-6">
                Retail vs. Wholesale Catalogue
              </h2>
              <div className="space-y-6 text-gray-400 font-body">
                <p>
                  We believe in complete transparency. Our <strong className="text-white">Wholesale Catalogue</strong> contains the exact same premium 220 GSM bio-washed oversized t-shirts that we sell to our <strong className="text-white">Retail</strong> customers.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <strong className="text-secondary block">Same Premium Quality</strong>
                      No downgrading materials. You get the exact same heavyweight fabric and vibrant DTF prints.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <strong className="text-secondary block">Different Pricing Structure</strong>
                      Because you are buying in bulk, catalogue buyers receive heavy discounts compared to retail pricing.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <strong className="text-secondary block">Strict MOQ (15 Units)</strong>
                      To qualify for wholesale catalogue pricing, orders must meet the strict 15 unit Minimum Order Quantity.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Visual element */}
            <div className="relative aspect-square md:aspect-video lg:aspect-square bg-primary rounded-lg border border-white/5 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-primary to-primary" />
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-4">👕</div>
                <h3 className="text-2xl font-heading font-bold text-secondary uppercase">One Premium Tee</h3>
                <p className="text-accent mt-2 font-body font-semibold">Multiple Ways to Buy</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
