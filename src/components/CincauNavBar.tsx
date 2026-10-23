import React from 'react';
import { motion } from 'motion/react';
import { playPopSound } from '../utils/audioEffects';
import { ChildProfile } from '../types';

interface CincauNavBarProps {
  childProfile?: ChildProfile | null;
  onOpenProfile?: () => void;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const CincauNavBar: React.FC<CincauNavBarProps> = ({
  onOpenProfile,
  direction = 'horizontal',
  className = '',
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Navigasi Profil Petualang"
      className={`z-40 flex ${
        direction === 'horizontal'
          ? 'flex-row items-center justify-center bg-white/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/85 shadow-lg'
          : 'flex-col items-center justify-center gap-3.5 tablet:gap-4 tablet-md:gap-5 bg-transparent'
      } pointer-events-auto select-none ${className}`}
    >
      {/* Profil / Kartu Petualang Si Kecil (3D Buku Profil Pink) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={(e) => {
          e.stopPropagation();
          playPopSound();
          if (onOpenProfile) onOpenProfile();
        }}
        className="relative w-11 h-11 tablet:w-12 tablet:h-12 rounded-2xl bg-gradient-to-b from-rose-100 via-pink-50 to-rose-200 border-2 border-rose-400 ring-2 ring-rose-200/80 shadow-md flex items-center justify-center shrink-0 transition-all cursor-pointer p-1"
        title="Buku Profil & Kartu Petualang Si Kecil"
        aria-label="Buku Profil Si Kecil"
      >
        <img
          src="/assets/ui3d/icon_pink_profile_book_3d.png"
          alt="Buku Profil Petualang"
          className="w-8 h-8 tablet:w-9 tablet:h-9 object-contain filter drop-shadow-[0_3px_5px_rgba(159,18,57,0.35)] select-none pointer-events-none"
          draggable={false}
        />
      </motion.button>
    </motion.nav>
  );
};

