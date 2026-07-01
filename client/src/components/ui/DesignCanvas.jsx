import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * DesignCanvas — Interactive T-shirt mockup with draggable/resizable design overlays.
 *
 * Props:
 *   mockupImage       - URL of the blank T-shirt image
 *   printZones        - Array of active print zone objects with { name, boundingBox: {top, left, width, height} }
 *   uploadedImages    - { [zoneName]: imageUrl }
 *   designTransforms  - { [zoneName]: { x, y, scale } }
 *   onTransformChange - (zoneName, transform) => void
 *   activeZone        - currently selected zone name
 *   onZoneClick       - (zoneName) => void
 *   selectedColorHex  - hex color for tinting (optional)
 */
export default function DesignCanvas({
  mockupImage,
  printZones = [],
  uploadedImages = {},
  designTransforms = {},
  onTransformChange,
  activeZone,
  onZoneClick,
  selectedColorHex,
}) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { zone, startX, startY, origX, origY }
  const [resizing, setResizing] = useState(null); // { zone, startX, startY, origScale }

  const getTransform = (zone) => designTransforms[zone] || { x: 50, y: 50, scale: 1 };

  // ── Drag handlers ──
  const handleMouseDown = useCallback((e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    const t = getTransform(zone);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging({ zone, startX: clientX, startY: clientY, origX: t.x, origY: t.y });
  }, [designTransforms]);

  const handleResizeDown = useCallback((e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    const t = getTransform(zone);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setResizing({ zone, startX: clientX, startY: clientY, origScale: t.scale });
  }, [designTransforms]);

  useEffect(() => {
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (dragging) {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const dx = ((clientX - dragging.startX) / rect.width) * 100;
        const dy = ((clientY - dragging.startY) / rect.height) * 100;
        const newX = Math.max(0, Math.min(100, dragging.origX + dx));
        const newY = Math.max(0, Math.min(100, dragging.origY + dy));
        const t = getTransform(dragging.zone);
        onTransformChange?.(dragging.zone, { ...t, x: newX, y: newY });
      }

      if (resizing) {
        const dy = clientY - resizing.startY;
        const dx = clientX - resizing.startX;
        const delta = Math.sqrt(dx * dx + dy * dy) * (dy > 0 ? 1 : -1);
        const newScale = Math.max(0.3, Math.min(3, resizing.origScale + delta / 200));
        const t = getTransform(resizing.zone);
        onTransformChange?.(resizing.zone, { ...t, scale: newScale });
      }
    };

    const handleUp = () => {
      setDragging(null);
      setResizing(null);
    };

    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, resizing, onTransformChange, designTransforms]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto select-none"
      style={{ touchAction: 'none' }}
    >
      {/* T-shirt mockup */}
      <img
        src={mockupImage}
        alt="T-Shirt Mockup"
        className="w-full h-auto drop-shadow-2xl rounded-xl"
        style={selectedColorHex ? { filter: `drop-shadow(0 0 40px ${selectedColorHex}20)` } : undefined}
        draggable={false}
      />

      {/* Print Zones */}
      {printZones.map((zone) => {
        const bounds = zone.boundingBox || { top: 30, left: 40, width: 20, height: 20 };
        const hasImage = !!uploadedImages[zone.name];
        const isActive = activeZone === zone.name;
        const transform = getTransform(zone.name);

        return (
          <div
            key={zone.name}
            style={{
              position: 'absolute',
              top: `${bounds.top}%`,
              left: `${bounds.left}%`,
              width: `${bounds.width}%`,
              height: `${bounds.height}%`,
            }}
            className={`border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer ${
              isActive
                ? 'border-accent/70 bg-accent/5 z-20 shadow-[0_0_20px_rgba(163,255,18,0.15)]'
                : 'border-white/15 hover:border-white/40 z-10'
            }`}
            onClick={() => onZoneClick?.(zone.name)}
          >
            {hasImage ? (
              <div
                className="absolute"
                style={{
                  left: `${transform.x}%`,
                  top: `${transform.y}%`,
                  transform: `translate(-50%, -50%) scale(${transform.scale})`,
                  width: '80%',
                  height: '80%',
                  cursor: dragging?.zone === zone.name ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handleMouseDown(e, zone.name)}
                onTouchStart={(e) => handleMouseDown(e, zone.name)}
              >
                <img
                  src={uploadedImages[zone.name]}
                  alt="Design"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
                {/* Resize handle — bottom-right corner */}
                {isActive && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full border-2 border-primary cursor-se-resize shadow-[0_0_8px_rgba(163,255,18,0.5)] hover:scale-125 transition-transform"
                    onMouseDown={(e) => handleResizeDown(e, zone.name)}
                    onTouchStart={(e) => handleResizeDown(e, zone.name)}
                  />
                )}
                {/* Resize handle — top-left corner */}
                {isActive && (
                  <div
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-accent rounded-full border-2 border-primary cursor-nw-resize shadow-[0_0_8px_rgba(163,255,18,0.5)] hover:scale-125 transition-transform"
                    onMouseDown={(e) => handleResizeDown(e, zone.name)}
                    onTouchStart={(e) => handleResizeDown(e, zone.name)}
                  />
                )}
              </div>
            ) : (
              <span
                className={`text-[10px] uppercase font-bold text-center p-1 pointer-events-none ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              >
                {zone.name}
              </span>
            )}
          </div>
        );
      })}

      {/* Active zone indicator */}
      {activeZone && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary/80 backdrop-blur-md border border-accent/30 px-4 py-1.5 rounded-full z-30">
          <span className="text-accent text-xs font-bold uppercase tracking-wider">
            {uploadedImages[activeZone] ? '✦ Drag to reposition' : `✦ ${activeZone}`}
          </span>
        </div>
      )}
    </div>
  );
}
