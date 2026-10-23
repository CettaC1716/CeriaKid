import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { speakTextUtterance, cancelSpeechSynthesis } from '../utils/speechUtils';
import { ChildProfile } from '../types';

interface WelcomeScreenProps {
  savedProfile?: ChildProfile | null;
  onStartRegistration: () => void;
  onSignInExisting?: () => void;
  onDirectEnter?: () => void;
}

const ARTWORK_SLIDES = [
  {
    src: '/assets/videos/slide3.mp4',
    poster: '/assets/aistudio/screen_008e1912.png',
    title: 'Pohon Ilmu Pengetahuan',
    artist: 'Pustaka Petualang Budi',
    description:
      'Yuk, jelajahi ribuan cerita seru dan temukan keajaiban dunia bersama teman-teman baru!',
  },
  {
    src: '/assets/videos/slide1.mp4',
    poster: '/assets/aistudio/screen_f0146edf.png',
    title: 'Kanvas Kreasi Pelangi',
    artist: 'Taman Seni CeriaKids',
    description:
      'Ruang belajar interaktif yang seru untuk membaca, bermain, dan mengasah kreativitas setiap hari.',
  },
  {
    src: '/assets/videos/slide2.mp4',
    poster: '/assets/aistudio/screen_5621e1c4.png',
    title: 'Petualangan Langit Origami',
    artist: 'Studio Origami Nusantara',
    description:
      'Buka bukumu, mulai petualangan serumu, dan jadilah bintang penjelajah cilik yang hebat!',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  savedProfile,
  onStartRegistration,
  onSignInExisting,
  onDirectEnter,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % ARTWORK_SLIDES.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % ARTWORK_SLIDES.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  // Auto-transition from Splash Screen to Homescreen after ~2.2s when an already-registered child opens the app
  useEffect(() => {
    if (!savedProfile || !onDirectEnter) return;
    const splashTimer = setTimeout(() => {
      onDirectEnter();
    }, 2200);
    return () => clearTimeout(splashTimer);
  }, [savedProfile, onDirectEnter]);

  useEffect(() => {
    return () => {
      cancelSpeechSynthesis();
    };
  }, []);

  const handleVoiceGreeting = () => {
    playPopSound();
    setIsSpeaking(true);
    speakTextUtterance(
      'Selamat datang di CeriaKids! Yuk mulai petualangan kreatifmu di dunia origami Nusantara!',
      {
        lang: 'id-ID',
        rate: 1.05,
        pitch: 1.2,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  const currentArtwork = ARTWORK_SLIDES[activeSlide];

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none p-3 sm:p-5 md:p-7"
      style={{
        background:
          'linear-gradient(135deg, #BDE9FF 0%, #DFF6FF 28%, #F2ECFF 68%, #FAD9FF 100%)',
      }}
    >
      {/* Subtle iridescent pastel ambient glows matching splash screen border */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-70"
        style={{ background: 'radial-gradient(circle, #93E5FF 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-65"
        style={{ background: 'radial-gradient(circle, #F5C2FF 0%, transparent 70%)' }}
      />
      <div
        className="absolute -top-20 right-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-60"
        style={{ background: 'radial-gradient(circle, #C8F7FF 0%, transparent 70%)' }}
      />

      {/* ================= MAIN SPLASH CARD CONTAINER ================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full h-full max-w-[1360px] max-h-[860px] bg-white rounded-[28px] sm:rounded-[38px] shadow-[0_25px_70px_rgba(15,23,42,0.08)] grid grid-cols-1 tablet:grid-cols-2 overflow-hidden"
      >
        {/* ================= LEFT COLUMN: CLEAN EDITORIAL SPLASH INFO ================= */}
        <div className="flex flex-col justify-between px-7 py-6 sm:px-12 sm:py-8 lg:px-16 lg:py-9 bg-white h-full overflow-y-auto">
          {/* Top Bar with Audio Greeting - Fixed static position */}
          <div className="flex items-center justify-end w-full shrink-0">
            <button
              type="button"
              onClick={handleVoiceGreeting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F5F6F8] hover:bg-[#ECEEF2] text-[#4B5563] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  isSpeaking ? 'text-[#FF9A00] animate-pulse' : 'text-[#6B7280]'
                }`}
              />
              <span>Sapaan Suara</span>
            </button>
          </div>

          {/* Center Brand Lockup & Actions - Static stable container */}
          <div className="flex-1 flex flex-col items-start justify-center w-full py-1 sm:py-2">
            {/* 1. Static Brand Header Container: Mascot Icon, Badge & 3D Logo (Locked, independent) */}
            <div className="shrink-0 flex flex-col items-start w-full">
              {/* Stationery Mascot Icon Emblem */}
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                }}
                title="CeriaKids Studio"
                className="group relative flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 mb-3 -ml-0.5"
              >
                <img
                  src="/assets/aistudio/Firefly__9__b3a40846.png"
                  alt="Logo Ikon CeriaKid"
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 object-contain select-none drop-shadow-sm"
                />
              </button>

              {/* Subtle gray label badge */}
              <div className="inline-flex items-center px-3.5 py-1 rounded-[7px] bg-[#F3F4F6] text-[#111827] font-bold text-xs sm:text-[13px] tracking-tight mb-2.5">
                Kurikulum Merdeka
              </div>

              {/* Hero 3D CeriaKid Wordmark - Large & Proportional */}
              <div className="relative overflow-hidden aspect-[721/192] w-full max-w-[270px] sm:max-w-[330px] lg:max-w-[370px] -ml-1.5 select-none">
                <img
                  src="/assets/aistudio/Firefly__10__ee51bc02.png"
                  alt="CeriaKid"
                  className="absolute max-w-none w-[176.28%] h-[289.58%] left-[-68.93%] top-[-95.83%] select-none pointer-events-none"
                />
              </div>
            </div>

            {/* 2. Fixed-Height Description Container - Locks height so changing sentences never shift the header or buttons */}
            <div className="w-full max-w-md h-[4.75rem] sm:h-[4.5rem] lg:h-[4.75rem] mt-3.5 sm:mt-4 mb-5 sm:mb-6 flex items-start overflow-hidden shrink-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeSlide}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="text-sm sm:text-base lg:text-[16px] text-[#64748B] font-medium leading-relaxed"
                >
                  {currentArtwork.description}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* 3. Static Action Controls Container - Preserves exact spacing and sizing */}
            <div className="shrink-0 flex flex-col items-start gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  playCheerSound();
                  onStartRegistration();
                }}
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-[#FF7A00] via-[#FF5400] to-[#FF0055] hover:from-[#FF8C1A] hover:via-[#FF6611] hover:to-[#FF1F6D] text-white font-black text-sm sm:text-base lg:text-[17px] shadow-[0_10px_25px_-4px_rgba(255,84,0,0.45)] hover:shadow-[0_14px_30px_-4px_rgba(255,84,0,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse shrink-0" />
                <span>Mulai Petualangan Baru</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  if (onSignInExisting) onSignInExisting();
                  else if (onDirectEnter) onDirectEnter();
                }}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:via-[#0284C7] hover:to-[#0EA5E9] text-white font-extrabold text-xs sm:text-sm lg:text-[15px] shadow-[0_8px_20px_-4px_rgba(2,132,199,0.38)] hover:shadow-[0_12px_25px_-4px_rgba(2,132,199,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Masuk Kartu Petualang</span>
              </button>
            </div>
          </div>


        </div>

        {/* ================= RIGHT COLUMN: INSET ROUNDED VIDEO CAROUSEL SHOWCASE ================= */}
        <div className="p-2.5 sm:p-3.5 lg:p-4 h-full min-h-[260px] flex">
          <div
            onClick={() => {
              playPopSound();
              goToNextSlide();
            }}
            className="relative w-full h-full rounded-[22px] sm:rounded-[28px] overflow-hidden bg-gradient-to-br from-[#312E81] via-[#6D28D9] to-[#EC4899] cursor-pointer group"
          >
            <AnimatePresence initial={false}>
              <motion.video
                key={currentArtwork.src}
                src={currentArtwork.src}
                poster={currentArtwork.poster}
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={goToNextSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              />
            </AnimatePresence>

            {/* Subtle bottom-right slide selector dots */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1.5 rounded-full">
              {ARTWORK_SLIDES.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPopSound();
                    setActiveSlide(index);
                  }}
                  aria-label={`Pilih video slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === index
                      ? 'w-5 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
