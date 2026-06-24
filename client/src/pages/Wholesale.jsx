import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiZap, FiBookOpen } from 'react-icons/fi';
import Button from '../components/ui/Button';

const PRINT_STYLES = [
  // Front Prints
  { name: 'Left Chest Logo', cost: 20, category: 'Front', size: '8–10 × 8–10 cm' },
  { name: 'Chest Design (15×7 cm)', cost: 35, category: 'Front', size: '15 × 7 cm' },
  { name: 'Center Chest Design', cost: 40, category: 'Front', size: '20–25 × 20–25 cm' },
  { name: 'Front Graphic (A4)', cost: 50, category: 'Front', size: '21 × 29.7 cm' },
  { name: 'Large Front Graphic (A3)', cost: 70, category: 'Front', size: '29.7 × 42 cm' },
  // Back Prints
  { name: 'Small Upper Back Logo', cost: 25, category: 'Back', size: '10–15 × 7–10 cm' },
  { name: 'Medium Back Graphic (A4)', cost: 50, category: 'Back', size: '21 × 29.7 cm' },
  { name: 'Large Back Graphic (A3)', cost: 80, category: 'Back', size: '29.7 × 42 cm' },
  // Sleeve Prints
  { name: 'Small Sleeve Logo', cost: 15, category: 'Sleeve', size: '5 × 5 cm' },
  { name: 'Sleeve Typography', cost: 20, category: 'Sleeve', size: '10 × 4 cm' },
  // Other Placements
  { name: 'Neck Print (Inside)', cost: 15, category: 'Other', size: '6 × 4 cm' },
  { name: 'Outside Neck Print', cost: 15, category: 'Other', size: '8 × 4 cm' },
  { name: 'Bottom Hem Print', cost: 20, category: 'Other', size: '10 × 5 cm' },
  { name: 'Pocket Area Print', cost: 20, category: 'Other', size: '8 × 8 cm' },
];

const PRINT_CATEGORIES = [
  { key: 'Front', label: 'Front Prints', icon: '👕' },
  { key: 'Back', label: 'Back Prints', icon: '🔄' },
  { key: 'Sleeve', label: 'Sleeve Prints', icon: '💪' },
  { key: 'Other', label: 'Other Placements', icon: '✨' },
];

const COMBO_PRESETS = [
  {
    name: 'Streetwear Combo',
    tag: 'Recommended',
    description: 'Chest Design + Large Back',
    prints: ['Chest Design (15×7 cm)', 'Large Back Graphic (A3)'],
  },
  {
    name: 'Minimal Combo',
    tag: null,
    description: 'Left Chest + Upper Back',
    prints: ['Left Chest Logo', 'Small Upper Back Logo'],
  },
  {
    name: 'Anime Collection',
    tag: 'Popular',
    description: 'A4 Front + A3 Back',
    prints: ['Front Graphic (A4)', 'Large Back Graphic (A3)'],
  },
];

const CATEGORIES = [
  { name: 'Oversized T-Shirts (220 GSM)', baseCost: 0 },
  { name: 'Classic Fit T-Shirts (180 GSM)', baseCost: -30 },
  { name: 'Heavyweight Hoodies (350 GSM)', baseCost: 400 },
];

export default function Wholesale() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedPrints, setSelectedPrints] = useState([]);

  // Pricing Logic
  const pricingDetails = useMemo(() => {
    let q = Math.max(0, parseInt(quantity) || 0);

    // Determine Base Price
    let basePrice = 0;
    if (q >= 15 && q <= 30) {
      basePrice = 485;
    } else if (q > 30) {
      basePrice = 450;
    }

    // Add category modifier and print cost
    let finalBasePrice = basePrice > 0 ? basePrice + selectedCategory.baseCost : 0;

    let totalPrintCost = selectedPrints.reduce((acc, print) => acc + print.cost, 0);

    let pricePerPiece = finalBasePrice > 0 ? finalBasePrice + totalPrintCost : 0;
    let totalAmount = pricePerPiece * q;

    return {
      isValid: q >= 15,
      basePrice: finalBasePrice,
      printCost: totalPrintCost,
      printNames: selectedPrints.length > 0 ? selectedPrints.map(p => p.name).join(' + ') : 'Blank',
      pricePerPiece,
      totalAmount,
      q
    };
  }, [quantity, selectedCategory, selectedPrints]);

  const togglePrint = (style) => {
    setSelectedPrints(prev => {
      const isSelected = prev.find(p => p.name === style.name);
      if (isSelected) {
        return prev.filter(p => p.name !== style.name);
      } else {
        return [...prev, style];
      }
    });
  };

  const applyCombo = (combo) => {
    const prints = combo.prints
      .map(name => PRINT_STYLES.find(s => s.name === name))
      .filter(Boolean);
    setSelectedPrints(prints);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-secondary uppercase tracking-tighter mb-6">
          Wholesale <span className="text-accent italic">Partner</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-body text-lg mb-10">
          Start your clothing brand with our premium blanks and DTF printing. MOQ starts at just 15 pieces.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="accent" size="lg" className="flex items-center gap-2" onClick={() => navigate('/catalogue')}>
            <FiBookOpen /> View Catalogue
          </Button>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 border border-white/10 p-8 md:p-12 rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Form Side */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary uppercase tracking-wider mb-8 border-b border-white/10 pb-4">
              Instant Quote Calculator
            </h2>

            {/* Category Selector */}
            <div className="mb-8">
              <label className="block text-secondary font-heading font-semibold uppercase tracking-wider mb-4">
                1. Select Category
              </label>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <label key={cat.name} className="flex items-center p-4 border border-white/10 rounded-sm cursor-pointer hover:border-accent transition-colors">
                    <input
                      type="radio"
                      name="category"
                      className="accent-accent w-4 h-4 mr-4"
                      checked={selectedCategory.name === cat.name}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    <span className="text-gray-300 font-body">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Print Style Selector — Grouped by Category */}
            <div className="mb-8">
              <label className="block text-secondary font-heading font-semibold uppercase tracking-wider mb-4">
                2. Select Print Styles
              </label>

              {/* Combo Presets */}
              <div className="mb-6">
                <p className="text-gray-500 text-xs font-body uppercase tracking-wider mb-3">Quick Combos</p>
                <div className="flex flex-wrap gap-2">
                  {COMBO_PRESETS.map(combo => (
                    <button
                      key={combo.name}
                      onClick={() => applyCombo(combo)}
                      className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-sm text-sm font-body text-gray-300 hover:border-accent hover:text-accent transition-colors group"
                    >
                      <FiZap className="w-3 h-3 text-accent/60 group-hover:text-accent" />
                      <span>{combo.name}</span>
                      {combo.tag && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent rounded-sm">{combo.tag}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Styles by Category */}
              <div className="space-y-6">
                {PRINT_CATEGORIES.map(cat => {
                  const styles = PRINT_STYLES.filter(s => s.category === cat.key);
                  return (
                    <div key={cat.key}>
                      <p className="text-gray-500 text-xs font-body uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.label}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {styles.map(style => {
                          const isSelected = !!selectedPrints.find(p => p.name === style.name);
                          return (
                            <label
                              key={style.name}
                              className={`flex items-center p-3 border rounded-sm cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-accent/50 bg-accent/5'
                                  : 'border-white/10 hover:border-accent/30'
                              }`}
                            >
                              <input
                                type="checkbox"
                                name="printStyle"
                                className="accent-accent w-4 h-4 mr-3 shrink-0"
                                checked={isSelected}
                                onChange={() => togglePrint(style)}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-gray-300 font-body text-sm truncate">{style.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs font-body">{style.size}</span>
                                  <span className="text-accent text-xs font-body">+₹{style.cost}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Input */}
            <div className="mb-8">
              <label className="block text-secondary font-heading font-semibold uppercase tracking-wider mb-4">
                3. Enter Quantity (Min 15)
              </label>
              <input
                type="number"
                min="15"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-primary border border-white/10 text-secondary px-4 py-4 rounded-sm focus:outline-none focus:border-accent transition-colors font-body text-xl"
              />
              {!pricingDetails.isValid && (
                <p className="text-red-500 text-sm mt-2 font-body">Minimum Order Quantity (MOQ) is 15 pieces.</p>
              )}
            </div>
          </div>

          {/* Pricing Summary Side */}
          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <div className="sticky top-32">
              <h2 className="text-3xl font-heading font-bold text-secondary uppercase tracking-wider mb-8 border-b border-white/10 pb-4">
                Pricing Summary
              </h2>

              <div className="space-y-6 mb-8 font-body">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Base Price (for {pricingDetails.q} pcs)</span>
                  <span>{pricingDetails.isValid ? `₹${pricingDetails.basePrice}` : '---'}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span className="w-2/3 truncate">Print Cost ({pricingDetails.printNames})</span>
                  <span>+₹{pricingDetails.printCost}</span>
                </div>

                <div className="h-px w-full bg-white/10 my-4"></div>

                <div className="flex justify-between items-center text-xl text-secondary font-bold">
                  <span>Price Per Piece</span>
                  <span>{pricingDetails.isValid ? `₹${pricingDetails.pricePerPiece}` : '---'}</span>
                </div>

                <div className="flex justify-between items-center text-3xl font-heading font-bold text-accent mt-6">
                  <span>Total Est.</span>
                  <span>{pricingDetails.isValid ? `₹${pricingDetails.totalAmount.toLocaleString()}` : '---'}</span>
                </div>
              </div>

              <div className="bg-primary/50 p-6 rounded-sm border border-white/5 mb-8">
                <h4 className="text-secondary font-semibold uppercase tracking-wider mb-4 text-sm">Included in all orders:</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-center gap-2"><FiCheckCircle className="text-accent" /> Premium Bio-Washed Fabric</li>
                  <li className="flex items-center gap-2"><FiCheckCircle className="text-accent" /> Polybag Packaging</li>
                  <li className="flex items-center gap-2"><FiCheckCircle className="text-accent" /> Size Label (Neck)</li>
                </ul>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={!pricingDetails.isValid || selectedPrints.length === 0}
                onClick={() => navigate('/wholesale/upload', {
                  state: {
                    selectedPrints,
                    pricingDetails,
                    selectedCategory,
                  }
                })}
              >
                Proceed to Design Upload
              </Button>
              {selectedPrints.length === 0 && pricingDetails.isValid && (
                <p className="text-yellow-500/80 text-xs text-center mt-3 font-body">
                  Please select at least one print style above
                </p>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
