import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiCheck, FiMinus, FiPlus, FiShoppingBag, FiZap, FiMove, FiMaximize2 } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { API_URL } from '../config';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';
import AnimatedSection from '../components/ui/AnimatedSection';
import DesignCanvas from '../components/ui/DesignCanvas';

// Mock T-Shirt Image URL (Plain Black)
const TSHIRT_MOCKUP = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800";

const CATEGORIES = [
  { name: 'Oversized T-Shirts (220 GSM)', baseCost: 0 },
  { name: 'Classic Fit T-Shirts (180 GSM)', baseCost: -30 },
  { name: 'Heavyweight Hoodies (350 GSM)', baseCost: 400 },
];

export default function CustomOrder() {
  const location = useLocation();
  const { alert } = useUIStore();

  const passedState = location.state || {};

  const [quantity, setQuantity] = useState(passedState.pricingDetails?.q || 1);
  const selectedCategory = passedState.selectedCategory || CATEGORIES[0];
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedPrints, setSelectedPrints] = useState(passedState.selectedPrints || []);
  const [selectedColor, setSelectedColor] = useState(null);
  const [printingInstructions, setPrintingInstructions] = useState('');

  const [uploadedImages, setUploadedImages] = useState({});
  const [uploadedRawFiles, setUploadedRawFiles] = useState({});
  const [activeZone, setActiveZone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCombo, setActiveCombo] = useState(null);
  const [designTransforms, setDesignTransforms] = useState({});

  const [printStyles, setPrintStyles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customPrintNotice, setCustomPrintNotice] = useState('');

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

    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          if (data.settings.customPrintColors && data.settings.customPrintColors.length > 0) {
            const activeColors = data.settings.customPrintColors.filter(c => c.isActive);
            setColors(activeColors);
            if (activeColors.length > 0) setSelectedColor(activeColors[0]);
          }
          if (data.settings.general && data.settings.general.customPrintNotice) {
            setCustomPrintNotice(data.settings.general.customPrintNotice);
          }
        }
      })
      .catch(err => console.error("Failed to fetch settings:", err));
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
        setDesignTransforms(prev => {
          const n = { ...prev };
          delete n[style.name];
          return n;
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
      alert('Please upload a design for at least one print area before adding to cart.', 'error', 'Missing Design');
      return;
    }
    if (!pricingDetails.isValid) {
      alert(`Please select a valid quantity (MOQ required).`, 'error', 'Invalid Quantity');
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
        selectedColor: selectedColor ? selectedColor.name : 'Black',
        selectedColorHex: selectedColor ? selectedColor.hex : '#000000',
        printingInstructions: printingInstructions,
        selectedPrints: selectedPrints,
        uploadedImages: finalImages,
        designTransforms: designTransforms,
        orderType: 'CustomPrint'
      });
      alert('Added custom design to cart!', 'success', 'Success');
    } catch (err) {
      alert('Error: ' + err.message, 'error', 'Error');
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
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!', 'error', 'Invalid File');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds the 3MB limit. Please choose a smaller image.', 'error', 'File Too Large');
      return;
    }
    const url = URL.createObjectURL(file);
    setUploadedImages(prev => ({
      ...prev,
      [activeZone]: url
    }));
    setUploadedRawFiles(prev => ({
      ...prev,
      [activeZone]: file
    }));
    // Initialize centered transform
    setDesignTransforms(prev => ({
      ...prev,
      [activeZone]: { x: 50, y: 50, scale: 1 }
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
    setDesignTransforms(prev => {
      const n = { ...prev };
      delete n[zone];
      return n;
    });
  };

  const handleTransformChange = (zone, transform) => {
    setDesignTransforms(prev => ({
      ...prev,
      [zone]: transform
    }));
  };

  const activePrintZones = printStyles
    .filter(s => s.isActive && selectedPrints.some(p => p.name === s.name))
    .map(s => ({ name: s.name, boundingBox: s.boundingBox }));

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="gradient-orb gradient-orb-accent w-[500px] h-[500px] -top-40 -right-40 animate-float" />
      <div className="gradient-orb gradient-orb-blue w-[400px] h-[400px] top-1/2 -left-40 animate-float" style={{ animationDelay: '3s' }} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-gray-400 font-body uppercase tracking-wider text-sm">Loading print templates...</span>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Hero Header */}
          <AnimatedSection className="mb-12">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-secondary uppercase tracking-tighter mb-4">
                Design <span className="text-gradient-accent italic">Studio</span>
              </h1>
              <p className="text-gray-400 font-body text-lg max-w-2xl">
                Upload your artwork, position it precisely on our premium blanks, and see exactly what you'll get.
              </p>
              <div className="flex gap-4 mt-4 text-xs text-gray-500 font-body uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><FiMove className="text-accent" /> Drag to position</span>
                <span className="flex items-center gap-1.5"><FiMaximize2 className="text-accent" /> Resize with handles</span>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* ── Left: Interactive Mockup Preview ── */}
            <AnimatedSection direction="left" delay={0.1}>
              <div className="sticky top-28">
                <div className="glass-card p-6 md:p-8">
                  <DesignCanvas
                    mockupImage={TSHIRT_MOCKUP}
                    printZones={activePrintZones}
                    uploadedImages={uploadedImages}
                    designTransforms={designTransforms}
                    onTransformChange={handleTransformChange}
                    activeZone={activeZone}
                    onZoneClick={setActiveZone}
                    selectedColorHex={selectedColor?.hex}
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* ── Right: Controls ── */}
            <div className="flex flex-col gap-8">

              {/* Print Area Selection */}
              <AnimatedSection direction="right" delay={0.15}>
                <div className="glass-card p-6">
                  <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold">1</span>
                    Select Print Areas
                  </h3>

                  {/* Quick Combos */}
                  {templates.length > 0 && (
                    <div className="mb-6">
                      <p className="text-gray-500 text-xs font-body uppercase tracking-wider mb-3">Quick Combos</p>
                      <div className="flex flex-wrap gap-2">
                        {templates.map(combo => (
                          <motion.button
                            key={combo._id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
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
                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-body transition-colors group ${activeCombo && activeCombo._id === combo._id
                              ? 'border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(163,255,18,0.15)]'
                              : 'border-white/10 text-gray-300 hover:border-accent/50 hover:text-accent'
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
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {printStyles.map(style => (
                      <label key={style._id} className={`flex items-center p-3 border rounded-lg transition-all ${style.isActive ? 'border-white/10 cursor-pointer hover:border-accent/50 hover:bg-accent/5' : 'border-red-500/20 opacity-50 cursor-not-allowed'}`}>
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
                          {style.isActive && <span className="text-accent text-xs mt-0.5">+₹{style.cost}</span>}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Zone tabs */}
                  <AnimatePresence>
                    {selectedPrints.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <h4 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-3 text-sm">
                          Upload Design For:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPrints.map(p => p.name).map(zone => (
                            <motion.button
                              key={zone}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setActiveZone(zone)}
                              className={`px-4 py-2 text-sm font-body border rounded-lg transition-all flex items-center gap-2 ${activeZone === zone
                                ? 'border-accent bg-accent text-primary font-bold shadow-[0_0_20px_rgba(163,255,18,0.2)]'
                                : 'border-white/20 text-gray-400 hover:border-white/50'
                                }`}
                            >
                              {zone}
                              {uploadedImages[zone] && <FiCheck className={activeZone === zone ? 'text-primary' : 'text-accent'} />}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {customPrintNotice && (
                    <div className="mt-6 bg-accent/10 border border-accent/20 p-4 rounded-lg">
                      <p className="text-accent text-sm font-medium">{customPrintNotice}</p>
                    </div>
                  )}
                </div>
              </AnimatedSection>

              {/* Upload Area */}
              <AnimatedSection direction="right" delay={0.2}>
                <div className="glass-card p-6">
                  <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold">2</span>
                    Upload Artwork
                  </h3>

                  {activeZone ? (
                    <div
                      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${isDragging
                        ? 'border-accent bg-accent/5 shadow-[0_0_30px_rgba(163,255,18,0.1)]'
                        : 'border-white/15 bg-white/[0.02] hover:border-white/30'
                        }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {uploadedImages[activeZone] ? (
                        <div className="flex flex-col items-center">
                          <div className="w-28 h-28 mb-5 bg-black/50 p-2 rounded-xl border border-white/10 overflow-hidden">
                            <img src={uploadedImages[activeZone]} alt="Preview" className="w-full h-full object-contain" />
                          </div>
                          <p className="text-accent text-xs mb-4 font-body">Drag your design on the mockup to reposition it</p>
                          <div className="flex gap-3">
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
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 text-accent"
                          >
                            <FiUploadCloud className="w-8 h-8" />
                          </motion.div>
                          <h4 className="text-lg font-heading text-secondary mb-1">Drag & Drop your design</h4>
                          <p className="text-gray-500 font-body text-sm mb-5">Uploading for <strong className="text-accent">{activeZone}</strong></p>
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
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center bg-white/[0.01]">
                      <p className="text-gray-500 font-body">Select a print area above to upload a design.</p>
                    </div>
                  )}
                </div>
              </AnimatedSection>

              {/* Options & Summary */}
              <AnimatedSection direction="right" delay={0.25}>
                <div className="glass-card p-6">
                  <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold">3</span>
                    Options & Summary
                  </h3>

                  {/* Size */}
                  <div className="mb-6">
                    <h4 className="text-gray-400 font-body text-xs uppercase tracking-wider mb-3">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-10 border rounded-lg font-bold transition-all ${selectedSize === size
                            ? 'border-accent bg-accent/20 text-accent shadow-[0_0_12px_rgba(163,255,18,0.2)]'
                            : 'border-white/10 text-gray-400 hover:border-accent/50 hover:text-accent'
                            }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  {colors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-gray-400 font-body text-xs uppercase tracking-wider mb-3">Garment Color</h4>
                      <div className="flex flex-wrap gap-3">
                        {colors.map(color => (
                          <motion.button
                            key={color.name}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedColor(color)}
                            title={color.name}
                            className={`w-10 h-10 rounded-full border-2 transition-all shadow-lg ${selectedColor?.name === color.name ? 'border-accent scale-110 shadow-[0_0_15px_rgba(163,255,18,0.3)]' : 'border-white/20 hover:border-white/50'}`}
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <h4 className="text-gray-400 font-body text-xs uppercase tracking-wider mb-3">Quantity</h4>
                    <div className="flex items-center border border-white/15 rounded-lg overflow-hidden bg-white/[0.02] w-fit">
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

                  {/* Instructions */}
                  <div className="mb-6">
                    <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg mb-4">
                      <p className="text-accent text-xs font-medium">Note: We will be using plain t-shirts and print your reference design.</p>
                    </div>
                    <h4 className="text-gray-400 font-body text-xs uppercase tracking-wider mb-3">Printing Instructions</h4>
                    <textarea
                      value={printingInstructions}
                      onChange={(e) => setPrintingInstructions(e.target.value)}
                      placeholder="Enter any specific instructions for the printing team..."
                      className="w-full bg-white/[0.03] border border-white/15 rounded-lg p-3 text-white focus:outline-none focus:border-accent text-sm resize-none transition-colors"
                      rows={3}
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-white/10 pt-5 space-y-2.5 font-body text-sm text-gray-300">
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
                    <div className="h-px w-full bg-white/10 my-1"></div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Base Price</span>
                      <span>₹{pricingDetails.basePrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Print Cost</span>
                      <span>+₹{pricingDetails.printCost}</span>
                    </div>
                    <motion.div
                      key={pricingDetails.totalAmount}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className="flex justify-between text-xl font-heading text-accent font-bold pt-2"
                    >
                      <span>Total Cost:</span>
                      <span>{pricingDetails.isValid ? `₹${pricingDetails.totalAmount.toLocaleString()}` : 'MOQ 1 required'}</span>
                    </motion.div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <Button
                      variant="accent"
                      className="w-full flex justify-center items-center gap-2 animate-pulse-glow"
                      onClick={handleAddToCartOnly}
                      disabled={isUploading}
                    >
                      <FiShoppingBag /> {isUploading ? 'Uploading...' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </AnimatedSection>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
