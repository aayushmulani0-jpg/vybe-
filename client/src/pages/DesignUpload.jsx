import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiTrash2, FiCheck, FiArrowLeft, FiShoppingBag, FiImage } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/useCartStore';
import { API_URL } from '../config';

// Mock T-Shirt Image URL (Plain Black)
const TSHIRT_MOCKUP = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"; // Black oversized blank

const PRINT_ZONES = {
  'Left Chest Logo': { top: '30%', left: '60%', width: '10%', height: '10%' },
  '15 × 7 cm Chest Design': { top: '32%', left: '50%', transform: 'translateX(-50%)', width: '20%', height: '10%' },
  'A4 Print': { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' },
  'A3 Print': { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '45%', height: '55%' },
  'Sleeve Print': { top: '45%', left: '25%', width: '15%', height: '20%' },
  'Front + Back Print': { top: '40%', left: '50%', transform: 'translateX(-50%)', width: '35%', height: '40%' },
};

export default function DesignUpload() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Wholesale State
  const { selectedPrints = [], pricingDetails = {}, selectedCategory = {} } = location.state || {};

  const [uploadedImages, setUploadedImages] = useState({});
  const [uploadedRawFiles, setUploadedRawFiles] = useState({});
  const [activeZone, setActiveZone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    if (selectedPrints.length > 0 && !activeZone) {
      setActiveZone(selectedPrints[0].name);
    } else if (selectedPrints.length === 0) {
      setActiveZone(null);
    }
  }, [selectedPrints]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (file && activeZone) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => ({ ...prev, [activeZone]: reader.result }));
        setUploadedRawFiles(prev => ({ ...prev, [activeZone]: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = (zone) => {
    setUploadedImages(prev => {
      const updated = { ...prev };
      delete updated[zone];
      return updated;
    });
    setUploadedRawFiles(prev => {
      const updated = { ...prev };
      delete updated[zone];
      return updated;
    });
  };

  const handleSubmitOrder = async () => {
    if (Object.keys(uploadedImages).length === 0) {
      alert('Please upload a design for at least one print area before adding to cart.');
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
        id: selectedCategory.productId?._id || selectedCategory.productId || 'custom-' + Date.now(),
        name: `Wholesale - ${selectedCategory.productId?.name || selectedCategory.name || 'Blank Item'}`,
        price: pricingDetails.pricePerPiece,
        quantity: pricingDetails.q,
        selectedPrints,
        uploadedImages: finalImages,
        orderType: 'Wholesale'
      });
      
      alert('Added wholesale designs to cart!');
      navigate('/checkout');
    } catch (err) {
      console.error(err);
      alert('Error uploading designs: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback: no prints selected
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
        
        <div className="mb-12">
          <button
            onClick={() => navigate('/wholesale')}
            className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors font-body text-sm mb-4 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Wholesale
          </button>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-secondary uppercase tracking-tighter mb-4">
            Upload <span className="text-accent italic">Design</span>
          </h1>
          <p className="text-gray-400 font-body">Visualize your custom print on our premium blanks for your wholesale order.</p>
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
            
            <div className="mb-8 bg-neutral-900/50 p-6 rounded-lg border border-white/5">
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
                <p className="text-gray-500 font-body">Please select a print area above to upload a design.</p>
              </div>
            )}

            {/* Summary & Next Steps */}
            <div className="bg-neutral-900 p-6 rounded-lg border border-white/5">
              
              <h3 className="text-secondary font-heading uppercase tracking-wider mb-4 border-b border-white/10 pb-4">
                Wholesale Order Summary
              </h3>

              <div className="space-y-3 font-body text-sm text-gray-300 mb-6">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="text-secondary">{selectedCategory.productId?.name || selectedCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bulk Quantity:</span>
                  <span className="text-secondary">{pricingDetails.q} pieces</span>
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
                  <span>Total Estimated:</span>
                  <span>{pricingDetails.isValid ? `₹${pricingDetails.totalAmount.toLocaleString()}` : '---'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="accent"
                  className="w-full flex justify-center items-center gap-2"
                  onClick={handleSubmitOrder}
                  disabled={isUploading}
                >
                  <FiShoppingBag /> {isUploading ? 'Uploading & Adding to Cart...' : 'Add Wholesale Order to Cart'}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
