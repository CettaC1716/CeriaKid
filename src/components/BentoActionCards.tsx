import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  playPopSound,
  playCheerSound,
  playFloraChime,
  playFaunaChime,
} from '../utils/audioEffects';

interface BentoActionCardsProps {
  onOpenLearningRoom?: () => void;
  onOpenPlayRoom?: () => void;
  onOpenDrawingStudio?: () => void;
  onOpenChatWithBudi?: () => void;
  className?: string;
  isCompact?: boolean;
  highlightedCardIndex?: 0 | 1 | 2 | 3 | null;
}

type FeatureActionType = 'learn' | 'play' | 'draw';

const SPARK_COLORS = ['#a3e635', '#38bdf8', '#fb923c', '#facc15', '#f43f5e', '#818cf8'];

const BENTO_IMAGES = {
  membaca: '/assets/aistudio/screen_008e1912.png',
  mainGame: '/assets/aistudio/screen_5621e1c4.png',
  menggambar: '/assets/aistudio/screen_f0146edf.png',
  mengobrolBudi: '/mascots/origami_sd/avatar_closeup.webp',
};

const FEATURE_LOADING_VIDEOS: Record<FeatureActionType, string> = {
  learn: '/assets/videos/slide3.mp4',
  play: '/assets/videos/slide2.mp4',
  draw: '/assets/videos/slide1.mp4',
};

const FEATURE_LOADING_META: Record<
  FeatureActionType,
  { label: string; barGradient: string; dotColor: string }
> = {
  learn: {
    label: 'Ruang Membaca',
    barGradient: 'from-[#a3e635] via-[#34d399] to-[#38bdf8]',
    dotColor: 'bg-[#a3e635]',
  },
  play: {
    label: 'Pulau Petualang',
    barGradient: 'from-[#38bdf8] via-[#60a5fa] to-[#a3e635]',
    dotColor: 'bg-[#38bdf8]',
  },
  draw: {
    label: 'Studio Gambar',
    barGradient: 'from-[#facc15] via-[#fb923c] to-[#f472b6]',
    dotColor: 'bg-[#facc15]',
  },
};

const VIDEO_START_TIME = 2.0;

export const BentoActionCards: React.FC<BentoActionCardsProps> = ({
  onOpenLearningRoom,
  onOpenPlayRoom,
  onOpenDrawingStudio,
  onOpenChatWithBudi,
  className = '',
  isCompact = false,
  highlightedCardIndex = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasSeekedRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);
  const [activeLoadingFeature, setActiveLoadingFeature] = useState<FeatureActionType | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(8);

  const playVideoWithExistingAudio = useCallback((vid: HTMLVideoElement) => {
    vid.muted = false;
    vid.volume = 1.0;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }
  }, []);

  const completeVideoTransition = useCallback(
    (feature: FeatureActionType | null) => {
      if (!feature || hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      setLoadingProgress(100);

      if (feature === 'learn') {
        playFloraChime();
        onOpenLearningRoom?.();
      } else if (feature === 'play') {
        playFaunaChime();
        onOpenPlayRoom?.();
      } else if (feature === 'draw') {
        playCheerSound();
        onOpenDrawingStudio?.();
      }

      requestAnimationFrame(() => {
        setActiveLoadingFeature(null);
      });
    },
    [onOpenLearningRoom, onOpenPlayRoom, onOpenDrawingStudio]
  );

  useEffect(() => {
    if (!activeLoadingFeature) {
      hasSeekedRef.current = false;
      hasCompletedRef.current = false;
      setLoadingProgress(8);
      return;
    }

    const vid = videoRef.current;
    if (vid && vid.readyState >= 1 && !hasSeekedRef.current) {
      try {
        vid.currentTime = VIDEO_START_TIME;
        hasSeekedRef.current = true;
        playVideoWithExistingAudio(vid);
      } catch {
        // Handled by onLoadedMetadata
      }
    }

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => (prev < 92 ? prev + 3 : prev));
    }, 180);

    const fallbackTimer = setTimeout(() => {
      completeVideoTransition(activeLoadingFeature);
    }, 8500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fallbackTimer);
    };
  }, [activeLoadingFeature, completeVideoTransition, playVideoWithExistingAudio]);

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current && !hasSeekedRef.current) {
      try {
        videoRef.current.currentTime = VIDEO_START_TIME;
        hasSeekedRef.current = true;
      } catch {
        // ignore
      }
      playVideoWithExistingAudio(videoRef.current);
    }
  };

  const handleVideoTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration || Number.isNaN(vid.duration)) return;
    const effectiveDuration = Math.max(0.5, vid.duration - VIDEO_START_TIME);
    const elapsed = Math.max(0, vid.currentTime - VIDEO_START_TIME);
    const pct = Math.min(99, Math.max(10, (elapsed / effectiveDuration) * 100));
    setLoadingProgress((prev) => Math.max(prev, pct));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = container.querySelectorAll<HTMLElement>('.tilt-card');

    const handleMouseMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    };

    const handleMouseLeave = (card: HTMLElement) => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    const listeners: { card: HTMLElement; onMove: (e: MouseEvent) => void; onLeave: () => void }[] = [];

    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => handleMouseMove(e, card);
      const onLeave = () => handleMouseLeave(card);

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      listeners.push({ card, onMove, onLeave });
    });

    return () => {
      listeners.forEach(({ card, onMove, onLeave }) => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  const spawnSparkles = (e: React.MouseEvent<HTMLElement>, card: HTMLElement) => {
    const rect = card.getBoundingClientRect();
    const originX = e.clientX - rect.left;
    const originY = e.clientY - rect.top;

    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-sparkle';

      const size = Math.floor(Math.random() * 10) + 8;
      const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.4 - 0.2);
      const distance = Math.floor(Math.random() * 50) + 40;
      const tx = `${Math.cos(angle) * distance}px`;
      const ty = `${Math.sin(angle) * distance}px`;

      particle.style.left = `${originX - size / 2}px`;
      particle.style.top = `${originY - size / 2}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty('--tx', tx);
      particle.style.setProperty('--ty', ty);

      particle.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${color}">
        <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/>
      </svg>`;

      card.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    }
  };

  const triggerRipple = (e: React.MouseEvent<HTMLElement>) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    circle.classList.add('ripple-circle');

    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    actionType: FeatureActionType
  ) => {
    if (activeLoadingFeature) return;

    const card = e.currentTarget as HTMLElement;
    spawnSparkles(e, card);
    triggerRipple(e);

    playPopSound();
    if (actionType === 'learn') {
      playCheerSound();
    } else if (actionType === 'play') {
      playFaunaChime();
    } else {
      playFloraChime();
    }

    hasSeekedRef.current = false;
    hasCompletedRef.current = false;
    setLoadingProgress(10);
    setActiveLoadingFeature(actionType);
  };

  const handleChatCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (activeLoadingFeature) return;

    const card = e.currentTarget as HTMLElement;
    spawnSparkles(e, card);
    triggerRipple(e);

    playPopSound();
    playCheerSound();
    onOpenChatWithBudi?.();
  };

  const sharedCardBaseClass =
    'tilt-card flex-1 min-h-[96px] sm:min-h-[104px] tablet:min-h-[106px] lg:min-h-[114px] xl:min-h-[120px] rounded-[24px] tablet:rounded-[28px] bg-white border transition-all duration-300 ease-out cursor-pointer px-4 py-3 sm:px-4.5 sm:py-3.5 tablet:px-5.5 tablet:py-3 lg:px-6 lg:py-3.5 relative flex items-center justify-between overflow-hidden group';

  return (
    <>
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeLoadingFeature && (
              <motion.div
                key={`feature-video-loading-${activeLoadingFeature}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-0 z-[150] w-screen h-screen bg-black overflow-hidden select-none"
              >
                <video
                  ref={videoRef}
                  src={FEATURE_LOADING_VIDEOS[activeLoadingFeature]}
                  autoPlay
                  playsInline
                  preload="auto"
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={() => completeVideoTransition(activeLoadingFeature)}
                  onError={() => completeVideoTransition(activeLoadingFeature)}
                  className="w-full h-full object-cover object-center"
                />

                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-7 sm:pb-10 pt-16 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-[280px] sm:w-[360px] max-w-[88vw] bg-black/45 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.45)] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-[13px] font-extrabold text-white tracking-tight drop-shadow-xs">
                        {FEATURE_LOADING_META[activeLoadingFeature].label}
                      </span>
                      <span className="text-[11px] font-black text-white/90 tabular-nums">
                        {Math.round(loadingProgress)}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 sm:h-3 rounded-full bg-white/20 p-0.5 overflow-hidden border border-white/25">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${FEATURE_LOADING_META[activeLoadingFeature].barGradient} relative overflow-hidden`}
                        initial={{ width: '10%' }}
                        animate={{ width: `${Math.max(10, Math.min(100, loadingProgress))}%` }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <div
        ref={containerRef}
        data-purpose="bento-grid-wrapper"
        className={`relative z-20 flex flex-col ${
          isCompact
            ? 'gap-1.5 sm:gap-2 tablet:gap-2'
            : 'gap-2 sm:gap-2.5 tablet:gap-2.5 lg:gap-3'
        } w-full max-w-[640px] xl:max-w-[680px] tablet:h-full justify-between items-stretch ${className}`}
      >
        {/* CARD 1: Membaca */}
        <section
          onClick={(e) => handleCardClick(e, 'learn')}
          className={`card-enter-1 ${sharedCardBaseClass} ${
            highlightedCardIndex === 0
              ? '-translate-y-1.5 scale-[1.028] border-amber-300 ring-4 ring-amber-300/90 shadow-[0_0_36px_rgba(251,191,36,0.78),0_20px_44px_rgba(15,23,42,0.22)] z-30'
              : 'border-white/95 shadow-[0_12px_28px_rgba(15,23,42,0.14)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 active:scale-[0.985]'
          }`}
        >
          {highlightedCardIndex === 0 && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-200/65 to-transparent -skew-x-12 pointer-events-none z-30"
            />
          )}
          <div className="relative z-20 w-[62%] sm:w-[59%] tablet:w-[58%] pr-2 select-none flex flex-col justify-center gap-2 h-full">
            <h2 className="text-xl sm:text-2xl tablet:text-[23px] lg:text-[25px] font-black text-[#0f172a] tracking-tight leading-tight group-hover:text-black transition-colors font-sans">
              Membaca
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="interactive-btn btn-lime-pulse inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-b from-[#bef264] via-[#a3e635] to-[#65a30d] text-[#1a2e05] font-black text-xs sm:text-sm border border-lime-200/90 shadow-[0_3px_0_#3f6212,0_6px_14px_rgba(101,163,13,0.38),inset_0_1.5px_1px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_1px_0_#3f6212] transition-all duration-200 hover:brightness-105 cursor-pointer focus:outline-none"
              >
                <span className="tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
                  Mulai Baca
                </span>
              </button>
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-lime-100/90 text-lime-800 border border-lime-300 shadow-xs whitespace-nowrap">
                Buku &amp; Dongeng
              </span>
            </div>
          </div>

          <div
            className="
              absolute inset-y-0 right-0 z-10
              w-[55%] sm:w-[54%] tablet:w-[53%]
              pointer-events-none select-none overflow-hidden
            "
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
            }}
          >
            <img
              alt="Membaca"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              src={BENTO_IMAGES.membaca}
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* CARD 2: Berpetualang */}
        <section
          onClick={(e) => handleCardClick(e, 'play')}
          className={`card-enter-2 ${sharedCardBaseClass} ${
            highlightedCardIndex === 1
              ? '-translate-y-1.5 scale-[1.028] border-sky-300 ring-4 ring-amber-300/90 shadow-[0_0_36px_rgba(251,191,36,0.78),0_20px_44px_rgba(15,23,42,0.22)] z-30'
              : 'border-white/95 shadow-[0_12px_28px_rgba(15,23,42,0.14)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 active:scale-[0.985]'
          }`}
        >
          {highlightedCardIndex === 1 && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-200/65 to-transparent -skew-x-12 pointer-events-none z-30"
            />
          )}
          <div className="relative z-20 w-[62%] sm:w-[59%] tablet:w-[58%] pr-2 select-none flex flex-col justify-center gap-2 h-full">
            <h3 className="text-xl sm:text-2xl tablet:text-[23px] lg:text-[25px] font-black text-[#0f172a] tracking-tight leading-tight font-sans">
              Berpetualang
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="interactive-btn inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] text-white font-black text-xs sm:text-sm border border-sky-200/80 shadow-[0_3px_0_#0369a1,0_6px_14px_rgba(14,165,233,0.38),inset_0_1.5px_1px_rgba(255,255,255,0.65)] active:translate-y-0.5 active:shadow-[0_1px_0_#0369a1] transition-all duration-200 hover:brightness-105 cursor-pointer focus:outline-none"
              >
                <span className="tracking-tight drop-shadow-[0_1px_1px_rgba(3,105,161,0.55)]">
                  Mulai Main
                </span>
              </button>
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-sky-100/90 text-sky-800 border border-sky-300 shadow-xs whitespace-nowrap">
                Peta Level
              </span>
            </div>
          </div>

          <div
            className="
              absolute inset-y-0 right-0 z-10
              w-[55%] sm:w-[54%] tablet:w-[53%]
              pointer-events-none select-none overflow-hidden
            "
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
            }}
          >
            <img
              alt="Berpetualang"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              src={BENTO_IMAGES.mainGame}
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* CARD 3: Menggambar */}
        <section
          onClick={(e) => handleCardClick(e, 'draw')}
          className={`card-enter-3 ${sharedCardBaseClass} ${
            highlightedCardIndex === 2
              ? '-translate-y-1.5 scale-[1.028] border-amber-300 ring-4 ring-amber-300/90 shadow-[0_0_36px_rgba(251,191,36,0.78),0_20px_44px_rgba(15,23,42,0.22)] z-30'
              : 'border-white/95 shadow-[0_12px_28px_rgba(15,23,42,0.14)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 active:scale-[0.985]'
          }`}
        >
          {highlightedCardIndex === 2 && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-200/65 to-transparent -skew-x-12 pointer-events-none z-30"
            />
          )}
          <div className="relative z-20 w-[62%] sm:w-[59%] tablet:w-[58%] pr-2 select-none flex flex-col justify-center gap-2 h-full">
            <h3 className="text-xl sm:text-2xl tablet:text-[23px] lg:text-[25px] font-black text-[#0f172a] tracking-tight leading-tight font-sans">
              Menggambar
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="interactive-btn inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-b from-[#fde047] via-[#fbbf24] to-[#f97316] text-[#451a03] font-black text-xs sm:text-sm border border-amber-200/90 shadow-[0_3px_0_#b45309,0_6px_14px_rgba(245,158,11,0.38),inset_0_1.5px_1px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_1px_0_#b45309] transition-all duration-200 hover:brightness-105 cursor-pointer focus:outline-none"
              >
                <span className="tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
                  Mulai Gambar
                </span>
              </button>
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-100/90 text-amber-800 border border-amber-300 shadow-xs whitespace-nowrap">
                Studio Melukis
              </span>
            </div>
          </div>

          <div
            className="
              absolute inset-y-0 right-0 z-10
              w-[55%] sm:w-[54%] tablet:w-[53%]
              pointer-events-none select-none overflow-hidden
            "
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
            }}
          >
            <img
              alt="Menggambar"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              src={BENTO_IMAGES.menggambar}
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* CARD 4: Mengobrol */}
        <section
          onClick={handleChatCardClick}
          className={`card-enter-3 ${sharedCardBaseClass} ${
            highlightedCardIndex === 3
              ? '-translate-y-1.5 scale-[1.028] border-violet-300 ring-4 ring-amber-300/90 shadow-[0_0_36px_rgba(251,191,36,0.78),0_20px_44px_rgba(15,23,42,0.22)] z-30'
              : 'border-white/95 shadow-[0_12px_28px_rgba(15,23,42,0.14)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 active:scale-[0.985]'
          }`}
        >
          {highlightedCardIndex === 3 && (
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-200/65 to-transparent -skew-x-12 pointer-events-none z-30"
            />
          )}
          <div className="relative z-20 w-[62%] sm:w-[59%] tablet:w-[58%] pr-2 select-none flex flex-col justify-center gap-2 h-full">
            <h3 className="text-xl sm:text-2xl tablet:text-[23px] lg:text-[25px] font-black text-[#0f172a] tracking-tight leading-tight font-sans">
              Mengobrol
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="interactive-btn inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-b from-[#a855f7] via-[#8b5cf6] to-[#6d28d9] text-white font-black text-xs sm:text-sm border border-purple-300/80 shadow-[0_3px_0_#4c1d95,0_6px_14px_rgba(124,58,237,0.38),inset_0_1.5px_1px_rgba(255,255,255,0.65)] active:translate-y-0.5 active:shadow-[0_1px_0_#4c1d95] transition-all duration-200 hover:brightness-105 cursor-pointer focus:outline-none"
              >
                <span className="tracking-tight drop-shadow-[0_1px_1px_rgba(76,29,149,0.55)]">
                  Ayo Ngobrol
                </span>
              </button>
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-purple-100/90 text-purple-800 border border-purple-300 shadow-xs whitespace-nowrap">
                Sahabat Ceria
              </span>
            </div>
          </div>

          <div
            className="
              absolute inset-y-0 right-0 z-10
              w-[55%] sm:w-[54%] tablet:w-[53%]
              pointer-events-none select-none overflow-hidden
              bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-400
            "
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 10%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0.68) 42%, rgba(0,0,0,0.92) 58%, #000000 72%)',
            }}
          >
            <div className="absolute -top-6 right-4 w-24 h-24 rounded-full bg-amber-300/45 blur-xl" />
            <div className="absolute bottom-0 right-16 w-20 h-20 rounded-full bg-sky-300/35 blur-lg" />

            <img
              alt="Mengobrol"
              className="w-full h-full object-contain object-bottom scale-110 translate-x-3 translate-y-1.5 transition-transform duration-700 ease-out group-hover:scale-118 drop-shadow-[0_8px_16px_rgba(15,23,42,0.35)]"
              src={BENTO_IMAGES.mengobrolBudi}
              referrerPolicy="no-referrer"
            />
          </div>
        </section>
      </div>
    </>
  );
};
