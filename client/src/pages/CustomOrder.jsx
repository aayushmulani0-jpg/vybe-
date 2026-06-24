import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiTrash2, FiCheckCircle, FiImage,
  FiZoomIn, FiZoomOut, FiZap, FiShoppingCart, FiPackage
} from 'react-icons/fi';
import Button from '../components/ui/Button';

/* ═══════════════════════════════════════════════════════════════
 *  PRINT STYLES — same zones as wholesale, used for style selection
 * ═══════════════════════════════════════════════════════════════ */
const PRINT_STYLES = [
  { name: 'Left Chest Logo', cost: 49, category: 'Front', size: '8–10 × 8–10 cm' },
  { name: 'Chest Design (15×7 cm)', cost: 79, category: 'Front', size: '15 × 7 cm' },
  { name: 'Center Chest Design', cost: 99, category: 'Front', size: '20–25 × 20–25 cm' },
  { name: 'Front Graphic (A4)', cost: 129, category: 'Front', size: '21 × 29.7 cm' },
  { name: 'Large Front Graphic (A3)', cost: 179, category: 'Front', size: '29.7 × 42 cm' },
  { name: 'Small Upper Back Logo', cost: 59, category: 'Back', size: '10–15 × 7–10 cm' },
  { name: 'Medium Back Graphic (A4)', cost: 129, category: 'Back', size: '21 × 29.7 cm' },
  { name: 'Large Back Graphic (A3)', cost: 199, category: 'Back', size: '29.7 × 42 cm' },
  { name: 'Small Sleeve Logo', cost: 39, category: 'Sleeve', size: '5 × 5 cm' },
  { name: 'Sleeve Typography', cost: 49, category: 'Sleeve', size: '10 × 4 cm' },
  { name: 'Neck Print (Inside)', cost: 39, category: 'Other', size: '6 × 4 cm' },
  { name: 'Outside Neck Print', cost: 39, category: 'Other', size: '8 × 4 cm' },
  { name: 'Bottom Hem Print', cost: 49, category: 'Other', size: '10 × 5 cm' },
  { name: 'Pocket Area Print', cost: 49, category: 'Other', size: '8 × 8 cm' },
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
    prints: ['Chest Design (15×7 cm)', 'Large Back Graphic (A3)'],
  },
  {
    name: 'Minimal Combo',
    tag: null,
    prints: ['Left Chest Logo', 'Small Upper Back Logo'],
  },
  {
    name: 'Anime Collection',
    tag: 'Popular',
    prints: ['Front Graphic (A4)', 'Large Back Graphic (A3)'],
  },
];

const BASE_TSHIRT_PRICE = 499;

/* ═══════════════════════════════════════════════════════════════
 *  PROPORTIONAL ZONE MAP — SVG coordinate space (viewBox 0 0 400 480)
 *
 *  220 GSM Oversized Tee scale:
 *    1 cm = 3.333 SVG units (horizontal)
 *    1 cm = 4.533 SVG units (vertical)
 * ═══════════════════════════════════════════════════════════════ */
const CM_H = 3.333;
const CM_V = 4.533;
const CX = 200;
const COLLAR_Y = 90;
const BACK_NECK_Y = 80;

const PRINT_ZONE_MAP = {
  'Left Chest Logo': {
    label: 'Left Chest Logo', realSize: '9 × 9 cm', view: 'front',
    bestFor: 'Brand logos, Minimal designs',
    rect: { x: Math.round(CX - 8 * CM_H), y: Math.round(COLLAR_Y + 10 * CM_V - (9 * CM_V) / 2), w: Math.round(9 * CM_H), h: Math.round(9 * CM_V) },
  },
  'Chest Design (15×7 cm)': {
    label: 'Chest Design', realSize: '15 × 7 cm', view: 'front',
    bestFor: 'Brand name, Typography, Streetwear',
    rect: { x: Math.round(CX - (15 * CM_H) / 2), y: Math.round(COLLAR_Y + 9 * CM_V - (7 * CM_V) / 2), w: Math.round(15 * CM_H), h: Math.round(7 * CM_V) },
  },
  'Center Chest Design': {
    label: 'Center Chest', realSize: '22 × 22 cm', view: 'front',
    bestFor: 'Anime logos, Medium graphics, Quotes',
    rect: { x: Math.round(CX - (22 * CM_H) / 2), y: Math.round(COLLAR_Y + 7 * CM_V), w: Math.round(22 * CM_H), h: Math.round(22 * CM_V) },
  },
  'Front Graphic (A4)': {
    label: 'Front A4', realSize: '21 × 29.7 cm', view: 'front',
    bestFor: 'Anime graphics, Custom artwork, Photo prints',
    rect: { x: Math.round(CX - (21 * CM_H) / 2), y: Math.round(COLLAR_Y + 7 * CM_V), w: Math.round(21 * CM_H), h: Math.round(29.7 * CM_V) },
  },
  'Large Front Graphic (A3)': {
    label: 'Front A3', realSize: '29.7 × 42 cm', view: 'front',
    bestFor: 'Streetwear, Oversized prints, Premium',
    rect: { x: Math.round(CX - (29.7 * CM_H) / 2), y: Math.round(COLLAR_Y + 6 * CM_V), w: Math.round(29.7 * CM_H), h: Math.round(42 * CM_V) },
  },
  'Small Upper Back Logo': {
    label: 'Upper Back Logo', realSize: '12 × 10 cm', view: 'back',
    bestFor: 'Brand logos, Minimal back branding',
    rect: { x: Math.round(CX - (12 * CM_H) / 2), y: Math.round(BACK_NECK_Y + 10 * CM_V - (10 * CM_V) / 2), w: Math.round(12 * CM_H), h: Math.round(10 * CM_V) },
  },
  'Medium Back Graphic (A4)': {
    label: 'Back A4', realSize: '21 × 29.7 cm', view: 'back',
    bestFor: 'Medium back graphics, Artwork',
    rect: { x: Math.round(CX - (21 * CM_H) / 2), y: Math.round(BACK_NECK_Y + 10 * CM_V), w: Math.round(21 * CM_H), h: Math.round(29.7 * CM_V) },
  },
  'Large Back Graphic (A3)': {
    label: 'Back A3', realSize: '29.7 × 42 cm', view: 'back',
    bestFor: 'Streetwear, Anime, Large typography',
    rect: { x: Math.round(CX - (29.7 * CM_H) / 2), y: Math.round(BACK_NECK_Y + 7 * CM_V), w: Math.round(29.7 * CM_H), h: Math.round(42 * CM_V) },
  },
  'Small Sleeve Logo': {
    label: 'Sleeve Logo', realSize: '5 × 5 cm', view: 'front',
    bestFor: 'Small brand marks',
    rect: { x: 55, y: 128, w: Math.round(5 * CM_H), h: Math.round(5 * CM_V) },
  },
  'Sleeve Typography': {
    label: 'Sleeve Text', realSize: '10 × 4 cm', view: 'front',
    bestFor: 'Text, Dates, URLs',
    rect: { x: 45, y: 135, w: Math.round(10 * CM_H), h: Math.round(4 * CM_V) },
  },
  'Neck Print (Inside)': {
    label: 'Neck (Inside)', realSize: '6 × 4 cm', view: 'front',
    bestFor: 'Size label, Brand logo',
    rect: { x: Math.round(CX - (6 * CM_H) / 2), y: 78, w: Math.round(6 * CM_H), h: Math.round(4 * CM_V) },
  },
  'Outside Neck Print': {
    label: 'Neck (Outside)', realSize: '8 × 4 cm', view: 'back',
    bestFor: 'Brand tag, External label',
    rect: { x: Math.round(CX - (8 * CM_H) / 2), y: 82, w: Math.round(8 * CM_H), h: Math.round(4 * CM_V) },
  },
  'Bottom Hem Print': {
    label: 'Bottom Hem', realSize: '10 × 5 cm', view: 'front',
    bestFor: 'Small graphics, Brand signature',
    rect: { x: Math.round(CX - (10 * CM_H) / 2), y: 400, w: Math.round(10 * CM_H), h: Math.round(5 * CM_V) },
  },
  'Pocket Area Print': {
    label: 'Pocket Area', realSize: '8 × 8 cm', view: 'front',
    bestFor: 'Pocket logo, Small graphic',
    rect: { x: Math.round(CX - 8 * CM_H), y: Math.round(COLLAR_Y + 14 * CM_V - (8 * CM_V) / 2), w: Math.round(8 * CM_H), h: Math.round(8 * CM_V) },
  },
};

const TSHIRT_FRONT_PATH = 'M 80 80 L 30 120 L 60 200 L 100 170 L 100 430 L 300 430 L 300 170 L 340 200 L 370 120 L 320 80 L 280 60 Q 260 90 200 90 Q 140 90 120 60 Z';
const TSHIRT_BACK_PATH = 'M 80 80 L 30 120 L 60 200 L 100 170 L 100 430 L 300 430 L 300 170 L 340 200 L 370 120 L 320 80 L 280 68 Q 250 80 200 82 Q 150 80 120 68 Z';

/* ═══════════════════════════════════════════════════════════════
 *  COMPONENT
 * ═══════════════════════════════════════════════════════════════ */
export default function CustomOrder() {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // ── State ──
  const [selectedPrints, setSelectedPrints] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [activeZone, setActiveZone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [designScales, setDesignScales] = useState({});
  const [currentView, setCurrentView] = useState('front');
  const [quantity, setQuantity] = useState(1);

  // ── Derived ──
  const activeZones = useMemo(() =>
    selectedPrints
      .map(p => ({ ...p, zone: PRINT_ZONE_MAP[p.name] }))
      .filter(p => p.zone),
    [selectedPrints]
  );

  const frontZones = activeZones.filter(z => z.zone.view === 'front');
  const backZones = activeZones.filter(z => z.zone.view === 'back');
  const hasBackZones = backZones.length > 0;
  const hasFrontZones = frontZones.length > 0;
  const currentZones = currentView === 'front' ? frontZones : backZones;

  // ── Pricing ──
  const pricing = useMemo(() => {
    const q = Math.max(1, parseInt(quantity) || 1);
    const printCost = selectedPrints.reduce((acc, p) => acc + p.cost, 0);
    const perPiece = BASE_TSHIRT_PRICE + printCost;
    return {
      base: BASE_TSHIRT_PRICE,
      printCost,
      perPiece,
      total: perPiece * q,
      q,
    };
  }, [selectedPrints, quantity]);

  const totalUploaded = Object.keys(uploadedFiles).length;
  const totalRequired = activeZones.length;
  const isReady = totalRequired > 0 && totalUploaded >= totalRequired;

  // ── Handlers ──
  const togglePrint = (style) => {
    setSelectedPrints(prev => {
      const exists = prev.find(p => p.name === style.name);
      if (exists) {
        // Also remove its uploaded file
        setUploadedFiles(f => { const u = { ...f }; delete u[style.name]; return u; });
        setDesignScales(s => { const u = { ...s }; delete u[style.name]; return u; });
        if (activeZone === style.name) setActiveZone(null);
        return prev.filter(p => p.name !== style.name);
      }
      const zone = PRINT_ZONE_MAP[style.name];
      if (zone) {
        setActiveZone(style.name);
        setCurrentView(zone.view);
      }
      return [...prev, style];
    });
  };

  const applyCombo = (combo) => {
    const prints = combo.prints.map(n => PRINT_STYLES.find(s => s.name === n)).filter(Boolean);
    setSelectedPrints(prints);
    // Reset uploads for removed styles
    setUploadedFiles(prev => {
      const kept = {};
      prints.forEach(p => { if (prev[p.name]) kept[p.name] = prev[p.name]; });
      return kept;
    });
    if (prints.length > 0) {
      setActiveZone(prints[0].name);
      const zone = PRINT_ZONE_MAP[prints[0].name];
      if (zone) setCurrentView(zone.view);
    }
  };

  const selectZone = (name) => {
    setActiveZone(name);
    const zone = PRINT_ZONE_MAP[name];
    if (zone) setCurrentView(zone.view);
  };

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 25 * 1024 * 1024) { alert('File size must be under 25MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (activeZone) {
        setUploadedFiles(prev => ({
          ...prev,
          [activeZone]: { name: file.name, size: file.size, type: file.type, preview: e.target.result },
        }));
        setDesignScales(prev => ({ ...prev, [activeZone]: 1 }));
      }
    };
    reader.readAsDataURL(file);
  }, [activeZone]);

  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }, [processFile]);
  const handleFileSelect = useCallback((e) => { processFile(e.target.files[0]); e.target.value = ''; }, [processFile]);

  const removeFile = (zoneName) => {
    setUploadedFiles(prev => { const u = { ...prev }; delete u[zoneName]; return u; });
    setDesignScales(prev => { const u = { ...prev }; delete u[zoneName]; return u; });
  };

  const adjustScale = (zoneName, delta) => {
    setDesignScales(prev => ({
      ...prev,
      [zoneName]: Math.max(0.3, Math.min(2.5, (prev[zoneName] || 1) + delta)),
    }));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  /* ═══════════════════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen pt-24 pb-20 bg-primary">

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-heading font-bold text-secondary uppercase tracking-tighter mb-6"
        >
          Custom <span className="text-accent italic">Print</span>
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-body text-lg mb-4">
          Design your own premium 220 GSM oversized tee. Select print placements, upload your artwork, and see it come to life.
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-sm">
            <FiPackage className="text-accent" />
            <span className="text-accent font-heading font-bold text-lg">₹{BASE_TSHIRT_PRICE}</span>
            <span className="text-accent/60 text-sm font-body">base t-shirt</span>
          </div>
          <span className="text-gray-600 text-sm font-body">+ print costs</span>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ══════════ LEFT: Style Selector + Upload (3 cols) ══════════ */}
          <div className="lg:col-span-3 space-y-8">

            {/* ── Step 1: Select Print Styles ── */}
            <div className="bg-neutral-900 border border-white/10 rounded-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-heading font-bold">1</span>
                <h2 className="text-xl font-heading font-bold text-secondary uppercase tracking-wider">
                  Select Print Styles
                </h2>
              </div>

              {/* Quick Combos */}
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
              <div className="space-y-5">
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
                                className="accent-accent w-4 h-4 mr-3 shrink-0"
                                checked={isSelected}
                                onChange={() => togglePrint(style)}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-gray-300 font-body text-sm truncate">{style.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs font-body">{style.size}</span>
                                  <span className="text-accent text-xs font-body font-semibold">+₹{style.cost}</span>
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

            {/* ── Step 2: Upload Designs ── */}
            <div className={`bg-neutral-900 border rounded-lg p-6 md:p-8 transition-all ${
              selectedPrints.length > 0 ? 'border-white/10 opacity-100' : 'border-white/5 opacity-40 pointer-events-none'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-bold ${
                  selectedPrints.length > 0 ? 'bg-accent/15 text-accent' : 'bg-white/5 text-gray-600'
                }`}>2</span>
                <h2 className="text-xl font-heading font-bold text-secondary uppercase tracking-wider">
                  Upload Your Designs
                </h2>
                {totalRequired > 0 && (
                  <span className={`ml-auto text-xs font-body ${
                    totalUploaded === totalRequired ? 'text-accent' : 'text-gray-500'
                  }`}>
                    {totalUploaded}/{totalRequired} uploaded
                  </span>
                )}
              </div>

              {/* Zone Tabs */}
              {activeZones.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {activeZones.map(({ name, zone }) => (
                    <button
                      key={name}
                      onClick={() => selectZone(name)}
                      className={`px-3 py-2 text-xs font-body border rounded-sm transition-all flex items-center gap-1.5 ${
                        activeZone === name
                          ? 'border-accent bg-accent/10 text-accent'
                          : uploadedFiles[name]
                            ? 'border-accent/30 text-accent/70 bg-accent/5'
                            : 'border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {uploadedFiles[name] && <FiCheckCircle className="w-3 h-3" />}
                      <span className="opacity-40 uppercase" style={{ fontSize: '9px' }}>
                        {zone.view === 'back' ? 'B' : name.includes('Sleeve') ? 'S' : 'F'}
                      </span>
                      {zone.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Zone Info */}
              {activeZone && PRINT_ZONE_MAP[activeZone] && (
                <div className="mb-4 px-4 py-3 bg-primary/50 border border-white/5 rounded-sm">
                  <p className="text-secondary text-sm font-heading font-semibold">
                    {PRINT_ZONE_MAP[activeZone].label}
                    <span className="text-gray-500 font-body font-normal ml-2 text-xs">
                      {PRINT_ZONE_MAP[activeZone].realSize}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs font-body mt-0.5">{PRINT_ZONE_MAP[activeZone].bestFor}</p>
                </div>
              )}

              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => activeZone && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-sm p-10 text-center transition-all duration-300 group ${
                  !activeZone
                    ? 'border-white/5 bg-white/[0.01] cursor-not-allowed'
                    : isDragging
                      ? 'border-accent bg-accent/5 scale-[1.01] cursor-copy'
                      : 'border-white/15 hover:border-accent/50 bg-primary/30 hover:bg-primary/50 cursor-pointer'
                }`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <motion.div
                  animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors ${
                    isDragging ? 'bg-accent/20' : 'bg-white/5 group-hover:bg-accent/10'
                  }`}>
                    <FiUploadCloud className={`w-6 h-6 transition-colors ${
                      !activeZone ? 'text-gray-600' : isDragging ? 'text-accent' : 'text-gray-400 group-hover:text-accent'
                    }`} />
                  </div>
                  <h3 className="text-secondary font-heading font-semibold text-base mb-1">
                    {!activeZone ? 'Select a print zone first' : isDragging ? 'Drop here' : 'Drag & drop your design'}
                  </h3>
                  <p className="text-gray-500 font-body text-sm mb-3">
                    {activeZone ? 'or click to browse' : 'Choose a zone tab above to start'}
                  </p>
                  <p className="text-gray-600 font-body text-xs">PNG, JPG, SVG, WEBP — Max 25MB</p>
                </motion.div>
              </div>

              {/* Uploaded Files */}
              <AnimatePresence>
                {Object.entries(uploadedFiles).length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-2">
                    {Object.entries(uploadedFiles).map(([zoneName, file]) => (
                      <motion.div
                        key={zoneName}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center gap-3 p-3 bg-primary/50 border rounded-sm transition-colors cursor-pointer ${
                          activeZone === zoneName ? 'border-accent/40' : 'border-white/10'
                        }`}
                        onClick={() => selectZone(zoneName)}
                      >
                        <div className="w-10 h-10 rounded-sm overflow-hidden border border-white/10 shrink-0 bg-neutral-800">
                          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-secondary font-body text-sm truncate">{file.name}</p>
                          <p className="text-gray-500 text-xs font-body">
                            {PRINT_ZONE_MAP[zoneName]?.label} — {formatSize(file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); adjustScale(zoneName, -0.1); }} className="p-1 text-gray-400 hover:text-accent transition-colors">
                            <FiZoomOut className="w-3 h-3" />
                          </button>
                          <span className="text-gray-500 text-[10px] font-body w-7 text-center">
                            {Math.round((designScales[zoneName] || 1) * 100)}%
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); adjustScale(zoneName, 0.1); }} className="p-1 text-gray-400 hover:text-accent transition-colors">
                            <FiZoomIn className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeFile(zoneName); }} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors shrink-0">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ══════════ RIGHT: Preview + Pricing (2 cols, sticky) ══════════ */}
          <div className="lg:col-span-2 lg:sticky lg:top-28 lg:self-start space-y-5">

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-secondary font-heading font-semibold uppercase tracking-wider text-sm">
                Live Preview
              </h3>
              {(hasFrontZones || hasBackZones) && (
                <div className="flex items-center gap-1 bg-neutral-900 border border-white/10 rounded-sm p-0.5">
                  <button
                    onClick={() => setCurrentView('front')}
                    className={`px-3 py-1 text-xs font-body rounded-sm transition-all ${
                      currentView === 'front'
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'text-gray-400 hover:text-secondary border border-transparent'
                    }`}
                  >Front</button>
                  <button
                    onClick={() => setCurrentView('back')}
                    disabled={!hasBackZones}
                    className={`px-3 py-1 text-xs font-body rounded-sm transition-all ${
                      currentView === 'back'
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : hasBackZones
                          ? 'text-gray-400 hover:text-secondary border border-transparent'
                          : 'text-gray-600 cursor-not-allowed border border-transparent'
                    }`}
                  >Back</button>
                </div>
              )}
            </div>

            {/* T-Shirt Mockup */}
            <div className="bg-neutral-900 border border-white/10 rounded-sm overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none z-10" />
              <svg
                viewBox="0 0 400 480"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
                style={{ background: '#0a0a0a' }}
              >
                <defs>
                  <clipPath id="cp-shirt-clip-front"><path d={TSHIRT_FRONT_PATH} /></clipPath>
                  <clipPath id="cp-shirt-clip-back"><path d={TSHIRT_BACK_PATH} /></clipPath>
                  <pattern id="cp-fabric" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="transparent" />
                    <circle cx="1" cy="1" r="0.4" fill="rgba(255,255,255,0.012)" />
                    <circle cx="4" cy="4" r="0.3" fill="rgba(255,255,255,0.008)" />
                  </pattern>
                </defs>

                {/* Shirt body */}
                <path d={currentView === 'front' ? TSHIRT_FRONT_PATH : TSHIRT_BACK_PATH} fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
                <path d={currentView === 'front' ? TSHIRT_FRONT_PATH : TSHIRT_BACK_PATH} fill="url(#cp-fabric)" />

                {/* Design zones */}
                <g clipPath={`url(#cp-shirt-clip-${currentView})`}>
                  {currentZones.map(({ name, zone }) => {
                    const file = uploadedFiles[name];
                    const scale = designScales[name] || 1;
                    const isActive = activeZone === name;
                    const { x, y, w, h } = zone.rect;
                    const cx = x + w / 2;
                    const cy = y + h / 2;
                    const sw = w * scale;
                    const sh = h * scale;
                    const sx = cx - sw / 2;
                    const sy = cy - sh / 2;

                    return (
                      <g key={name} onClick={() => selectZone(name)} style={{ cursor: 'pointer' }}>
                        <defs>
                          <clipPath id={`clip-${name.replace(/\s+/g, '-')}`}>
                            <rect x={x} y={y} width={w} height={h} rx="2" />
                          </clipPath>
                        </defs>
                        {file ? (
                          <image href={file.preview} x={sx} y={sy} width={sw} height={sh} preserveAspectRatio="xMidYMid meet" opacity="0.95" clipPath={`url(#clip-${name.replace(/\s+/g, '-')})`} />
                        ) : (
                          <>
                            <rect x={x} y={y} width={w} height={h}
                              fill={isActive ? 'rgba(163,255,18,0.06)' : 'rgba(255,255,255,0.015)'}
                              stroke={isActive ? '#A3FF12' : 'rgba(255,255,255,0.12)'}
                              strokeWidth={isActive ? 1.5 : 0.8}
                              strokeDasharray={isActive ? '6 3' : '4 3'}
                              rx="2"
                            />
                            <text x={x + w / 2} y={y + h / 2 - 5} textAnchor="middle" dominantBaseline="middle"
                              fill={isActive ? '#A3FF12' : 'rgba(255,255,255,0.25)'}
                              fontSize={w > 60 ? 9 : 7} fontFamily="Inter, sans-serif"
                            >{zone.label}</text>
                            <text x={x + w / 2} y={y + h / 2 + 7} textAnchor="middle" dominantBaseline="middle"
                              fill={isActive ? 'rgba(163,255,18,0.5)' : 'rgba(255,255,255,0.12)'}
                              fontSize={w > 60 ? 7 : 5.5} fontFamily="Inter, sans-serif"
                            >{zone.realSize}</text>
                          </>
                        )}
                        {isActive && (
                          <rect
                            x={(file ? sx : x) - 2} y={(file ? sy : y) - 2}
                            width={(file ? sw : w) + 4} height={(file ? sh : h) + 4}
                            fill="none" stroke="#A3FF12" strokeWidth="1.5" rx="3" opacity="0.8"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Seams & collar */}
                {currentView === 'front' ? (
                  <>
                    <path d="M 130 62 Q 150 80 200 82 Q 250 80 270 62" fill="none" stroke="#333" strokeWidth="2" />
                    <path d="M 120 60 Q 140 95 200 95 Q 260 95 280 60" fill="none" stroke="#2a2a2a" strokeWidth="1" />
                  </>
                ) : (
                  <>
                    <path d="M 120 68 Q 150 80 200 82 Q 250 80 280 68" fill="none" stroke="#282828" strokeWidth="1.5" />
                    <rect x="190" y="70" width="20" height="8" fill="#222" stroke="#2a2a2a" strokeWidth="0.5" rx="1" />
                  </>
                )}
                <line x1="100" y1="170" x2="100" y2="430" stroke="#222" strokeWidth="0.5" opacity="0.6" />
                <line x1="300" y1="170" x2="300" y2="430" stroke="#222" strokeWidth="0.5" opacity="0.6" />
                <line x1="100" y1="170" x2="80" y2="80" stroke="#252525" strokeWidth="0.5" opacity="0.5" />
                <line x1="300" y1="170" x2="320" y2="80" stroke="#252525" strokeWidth="0.5" opacity="0.5" />

                {/* Empty state */}
                {currentZones.length === 0 && (
                  <text x="200" y="260" textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.1)" fontSize="12" fontFamily="Inter, sans-serif"
                  >{selectedPrints.length === 0 ? 'Select print styles to begin' : `No ${currentView} prints selected`}</text>
                )}

                <text x="200" y="465" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10"
                  fontFamily="Space Grotesk, sans-serif" letterSpacing="3"
                >{currentView === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}</text>
              </svg>
            </div>

            {/* ── Pricing Breakdown ── */}
            <div className="bg-neutral-900 border border-white/10 rounded-sm p-5">
              <h4 className="text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                <FiShoppingCart className="text-accent/60 w-4 h-4" />
                Price Breakdown
              </h4>

              <div className="space-y-3 font-body text-sm">
                {/* Base */}
                <div className="flex justify-between text-gray-400">
                  <span>220 GSM Oversized Tee</span>
                  <span className="text-secondary font-semibold">₹{BASE_TSHIRT_PRICE}</span>
                </div>

                {/* Print Costs */}
                {selectedPrints.length > 0 ? (
                  selectedPrints.map(p => (
                    <div key={p.name} className="flex justify-between text-gray-400">
                      <span className="truncate mr-4">{p.name}</span>
                      <span className="text-accent shrink-0">+₹{p.cost}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-gray-500 italic">
                    <span>No prints selected</span>
                    <span>+₹0</span>
                  </div>
                )}

                <div className="h-px bg-white/10 my-2" />

                {/* Per Piece */}
                <div className="flex justify-between text-secondary font-semibold text-base">
                  <span>Price Per Piece</span>
                  <span>₹{pricing.perPiece}</span>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-7 h-7 flex items-center justify-center border border-white/10 text-gray-400 hover:border-accent hover:text-accent rounded-sm transition-colors text-sm"
                    >−</button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 bg-transparent border border-white/10 text-secondary text-center py-1 rounded-sm focus:outline-none focus:border-accent font-body text-sm"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-7 h-7 flex items-center justify-center border border-white/10 text-gray-400 hover:border-accent hover:text-accent rounded-sm transition-colors text-sm"
                    >+</button>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-2" />

                {/* Total */}
                <div className="flex justify-between items-center text-accent font-heading font-bold text-2xl">
                  <span>Total</span>
                  <span>₹{pricing.total.toLocaleString()}</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                variant="accent"
                size="lg"
                className="w-full mt-5"
                disabled={!isReady}
              >
                {selectedPrints.length === 0
                  ? 'Select Print Styles'
                  : totalUploaded < totalRequired
                    ? `Upload ${totalRequired - totalUploaded} Design${totalRequired - totalUploaded > 1 ? 's' : ''}`
                    : 'Place Order'
                }
              </Button>

              {selectedPrints.length > 0 && totalUploaded < totalRequired && (
                <p className="text-gray-500 text-xs text-center mt-2 font-body">
                  Upload designs for all zones to place your order
                </p>
              )}
            </div>

            {/* Included */}
            <div className="bg-primary/50 p-4 rounded-sm border border-white/5">
              <h4 className="text-secondary font-semibold uppercase tracking-wider mb-3 text-xs">Included:</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs font-body">
                <li className="flex items-center gap-2"><FiCheckCircle className="text-accent w-3 h-3" /> Premium 220 GSM Bio-Washed Fabric</li>
                <li className="flex items-center gap-2"><FiCheckCircle className="text-accent w-3 h-3" /> High-Quality DTF Printing</li>
                <li className="flex items-center gap-2"><FiCheckCircle className="text-accent w-3 h-3" /> Polybag Packaging</li>
                <li className="flex items-center gap-2"><FiCheckCircle className="text-accent w-3 h-3" /> Free Shipping on 2+ items</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
