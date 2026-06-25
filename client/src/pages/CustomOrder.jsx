import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiCheck, FiMinus, FiPlus, FiShoppingBag, FiZap } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { API_URL } from '../config';
import { useCartStore } from '../store/useCartStore';
import { useApiStore } from '../store/useApiStore';

// Mock T-Shirt Image URL (Plain Black)
const TSHIRT_MOCKUP = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"; // Black oversized blank

// Will be fetched from backend dynamically

const PRINT_ZONES = {
  'Left Chest Logo': { top: '30%', left: '60%', width: '10%', height: '10%' },
  '15 × 7 cm Chest Design': { top: '32%', left: '50%', transform: 'translateX(-50%)', width: '20%', height: '10%' },
  'A4 Print': { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' },
  'A3 Print': { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '45%', height: '55%' },
  'Sleeve Print': { top: '45%', left: '25%', width: '15%', height: '20%' },
  'Front + Back Print': { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' },
};

const CATEGORIES = [
  { name: 'Oversized T-Shirts (220 GSM)', baseCost: 0 },
  { name: 'Classic Fit T-Shirts (180 GSM)', baseCost: -30 },
  { name: 'Heavyweight Hoodies (350 GSM)', baseCost: 400 },
];

export default function CustomOrder() {
  const location = useLocation();
  const navigate = useNavigate();

  const passedState = location.state || {};

  const [quantity, setQuantity] = useState(passedState.pricingDetails?.q || 1);
  const [selectedCategory, setSelectedCategory] = useState(passedState.selectedCategory || CATEGORIES[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedPrints, setSelectedPrints] = useState(passedState.selectedPrints || []);

  const [uploadedImages, setUploadedImages] = useState({});
  const [uploadedRawFiles, setUploadedRawFiles] = useState({});
  const [activeZone, setActiveZone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCombo, setActiveCombo] = useState(null);

  const [printStyles, setPrintStyles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const addToCart = useCartStore(state => state.addToCart);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/print-locations`)
      .then(res => res.json())
      .then(data => {
        setPrintStyles(data);
        setLoading(false);
        if (passedState.selectedPrints) {
          const validPrints = passedState.selectedPrints.filter(sp => data.find(dp => dp.name === sp.name && dp.isActive));
          setSelectedPrints(validPrints);
          if (validPrints.length > 0 && !activeZone) setActiveZone(validPrints[0].name);
        }
      })
      .catch(err => {
        console.error('Failed to fetch print locations', err);
        setLoading(false);
      });

    fetch(`${API_URL}/templates`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data.filter(t => t.isActive));
      })
      .catch(err => console.error("Failed to fetch templates:", err));
  }, []);

  useEffect(() => {
    if (selectedPrints.length > 0 && !activeZone) {
      setActiveZone(selectedPrints[0].name);
    } else if (selectedPrints.length === 0) {
      setActiveZone(null);
    }
  }, [selectedPrints]);

  const togglePrint = (style) => {
    setActiveCombo(null);
    setSelectedPrints(prev => {
      const isSelected = prev.find(p => p._id === style._id);
      if (isSelected) {
        // If removing, also remove the uploaded image for this zone
        setUploadedImages(imgs => {
          const newImgs = { ...imgs };
          delete newImgs[style.name];
          return newImgs;
        });
        setUploadedRawFiles(raws => {
          const newRaws = { ...raws };
          delete newRaws[style.name];
          return newRaws;
        });
        if (activeZone === style.name) setActiveZone(null);
        return prev.filter(p => p._id !== style._id);
      } else {
        if (!activeZone) setActiveZone(style.name);
        return [...prev, style];
      }
    });
  };

  const [pricingDetails, setPricingDetails] = useState({
    isValid: true,
    basePrice: 0,
    printCost: 0,
    printNames: 'Blank',
    pricePerPiece: 0,
    totalAmount: 0,
    q: 1
  });

  useEffect(() => {
    const calculatePricing = async () => {
      try {
        const response = await fetch(`${API_URL}/pricing/calculate-custom-print`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: quantity,
            categoryBaseCost: selectedCategory.baseCost,
            printCosts: selectedPrints.map(p => p.cost)
          })
        });
        if (response.ok) {
          const data = await response.json();
          setPricingDetails({
            ...data,
            printNames: selectedPrints.length > 0 ? selectedPrints.map(p => p.name).join(' + ') : 'Blank'
          });
        }
      } catch (err) {
        console.error('Failed to calculate pricing', err);
      }
    };

    calculatePricing();
  }, [quantity, selectedCategory, selectedPrints]);

  const handleAddToCartOnly = async () => {
    if (Object.keys(uploadedImages).length === 0) {
      alert('Please upload a design for at least one print area before adding to cart.');
      return;
    }
    if (!pricingDetails.isValid) {
      alert(`Please select a valid quantity (MOQ required).`);
      return;
    }

    setIsUploading(true);
    try {
      const finalImages = { ...uploadedImages };

      for (const [zone, file] of Object.entries(uploadedRawFiles)) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${zone} design`);
        const data = await res.json();
        finalImages[zone] = data.url;
      }

      addToCart({
        id: 'custom-' + Date.now(),
        name: `Custom Print - ${selectedCategory.name}`,
        price: pricingDetails.pricePerPiece,
        quantity: pricingDetails.q,
        selectedSize: selectedSize,
        selectedPrints: selectedPrints,
        uploadedImages: finalImages,
        orderType: 'CustomPrint'
      });
      alert('Added custom design to cart!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !shippingAddress.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      alert('Please fill out all contact and shipping details before checkout.');
      return;
    }

    setIsUploading(true);
    const fullAddress = `${shippingAddress}, ${city}, ${state} - ${zipCode}`;

    try {
      const finalImages = { ...uploadedImages };
      for (const [zone, file] of Object.entries(uploadedRawFiles)) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${zone} design`);
        const data = await res.json();
        finalImages[zone] = data.url;
      }

      await submitOrder({
        orderType: "CustomPrint",
        customer: customerName,
        email: customerEmail,
        phone: customerPhone,
        shippingAddress: fullAddress,
        itemsList: [
          {
            name: `Custom Print - ${selectedCategory.name}`,
            qty: quantity,
            price: pricingDetails.pricePerPiece,
            image: Object.values(finalImages)[0] || TSHIRT_MOCKUP
          }
        ]
      });
      alert('Order placed successfully!');
      navigate('/shop');
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!activeZone) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (!activeZone) return;
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setUploadedImages(prev => ({
      ...prev,
      [activeZone]: url
    }));
    setUploadedRawFiles(prev => ({
      ...prev,
      [activeZone]: file
    }));
  };

  const removeImage = (zone) => {
    setUploadedImages(prev => {
      const newMap = { ...prev };
      delete newMap[zone];
      return newMap;
    });
    setUploadedRawFiles(prev => {
      const newMap = { ...prev };
      delete newMap[zone];
      return newMap;
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading print templates...</div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-secondary uppercase tracking-tighter mb-4">
              Upload <span className="text-accent italic">Design</span>
            </h1>
            <p className="text-gray-400 font-body">Visualize your custom print on our premium 220 GSM blanks.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

            {/* Mockup Preview Side */}
            <div className="relative bg-neutral-900 rounded-lg p-8 flex items-start pt-12 justify-center min-h-[600px] border border-white/5 overflow-hidden">
              <div className="relative w-full max-w-md pointer-events-none">
                <img
                  src={TSHIRT_MOCKUP}
                  alt="Black Blank T-Shirt"
                  className="w-full h-auto drop-shadow-2xl opacity-90"
                />

                {/* Overlay Zones */}
                {Object.keys(PRINT_ZONES).map(zoneName => {
                  // Check if this zone is enabled by admin
                  const activeStyle = printStyles.find(style => style.name === zoneName);
                  if (!activeStyle || !activeStyle.isActive) return null;

                  const zoneStyle = PRINT_ZONES[zoneName];
                  const isSelectedPrint = selectedPrints.some(p => p.name === zoneName);
                  if (!isSelectedPrint) return null; // Only show selected print areas

                  const hasImage = !!uploadedImages[zoneName];
                  const isActive = activeZone === zoneName;

                  return (
                    <div
                      key={zoneName}
                      style={{
                        position: 'absolute',
                        top: zoneStyle.top,
                        left: zoneStyle.left,
                        width: zoneStyle.width,
                        height: zoneStyle.height,
                        transform: zoneStyle.transform,
                      }}
                      className={`border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 pointer-events-auto cursor-pointer ${isActive ? 'border-accent bg-accent/10 z-20' : 'border-white/20 hover:border-white/50 z-10'
                        }`}
                      onClick={() => setActiveZone(zoneName)}
                    >
                      {hasImage ? (
                        <img src={uploadedImages[zoneName]} alt="Uploaded Design" className="w-full h-full object-contain pointer-events-none" />
                      ) : (
                        <span className={`text-[10px] uppercase font-bold text-center p-1 pointer-events-none ${isActive ? 'text-accent' : 'text-gray-500'}`}>
                          {zoneName}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload Controls Side */}
            <div className="flex flex-col justify-center">

              {/* Template / Print Style Checkboxes */}
              <div className="mb-8 bg-neutral-900/50 p-6 rounded-lg border border-white/5">
                <label className="block text-secondary font-heading font-semibold uppercase tracking-wider mb-4">
                  Selected Print Areas (Templates)
                </label>

                {/* Quick Combos */}
                {templates.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-500 text-xs font-body uppercase tracking-wider mb-3">Quick Combos</p>
                    <div className="flex flex-wrap gap-2">
                      {templates.map(combo => (
                        <button
                          key={combo._id}
                          onClick={() => {
                            if (activeCombo && activeCombo._id === combo._id) {
                              setSelectedPrints([]);
                              setActiveCombo(null);
                            } else {
                              const comboPrints = (combo.printAreas || [])
                                .map(p => printStyles.find(style => style.name === p.name))
                                .filter(Boolean);
                              setSelectedPrints(comboPrints);
                              setActiveCombo(combo);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-sm text-sm font-body transition-colors group ${activeCombo && activeCombo._id === combo._id
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-white/10 text-gray-300 hover:border-accent hover:text-accent'
                            }`}
                        >
                          <FiZap className="w-3 h-3 text-accent/60 group-hover:text-accent" />
                          <span>{combo.name}</span>
                          {combo.isRecommended && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent rounded-sm">Recommended</span>
                          )}
                          {combo.isPopular && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent rounded-sm">Popular</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {printStyles.map(style => (
                    <label key={style._id} className={`flex items-center p-3 border rounded-sm transition-colors bg-primary/50 ${style.isActive ? 'border-white/10 cursor-pointer hover:border-accent' : 'border-red-500/20 opacity-50 cursor-not-allowed'}`}>
                      <input
                        type="checkbox"
                        className="accent-accent w-4 h-4 mr-3 shrink-0"
                        checked={!!selectedPrints.find(p => p._id === style._id)}
                        onChange={() => style.isActive && togglePrint(style)}
                        disabled={!style.isActive}
                      />
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-body text-sm">
                          {style.name}
                          {!style.isActive && <span className="text-red-400 text-xs ml-2 font-bold">(Not Available)</span>}
                        </span>
                        {style.isActive && <span className="text-accent text-xs mt-1">+₹{style.cost}</span>}
                      </div>
                    </label>
                  ))}
                </div>

                {selectedPrints.length > 0 && (
                  <>
                    <label className="block text-secondary font-heading font-semibold uppercase tracking-wider mb-4">
                      Uploading Design For:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrints.map(p => p.name).map(zone => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => setActiveZone(zone)}
                          className={`px-4 py-2 text-sm font-body border transition-colors flex items-center gap-2 ${activeZone === zone
                            ? 'border-accent bg-accent text-primary font-bold'
                            : 'border-white/20 text-gray-400 hover:border-white/50'
                            }`}
                        >
                          {zone}
                          {uploadedImages[zone] && <FiCheck className={activeZone === zone ? 'text-primary' : 'text-accent'} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Drag & Drop Area */}
              {activeZone ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 mb-8 ${isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-white/20 bg-neutral-900/50 hover:border-white/40'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedImages[activeZone] ? (
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 mb-6 bg-black/50 p-2 rounded border border-white/10">
                        <img src={uploadedImages[activeZone]} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Change File
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeImage(activeZone)} className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500">
                          <FiTrash2 /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 text-accent">
                        <FiUploadCloud className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-heading text-secondary mb-2">Drag & Drop your design</h3>
                      <p className="text-gray-400 font-body text-sm mb-6">Uploading for <strong>{activeZone}</strong></p>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Browse Files
                      </Button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center mb-8 bg-neutral-900/50">
                  <p className="text-gray-500 font-body">Please select a print area template above to upload a design.</p>
                </div>
              )}

              {/* Summary & Next Steps */}
              <div className="bg-neutral-900 p-6 rounded-lg border border-white/5">
                <div className="mb-6 pb-6 border-b border-white/10">
                  <h3 className="text-secondary font-heading uppercase tracking-wider mb-4">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['S', 'M', 'L', 'XL'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-10 border rounded font-bold transition-colors ${selectedSize === size
                            ? 'border-accent bg-accent/20 text-accent'
                            : 'border-white/10 text-gray-400 hover:border-accent hover:text-accent'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-secondary font-heading uppercase tracking-wider mb-4">
                    Quantity
                  </h3>
                  <div className="flex items-center border border-white/20 rounded-md overflow-hidden bg-neutral-950 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-16 text-center bg-transparent text-white font-medium outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <h3 className="text-secondary font-heading uppercase tracking-wider mb-4 border-b border-white/10 pb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 font-body text-sm text-gray-300 mb-6">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="text-secondary">{selectedCategory.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="text-secondary">{pricingDetails.q} pieces</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="text-secondary font-bold">{selectedSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-1/3">Print Styles:</span>
                    <span className="text-secondary text-right truncate pl-4">{pricingDetails.printNames}</span>
                  </div>
                  <div className="h-px w-full bg-white/10 my-2"></div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Base Price</span>
                    <span>₹{pricingDetails.basePrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Print Cost</span>
                    <span>+₹{pricingDetails.printCost}</span>
                  </div>
                  <div className="flex justify-between text-xl font-heading text-accent font-bold mt-2">
                    <span>Total Cost:</span>
                    <span>{pricingDetails.isValid ? `₹${pricingDetails.totalAmount.toLocaleString()}` : 'MOQ 1 required'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="accent"
                    className="w-full flex justify-center items-center gap-2"
                    onClick={handleAddToCartOnly}
                    disabled={isUploading}
                  >
                    <FiShoppingBag /> {isUploading ? 'Uploading...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
