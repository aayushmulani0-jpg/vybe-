import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function WholesaleCTA() {
  return (
    <section className="py-24 bg-neutral-900 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative group">
            <div className="absolute inset-0 bg-accent translate-x-4 translate-y-4 rounded-lg transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <img 
              src="https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1000" 
              alt="Wholesale Production" 
              className="relative z-10 w-full h-[500px] object-cover rounded-lg filter grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-primary border border-white/10 p-6 rounded-lg z-20 backdrop-blur-md">
              <p className="text-4xl font-heading font-bold text-accent mb-1">₹455</p>
              <p className="text-xs text-gray-400 font-body uppercase tracking-wider">Per piece on 30+ units</p>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col items-start">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-secondary uppercase tracking-tighter mb-6 leading-none">
              Start Your Own <br />
              <span className="text-accent italic">Clothing Brand</span>
            </h2>
            
            <p className="text-gray-400 font-body text-lg mb-8 leading-relaxed max-w-lg">
              Partner with us for bulk manufacturing, custom DTF printing, and private label support. We handle the production, so you can focus on building your brand.
            </p>

            <ul className="space-y-4 mb-10 w-full max-w-md">
              <li className="flex items-center text-secondary font-body">
                <span className="w-2 h-2 bg-accent rounded-full mr-4"></span>
                Premium 220 GSM Bio-Washed Cotton
              </li>
              <li className="flex items-center text-secondary font-body">
                <span className="w-2 h-2 bg-accent rounded-full mr-4"></span>
                Custom DTF Printing (Left Chest, A4, A3)
              </li>
              <li className="flex items-center text-secondary font-body">
                <span className="w-2 h-2 bg-accent rounded-full mr-4"></span>
                Private Label Support (Neck Tags, Packaging)
              </li>
              <li className="flex items-center text-secondary font-body">
                <span className="w-2 h-2 bg-accent rounded-full mr-4"></span>
                Low Minimum Order Quantity (30 Pieces)
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/wholesale">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Get Wholesale Quote
                </Button>
              </Link>
              <Link to="/custom">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Custom Printing
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
