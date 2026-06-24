import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiZap, FiBookOpen } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { API_URL } from '../config';

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

export default function Wholesale() {
  const navigate = useNavigate();
  const [catalogue, setCatalogue] = useState(null);
  const [quantity, setQuantity] = useState(15);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPrints, setSelectedPrints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/catalogues/live`)
      .then(res => res.json())
      .then(data => {
        setCatalogue(data);
        if (data && data.items && data.items.length > 0) {
          setSelectedItem(data.items[0]);
          setQuantity(data.items[0].moq || 15);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch live catalogue:", err);
        setLoading(false);
      });
  }, []);

  const printStyles = useMemo(() => {
    if (!catalogue || !catalogue.printPricing) return [];
    return catalogue.printPricing.map(p => {
      // Map to category based on name keywords if possible
      let cat = 'Other';
      if (p.sizeName.toLowerCase().includes('front') || p.sizeName.toLowerCase().includes('chest')) cat = 'Front';
      if (p.sizeName.toLowerCase().includes('back')) cat = 'Back';
      if (p.sizeName.toLowerCase().includes('sleeve')) cat = 'Sleeve';
      
      return {
        name: p.sizeName,
        cost: p.price,
        category: cat,
        size: p.dimensionsCm,
        id: p._id
      };
    });
  }, [catalogue]);

  // Pricing Logic
  const pricingDetails = useMemo(() => {
    let q = Math.max(0, parseInt(quantity) || 0);
    let minQty = selectedItem ? selectedItem.moq : 15;

    let basePrice = selectedItem ? selectedItem.wholesalePrice : 0;
    let totalPrintCost = selectedPrints.reduce((acc, print) => acc + print.cost, 0);

    let pricePerPiece = basePrice > 0 ? basePrice + totalPrintCost : 0;
    let totalAmount = pricePerPiece * q;

    return {
      isValid: q >= minQty,
      basePrice: basePrice,
      printCost: totalPrintCost,
      printNames: selectedPrints.length > 0 ? selectedPrints.map(p => p.name).join(' + ') : 'Blank',
      pricePerPiece,
      totalAmount,
      q,
      minQty
    };
  }, [quantity, selectedItem, selectedPrints]);

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
      .map(name => printStyles.find(s => s.name === name))
      .filter(Boolean);
    setSelectedPrints(prints);
  };

  const handlePlaceWholesaleOrder = async () => {
    if (!selectedItem || !pricingDetails.isValid) return;
    
    try {
      const payload = {
        orderType: "Wholesale",
        company: "Guest Company", // placeholder
        contact: "guest@company.com", // placeholder
        shippingAddress: "To be added", // placeholder
        itemsList: [
          { 
            productId: selectedItem.productId._id || selectedItem.productId, 
            name: selectedItem.productId.name || 'Blank Item', 
            qty: pricingDetails.q, 
            price: pricingDetails.pricePerPiece,
            image: selectedItem.productId.image 
          }
        ]
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Wholesale order placed successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to place wholesale order: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error placing wholesale order.");
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-gray-400">Loading wholesale catalogue...</div>;
  }

  if (!catalogue) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-gray-400">No live catalogue available right now.</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-secondary uppercase tracking-tighter mb-6">
          Wholesale <span className="text-accent italic">Partner</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-body text-lg mb-10">
          Start your clothing brand with our premium blanks and DTF printing. MOQ applies based on catalogue.
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
                1. Select Product
              </label>
              <div className="space-y-3">
                {catalogue.items.map(item => (
                  <label key={item._id} className="flex items-center p-4 border border-white/10 rounded-sm cursor-pointer hover:border-accent transition-colors">
                    <input
                      type="radio"
                      name="category"
                      className="accent-accent w-4 h-4 mr-4"
                      checked={selectedItem && selectedItem._id === item._id}
                      onChange={() => {
                        setSelectedItem(item);
                        setQuantity(Math.max(quantity, item.moq));
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-300 font-body">{item.productId.name || 'Unknown Product'}</span>
                      <span className="text-xs text-gray-500">Wholesale: ₹{item.wholesalePrice} | MOQ: {item.moq}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Print Style Selector — Grouped by Category */}
            <div className="mb-8">
              <label className="block text-secondary font-heading font-semibold uppercase tracking-wider mb-4">
                2. Select Print Styles (Optional)
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
                  const styles = printStyles.filter(s => s.category === cat.key);
                  if (styles.length === 0) return null;
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
                3. Enter Quantity (Min {pricingDetails.minQty})
              </label>
              <input
                type="number"
                min={pricingDetails.minQty}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-primary border border-white/10 text-secondary px-4 py-4 rounded-sm focus:outline-none focus:border-accent transition-colors font-body text-xl"
              />
              {!pricingDetails.isValid && (
                <p className="text-red-500 text-sm mt-2 font-body">Minimum Order Quantity (MOQ) is {pricingDetails.minQty} pieces.</p>
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

              {selectedPrints.length > 0 ? (
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={!pricingDetails.isValid}
                  onClick={() => navigate('/wholesale/upload', {
                    state: {
                      selectedPrints,
                      pricingDetails,
                      selectedCategory: selectedItem,
                    }
                  })}
                >
                  Proceed to Design Upload
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                  disabled={!pricingDetails.isValid}
                  onClick={handlePlaceWholesaleOrder}
                >
                  Place Wholesale Order (Blanks)
                </Button>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
