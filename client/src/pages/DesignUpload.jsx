import { useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiArrowLeft, FiCheckCircle, FiImage, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import Button from '../components/ui/Button';

/*
 * ──────────────────────────────────────────────────────────────
 *  PROPORTIONAL ZONE DEFINITIONS
 *
 *  All positions are in SVG coordinate space (viewBox 0 0 400 480).
 *  The t-shirt body spans x=100–300 (width 200) and y=90–430 (height 340).
 *
 *  Scale basis (220 GSM Oversized Tee):
 *    Real body width  ≈ 60 cm  →  200 SVG units  →  1 cm = 3.333 units
 *    Real body height ≈ 75 cm  →  340 SVG units  →  1 cm = 4.533 units
 *    Collar at y ≈ 90, hem at y ≈ 430
 *
 *  Each zone's { x, y, w, h } is calculated from real cm dimensions.
 * ──────────────────────────────────────────────────────────────
 */
const CM_H = 3.333; // SVG units per cm horizontally
const CM_V = 4.533; // SVG units per cm vertically
const CX = 200;     // T-shirt center x
const COLLAR_Y = 90; // Front collar lowest point
const BACK_NECK_Y = 80; // Back neckline

const PRINT_ZONE_MAP = {
  // ── FRONT PRINTS ──────────────────────────────────────────
  'Left Chest Logo': {
    label: 'Left Chest Logo',
    realSize: '9 × 9 cm',
    view: 'front',
    bestFor: 'Brand logos, Minimal designs',
    // 9cm × 9cm, positioned 8cm left of center, 10cm below collar
    rect: {
      x: Math.round(CX - 8 * CM_H - (9 * CM_H) / 2 + (9 * CM_H) / 2),
      y: Math.round(COLLAR_Y + 10 * CM_V - (9 * CM_V) / 2),
      w: Math.round(9 * CM_H),
      h: Math.round(9 * CM_V),
    },
  },
  'Chest Design (15×7 cm)': {
    label: 'Chest Design',
    realSize: '15 × 7 cm',
    view: 'front',
    bestFor: 'Brand name, Typography, Streetwear',
    // 15cm × 7cm, centered horizontally, 9cm below collar
    rect: {
      x: Math.round(CX - (15 * CM_H) / 2),
      y: Math.round(COLLAR_Y + 9 * CM_V - (7 * CM_V) / 2),
      w: Math.round(15 * CM_H),
      h: Math.round(7 * CM_V),
    },
  },
  'Center Chest Design': {
    label: 'Center Chest',
    realSize: '22 × 22 cm',
    view: 'front',
    bestFor: 'Anime logos, Medium graphics, Quotes',
    // 22cm × 22cm, centered, 16cm below collar (center point)
    rect: {
      x: Math.round(CX - (22 * CM_H) / 2),
      y: Math.round(COLLAR_Y + 7 * CM_V),
      w: Math.round(22 * CM_H),
      h: Math.round(22 * CM_V),
    },
  },
  'Front Graphic (A4)': {
    label: 'Front A4',
    realSize: '21 × 29.7 cm',
    view: 'front',
    bestFor: 'Anime graphics, Custom artwork, Photo prints',
    // A4: 21cm × 29.7cm, centered, starts 7cm below collar
    rect: {
      x: Math.round(CX - (21 * CM_H) / 2),
      y: Math.round(COLLAR_Y + 7 * CM_V),
      w: Math.round(21 * CM_H),
      h: Math.round(29.7 * CM_V),
    },
  },
  'Large Front Graphic (A3)': {
    label: 'Front A3',
    realSize: '29.7 × 42 cm',
    view: 'front',
    bestFor: 'Streetwear, Oversized prints, Premium',
    // 29.7cm × 42cm, centered, starts 6cm below collar
    rect: {
      x: Math.round(CX - (29.7 * CM_H) / 2),
      y: Math.round(COLLAR_Y + 6 * CM_V),
      w: Math.round(29.7 * CM_H),
      h: Math.round(42 * CM_V),
    },
  },

  // ── BACK PRINTS ───────────────────────────────────────────
  'Small Upper Back Logo': {
    label: 'Upper Back Logo',
    realSize: '12 × 10 cm',
    view: 'back',
    bestFor: 'Brand logos, Minimal back branding',
    // 12cm × 10cm, centered, 10cm below back neckline
    rect: {
      x: Math.round(CX - (12 * CM_H) / 2),
      y: Math.round(BACK_NECK_Y + 10 * CM_V - (10 * CM_V) / 2),
      w: Math.round(12 * CM_H),
      h: Math.round(10 * CM_V),
    },
  },
  'Medium Back Graphic (A4)': {
    label: 'Back A4',
    realSize: '21 × 29.7 cm',
    view: 'back',
    bestFor: 'Medium back graphics, Artwork',
    // A4: 21cm × 29.7cm, centered, starts 10cm below back neckline
    rect: {
      x: Math.round(CX - (21 * CM_H) / 2),
      y: Math.round(BACK_NECK_Y + 10 * CM_V),
      w: Math.round(21 * CM_H),
      h: Math.round(29.7 * CM_V),
    },
  },
  'Large Back Graphic (A3)': {
    label: 'Back A3',
    realSize: '29.7 × 42 cm',
    view: 'back',
    bestFor: 'Streetwear, Anime, Large typography',
    // A3: 29.7cm × 42cm, centered, starts 7cm below back neckline
    rect: {
      x: Math.round(CX - (29.7 * CM_H) / 2),
      y: Math.round(BACK_NECK_Y + 7 * CM_V),
      w: Math.round(29.7 * CM_H),
      h: Math.round(42 * CM_V),
    },
  },

  // ── SLEEVE PRINTS ─────────────────────────────────────────
  'Small Sleeve Logo': {
    label: 'Sleeve Logo',
    realSize: '5 × 5 cm',
    view: 'front',
    bestFor: 'Small brand marks',
    // 5cm × 5cm, on left sleeve mid-area
    rect: {
      x: 55,
      y: 128,
      w: Math.round(5 * CM_H),
      h: Math.round(5 * CM_V),
    },
  },
  'Sleeve Typography': {
    label: 'Sleeve Text',
    realSize: '10 × 4 cm',
    view: 'front',
    bestFor: 'Text, Dates, URLs',
    // 10cm × 4cm, on left sleeve
    rect: {
      x: 45,
      y: 135,
      w: Math.round(10 * CM_H),
      h: Math.round(4 * CM_V),
    },
  },

  // ── OTHER PLACEMENTS ──────────────────────────────────────
  'Neck Print (Inside)': {
    label: 'Neck (Inside)',
    realSize: '6 × 4 cm',
    view: 'front',
    bestFor: 'Size label, Brand logo, Wash instructions',
    // 6cm × 4cm, at inner collar
    rect: {
      x: Math.round(CX - (6 * CM_H) / 2),
      y: 78,
      w: Math.round(6 * CM_H),
      h: Math.round(4 * CM_V),
    },
  },
  'Outside Neck Print': {
    label: 'Neck (Outside)',
    realSize: '8 × 4 cm',
    view: 'back',
    bestFor: 'Brand tag, External label',
    // 8cm × 4cm, below back neckline
    rect: {
      x: Math.round(CX - (8 * CM_H) / 2),
      y: 82,
      w: Math.round(8 * CM_H),
      h: Math.round(4 * CM_V),
    },
  },
  'Bottom Hem Print': {
    label: 'Bottom Hem',
    realSize: '10 × 5 cm',
    view: 'front',
    bestFor: 'Small graphics, Brand signature',
    // 10cm × 5cm, near hem
    rect: {
      x: Math.round(CX - (10 * CM_H) / 2),
      y: 400,
      w: Math.round(10 * CM_H),
      h: Math.round(5 * CM_V),
    },
  },
  'Pocket Area Print': {
    label: 'Pocket Area',
    realSize: '8 × 8 cm',
    view: 'front',
    bestFor: 'Pocket logo, Small graphic',
    // 8cm × 8cm, left chest pocket position
    rect: {
      x: Math.round(CX - 8 * CM_H - (8 * CM_H) / 2 + (8 * CM_H) / 2),
      y: Math.round(COLLAR_Y + 14 * CM_V - (8 * CM_V) / 2),
      w: Math.round(8 * CM_H),
      h: Math.round(8 * CM_V),
    },
  },
};

// ── SVG T-SHIRT PATHS ─────────────────────────────────────
const TSHIRT_FRONT_PATH = 'M 80 80 L 30 120 L 60 200 L 100 170 L 100 430 L 300 430 L 300 170 L 340 200 L 370 120 L 320 80 L 280 60 Q 260 90 200 90 Q 140 90 120 60 Z';
const TSHIRT_BACK_PATH = 'M 80 80 L 30 120 L 60 200 L 100 170 L 100 430 L 300 430 L 300 170 L 340 200 L 370 120 L 320 80 L 280 68 Q 250 80 200 82 Q 150 80 120 68 Z';

export default function DesignUpload() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Get state passed from Wholesale page
  const { selectedPrints = [], pricingDetails = {}, selectedCategory = {} } = location.state || {};

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [activeZone, setActiveZone] = useState(selectedPrints[0]?.name || null);
  const [isDragging, setIsDragging] = useState(false);
  const [designScales, setDesignScales] = useState({});
  const [currentView, setCurrentView] = useState('front');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  // Only show zones that match user's selected print styles
  const activeZones = selectedPrints
    .map(p => ({ ...p, zone: PRINT_ZONE_MAP[p.name] }))
    .filter(p => p.zone);

  const frontZones = activeZones.filter(z => z.zone.view === 'front');
  const backZones = activeZones.filter(z => z.zone.view === 'back');
  const hasBackZones = backZones.length > 0;
  const hasFrontZones = frontZones.length > 0;
  const currentZones = currentView === 'front' ? frontZones : backZones;

  // Auto-switch view when selecting a zone on the other side
  const selectZone = (name) => {
    setActiveZone(name);
    const zone = PRINT_ZONE_MAP[name];
    if (zone) setCurrentView(zone.view);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be under 25MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (activeZone) {
        setUploadedFiles(prev => ({
          ...prev,
          [activeZone]: {
            name: file.name,
            size: file.size,
            type: file.type,
            preview: e.target.result,
            rawFile: file,
          },
        }));
        setDesignScales(prev => ({
          ...prev,
          [activeZone]: 1,
        }));
      }
    };
    reader.readAsDataURL(file);
  }, [activeZone]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = '';
  }, [processFile]);

  const removeFile = (zoneName) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[zoneName];
      return updated;
    });
    setDesignScales(prev => {
      const updated = { ...prev };
      delete updated[zoneName];
      return updated;
    });
  };

  const adjustScale = (zoneName, delta) => {
    setDesignScales(prev => ({
      ...prev,
      [zoneName]: Math.max(0.3, Math.min(2.5, (prev[zoneName] || 1) + delta)),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const finalImages = {};
      
      // Upload each file to the backend
      for (const [zone, fileData] of Object.entries(uploadedFiles)) {
        if (fileData.rawFile) {
          const formData = new FormData();
          formData.append('image', fileData.rawFile);
          
          const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
          });
          
          if (!res.ok) throw new Error(`Failed to upload ${zone} design`);
          const data = await res.json();
          finalImages[zone] = data.url;
        } else {
          finalImages[zone] = fileData.preview;
        }
      }

      addToCart({
        id: selectedCategory.productId?._id || selectedCategory.productId || 'custom-' + Date.now(),
        name: `Wholesale - ${selectedCategory.productId?.name || selectedCategory.name || 'Blank Item'}`,
        price: pricingDetails.pricePerPiece,
        quantity: pricingDetails.q,
        selectedPrints,
        uploadedImages: finalImages,
        orderType: 'Wholesale'
      });
      
      alert('Added designs to cart!');
      navigate('/checkout');
    } catch (err) {
      console.error(err);
      alert('Error uploading designs: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUploaded = Object.keys(uploadedFiles).length;
  const totalRequired = activeZones.length;

  // Fallback: no prints selected (direct navigation)
  if (selectedPrints.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <FiImage className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-secondary uppercase tracking-wider mb-4">
            No Print Styles Selected
          </h2>
          <p className="text-gray-400 font-body mb-8">
            Please go back to the wholesale page and select your print styles before uploading designs.
          </p>
          <Button variant="accent" size="lg" onClick={() => navigate('/wholesale')}>
            <FiArrowLeft className="mr-2" /> Go to Wholesale
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
          <div>
            <button
              onClick={() => navigate('/wholesale')}
              className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors font-body text-sm mb-4 group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Wholesale
            </button>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-secondary uppercase tracking-tighter">
              Upload <span className="text-accent italic">Designs</span>
            </h1>
            <p className="text-gray-400 mt-2 font-body">
              {selectedCategory.name || 'Custom Order'} — {selectedPrints.map(p => p.name).join(', ')}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-6 md:mt-0 flex items-center gap-3">
            <span className={`text-sm font-body ${totalUploaded === totalRequired ? 'text-accent' : 'text-gray-400'}`}>
              {totalUploaded}/{totalRequired} uploaded
            </span>
            <div className="w-32 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalRequired > 0 ? (totalUploaded / totalRequired) * 100 : 0}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ═══ LEFT COLUMN: Upload ═══ */}
          <div>
            {/* Zone Tabs */}
            <div className="mb-6">
              <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-4">
                Select Print Zone to Upload
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeZones.map(({ name, zone }) => (
                  <button
                    key={name}
                    onClick={() => selectZone(name)}
                    className={`px-4 py-2.5 text-sm font-body border rounded-sm transition-all duration-300 flex items-center gap-2 ${
                      activeZone === name
                        ? 'border-accent bg-accent/10 text-accent'
                        : uploadedFiles[name]
                          ? 'border-accent/30 text-accent/70 bg-accent/5'
                          : 'border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {uploadedFiles[name] && <FiCheckCircle className="w-3.5 h-3.5" />}
                    <span className="text-[10px] uppercase tracking-wider opacity-50 mr-1">
                      {zone.view === 'back' ? 'Back' : zone.view === 'front' && name.includes('Sleeve') ? 'Sleeve' : 'Front'}
                    </span>
                    {zone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Zone Info */}
            {activeZone && PRINT_ZONE_MAP[activeZone] && (
              <div className="mb-4 px-4 py-3 bg-neutral-900/50 border border-white/5 rounded-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary text-sm font-heading font-semibold">{PRINT_ZONE_MAP[activeZone].label}</p>
                    <p className="text-gray-500 text-xs font-body">{PRINT_ZONE_MAP[activeZone].realSize} — {PRINT_ZONE_MAP[activeZone].bestFor}</p>
                  </div>
                  <span className="text-accent/60 text-xs font-body border border-accent/20 px-2 py-1 rounded-sm">
                    {PRINT_ZONE_MAP[activeZone].view}
                  </span>
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-300 group ${
                isDragging
                  ? 'border-accent bg-accent/5 scale-[1.01]'
                  : 'border-white/15 hover:border-accent/50 bg-neutral-900/50 hover:bg-neutral-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  isDragging ? 'bg-accent/20' : 'bg-white/5 group-hover:bg-accent/10'
                }`}>
                  <FiUploadCloud className={`w-7 h-7 transition-colors ${
                    isDragging ? 'text-accent' : 'text-gray-400 group-hover:text-accent'
                  }`} />
                </div>
                <h3 className="text-secondary font-heading font-semibold text-lg mb-2">
                  {isDragging ? 'Drop your design here' : 'Drag & drop your design'}
                </h3>
                <p className="text-gray-500 font-body text-sm mb-4">or click to browse files</p>
                <p className="text-gray-600 font-body text-xs">
                  PNG, JPG, SVG, WEBP — Max 25MB — 300 DPI recommended
                </p>
                {activeZone && (
                  <div className="mt-4 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-sm">
                    <p className="text-accent text-xs font-body">
                      Uploading for: <span className="font-semibold">{PRINT_ZONE_MAP[activeZone]?.label}</span>
                      <span className="text-accent/50 ml-2">({PRINT_ZONE_MAP[activeZone]?.realSize})</span>
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Uploaded Files List */}
            <AnimatePresence>
              {Object.entries(uploadedFiles).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-3">
                    Uploaded Designs
                  </h3>
                  {Object.entries(uploadedFiles).map(([zoneName, file]) => (
                    <motion.div
                      key={zoneName}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-4 p-4 bg-neutral-900 border rounded-sm transition-colors cursor-pointer ${
                        activeZone === zoneName ? 'border-accent/40' : 'border-white/10'
                      }`}
                      onClick={() => selectZone(zoneName)}
                    >
                      <div className="w-12 h-12 rounded-sm overflow-hidden border border-white/10 shrink-0 bg-neutral-800">
                        <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-secondary font-body text-sm truncate">{file.name}</p>
                        <p className="text-gray-500 text-xs font-body">
                          {PRINT_ZONE_MAP[zoneName]?.label} ({PRINT_ZONE_MAP[zoneName]?.realSize}) — {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); adjustScale(zoneName, -0.1); }}
                          className="p-1.5 text-gray-400 hover:text-accent transition-colors"
                        >
                          <FiZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-gray-500 text-xs font-body w-8 text-center">
                          {Math.round((designScales[zoneName] || 1) * 100)}%
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); adjustScale(zoneName, 0.1); }}
                          className="p-1.5 text-gray-400 hover:text-accent transition-colors"
                        >
                          <FiZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(zoneName); }}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ RIGHT COLUMN: T-Shirt Preview ═══ */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {/* View Toggle Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider text-sm">
                Live Preview
              </h3>
              <div className="flex items-center gap-1 bg-neutral-900 border border-white/10 rounded-sm p-1">
                <button
                  onClick={() => setCurrentView('front')}
                  disabled={!hasFrontZones}
                  className={`px-3 py-1.5 text-xs font-body rounded-sm transition-all ${
                    currentView === 'front'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : hasFrontZones
                        ? 'text-gray-400 hover:text-secondary border border-transparent'
                        : 'text-gray-600 cursor-not-allowed border border-transparent'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setCurrentView('back')}
                  disabled={!hasBackZones}
                  className={`px-3 py-1.5 text-xs font-body rounded-sm transition-all ${
                    currentView === 'back'
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : hasBackZones
                        ? 'text-gray-400 hover:text-secondary border border-transparent'
                        : 'text-gray-600 cursor-not-allowed border border-transparent'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* T-Shirt SVG Mockup */}
            <div className="relative bg-neutral-900 border border-white/10 rounded-sm overflow-hidden">
              {/* Subtle top gradient for depth */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none z-10" />

              <svg
                viewBox="0 0 400 480"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
                style={{ background: '#0a0a0a' }}
              >
                <defs>
                  {/* Clip paths to contain designs within the shirt */}
                  <clipPath id="shirt-clip-front">
                    <path d={TSHIRT_FRONT_PATH} />
                  </clipPath>
                  <clipPath id="shirt-clip-back">
                    <path d={TSHIRT_BACK_PATH} />
                  </clipPath>
                  {/* Subtle fabric texture */}
                  <pattern id="fabric-tex" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="transparent" />
                    <circle cx="1" cy="1" r="0.4" fill="rgba(255,255,255,0.012)" />
                    <circle cx="4" cy="4" r="0.3" fill="rgba(255,255,255,0.008)" />
                  </pattern>
                </defs>

                {/* ── T-Shirt Body ── */}
                <path
                  d={currentView === 'front' ? TSHIRT_FRONT_PATH : TSHIRT_BACK_PATH}
                  fill="#1a1a1a"
                  stroke="#2a2a2a"
                  strokeWidth="1.5"
                />
                {/* Fabric texture overlay */}
                <path
                  d={currentView === 'front' ? TSHIRT_FRONT_PATH : TSHIRT_BACK_PATH}
                  fill="url(#fabric-tex)"
                />

                {/* ── Print Zone Designs (clipped to shirt) ── */}
                <g clipPath={`url(#shirt-clip-${currentView})`}>
                  {currentZones.map(({ name, zone }) => {
                    const file = uploadedFiles[name];
                    const scale = designScales[name] || 1;
                    const isActive = activeZone === name;
                    const { x, y, w, h } = zone.rect;

                    // Calculate scaled position (scale from center)
                    const cx = x + w / 2;
                    const cy = y + h / 2;
                    const sw = w * scale;
                    const sh = h * scale;
                    const sx = cx - sw / 2;
                    const sy = cy - sh / 2;

                    return (
                      <g
                        key={name}
                        onClick={() => selectZone(name)}
                        style={{ cursor: 'pointer' }}
                      >
                        <defs>
                          <clipPath id={`clip-${name.replace(/\s+/g, '-')}`}>
                            <rect x={x} y={y} width={w} height={h} rx="2" />
                          </clipPath>
                        </defs>
                        {file ? (
                          /* Uploaded design image */
                          <image
                            href={file.preview}
                            x={sx}
                            y={sy}
                            width={sw}
                            height={sh}
                            preserveAspectRatio="xMidYMid meet"
                            opacity="0.95"
                            clipPath={`url(#clip-${name.replace(/\s+/g, '-')})`}
                          />
                        ) : (
                          /* Empty zone placeholder */
                          <>
                            <rect
                              x={x}
                              y={y}
                              width={w}
                              height={h}
                              fill={isActive ? 'rgba(163,255,18,0.06)' : 'rgba(255,255,255,0.015)'}
                              stroke={isActive ? '#A3FF12' : 'rgba(255,255,255,0.12)'}
                              strokeWidth={isActive ? 1.5 : 0.8}
                              strokeDasharray={isActive ? '6 3' : '4 3'}
                              rx="2"
                            />
                            {/* Zone size label */}
                            <text
                              x={x + w / 2}
                              y={y + h / 2 - 5}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={isActive ? '#A3FF12' : 'rgba(255,255,255,0.25)'}
                              fontSize={w > 60 ? 9 : 7}
                              fontFamily="Inter, sans-serif"
                            >
                              {zone.label}
                            </text>
                            <text
                              x={x + w / 2}
                              y={y + h / 2 + 7}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={isActive ? 'rgba(163,255,18,0.5)' : 'rgba(255,255,255,0.12)'}
                              fontSize={w > 60 ? 7 : 5.5}
                              fontFamily="Inter, sans-serif"
                            >
                              {zone.realSize}
                            </text>
                          </>
                        )}

                        {/* Active zone highlight border */}
                        {isActive && (
                          <rect
                            x={file ? sx - 2 : x - 2}
                            y={file ? sy - 2 : y - 2}
                            width={file ? sw + 4 : w + 4}
                            height={file ? sh + 4 : h + 4}
                            fill="none"
                            stroke="#A3FF12"
                            strokeWidth="1.5"
                            strokeDasharray="0"
                            rx="3"
                            opacity="0.8"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* ── Seam Lines (drawn on top of designs) ── */}
                {currentView === 'front' ? (
                  <>
                    {/* Collar */}
                    <path
                      d="M 130 62 Q 150 80 200 82 Q 250 80 270 62"
                      fill="none"
                      stroke="#333"
                      strokeWidth="2"
                    />
                    {/* Neckline curve */}
                    <path
                      d="M 120 60 Q 140 95 200 95 Q 260 95 280 60"
                      fill="none"
                      stroke="#2a2a2a"
                      strokeWidth="1"
                    />
                  </>
                ) : (
                  <>
                    {/* Back yoke seam */}
                    <path
                      d="M 120 68 Q 150 80 200 82 Q 250 80 280 68"
                      fill="none"
                      stroke="#282828"
                      strokeWidth="1.5"
                    />
                    {/* Back neck label area indicator */}
                    <rect
                      x="190"
                      y="70"
                      width="20"
                      height="8"
                      fill="#222"
                      stroke="#2a2a2a"
                      strokeWidth="0.5"
                      rx="1"
                    />
                  </>
                )}

                {/* Side seams (subtle) */}
                <line x1="100" y1="170" x2="100" y2="430" stroke="#222" strokeWidth="0.5" opacity="0.6" />
                <line x1="300" y1="170" x2="300" y2="430" stroke="#222" strokeWidth="0.5" opacity="0.6" />
                {/* Sleeve seams */}
                <line x1="100" y1="170" x2="80" y2="80" stroke="#252525" strokeWidth="0.5" opacity="0.5" />
                <line x1="300" y1="170" x2="320" y2="80" stroke="#252525" strokeWidth="0.5" opacity="0.5" />

                {/* View label */}
                <text
                  x="200"
                  y="465"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.2)"
                  fontSize="10"
                  fontFamily="Space Grotesk, sans-serif"
                  letterSpacing="3"
                >
                  {currentView === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
                </text>
              </svg>
            </div>

            {/* Zone Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeZones.map(({ name, zone }) => (
                <button
                  key={name}
                  onClick={() => selectZone(name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-body cursor-pointer transition-all ${
                    activeZone === name
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : uploadedFiles[name]
                        ? 'bg-accent/5 text-accent/60 border border-accent/10'
                        : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/15'
                  }`}
                >
                  {uploadedFiles[name] ? (
                    <FiCheckCircle className="w-3 h-3" />
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      activeZone === name ? 'bg-accent' : 'bg-gray-600'
                    }`} />
                  )}
                  <span className="opacity-50 uppercase" style={{ fontSize: '9px' }}>
                    {zone.view === 'back' ? 'B' : name.includes('Sleeve') ? 'S' : 'F'}
                  </span>
                  {zone.label}
                </button>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 bg-neutral-900 border border-white/10 rounded-sm p-6">
              <h4 className="text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-4">
                Order Summary
              </h4>
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Category</span>
                  <span className="text-secondary">{selectedCategory.name || '—'}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Quantity</span>
                  <span className="text-secondary">{pricingDetails.q || '—'} pcs</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Print Zones</span>
                  <span className="text-secondary">{selectedPrints.length}</span>
                </div>
                <div className="h-px bg-white/10 my-3" />
                <div className="flex justify-between text-accent font-heading font-bold text-lg">
                  <span>Estimated Total</span>
                  <span>{pricingDetails.totalAmount ? `₹${pricingDetails.totalAmount.toLocaleString()}` : '—'}</span>
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="w-full mt-6"
                onClick={handleSubmitOrder}
                disabled={totalUploaded < totalRequired || isSubmitting}
              >
                {isSubmitting 
                  ? 'Uploading Designs...' 
                  : totalUploaded < totalRequired
                    ? `Upload ${totalRequired - totalUploaded} more design${totalRequired - totalUploaded > 1 ? 's' : ''}`
                    : 'Submit Order'
                }
              </Button>

              {totalUploaded < totalRequired && (
                <p className="text-gray-500 text-xs text-center mt-3 font-body">
                  Upload designs for all selected print zones to proceed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
