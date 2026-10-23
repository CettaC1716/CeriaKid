import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Home
} from 'lucide-react';

import { FLORA_REGISTRY } from '../data/flora';
import { getFloraIllustration } from '../utils/natureIllustrations';
import { playFloraBreezeSound, playPopChime } from '../utils/soundSynthesizer';
import { speakTextUtterance, cancelSpeechSynthesis } from '../utils/speechUtils';
import {
  HIGHLIGHT_COLORS,
  HighlightColorKey,
  getPageHighlights,
  setElementHighlight,
  clearPageHighlights,
  getHighlightStyle,
  isBookInChest,
  toggleBookInChest,
} from '../utils/bookChestStorage';

const SafeFloraImage: React.FC<{
  floraKey: string;
  src: string;
  className?: string;
}> = ({ floraKey, src, className = 'w-full h-full object-cover' }) => {
  const [hasError, setHasError] = useState(false);
  const fallbackUri = getFloraIllustration(floraKey);

  useEffect(() => {
    setHasError(false);
  }, [src, floraKey]);

  const resolvedSrc = hasError ? fallbackUri : src || fallbackUri;

  return (
    <img
      src={resolvedSrc}
      alt=""
      aria-hidden="true"
      draggable={false}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      className={className}
    />
  );
};

interface FloraInteractiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFloraKey?: string;
}

export const FloraInteractiveModal: React.FC<FloraInteractiveModalProps> = ({
  isOpen,
  onClose,
  initialFloraKey,
}) => {
  const [selectedFloraKey, setSelectedFloraKey] = useState<string>(initialFloraKey || 'mawar');
  const [heroMode, setHeroMode] = useState<'habitat' | 'audio' | 'map'>('habitat');
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [isPlayingName, setIsPlayingName] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [narrationSpeed, setNarrationSpeed] = useState(360);
  const [floraToast, setFloraToast] = useState<string | null>(null);

  // Book Highlighter & Peti Buku Favorit state
  const [isHighlighterActive, setIsHighlighterActive] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColorKey>('yellow');
  const pageKey = `flora:${selectedFloraKey}`;
  const [pageHighlights, setPageHighlights] = useState<Record<string, Exclude<HighlightColorKey, 'eraser'>>>(() =>
    getPageHighlights(`flora:${initialFloraKey || 'mawar'}`)
  );
  const [isSavedInChest, setIsSavedInChest] = useState<boolean>(() =>
    isBookInChest(`flora:${initialFloraKey || 'mawar'}`)
  );

  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeFlora = FLORA_REGISTRY[selectedFloraKey] || FLORA_REGISTRY.mawar;

  useEffect(() => {
    if (initialFloraKey && FLORA_REGISTRY[initialFloraKey]) {
      setSelectedFloraKey(initialFloraKey);
    }
  }, [initialFloraKey, isOpen]);

  useEffect(() => {
    setPageHighlights(getPageHighlights(pageKey));
    setIsSavedInChest(isBookInChest(pageKey));
  }, [pageKey, isOpen]);

  useEffect(() => {
    const syncChest = () => setIsSavedInChest(isBookInChest(pageKey));
    window.addEventListener('ceriakids-saved-books-updated', syncChest);
    return () => window.removeEventListener('ceriakids-saved-books-updated', syncChest);
  }, [pageKey]);

  const showFloraToast = (msg: string) => {
    setFloraToast(msg);
    setTimeout(() => setFloraToast(null), 2800);
  };

  const handleToggleHighlightElement = (elementId: string, labelForToast?: string) => {
    if (!isHighlighterActive) return false;
    playPopChime();
    const updated = setElementHighlight(pageKey, elementId, activeHighlightColor);
    setPageHighlights(updated);
    if (activeHighlightColor === 'eraser') {
      showFloraToast(`🧽 Tanda stabilo dihapus${labelForToast ? ` pada ${labelForToast}` : ''}!`);
    } else {
      const colorObj = HIGHLIGHT_COLORS.find((c) => c.key === activeHighlightColor);
      showFloraToast(
        `🖍️ Ditandai dengan kuas ${colorObj?.label || 'stabilo'}${labelForToast ? `: ${labelForToast}` : ''}!`
      );
    }
    return true;
  };

  const handleSaveCurrentFloraPage = () => {
    playPopChime();
    const res = toggleBookInChest({
      id: pageKey,
      bookType: 'flora',
      subKey: selectedFloraKey,
      title: `Buku Flora: ${activeFlora.name}`,
      subtitle: `${activeFlora.taleTitle} (${activeFlora.latin})`,
      badge: 'EDISI BOTANI & BUNGA',
      icon: activeFlora.cardMeta.emoji,
      xp: '+40 XP',
      gradient: 'from-amber-800 via-orange-900 to-emerald-950',
    });
    setIsSavedInChest(res.saved);
    showFloraToast(
      res.saved
        ? `❤️ "${activeFlora.name}" disimpan ke Peti Buku Favorit & Baca Nanti!`
        : `Buku "${activeFlora.name}" dihapus dari Peti Buku Favorit.`
    );
  };

  const fullFloraStoryText = `${activeFlora.taleTitle}. ${activeFlora.taleSubtitle}. ${activeFlora.taleSummary} Mari rawat tanaman sahabat alam kita setiap hari!`;
  const storyWords = fullFloraStoryText.split(' ');

  const triggerLeafBeeAudio = () => {
    playFloraBreezeSound();
  };

  const stopStoryNarration = () => {
    setIsSpeechPlaying(false);
    setIsPlayingName(false);
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    cancelSpeechSynthesis();
  };

  const handleCloseFloraModal = () => {
    stopStoryNarration();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopStoryNarration();
    }
  }, [isOpen]);

  const startStoryNarration = () => {
    stopStoryNarration();
    if (currentWordIdx >= storyWords.length - 1) {
      setCurrentWordIdx(0);
    }
    triggerLeafBeeAudio();
    setIsSpeechPlaying(true);
    speakTextUtterance(fullFloraStoryText, {
      lang: 'id-ID',
      rate: narrationSpeed === 360 ? 0.95 : 0.72,
      pitch: 1.05,
      onEnd: () => {
        setIsSpeechPlaying(false);
        if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      },
      onError: () => {
        setIsSpeechPlaying(false);
        if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
      },
    });
  };

  // Synced word counter for narration
  useEffect(() => {
    if (!isSpeechPlaying) return;
    const interval = narrationSpeed;
    const tick = () => {
      setCurrentWordIdx((prev) => {
        if (prev < storyWords.length - 1) {
          storyTimerRef.current = setTimeout(tick, interval);
          return prev + 1;
        } else {
          setIsSpeechPlaying(false);
          return prev;
        }
      });
    };
    storyTimerRef.current = setTimeout(tick, interval);
    return () => {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    };
  }, [isSpeechPlaying, narrationSpeed, storyWords.length]);

  const speakText = (text: string) => {
    stopStoryNarration();
    triggerLeafBeeAudio();
    setIsPlayingName(true);
    speakTextUtterance(text, {
      lang: 'id-ID',
      rate: 0.92,
      pitch: 1.05,
      onEnd: () => setIsPlayingName(false),
      onError: () => setIsPlayingName(false),
    });
  };

  const handleFloraSelect = (key: string) => {
    playPopChime();
    if (key === selectedFloraKey) {
      speakText(`${activeFlora.name}! Sahabat bunga indah di kebun kita.`);
      return;
    }
    stopStoryNarration();
    setCurrentWordIdx(0);
    setSelectedFloraKey(key);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselTrackRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    carouselTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Close speech on modal unmount
  useEffect(() => {
    return () => {
      cancelSpeechSynthesis();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 tablet:p-3 lg:p-6 overflow-hidden select-none font-['Nunito',sans-serif]">
        {/* Main Modal Container - Matches Fauna Modal (MengenalHewanModal) Dimensions & Proportions 100% */}
        <motion.main
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full tablet:max-h-[98dvh] tablet:h-[98dvh] tablet:max-w-[1340px] rounded-none tablet:rounded-[2.2rem] shadow-2xl overflow-hidden flex flex-col border-0 tablet:border-3 border-amber-200/80"
          style={{
            backgroundImage: `url('/assets/aistudio/screen_171b390b.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'rgb(44, 26, 29)'
          }}
        >
          {/* Scrollable / Flexible Inner Frame */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3.5 sm:px-5 tablet:px-6 lg:px-8 py-2 tablet:py-3 flex flex-col justify-between gap-2 tablet:gap-2.5" style={{ background: 'rgba(255, 255, 255, 0.35)' }}>
            
            {/* Header Bar matching Fauna Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-md">
                <button onClick={handleCloseFloraModal} className="flex items-center gap-1.5 text-[#b45309] hover:text-[#991b1b] transition-colors text-xs font-black uppercase tracking-wider cursor-pointer">
                  <Home className="w-4 h-4 text-[#f5a623]" />
                  <span>Habitat Kebun</span>
                </button>
                <ChevronRight className="w-4 h-4 text-amber-400" />
                <span className="text-[#991b1b] font-black text-xs uppercase tracking-wider">{activeFlora.name}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {/* Tombol Simpan */}
                <button
                  type="button"
                  onClick={handleSaveCurrentFloraPage}
                  className={`flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95 border-2 shadow-sm ${
                    isSavedInChest
                      ? 'bg-rose-600 text-white border-rose-300'
                      : 'bg-white/90 hover:bg-amber-50 border-amber-300 text-[#991b1b]'
                  }`}
                >
                  <span>{isSavedInChest ? 'Tersimpan' : 'Simpan'}</span>
                </button>

                {/* Tombol Kuas */}
                <button
                  type="button"
                  onClick={() => {
                    playPopChime();
                    const next = !isHighlighterActive;
                    setIsHighlighterActive(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95 border-2 shadow-sm ${
                    isHighlighterActive
                      ? 'bg-[#a3e635] text-gray-950 border-emerald-700 ring-2 ring-[#a3e635]/60 shadow-md'
                      : 'bg-white/90 hover:bg-amber-50 border-amber-300 text-[#b45309]'
                  }`}
                >
                  <img
                    src="/assets/ui3d/icon_palette_brush_3d.png"
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6 object-contain drop-shadow"
                  />
                  <span>{isHighlighterActive ? 'Kuas Aktif' : 'Kuas'}</span>
                </button>

                <button 
                  onClick={handleCloseFloraModal}
                  className="w-10 h-10 sm:w-11 sm:h-11 min-h-[40px] min-w-[40px] rounded-full bg-white hover:bg-red-50 text-[#b45309] hover:text-red-600 flex items-center justify-center border-2 border-amber-200 transition-all active:scale-95 cursor-pointer shadow-md touch-target"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar Pilihan Warna Kuas */}
            <AnimatePresence>
              {isHighlighterActive && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-wrap items-center justify-between gap-2 bg-[#1c2e24]/95 text-white backdrop-blur-xl border-2 border-[#a3e635] rounded-2xl px-3.5 py-2 shadow-xl shrink-0"
                >
                  <span className="text-xs font-black text-[#a3e635]">
                    Warna Kuas
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {HIGHLIGHT_COLORS.map((col) => (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => {
                          playPopChime();
                          setActiveHighlightColor(col.key);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                          activeHighlightColor === col.key
                            ? 'scale-105 border-white ring-2 ring-white/80 text-gray-950 shadow-md'
                            : 'border-white/25 text-white/90 opacity-85 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: activeHighlightColor === col.key ? col.hex : 'rgba(255,255,255,0.12)',
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/30 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.label}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        playPopChime();
                        setActiveHighlightColor('eraser');
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center transition-all cursor-pointer border ${
                        activeHighlightColor === 'eraser'
                          ? 'bg-rose-500 text-white border-white ring-2 ring-rose-300 shadow-md'
                          : 'bg-white/10 border-white/25 text-white/90 hover:bg-white/20'
                      }`}
                    >
                      <span>Hapus</span>
                    </button>
                    {Object.keys(pageHighlights).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          playPopChime();
                          clearPageHighlights(pageKey);
                          setPageHighlights({});
                        }}
                        className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/30 hover:bg-red-500/45 border border-red-300/40 text-red-100 cursor-pointer transition"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 tablet:grid-cols-12 gap-2.5 tablet:gap-3.5 lg:gap-5 items-stretch flex-1 min-h-0">
              
            {/* Hero Card (KOTAK KIRI: 100% MURNI GAMBAR PREVIEW) */}
            <div className="md:col-span-5 tablet:col-span-5 relative overflow-hidden rounded-[1.8rem] tablet:rounded-[2rem] bg-gradient-to-b from-[#1a2e22] to-[#0a1811] shadow-2xl h-full min-h-[330px] tablet:min-h-0 border-2 tablet:border-3 border-amber-300/40 flex items-center justify-center" id="heroFloraCard">
              {heroMode === 'map' ? (
                <div className="w-full h-full relative flex items-center justify-center p-2 bg-[#07241d]">
                  <svg viewBox="0 0 800 450" className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
                    <defs>
                      <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#05241e" />
                        <stop offset="50%" stopColor="#09382f" />
                        <stop offset="100%" stopColor="#041a15" />
                      </linearGradient>
                      <linearGradient id="floraContinentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fed7aa" />
                        <stop offset="50%" stopColor="#fdba74" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#oceanGrad)" />
                    <path d="M 0 112.5 L 800 112.5 M 0 225 L 800 225 M 0 337.5 L 800 337.5" stroke="rgba(94, 234, 212, 0.15)" strokeWidth="1" strokeDasharray="4,4" />
                    <path d="M 200 0 L 200 450 M 400 0 L 400 450 M 600 0 L 600 450" stroke="rgba(94, 234, 212, 0.15)" strokeWidth="1" strokeDasharray="4,4" />

                    <path d="M 80 80 Q 150 50 240 70 Q 280 120 220 180 Q 180 220 160 250 Q 120 230 100 170 Z" fill="url(#floraContinentGrad)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                    <path d="M 180 250 Q 260 260 280 320 Q 260 410 220 440 Q 180 400 170 330 Z" fill="url(#floraContinentGrad)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                    <path d="M 370 70 Q 450 60 470 110 Q 430 150 380 140 Q 360 110 370 70 Z" fill="url(#floraContinentGrad)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                    <path d="M 360 140 Q 460 140 480 200 Q 470 280 440 360 Q 400 400 370 360 Q 340 270 340 200 Z" fill="url(#floraContinentGrad)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                    <ellipse cx="490" cy="330" rx="10" ry="20" fill="#fcd34d" stroke="#7c2d12" strokeWidth="1.5" />
                    <path d="M 470 60 Q 640 40 720 100 Q 750 180 680 220 Q 580 200 520 160 Q 470 120 470 60 Z" fill="url(#floraContinentGrad)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />

                    <g className="cursor-pointer">
                      <circle cx={activeFlora.pinX} cy={activeFlora.pinY} r="18" fill="none" stroke="#22c55e" strokeWidth="2.5" className="animate-ping opacity-75" />
                      <circle cx={activeFlora.pinX} cy={activeFlora.pinY} r="9" fill="#15803d" stroke="#ffffff" strokeWidth="2.5" className="filter drop-shadow-lg" />

                      <rect 
                        x={activeFlora.pinX - 70} 
                        y={activeFlora.pinY - 36} 
                        width="140" 
                        height="24" 
                        rx="8" 
                        fill="#14532d" 
                        stroke="#86efac" 
                        strokeWidth="1.5" 
                        className="filter drop-shadow-xl"
                      />
                      <text 
                        x={activeFlora.pinX} 
                        y={activeFlora.pinY - 20} 
                        fontSize="9.5" 
                        fontWeight="900" 
                        fill="#f0fdf4" 
                        textAnchor="middle" 
                        className="pointer-events-none"
                      >
                        {activeFlora.pinLabel}
                      </text>
                    </g>
                  </svg>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                  <SafeFloraImage
                    floraKey={activeFlora.key}
                    src={activeFlora.image}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                </div>
              )}
            </div>

            {/* Info Card (KARTU KANAN: PUSAT SEMUA KETERANGAN, TAB, & TOMBOL) */}
            <div 
              className="md:col-span-7 tablet:col-span-7 relative overflow-hidden rounded-[1.8rem] tablet:rounded-[2rem] p-3 tablet:p-3.5 lg:p-5 flex flex-col justify-between shadow-2xl border-2 tablet:border-3 border-amber-300/40 h-full min-h-0"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 12px 35px rgba(184, 92, 42, 0.1)',
                color: 'rgb(44, 26, 29)'
              }}
            >
              {/* TAB SELECTOR DI ATAS KARTU KANAN */}
              <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2 mb-2 shrink-0">
                <div className="flex items-center gap-1 bg-amber-100/80 p-1 rounded-full border border-amber-300">
                  <button
                    type="button"
                    onClick={() => {
                      playPopChime();
                      setHeroMode('habitat');
                      if (isSpeechPlaying) stopStoryNarration();
                    }}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer ${
                      heroMode === 'habitat' 
                        ? 'bg-[#f5a623] text-[#644000] shadow-sm' 
                        : 'text-amber-900 hover:text-amber-950'
                    }`}
                  >
                    Habitat
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopChime();
                      if (heroMode === 'audio') {
                        if (isSpeechPlaying) stopStoryNarration();
                        else startStoryNarration();
                      } else {
                        setHeroMode('audio');
                        startStoryNarration();
                      }
                    }}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer ${
                      heroMode === 'audio' 
                        ? 'bg-[#f5a623] text-[#644000] shadow-sm' 
                        : 'text-amber-900 hover:text-amber-950'
                    }`}
                  >
                    Dongeng
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopChime();
                      setHeroMode('map');
                      if (isSpeechPlaying) stopStoryNarration();
                    }}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer ${
                      heroMode === 'map' 
                        ? 'bg-[#0f766e] text-white shadow-sm' 
                        : 'text-amber-900 hover:text-amber-950'
                    }`}
                  >
                    Peta Asal
                  </button>
                </div>

                <span className="text-[10px] uppercase font-black tracking-wider text-[#b45309]">
                  {heroMode === 'habitat' ? 'Informasi Flora' : heroMode === 'audio' ? 'Dongeng Botani' : 'Detail Wilayah'}
                </span>
              </div>

              {/* KONTEN KARTU KANAN SESUAI TAB AKTIF */}
              <div className="relative z-10 flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pr-1 min-h-0 text-left">
                {heroMode === 'habitat' && (
                  <>
                    {/* Header Flora & Tombol Dengar Nama */}
                    <div
                      onClick={() => {
                        if (isHighlighterActive) {
                          handleToggleHighlightElement('title-block', activeFlora.name);
                        }
                      }}
                      style={getHighlightStyle(pageHighlights['title-block'])}
                      className={`flex flex-col gap-0.5 rounded-xl p-1 -m-1 transition-all ${
                        isHighlighterActive ? 'cursor-pointer hover:bg-amber-100/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <h1 className="text-2xl sm:text-3xl tablet:text-3xl lg:text-4xl font-black tracking-tight font-['Quicksand']" style={{ color: '#991b1b' }}>
                            {activeFlora.name}
                          </h1>
                          <p className="text-xs sm:text-sm font-semibold" style={{ color: '#3730a3' }}>
                            {activeFlora.latin}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(`${activeFlora.name}! Sahabat bunga indah di kebun kita.`);
                          }}
                          className="relative flex items-center px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-transform cursor-pointer active:scale-95"
                          style={{ background: '#ffedd5', color: '#c2410c', border: '2px solid #fdba74' }}
                        >
                          <span>{isPlayingName ? 'Mendengarkan...' : 'Dengar Nama'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Facts Section (Cahaya, Air, Manfaat) */}
                    <div className="grid grid-cols-3 gap-2 tablet:gap-3 w-full my-1">
                      <div
                        onClick={() => handleToggleHighlightElement('fact-sun', 'Sinar')}
                        className="rounded-xl tablet:rounded-2xl p-2.5 tablet:p-3 flex flex-col items-center text-center gap-1 shadow-xs transition-all hover:bg-[#fff9e6] cursor-pointer"
                        style={{
                          background: '#fffbeb',
                          border: '2px solid #fde68a',
                          ...getHighlightStyle(pageHighlights['fact-sun']),
                        }}
                      >
                        <span className="text-[10px] tablet:text-[11px] font-black uppercase tracking-wider" style={{ color: '#b45309' }}>Cahaya</span>
                        <p className="text-xs tablet:text-sm text-[#92400e] font-bold leading-tight">
                          {activeFlora.sun}
                        </p>
                      </div>

                      <div
                        onClick={() => handleToggleHighlightElement('fact-water', 'Air')}
                        className="rounded-xl tablet:rounded-2xl p-2.5 tablet:p-3 flex flex-col items-center text-center gap-1 shadow-xs transition-all hover:bg-[#f0faff] cursor-pointer"
                        style={{
                          background: '#f0f9ff',
                          border: '2px solid #bae6fd',
                          ...getHighlightStyle(pageHighlights['fact-water']),
                        }}
                      >
                        <span className="text-[10px] tablet:text-[11px] font-black uppercase tracking-wider" style={{ color: '#0369a1' }}>Air</span>
                        <p className="text-xs tablet:text-sm text-[#0c4a6e] font-bold leading-tight">
                          {activeFlora.water}
                        </p>
                      </div>

                      <div
                        onClick={() => handleToggleHighlightElement('fact-bee', 'Manfaat')}
                        className="rounded-xl tablet:rounded-2xl p-2.5 tablet:p-3 flex flex-col items-center text-center gap-1 shadow-xs transition-all hover:bg-[#f3fdf6] cursor-pointer"
                        style={{
                          background: '#f0fdf4',
                          border: '2px solid #bbf7d0',
                          ...getHighlightStyle(pageHighlights['fact-bee']),
                        }}
                      >
                        <span className="text-[10px] tablet:text-[11px] font-black uppercase tracking-wider" style={{ color: '#15803d' }}>Manfaat</span>
                        <p className="text-xs tablet:text-sm text-[#14532d] font-bold leading-tight">
                          {activeFlora.benefit}
                        </p>
                      </div>
                    </div>

                    {/* Ringkasan Cerita Banner */}
                    <div 
                      onClick={() => {
                        if (handleToggleHighlightElement('story-banner', activeFlora.taleTitle)) return;
                        setHeroMode('audio');
                        startStoryNarration();
                      }}
                      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col shadow-xs text-left hover:brightness-95 transition-all cursor-pointer mt-auto" 
                      style={{
                        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                        border: '2px solid #fed7aa',
                        ...getHighlightStyle(pageHighlights['story-banner']),
                      }}
                    >
                      <span className="font-extrabold text-sm sm:text-base" style={{ color: '#9a3412' }}>
                        {activeFlora.taleTitle}
                      </span>
                      <p className="text-xs sm:text-sm text-[#7c2d12] font-bold leading-relaxed mt-0.5">
                        {activeFlora.taleSummary}
                      </p>
                    </div>
                  </>
                )}

                {heroMode === 'audio' && (
                  <div className="flex flex-col gap-2 h-full justify-between">
                    <div className="bg-amber-100/90 p-2.5 rounded-2xl border border-amber-300 shrink-0">
                      <h4 className="text-sm font-black text-[#9a3412]">
                        {activeFlora.taleTitle}
                      </h4>
                    </div>

                    {/* TEKS DONGENG FLORA SECARA UTUH KANAN (TIDAK TERPOTONG ...) */}
                    <div className="flex-1 p-3 bg-amber-50/80 rounded-2xl border border-amber-200 overflow-y-auto no-scrollbar min-h-[140px]">
                      <div className="text-xs sm:text-sm font-bold text-[#7c2d12] leading-relaxed select-none">
                        {storyWords.map((word: string, idx: number) => {
                          const wordHighlight = pageHighlights[`word-${idx}`];
                          const highlightStyle = getHighlightStyle(wordHighlight);
                          return (
                            <motion.span
                              key={idx}
                              animate={{ 
                                backgroundColor:
                                  idx < currentWordIdx
                                    ? '#f5a623'
                                    : highlightStyle?.backgroundColor || 'transparent',
                                color: idx < currentWordIdx ? '#451a03' : '#7c2d12',
                                scale: idx === currentWordIdx - 1 ? 1.08 : 1
                              }}
                              style={idx < currentWordIdx ? undefined : highlightStyle}
                              className="inline-block mr-1.5 px-1.5 py-0.5 rounded-md cursor-pointer hover:text-[#9a3412] transition-colors"
                              onClick={() => {
                                if (handleToggleHighlightElement(`word-${idx}`, `kata "${word}"`)) return;
                                setCurrentWordIdx(idx);
                                stopStoryNarration();
                              }}
                            >
                              {word}
                            </motion.span>
                          );
                        })}
                      </div>
                    </div>

                    {/* AUDIO CONTROLS FLORA */}
                    <div className="bg-amber-100/90 p-2 rounded-2xl border border-amber-300 flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeechPlaying) {
                              stopStoryNarration();
                            } else {
                              startStoryNarration();
                            }
                          }}
                          className="px-4 py-2 rounded-full bg-[#f5a623] hover:bg-[#ffb955] text-[#644000] font-black text-xs flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <span>{isSpeechPlaying ? 'Jeda' : 'Putar Dongeng'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopStoryNarration();
                            setCurrentWordIdx(0);
                          }}
                          className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 text-amber-950 text-xs font-black flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-amber-300"
                        >
                          Ulangi
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-amber-300 text-[10px] font-black">
                        <button
                          type="button"
                          onClick={() => setNarrationSpeed(360)}
                          className={`px-2.5 py-0.5 rounded-full transition-all ${narrationSpeed === 360 ? 'bg-[#f5a623] text-[#644000]' : 'text-neutral-500'}`}
                        >
                          1.0x
                        </button>
                        <button
                          type="button"
                          onClick={() => setNarrationSpeed(560)}
                          className={`px-2.5 py-0.5 rounded-full transition-all ${narrationSpeed === 560 ? 'bg-[#f5a623] text-[#644000]' : 'text-neutral-500'}`}
                        >
                          0.7x
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {heroMode === 'map' && (
                  <div className="flex flex-col gap-2.5 h-full justify-between">
                    <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-300 flex flex-col gap-1">
                      <h3 className="text-sm sm:text-base font-black text-[#9a3412]">
                        Peta Asal & Wilayah: {activeFlora.name}
                      </h3>
                      <p className="text-xs text-[#7c2d12] font-semibold leading-relaxed">
                        {activeFlora.originFact}
                      </p>
                    </div>

                    {/* PREVIEW PETA BOTANI FLORA DI KANAN */}
                    <div className="w-full h-[170px] sm:h-[200px] rounded-2xl border-2 border-amber-300 overflow-hidden relative shadow-md bg-[#07241d] my-auto flex items-center justify-center p-2">
                      <svg viewBox="0 0 800 450" className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                        <defs>
                          <linearGradient id="oceanGradMini" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#05241e" />
                            <stop offset="50%" stopColor="#09382f" />
                            <stop offset="100%" stopColor="#041a15" />
                          </linearGradient>
                          <linearGradient id="floraContinentGradMini" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fed7aa" />
                            <stop offset="50%" stopColor="#fdba74" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                        </defs>

                        <rect width="100%" height="100%" fill="url(#oceanGradMini)" />
                        <path d="M 0 112.5 L 800 112.5 M 0 225 L 800 225 M 0 337.5 L 800 337.5" stroke="rgba(94, 234, 212, 0.15)" strokeWidth="1" strokeDasharray="4,4" />
                        <path d="M 200 0 L 200 450 M 400 0 L 400 450 M 600 0 L 600 450" stroke="rgba(94, 234, 212, 0.15)" strokeWidth="1" strokeDasharray="4,4" />

                        <path d="M 80 80 Q 150 50 240 70 Q 280 120 220 180 Q 180 220 160 250 Q 120 230 100 170 Z" fill="url(#floraContinentGradMini)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                        <path d="M 180 250 Q 260 260 280 320 Q 260 410 220 440 Q 180 400 170 330 Z" fill="url(#floraContinentGradMini)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                        <path d="M 370 70 Q 450 60 470 110 Q 430 150 380 140 Q 360 110 370 70 Z" fill="url(#floraContinentGradMini)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                        <path d="M 360 140 Q 460 140 480 200 Q 470 280 440 360 Q 400 400 370 360 Q 340 270 340 200 Z" fill="url(#floraContinentGradMini)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />
                        <path d="M 470 60 Q 640 40 720 100 Q 750 180 680 220 Q 580 200 520 160 Q 470 120 470 60 Z" fill="url(#floraContinentGradMini)" stroke="#7c2d12" strokeWidth="2.5" opacity="0.88" />

                        <g>
                          <circle cx={activeFlora.pinX} cy={activeFlora.pinY} r="18" fill="none" stroke="#22c55e" strokeWidth="2.5" className="animate-ping opacity-75" />
                          <circle cx={activeFlora.pinX} cy={activeFlora.pinY} r="9" fill="#15803d" stroke="#ffffff" strokeWidth="2.5" />
                          <rect 
                            x={activeFlora.pinX - 70} 
                            y={activeFlora.pinY - 36} 
                            width="140" 
                            height="24" 
                            rx="8" 
                            fill="#14532d" 
                            stroke="#86efac" 
                            strokeWidth="1.5" 
                          />
                          <text 
                            x={activeFlora.pinX} 
                            y={activeFlora.pinY - 20} 
                            fontSize="9.5" 
                            fontWeight="900" 
                            fill="#f0fdf4" 
                            textAnchor="middle" 
                          >
                            {activeFlora.pinLabel}
                          </text>
                        </g>
                      </svg>
                    </div>

                    <div className="grid grid-cols-2 gap-2 shrink-0">
                      <div className="bg-amber-50/90 border border-emerald-400/40 rounded-2xl p-2.5 flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] uppercase font-black text-[#15803d]">Wilayah Utama</span>
                        <span className="text-xs font-bold text-gray-900">{activeFlora.pinLabel}</span>
                      </div>
                      <div className="bg-amber-50/90 border border-amber-400/40 rounded-2xl p-2.5 flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] uppercase font-black text-[#b45309]">Nama Ilmiah</span>
                        <span className="text-xs font-bold text-gray-900">{activeFlora.latin}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BAR DI BAWAH KARTU KANAN (TANPA TOMBOL PETA ASAL GANDA) */}
              <div className="relative z-10 pt-2 border-t border-amber-200 flex items-center justify-between gap-2 shrink-0 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    playPopChime();
                    if (heroMode === 'audio') {
                      if (isSpeechPlaying) {
                        stopStoryNarration();
                      } else {
                        startStoryNarration();
                      }
                    } else {
                      setHeroMode('audio');
                      startStoryNarration();
                    }
                  }}
                  className={`w-full flex items-center justify-center px-4 py-2.5 rounded-full font-black border-2 transition-all cursor-pointer text-xs tablet:text-sm active:scale-95 ${
                    heroMode === 'audio' && isSpeechPlaying
                      ? 'bg-[#ffb955] text-[#4d2403] border-white shadow-[0_0_15px_rgba(245,166,35,0.7)]'
                      : 'bg-[#f5a623] text-[#644000] border-[#ffddb4] shadow-[0_3px_0_#644000] hover:bg-[#ffb955]'
                  }`}
                >
                  <span className="tracking-tight truncate">
                    {heroMode === 'audio' && isSpeechPlaying ? 'Jeda Dongeng' : 'Putar Dongeng'}
                  </span>
                </button>
              </div>
            </div>
            </div>

            {/* Bottom Carousel Section */}
            <div className="shrink-0 flex flex-col gap-1 tablet:gap-1.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm tablet:text-base lg:text-lg font-black text-[#3b2010] font-['Quicksand'] tracking-tight">
                  Koleksi Flora
                </h2>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => scrollCarousel('left')}
                    className="w-7 h-7 tablet:w-8 tablet:h-8 rounded-full bg-white text-[#b45309] border border-amber-300 flex items-center justify-center shadow-xs hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Geser Kiri"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel('right')}
                    className="w-7 h-7 tablet:w-8 tablet:h-8 rounded-full bg-white text-[#b45309] border border-amber-300 flex items-center justify-center shadow-xs hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Geser Kanan"
                  >
                    <ChevronRight className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Collectible Cards Track */}
              <div 
                ref={carouselTrackRef} 
                className="flex gap-2.5 tablet:gap-3.5 overflow-x-auto no-scrollbar pt-2 pb-3 px-2 -my-1 snap-x scroll-smooth items-center select-none"
              >
                {Object.values(FLORA_REGISTRY).map((item) => {
                  const isSelected = item.key === selectedFloraKey;

                  return (
                    <motion.div
                      key={item.key}
                      role="button"
                      aria-label={item.name}
                      whileHover={{ y: -3, scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleFloraSelect(item.key)}
                      className={`group snap-start shrink-0 w-24 h-24 sm:w-26 sm:h-26 tablet:w-28 tablet:h-28 lg:w-34 lg:h-34 rounded-xl tablet:rounded-2xl overflow-hidden relative cursor-pointer border-2 tablet:border-3 transition-all duration-300 origin-center flex flex-col justify-end p-2 bg-[#07241d] ${
                        isSelected 
                          ? 'border-[#f5a623] shadow-lg shadow-[#f5a623]/30 scale-105 z-20 ring-2 ring-[#ffddb4]' 
                          : 'border-white/25 opacity-85 hover:opacity-100 hover:border-white/60'
                      }`}
                    >
                      <SafeFloraImage
                        floraKey={item.key}
                        src={item.image}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
                      <div className="relative z-10 pointer-events-none">
                        <span className="text-white font-black text-[10px] tablet:text-[11px] block leading-tight truncate drop-shadow-sm">
                          {item.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {floraToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 right-6 z-[150] bg-[#1c2e24]/95 border-2 border-[#a3e635] text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center max-w-sm"
              >
                <span className="text-xs font-bold leading-snug">{floraToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </AnimatePresence>
  );
};
