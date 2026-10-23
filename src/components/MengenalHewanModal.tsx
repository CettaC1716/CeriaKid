import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  Home, 
  ArrowLeft,
  ArrowRight,
  Lock
} from 'lucide-react';
import { ANIMAL_DATA, MAP_REGISTRY, QuickFact } from '../data/animals';
import { getFaunaIllustration } from '../utils/natureIllustrations';
import { ChildFriendlyGeoMap } from './ChildFriendlyGeoMap';
import { playPopChime, SoundSynthesizer } from '../utils/soundSynthesizer';
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

const SafeAnimalImage: React.FC<{
  animalKey: string;
  src: string;
  emoji?: string;
  className?: string;
}> = ({ animalKey, src, className = 'w-full h-full object-cover' }) => {
  const [hasError, setHasError] = useState(false);
  const fallbackUri = getFaunaIllustration(animalKey);

  useEffect(() => {
    setHasError(false);
  }, [src, animalKey]);

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








interface MengenalHewanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAnimalKey?: string;
}

export const MengenalHewanModal: React.FC<MengenalHewanModalProps> = ({
  isOpen,
  onClose,
  initialAnimalKey,
}) => {
  const [currentKey, setCurrentKey] = useState(initialAnimalKey || 'singa');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [heroMode, setHeroMode] = useState<'habitat' | 'audio' | 'map'>('habitat');
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipAnimalName, setVipModalAnimalTitle] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  // Story state
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [narrationSpeed, setNarrationSpeed] = useState(360);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardsTrackRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [topBanner, setTopBanner] = useState<{ emoji: string; text: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  const [isFading, setIsFading] = useState(false);

  // Book Highlighter & Peti Buku Favorit state
  const [isHighlighterActive, setIsHighlighterActive] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColorKey>('yellow');
  const pageKey = `fauna:${currentKey}`;
  const [pageHighlights, setPageHighlights] = useState<Record<string, Exclude<HighlightColorKey, 'eraser'>>>(() =>
    getPageHighlights(`fauna:${initialAnimalKey || 'singa'}`)
  );
  const [isSavedInChest, setIsSavedInChest] = useState<boolean>(() =>
    isBookInChest(`fauna:${initialAnimalKey || 'singa'}`)
  );

  useEffect(() => {
    if (initialAnimalKey && ANIMAL_DATA[initialAnimalKey]) {
      setCurrentKey(initialAnimalKey);
    }
  }, [initialAnimalKey, isOpen]);

  useEffect(() => {
    setPageHighlights(getPageHighlights(pageKey));
    setIsSavedInChest(isBookInChest(pageKey));
  }, [pageKey, isOpen]);

  useEffect(() => {
    const syncChest = () => setIsSavedInChest(isBookInChest(pageKey));
    window.addEventListener('ceriakids-saved-books-updated', syncChest);
    return () => window.removeEventListener('ceriakids-saved-books-updated', syncChest);
  }, [pageKey]);

  const animal = ANIMAL_DATA[currentKey] || ANIMAL_DATA.singa;

  const showTopBanner = useCallback((emoji: string, text: string) => {
    setTopBanner({ emoji, text });
    setTimeout(() => setTopBanner(null), 4500);
  }, []);

  const showToast = useCallback((msg: string, icon = 'auto_awesome') => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3400);
  }, []);

  const handleToggleHighlightElement = useCallback(
    (elementId: string, labelForToast?: string) => {
      if (!isHighlighterActive) return false;
      playPopChime();
      const updated = setElementHighlight(pageKey, elementId, activeHighlightColor);
      setPageHighlights(updated);
      if (activeHighlightColor === 'eraser') {
        showToast(`Tanda stabilo dihapus${labelForToast ? ` pada ${labelForToast}` : ''}! 🧽`, 'lightbulb');
      } else {
        const colorObj = HIGHLIGHT_COLORS.find((c) => c.key === activeHighlightColor);
        showToast(
          `Ditandai dengan kuas ${colorObj?.label || 'stabilo'}${labelForToast ? `: ${labelForToast}` : ''}! 🖍️`,
          'lightbulb'
        );
      }
      return true;
    },
    [isHighlighterActive, pageKey, activeHighlightColor, showToast]
  );

  const handleSaveCurrentBookPage = () => {
    playPopChime();
    const res = toggleBookInChest({
      id: pageKey,
      bookType: 'fauna',
      subKey: currentKey,
      title: `Buku Fauna: ${animal.name}`,
      subtitle: `${animal.story.title} (${animal.latin})`,
      badge: 'EDISI SATWA RIMBA',
      icon: animal.emoji,
      xp: '+40 XP',
      gradient: 'from-emerald-900 via-teal-900 to-stone-900',
    });
    setIsSavedInChest(res.saved);
    showToast(
      res.saved
        ? `❤️ "${animal.name}" disimpan ke Peti Buku Favorit & Baca Nanti!`
        : `Buku "${animal.name}" dihapus dari Peti Buku Favorit.`,
      'verified'
    );
  };

  const stopStoryNarration = useCallback(() => {
    setIsNarrating(false);
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    cancelSpeechSynthesis();
  }, []);

  const handleCloseModal = useCallback(() => {
    stopStoryNarration();
    onClose();
  }, [stopStoryNarration, onClose]);

  useEffect(() => {
    if (!isOpen) {
      stopStoryNarration();
    }
  }, [isOpen, stopStoryNarration]);

  const triggerSound = useCallback(() => {
    if (isPlayingSound) return;
    setIsPlayingSound(true);
    if (SoundSynthesizer[currentKey]) SoundSynthesizer[currentKey]();
    showTopBanner(animal.emoji, animal.bannerFact);
    showToast(`Mendengarkan suara asli: ${animal.name}! 🔊`, 'volume_up');
    setTimeout(() => setIsPlayingSound(false), 2200);
  }, [currentKey, isPlayingSound, animal, showTopBanner, showToast]);

  const handleAnimalSelect = useCallback((key: string) => {
    const targetData = ANIMAL_DATA[key];
    if (!targetData) return;

    if (targetData.isLocked) {
      playPopChime();
      setVipModalAnimalTitle(targetData.name);
      setIsVipModalOpen(true);
      return;
    }

    if (key === currentKey) {
      triggerSound();
      return;
    }
    playPopChime();
    setIsFading(true);
    stopStoryNarration();
    setCurrentWordIdx(0);
    setTimeout(() => {
      setCurrentKey(key);
      setIsFading(false);
      if (SoundSynthesizer[key]) SoundSynthesizer[key]();
      showTopBanner(targetData.emoji, targetData.bannerFact);
      showToast(targetData.toastMsg, 'verified');
    }, 200);
  }, [currentKey, triggerSound, showTopBanner, showToast, stopStoryNarration]);

  // Story Logic
  const words = useMemo(() => animal.story.text.split(' '), [animal]);

  const speakStorySpeech = useCallback((textToSpeak: string) => {
    speakTextUtterance(textToSpeak, {
      lang: 'id-ID',
      rate: narrationSpeed === 360 ? 0.95 : 0.72,
      pitch: 1.05,
      onEnd: () => stopStoryNarration(),
      onError: () => stopStoryNarration(),
    });
  }, [narrationSpeed, stopStoryNarration]);

  const stepStoryNarration = useCallback(() => {
    setCurrentWordIdx((prev) => {
      const next = prev + 1;
      if (next >= words.length) {
        stopStoryNarration();
        showToast('Hore! Dongeng selesai dibacakan! 🎉', 'celebration');
        return prev;
      }
      return next;
    });
  }, [words.length, stopStoryNarration, showToast]);

  useEffect(() => {
    if (isNarrating) {
      storyTimerRef.current = setTimeout(stepStoryNarration, narrationSpeed);
    }
    return () => {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    };
  }, [isNarrating, currentWordIdx, narrationSpeed, stepStoryNarration]);

  const startStoryNarration = useCallback(() => {
    if (currentWordIdx >= words.length - 1) {
      setCurrentWordIdx(0);
    }
    setIsNarrating(true);
    speakStorySpeech(animal.story.text);
  }, [currentWordIdx, words.length, speakStorySpeech, animal.story.text]);

  const handleVipSubmit = () => {
    if (parseInt(mathAnswer) === 10) {
      showToast('Selamat Datang di Paket Langganan VIP Ranger! Fitur lengkap siap dijelajahi! 🎉', 'verified');
      setIsVipModalOpen(false);
    } else {
      setMathError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 tablet:p-3 lg:p-6 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <motion.main 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full h-full tablet:max-h-[98dvh] tablet:h-[98dvh] tablet:max-w-[1340px] bg-[#001711] rounded-none tablet:rounded-[2.2rem] shadow-2xl overflow-hidden flex flex-col border-0 tablet:border-3 border-[#ffc880]/20"
        style={{ 
          backgroundImage: `url('/assets/aistudio/screen_8da2fb8b.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Top Banner */}
        <AnimatePresence>
          {topBanner && (
            <motion.div 
              initial={{ y: -100, x: '-50%', opacity: 0 }}
              animate={{ y: 20, x: '-50%', opacity: 1 }}
              exit={{ y: -100, x: '-50%', opacity: 0 }}
              className="fixed left-1/2 z-[110] flex items-center gap-3 bg-[#1e3a31]/95 border-2 border-[#ffc880]/60 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md max-w-[92vw] whitespace-nowrap"
            >
              <div className="w-10 h-10 rounded-full bg-[#f5a623] text-[#644000] flex items-center justify-center shrink-0 text-xl shadow-inner">
                {topBanner.emoji}
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#ffc880]">Kabar Seru Rimba</span>
                <span className="text-sm tablet:text-base text-[#ffddb4] font-black">{topBanner.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3.5 sm:px-5 tablet:px-6 lg:px-8 py-2 tablet:py-3 flex flex-col justify-between gap-2 tablet:gap-2.5 bg-black/30 backdrop-blur-[2px]">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
              <button onClick={handleCloseModal} className="flex items-center gap-1.5 text-[#d7c3ae] hover:text-[#ffc880] transition-colors text-xs font-black uppercase tracking-wider cursor-pointer">
                <Home className="w-4 h-4 text-[#ffc880]" />
                <span>Habitat Rimba</span>
              </button>
              <ChevronRight className="w-4 h-4 text-white/20" />
              <span className="text-[#ffc880] font-black text-xs uppercase tracking-wider">{animal.breadcrumb}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {/* Tombol Simpan */}
              <button
                type="button"
                onClick={handleSaveCurrentBookPage}
                className={`flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95 border shadow-md ${
                  isSavedInChest
                    ? 'bg-rose-500/25 border-rose-300 text-rose-200 shadow-rose-500/20'
                    : 'bg-black/45 hover:bg-black/65 border-amber-300/40 text-[#ffc880]'
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95 border shadow-md ${
                  isHighlighterActive
                    ? 'bg-[#a3e635] text-gray-950 border-white ring-2 ring-[#a3e635]/60 shadow-[0_0_18px_rgba(163,230,53,0.5)]'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-[#ffddb4]'
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
                onClick={handleCloseModal}
                className="w-10 h-10 sm:w-11 sm:h-11 min-h-[40px] min-w-[40px] rounded-full bg-black/40 hover:bg-red-500/20 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md touch-target"
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
                className="flex flex-wrap items-center justify-between gap-2 bg-black/65 backdrop-blur-xl border-2 border-[#a3e635]/60 rounded-2xl px-3.5 py-2 shadow-xl shrink-0"
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
                        backgroundColor: activeHighlightColor === col.key ? col.hex : 'rgba(255,255,255,0.1)',
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
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/25 hover:bg-red-500/40 border border-red-400/40 text-red-200 cursor-pointer transition"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Showcase Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-12 tablet:grid-cols-12 gap-2.5 tablet:gap-3.5 lg:gap-5 items-stretch flex-1 min-h-0 transition-all duration-300 ${isFading ? 'opacity-20 scale-95' : 'opacity-100 scale-100'}`}>
            
            {/* Hero Card (KOTAK KIRI: 100% MURNI GAMBAR PREVIEW) */}
            <div className="md:col-span-5 tablet:col-span-5 relative overflow-hidden rounded-[1.8rem] tablet:rounded-[2rem] bg-gradient-to-b from-[#07241d] to-[#02110e] shadow-2xl h-full min-h-[330px] tablet:min-h-0 border-2 tablet:border-3 border-white/10 flex items-center justify-center">
              {heroMode === 'map' ? (
                <div className="w-full h-full relative">
                  <ChildFriendlyGeoMap
                    animalKey={currentKey}
                    animalName={animal.name}
                    animalEmoji={animal.emoji}
                    onClose={() => setHeroMode('habitat')}
                  />
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                  <SafeAnimalImage
                    animalKey={currentKey}
                    src={animal.img}
                    emoji={animal.emoji}
                    className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-700 hover:scale-105"
                  />
                </div>
              )}
            </div>

            {/* Info Card (KARTU KANAN: PUSAT SEMUA KETERANGAN, TAB, & TOMBOL) */}
            <div 
              className="md:col-span-7 tablet:col-span-7 relative overflow-hidden rounded-[1.8rem] tablet:rounded-[2rem] bg-[#132f27]/95 p-3 tablet:p-3.5 lg:p-5 flex flex-col justify-between shadow-2xl border-2 tablet:border-3 border-white/10 h-full min-h-0" 
              style={{ 
                backgroundImage: `linear-gradient(155deg, rgba(19, 47, 39, 0.96) 0%, rgba(7, 36, 29, 0.98) 100%)`,
                backgroundSize: 'cover'
              }}
            >
              {/* TAB SELECTOR DI ATAS KARTU KANAN */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2 shrink-0">
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      playPopChime();
                      setHeroMode('habitat');
                      if (isNarrating) stopStoryNarration();
                    }}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer ${
                      heroMode === 'habitat' 
                        ? 'bg-[#f5a623] text-[#644000] shadow-sm' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Habitat
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopChime();
                      if (heroMode === 'audio') {
                        if (isNarrating) stopStoryNarration();
                        else startStoryNarration();
                      } else {
                        setHeroMode('audio');
                        startStoryNarration();
                      }
                    }}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer ${
                      heroMode === 'audio' 
                        ? 'bg-[#f5a623] text-[#644000] shadow-sm' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Dongeng
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopChime();
                      setHeroMode('map');
                      if (isNarrating) stopStoryNarration();
                    }}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all cursor-pointer ${
                      heroMode === 'map' 
                        ? 'bg-[#0f766e] text-white shadow-sm' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Peta Asal
                  </button>
                </div>

                <span className="text-[10px] uppercase font-black tracking-wider text-[#ffc880]">
                  {heroMode === 'habitat' ? 'Informasi Satwa' : heroMode === 'audio' ? 'Cerita Dongeng' : 'Detail Wilayah'}
                </span>
              </div>

              {/* KONTEN KARTU KANAN SESUAI TAB AKTIF */}
              <div className="relative z-10 flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pr-1 min-h-0">
                {heroMode === 'habitat' && (
                  <>
                    {/* Header Satwa & Tombol Dengar Suara */}
                    <div
                      onClick={() => {
                        if (isHighlighterActive) {
                          handleToggleHighlightElement('title-block', animal.name);
                        }
                      }}
                      style={getHighlightStyle(pageHighlights['title-block'])}
                      className={`rounded-xl p-1 -m-1 transition-all ${isHighlighterActive ? 'cursor-pointer hover:bg-white/5' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h1 className="text-xl sm:text-2xl tablet:text-2xl lg:text-3xl font-black text-[#ffc880] tracking-tight leading-none mb-1">
                            {animal.name}
                          </h1>
                          <p className="text-xs sm:text-sm font-semibold text-[#baeed9]">
                            {animal.latin}
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerSound();
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#f5a623]/20 border border-[#f5a623]/60 text-[#ffc880] hover:bg-[#f5a623]/30 transition-all text-xs font-black flex items-center cursor-pointer active:scale-95 shrink-0 shadow-xs"
                        >
                          <span>{isPlayingSound ? 'Mengaum...' : 'Dengar Suara'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Facts Section (Makanan, Kebiasaan, Habitat Asli) */}
                    <div className="grid grid-cols-3 gap-1.5 tablet:gap-2 my-1">
                      {animal.quickFacts.map((fact: QuickFact, i: number) => (
                        <div 
                          key={i}
                          style={getHighlightStyle(pageHighlights[`fact-${i}`])}
                          className={`bg-black/30 border ${fact.border} rounded-xl tablet:rounded-2xl p-2.5 flex flex-col items-center text-center gap-1 transition-all hover:bg-black/40 cursor-pointer`}
                          onClick={() => {
                            if (handleToggleHighlightElement(`fact-${i}`, `Fakta ${fact.title}`)) return;
                            playPopChime();
                            if (i === 2) setHeroMode('map');
                          }}
                        >
                          <span className="text-[11px] tablet:text-xs font-black text-[#ffc880] uppercase tracking-wider">{fact.title}</span>
                          <p className="text-[10px] sm:text-xs text-[#d7c3ae] font-bold leading-tight" dangerouslySetInnerHTML={{ __html: fact.text }} />
                        </div>
                      ))}
                    </div>

                    {/* Ringkasan Fakta Banner */}
                    <div 
                      onClick={() => {
                        if (handleToggleHighlightElement('story-banner', animal.story.title)) return;
                        playPopChime();
                        setHeroMode('audio');
                        startStoryNarration();
                      }}
                      style={getHighlightStyle(pageHighlights['story-banner'])}
                      className="rounded-xl sm:rounded-2xl p-3 flex flex-col shadow-2xs text-left bg-black/40 hover:bg-black/55 border border-[#f5a623]/30 transition-all cursor-pointer mt-auto"
                    >
                      <span className="font-extrabold text-xs sm:text-sm text-[#ffc880]">
                        {animal.story.title}
                      </span>
                      <p className="text-xs sm:text-sm text-[#ffddb4] font-bold leading-snug mt-0.5">
                        {animal.story.text}
                      </p>
                    </div>
                  </>
                )}

                {heroMode === 'audio' && (
                  <div className="flex flex-col gap-2 h-full justify-between">
                    <div className="bg-black/40 p-2.5 rounded-2xl border border-white/10 shrink-0">
                      <h4 className="text-sm font-black text-[#ffc880]">
                        {animal.story.title}
                      </h4>
                    </div>

                    {/* TEKS DONGENG SECARA UTUH KANAN (TIDAK TERPOTONG ...) */}
                    <div className="flex-1 p-3 bg-black/40 rounded-2xl border border-white/10 overflow-y-auto no-scrollbar min-h-[140px]">
                      <div className="text-xs sm:text-sm font-bold text-[#cae9dd] leading-relaxed select-none">
                        {words.map((word: string, idx: number) => {
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
                                color: idx < currentWordIdx ? '#001711' : '#cae9dd',
                                scale: idx === currentWordIdx - 1 ? 1.08 : 1
                              }}
                              style={idx < currentWordIdx ? undefined : highlightStyle}
                              className="inline-block mr-1.5 px-1.5 py-0.5 rounded-md cursor-pointer hover:text-[#ffc880] transition-colors"
                              onClick={() => {
                                if (handleToggleHighlightElement(`word-${idx}`, `kata "${word}"`)) return;
                                playPopChime();
                                setCurrentWordIdx(idx);
                                setIsNarrating(false);
                              }}
                            >
                              {word}
                            </motion.span>
                          );
                        })}
                      </div>
                    </div>

                    {/* DONGENG AUDIO CONTROLS */}
                    <div className="bg-black/50 p-2 rounded-2xl border border-white/10 flex items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playPopChime();
                            if (isNarrating) {
                              stopStoryNarration();
                            } else {
                              startStoryNarration();
                            }
                          }}
                          className="px-4 py-2 rounded-full bg-[#f5a623] hover:bg-[#ffb955] text-[#644000] font-black text-xs flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <span>{isNarrating ? 'Jeda' : 'Putar Dongeng'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playPopChime();
                            stopStoryNarration();
                            setCurrentWordIdx(0);
                          }}
                          className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center justify-center transition-all cursor-pointer active:scale-95"
                        >
                          Ulangi
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-[10px] font-black">
                        <button
                          type="button"
                          onClick={() => {
                            playPopChime();
                            setNarrationSpeed(360);
                          }}
                          className={`px-2.5 py-0.5 rounded-full transition-all ${narrationSpeed === 360 ? 'bg-[#f5a623] text-[#644000]' : 'text-neutral-400'}`}
                        >
                          1.0x
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPopChime();
                            setNarrationSpeed(560);
                          }}
                          className={`px-2.5 py-0.5 rounded-full transition-all ${narrationSpeed === 560 ? 'bg-[#f5a623] text-[#644000]' : 'text-neutral-400'}`}
                        >
                          0.7x
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {heroMode === 'map' && (
                  <div className="flex flex-col gap-2.5 h-full justify-between">
                    <div className="bg-black/40 p-2.5 rounded-2xl border border-white/10 flex flex-col gap-1">
                      <h3 className="text-sm sm:text-base font-black text-[#ffc880]">
                        Peta Asal & Habitat: {animal.name}
                      </h3>
                      <p className="text-xs text-[#cae9dd] font-semibold leading-relaxed">
                        {animal.bannerFact || `${animal.name} hidup bebas di habitat aslinya. Sentuh wilayah peta untuk melihat penyebarannya.`}
                      </p>
                    </div>

                    {/* PREVIEW PETA ASAL HABITAT DI KANAN */}
                    <div className="w-full h-[170px] sm:h-[200px] rounded-2xl border-2 border-emerald-400/40 overflow-hidden relative shadow-lg bg-[#0c2e35] my-auto">
                      <ChildFriendlyGeoMap
                        animalKey={currentKey}
                        animalName={animal.name}
                        animalEmoji={animal.emoji}
                        onClose={() => {}}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 shrink-0">
                      <div className="bg-black/30 border border-emerald-400/30 rounded-2xl p-2.5 flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] uppercase font-black text-[#ffc880]">Wilayah Utama</span>
                        <span className="text-xs font-bold text-white">{MAP_REGISTRY[currentKey]?.regionName || animal.habitat || animal.breadcrumb}</span>
                      </div>
                      <div className="bg-black/30 border border-amber-400/30 rounded-2xl p-2.5 flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] uppercase font-black text-[#ffc880]">Nama Ilmiah</span>
                        <span className="text-xs font-bold text-white">{animal.latin}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BAR DI BAWAH KARTU KANAN (TANPA TOMBOL PETA ASAL GANDA) */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between gap-2 shrink-0 mt-2">
                <button 
                  type="button"
                  onClick={() => {
                    playPopChime();
                    if (heroMode === 'audio') {
                      if (isNarrating) stopStoryNarration();
                      else startStoryNarration();
                    } else {
                      setHeroMode('audio');
                      startStoryNarration();
                    }
                  }}
                  className={`w-full flex items-center justify-center px-4 py-2.5 rounded-full font-black border-2 transition-all cursor-pointer text-xs tablet:text-sm active:scale-95 ${
                    heroMode === 'audio' && isNarrating
                      ? 'bg-[#ffb955] text-[#4d2403] border-white shadow-[0_0_15px_rgba(245,166,35,0.7)]'
                      : 'bg-[#f5a623] text-[#644000] border-[#ffddb4] shadow-[0_3px_0_#644000] hover:bg-[#ffb955]'
                  }`}
                >
                  <span className="tracking-tight truncate">
                    {heroMode === 'audio' && isNarrating ? 'Jeda Dongeng' : 'Putar Dongeng'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Section */}
          <div className="shrink-0 flex flex-col gap-1 tablet:gap-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm tablet:text-base lg:text-lg font-black text-[#cae9dd] tracking-tight">
                Koleksi Satwa
              </h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => {
                    if (cardsTrackRef.current) {
                      cardsTrackRef.current.scrollBy({ left: -220, behavior: 'smooth' });
                      playPopChime();
                    }
                  }}
                  className="w-7 h-7 tablet:w-8 tablet:h-8 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                  title="Geser Kiri"
                >
                  <ArrowLeft className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (cardsTrackRef.current) {
                      cardsTrackRef.current.scrollBy({ left: 220, behavior: 'smooth' });
                      playPopChime();
                    }
                  }}
                  className="w-7 h-7 tablet:w-8 tablet:h-8 rounded-full bg-black/40 border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                  title="Geser Kanan"
                >
                  <ArrowRight className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
                </button>
              </div>
            </div>

            <div ref={cardsTrackRef} className="flex gap-2.5 tablet:gap-3.5 overflow-x-auto no-scrollbar pt-3 pb-3.5 px-2 -my-2 snap-x scroll-smooth items-center">
              {Object.keys(ANIMAL_DATA).map((key) => {
                const item = ANIMAL_DATA[key];
                const isActive = currentKey === key;
                const isLocked = Boolean(item.isLocked);
                return (
                  <motion.div
                    key={key}
                    role="button"
                    aria-label={item.name}
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAnimalSelect(key)}
                    className={`group snap-start shrink-0 w-24 h-24 sm:w-26 sm:h-26 tablet:w-28 tablet:h-28 lg:w-34 lg:h-34 rounded-xl tablet:rounded-2xl overflow-hidden relative cursor-pointer border-2 tablet:border-3 transition-all duration-300 origin-center bg-[#07241d] ${
                      isLocked
                        ? 'border-white/10 opacity-60 grayscale hover:opacity-90 hover:z-10'
                        : isActive 
                          ? 'border-[#f5a623] shadow-lg shadow-[#f5a623]/30 scale-105 z-20 ring-2 ring-[#ffddb4]' 
                          : 'border-white/15 opacity-85 hover:opacity-100 hover:border-white/45 hover:z-10'
                    }`}
                  >
                    <SafeAnimalImage
                      animalKey={key}
                      src={item.img}
                      emoji={item.emoji}
                      className="absolute inset-0 w-full h-full object-cover object-center scale-[1.03] transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />
                    {isLocked ? (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-1.5">
                        <Lock className="w-5 h-5 tablet:w-6 tablet:h-6 text-[#f5a623] mb-0.5" />
                        <span className="text-[#ffc880] font-black text-[8px] tablet:text-[9px] uppercase tracking-wider">Terkunci</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-1.5 left-2 right-2 z-10 pointer-events-none">
                        <span className="text-white font-black text-[10px] tablet:text-[11px] block leading-tight truncate drop-shadow-sm">
                          {item.name}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* VIP Parental Modal */}
        <AnimatePresence>
          {isVipModalOpen && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
               <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsVipModalOpen(false)}
                className="absolute inset-0"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-lg bg-[#132f27] border-4 border-[#f5a623] rounded-[3rem] shadow-2xl overflow-hidden p-8 flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-xl font-black text-[#ffc880]">{vipAnimalName}</h3>
                   </div>
                   <button onClick={() => setIsVipModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><X /></button>
                </div>

                <div className="bg-[#07241d] p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-[#ffc880] bg-black/40 px-6 py-3 rounded-2xl border border-[#f5a623]/30">6 + 4 = ?</span>
                      <input 
                        type="number" 
                        value={mathAnswer}
                        onChange={(e) => {
                          setMathAnswer(e.target.value);
                          setMathError(false);
                        }}
                        placeholder="?"
                        className="flex-1 bg-black/20 border-2 border-white/10 rounded-2xl px-4 py-3 text-center text-2xl font-black text-[#ffc880] focus:border-[#f5a623] outline-none"
                      />
                   </div>
                   {mathError && <span className="text-red-400 text-xs font-black text-center">Coba lagi</span>}
                   <button 
                    onClick={handleVipSubmit}
                    className="w-full bg-[#f5a623] text-[#644000] py-4 rounded-2xl font-black text-lg shadow-xl"
                   >
                     Buka Akses
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 right-8 z-[150] bg-[#1e3a31]/95 border-2 border-[#ffc880]/60 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center max-w-sm"
            >
              <span className="text-xs text-white font-bold leading-tight">{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>
    </div>
  );
};
