import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { MAP_REGISTRY } from '../data/animals';

interface ChildFriendlyGeoMapProps {
  animalKey: string;
  animalName: string;
  animalEmoji: string;
  onClose: () => void;
  className?: string;
}

export const ChildFriendlyGeoMap: React.FC<ChildFriendlyGeoMapProps> = ({
  animalKey,
  animalName,
  animalEmoji,
  onClose,
  className = '',
}) => {
  const mapData = MAP_REGISTRY[animalKey] || MAP_REGISTRY.singa;
  const isAfrica = animalKey === 'singa' || animalKey === 'gajah' || animalKey === 'jerapah';
  
  // Default selected pin to the first point
  const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(0);
  const selectedPin = selectedPinIndex !== null && mapData.points[selectedPinIndex] ? mapData.points[selectedPinIndex] : null;

  return (
    <div className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0c2e35] select-none ${className}`}>
      {/* Ocean Backdrop with Nautical Grid & Ripple Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Water Ripples and Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#092329] via-[#0d363f] to-[#071c21]" />
        
        {/* Cartographic Latitude / Longitude lines */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(147, 230, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 230, 246, 0.4) 1px, transparent 1px)', 
            backgroundSize: '36px 36px' 
          }} 
        />

        {/* Ocean Wave Waves */}
        <div className="absolute top-12 left-4 text-cyan-500/20 text-xs font-mono tracking-widest pointer-events-none">
          〰️ 〰️ 〰️
        </div>
        <div className="absolute bottom-16 right-8 text-cyan-500/20 text-xs font-mono tracking-widest pointer-events-none">
          〰️ 〰️ 〰️
        </div>

        {/* Ocean Name Labels */}
        <div className="absolute top-14 left-2 text-[9px] font-black uppercase tracking-widest text-cyan-300/40 rotate-[-90deg] origin-top-left pointer-events-none">
          Samudra Atlantik
        </div>
        <div className="absolute bottom-28 right-2 text-[9px] font-black uppercase tracking-widest text-amber-200/40 rotate-90 origin-bottom-right pointer-events-none">
          Samudra Hindia
        </div>
        {isAfrica && (
          <div className="absolute top-2 left-1/3 text-[8px] font-black uppercase tracking-widest text-sky-200/40 pointer-events-none">
            Laut Mediterania
          </div>
        )}
      </div>

      {/* Top Floating Control Bar */}
      <div className="relative z-20 flex items-center justify-between p-2.5 sm:p-3 bg-black/45 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm sm:text-base shadow-md">
            🧭
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-300">
              Peta Habitat {animalName}
            </span>
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight flex items-center gap-1.5">
              <span>{mapData.regionName}</span>
              <span className="text-xs">{animalEmoji}</span>
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-black text-[10px] sm:text-xs transition-all border border-white/20 active:scale-95 cursor-pointer shadow-sm"
          title="Kembali ke Foto Habitat"
        >
          <X className="w-3.5 h-3.5" />
          <span>Foto</span>
        </button>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center p-2 sm:p-3">
        {/* Child-Friendly Cartographic Compass Rose */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-10 h-10 sm:w-12 sm:h-12 pointer-events-none opacity-80 z-20 drop-shadow-md">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <circle cx="50" cy="50" r="44" stroke="#fcd34d" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="50,10 57,47 50,43 43,47" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
            <polygon points="50,90 57,53 50,57 43,53" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <polygon points="10,50 47,43 43,50 47,57" fill="#fcd34d" stroke="#d97706" strokeWidth="1" />
            <polygon points="90,50 53,43 57,50 53,57" fill="#fcd34d" stroke="#d97706" strokeWidth="1" />
            <circle cx="50" cy="50" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <text x="46" y="8" fontSize="9" fontWeight="900" fill="#f87171">U</text>
          </svg>
        </div>

        {/* Vintage Exploration Ship Detail */}
        <div className="absolute bottom-3 left-3 text-lg sm:text-xl opacity-70 pointer-events-none animate-pulse">
          ⛵
        </div>

        {/* Map SVG Canvas */}
        <div className="w-full h-full max-w-[420px] max-h-[380px] relative flex items-center justify-center">
          <svg viewBox="0 0 520 540" className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
            <defs>
              {/* African Savannah Gradient */}
              <linearGradient id="savannaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#bef264" />
              </linearGradient>

              {/* General Landmass Gradient */}
              <linearGradient id="landmassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="50%" stopColor="#fdba74" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Sub-Sahara Savanna Belt Highlight */}
              <linearGradient id="savannaBeltGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#84cc16" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {isAfrica ? (
              /* ======================================================== */
              /* ACCURATE & CHILD-FRIENDLY GEOGRAPHIC MAP OF AFRICA       */
              /* ======================================================== */
              <g id="africaMap">
                {/* Defs for Africa specific patterns and gradients */}
                <defs>
                  {/* Subtle desert stippling pattern */}
                  <pattern id="saharaStipple" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="0.7" fill="#d97706" opacity="0.3" />
                    <circle cx="9" cy="9" r="0.7" fill="#d97706" opacity="0.3" />
                  </pattern>
                </defs>

                {/* 1. Mainland Africa Continent Base Silhouette */}
                {/* Geographically authentic curvature: North Africa, Sinai, Red Sea, Horn of Africa, East Coast, Cape, West Coast, Gulf of Guinea, Bulge */}
                <path 
                  d="M 148 52 C 170 42, 215 36, 260 40 C 295 44, 325 58, 355 64 C 370 66, 386 70, 396 82 C 392 94, 408 126, 426 156 C 444 178, 468 190, 486 200 C 476 218, 442 242, 420 256 C 400 270, 390 292, 380 326 C 372 360, 362 396, 342 440 C 322 474, 298 506, 270 514 C 252 516, 238 500, 226 478 C 206 438, 196 388, 200 338 C 196 308, 186 288, 166 276 C 146 262, 116 252, 96 242 C 76 226, 64 196, 70 162 C 78 128, 110 98, 142 68 Z" 
                  fill="url(#landmassGradient)" 
                  stroke="#78350f" 
                  strokeWidth="3.5" 
                  strokeLinejoin="round" 
                />

                {/* 2. Distinct Geographic Regions & Biome Fills with clear territory borders */}
                {/* 2a. Sahara & North Africa Zone */}
                <path
                  d="M 148 52 C 170 42, 215 36, 260 40 C 295 44, 325 58, 355 64 C 370 66, 386 70, 396 82 C 388 95, 390 120, 392 138 C 300 144, 180 148, 74 150 C 78 128, 110 98, 142 68 Z"
                  fill="#fef08a"
                  opacity="0.45"
                />
                <path
                  d="M 148 52 C 170 42, 215 36, 260 40 C 295 44, 325 58, 355 64 C 370 66, 386 70, 396 82 C 388 95, 390 120, 392 138 C 300 144, 180 148, 74 150 C 78 128, 110 98, 142 68 Z"
                  fill="url(#saharaStipple)"
                />

                {/* 2b. Central Africa / Congo Basin Rainforest Zone (Lush Green) */}
                <path
                  d="M 198 250 C 240 230, 285 220, 295 240 C 305 280, 305 320, 295 348 C 245 345, 205 330, 196 280 Z"
                  fill="#86efac"
                  opacity="0.5"
                />

                {/* 2c. East & Southern African Savanna Habitat Corridor (Habitat Utama Singa) */}
                <path 
                  d="M 190 178 C 255 180, 330 190, 400 195 C 418 235, 388 280, 372 320 C 356 350, 346 390, 326 435 C 306 452, 276 446, 254 420 C 244 390, 248 350, 280 320 C 302 290, 304 250, 270 230 C 235 220, 208 200, 190 178 Z" 
                  fill="url(#savannaBeltGlow)" 
                  stroke="#4d7c0f" 
                  strokeWidth="2.5" 
                  strokeDasharray="5,2.5" 
                  opacity="0.92" 
                />

                {/* 2d. Madagascar Island (Pulau Madagaskar) */}
                <path 
                  d="M 415 350 C 428 340, 440 355, 448 380 C 455 410, 445 445, 430 460 C 420 465, 412 450, 408 425 C 404 400, 405 365, 415 350 Z" 
                  fill="#fcd34d" 
                  stroke="#78350f" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />

                {/* 3. Major Geographic Rivers & Lakes (Fitur Geografis Alami) */}
                {/* Sungai Nil (Nile River) flowing to Mediterranean */}
                <path d="M 360 215 C 362 175, 355 140, 362 105 C 366 85, 370 70, 372 65" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
                {/* Danau Victoria (Lake Victoria) */}
                <ellipse cx="355" cy="245" rx="10" ry="12" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
                {/* Danau Tanganyika */}
                <path d="M 338 275 C 336 295, 335 315, 332 335" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Sungai Zambezi */}
                <path d="M 270 380 C 300 375, 330 385, 360 380" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />

                {/* 4. CLEAR COUNTRY & REGIONAL BOUNDARY LINES (GARIS BATAS WILAYAH YANG JELAS) */}
                {/* Garis Batas Sahara / Afrika Utara (Maroko, Aljazair, Libya, Mesir) */}
                <path d="M 72 150 C 150 144, 260 140, 392 138" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                {/* Garis Batas Mesir / Sudan */}
                <path d="M 310 139 L 310 98" stroke="#78350f" strokeWidth="1.6" strokeDasharray="4,2" fill="none" />
                <path d="M 235 142 L 235 88" stroke="#78350f" strokeWidth="1.6" strokeDasharray="4,2" fill="none" />
                {/* Garis Batas Afrika Barat & Sahel (Senegal, Mali, Niger, Nigeria) */}
                <path d="M 166 276 C 176 215, 185 145, 185 145" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                <path d="M 125 245 C 130 190, 140 142, 140 142" stroke="#78350f" strokeWidth="1.6" strokeDasharray="4,2" fill="none" />
                <path d="M 125 245 C 160 238, 175 220, 185 210" stroke="#78350f" strokeWidth="1.6" strokeDasharray="4,2" fill="none" />

                {/* Garis Batas Cekungan Kongo / Afrika Tengah */}
                <path d="M 200 338 C 215 285, 240 230, 290 220" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                <path d="M 290 220 C 300 270, 305 315, 300 355" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />

                {/* Garis Batas Afrika Timur (Kenya, Tanzania, Uganda, Ethiopia) */}
                <path d="M 290 220 C 350 205, 380 170, 405 130" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                <path d="M 290 220 C 340 240, 380 255, 418 255" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                {/* Garis Batas Kenya / Tanzania (Serengeti - Masai Mara Border) */}
                <path d="M 335 252 L 400 246" stroke="#9a3412" strokeWidth="2" strokeDasharray="3,2" fill="none" />
                <path d="M 300 355 C 330 350, 360 345, 378 325" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />

                {/* Garis Batas Afrika Selatan, Botswana, Namibia, Zimbabwe */}
                <path d="M 200 338 C 250 350, 300 355, 350 365" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                <path d="M 245 350 C 248 400, 245 440, 235 480" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                <path d="M 295 355 C 300 405, 305 445, 305 480" stroke="#78350f" strokeWidth="2" strokeDasharray="5,2.5" fill="none" />
                <path d="M 245 425 C 270 425, 290 420, 305 420" stroke="#78350f" strokeWidth="1.8" strokeDasharray="4,2" fill="none" />

                {/* Garis Khatulistiwa (Equator 0°) */}
                <line x1="60" y1="240" x2="445" y2="240" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.75" />
                <text x="75" y="236" fontSize="7" fontWeight="900" fill="#f59e0b" letterSpacing="1" opacity="0.8">KHATULISTIWA (0°)</text>

                {/* 5. Clear Regional & Territorial Geographical Text Labels */}
                <text x="210" y="95" fontSize="10" fontWeight="900" fill="#78350f" letterSpacing="2" opacity="0.7">AFRIKA UTARA</text>
                <text x="215" y="115" fontSize="8" fontWeight="800" fill="#9a3412" letterSpacing="2" opacity="0.6">GURUN SAHARA</text>
                <text x="96" y="195" fontSize="8.5" fontWeight="900" fill="#78350f" letterSpacing="1.2" opacity="0.7">AFRIKA BARAT</text>
                <text x="220" y="280" fontSize="8.5" fontWeight="900" fill="#14532d" letterSpacing="1.2" opacity="0.8">LEMBAH KONGO</text>
                <text x="340" y="210" fontSize="9.5" fontWeight="900" fill="#365314" letterSpacing="1.5" opacity="0.9">AFRIKA TIMUR</text>
                <text x="250" y="475" fontSize="8.5" fontWeight="900" fill="#78350f" letterSpacing="1.2" opacity="0.8">AFRIKA SELATAN</text>
                <text x="412" y="405" fontSize="8" fontWeight="900" fill="#78350f" letterSpacing="1" opacity="0.75" transform="rotate(70 412 405)">MADAGASKAR</text>

                {/* Decorative Savanna Flora Icons */}
                <text x="325" y="260" fontSize="12" opacity="0.8">🌳</text>
                <text x="350" y="235" fontSize="10" opacity="0.8">🌿</text>
                <text x="280" y="380" fontSize="11" opacity="0.8">🌾</text>
                <text x="290" y="435" fontSize="11" opacity="0.8">🌳</text>

                {/* 6. Interactive Habitat Location Points */}
                {mapData.points.map((pt, i) => {
                  const isSelected = selectedPinIndex === i;
                  const { x: px, y: py } = pt;

                  return (
                    <g 
                      key={i} 
                      className="cursor-pointer group" 
                      onClick={() => setSelectedPinIndex(i)}
                    >
                      {/* Pulsing ring */}
                      <circle cx={px} cy={py} r={isSelected ? 16 : 11} fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping opacity-75" />
                      
                      {/* Outer glow ring */}
                      <circle cx={px} cy={py} r={isSelected ? 13 : 9} fill={isSelected ? '#ef4444' : '#dc2626'} stroke="#ffffff" strokeWidth="2.5" className="filter drop-shadow-md" />
                      
                      {/* Center dot */}
                      <circle cx={px} cy={py} r={isSelected ? 5 : 3.5} fill="#fef08a" />
                      
                      {/* Number badge */}
                      <text x={px} y={py + 3} fontSize="8" fontWeight="900" fill="#ffffff" textAnchor="middle" className="pointer-events-none">
                        {i + 1}
                      </text>

                      {/* Tooltip on hover/active */}
                      <g className={`transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <rect 
                          x={px - 58} 
                          y={py - 30} 
                          width="116" 
                          height="20" 
                          rx="6" 
                          fill="#431407" 
                          stroke="#fcd34d" 
                          strokeWidth="1.5" 
                          className="filter drop-shadow-lg"
                        />
                        <text 
                          x={px} 
                          y={py - 16} 
                          fontSize="8" 
                          fontWeight="900" 
                          fill="#fef3c7" 
                          textAnchor="middle" 
                          className="pointer-events-none"
                        >
                          📍 {pt.label.split('(')[0].trim()}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            ) : (
              /* Fallback for Asia, Australia, Nusantara */
              <g id="otherRegionMap">
                <path 
                  d={mapData.pathD} 
                  fill="url(#landmassGradient)" 
                  stroke="#9a3412" 
                  strokeWidth="3.5" 
                  strokeLinejoin="round" 
                />
                <text x="260" y="160" fontSize="15" fontWeight="900" fill="#78350f" letterSpacing="3" opacity="0.6" textAnchor="middle">
                  {mapData.regionName}
                </text>
                
                {mapData.points.map((pt, i) => {
                  const isSelected = selectedPinIndex === i;
                  return (
                    <g 
                      key={i} 
                      className="cursor-pointer group" 
                      onClick={() => setSelectedPinIndex(i)}
                    >
                      <circle cx={pt.x} cy={pt.y} r={isSelected ? 16 : 11} fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping opacity-75" />
                      <circle cx={pt.x} cy={pt.y} r={isSelected ? 12 : 9} fill={isSelected ? '#ef4444' : '#dc2626'} stroke="#ffffff" strokeWidth="2.5" />
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#fef08a" />
                      <text x={pt.x} y={pt.y + 3} fontSize="8" fontWeight="900" fill="#7f1d1d" textAnchor="middle">
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Bottom Interactive Detail Card for Selected Pin */}
      <div className="relative z-20 p-2.5 sm:p-3 bg-black/60 backdrop-blur-md border-t border-white/10 shrink-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Legend Items */}
          <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-bold text-amber-200/90">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-600 inline-block" />
              <span>Sabana Afrika</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 border border-white inline-block animate-pulse" />
              <span>Titik Habitat</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-b-2 border-dashed border-amber-800 inline-block" />
              <span>Batas Wilayah</span>
            </span>
          </div>

          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
            {mapData.biome.split('&')[0].trim()}
          </span>
        </div>

        {/* Selected Habitat Pin Callout */}
        <AnimatePresence mode="wait">
          {selectedPin && (
            <motion.div
              key={selectedPin.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-gradient-to-r from-amber-950/80 to-stone-900/90 border border-amber-400/40 rounded-xl p-2 sm:p-2.5 flex items-start gap-2 shadow-lg text-left"
            >
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-sm mt-0.5">
                {(selectedPinIndex ?? 0) + 1}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-black text-amber-300 truncate">
                  📍 {selectedPin.label}
                </span>
                <p className="text-[10px] sm:text-xs text-amber-100/90 font-medium leading-snug line-clamp-2 mt-0.5">
                  {selectedPin.desc}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
