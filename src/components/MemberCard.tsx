import React from 'react';
import { motion } from 'motion/react';
import { QrCode } from 'lucide-react';
import { OrigamiMoodProfileIcon } from './OrigamiIcons';
import { ChildProfile } from '../types';
import { playPopSound } from '../utils/audioEffects';

import { INTEREST_STICKERS as BOARD_STICKERS } from '../data/stickers';

export const INTEREST_STICKERS = [
  ...BOARD_STICKERS.map((s) => ({ id: s.id, emoji: s.icon, name: s.name })),
  { id: 'astronot', emoji: '🚀', name: 'Antariksa' },
  { id: 'dino', emoji: '🦖', name: 'Dinosaurus' },
  { id: 'lukis', emoji: '🎨', name: 'Melukis' },
  { id: 'musik', emoji: '🎵', name: 'Musik & Lagu' },
  { id: 'hewan', emoji: '🐾', name: 'Dunia Hewan' },
  { id: 'hitung', emoji: '🔢', name: 'Teka-Teki Angka' },
  { id: 'cerita', emoji: '📖', name: 'Dongeng Nusantara' },
  { id: 'alam', emoji: '🌿', name: 'Kebun & Alam' },
];

interface MemberCardProps {
  childProfile?: ChildProfile | null;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  childProfile,
  isFlipped,
  onFlip,
}) => {
  const childName = childProfile?.name || 'Bintang';
  const fase = childProfile?.fase || 'A';
  const gender = childProfile?.gender || 'boy';
  const birthDate = childProfile?.birthDate || { day: 12, month: 5, year: 2018 };
  const playDuration = childProfile?.playDuration || '30 Menit';
  const stickers = childProfile?.stickers || ['astronot', 'dino', 'lukis'];
  const memberId = childProfile?.memberId || 'MRDK-2026-VIP';

  return (
    <div
      onClick={() => {
        playPopSound();
        onFlip(!isFlipped);
      }}
      style={{ perspective: '1200px' }}
      className="w-full max-w-[340px] h-[215px] mx-auto cursor-pointer relative select-none"
    >
      <div className="w-full h-full relative">
        {/* CARD FRONT */}
        <motion.div
          initial={false}
          animate={{
            rotateY: isFlipped ? -180 : 0,
            opacity: isFlipped ? 0 : 1,
          }}
          transition={{
            rotateY: { duration: 0.55, type: 'spring', stiffness: 130, damping: 18 },
            opacity: { duration: 0.2, delay: isFlipped ? 0.15 : 0.1 },
          }}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className={`absolute inset-0 w-full h-full rounded-[24px] bg-gradient-to-br from-sky-100 via-teal-100 to-amber-100 p-4 text-slate-800 shadow-md border-2 border-sky-200/90 flex flex-col justify-between overflow-hidden ${
            isFlipped ? 'pointer-events-none' : 'z-10'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/60 blur-md pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-teal-200/50 blur-md pointer-events-none" />

          {/* Top Row: Club Logo & Fase Badge */}
          <div className="flex items-center justify-between z-10">
            <span className="font-black text-xs tracking-wider uppercase text-sky-950 bg-white/95 shadow-2xs px-2.5 py-0.5 rounded-full">
              CeriaKids
            </span>
            <span className="text-[10px] font-black text-teal-950 bg-teal-900/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-teal-900/15">
              Fase {fase}
            </span>
          </div>

          {/* Center Row: Avatar & Child Details */}
          <div className="flex items-center gap-3.5 z-10 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-sm border-2 border-sky-200 shrink-0 flex items-center justify-center relative">
              <OrigamiMoodProfileIcon
                gender={gender}
                className="w-11 h-11 drop-shadow-2xs"
              />
            </div>

            <div className="text-left overflow-hidden">
              <h3 className="text-xl font-black text-slate-800 truncate">
                {childName}
              </h3>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                {birthDate.day}/{birthDate.month}/{birthDate.year}
              </p>
            </div>
          </div>

          {/* Bottom Row: Collected Stickers & ID */}
          <div className="flex items-center justify-between z-10 pt-2 border-t border-slate-700/10">
            <div className="flex items-center gap-1">
              {stickers.slice(0, 4).map((stId) => {
                const st = INTEREST_STICKERS.find((s) => s.id === stId);
                return (
                  <span
                    key={stId}
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs shadow-2xs border border-slate-100"
                  >
                    {st?.emoji}
                  </span>
                );
              })}
            </div>
            <span className="text-[9px] font-mono font-black text-slate-700 bg-white/95 border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              {memberId}
            </span>
          </div>
        </motion.div>

        {/* CARD BACK */}
        <motion.div
          initial={false}
          animate={{
            rotateY: isFlipped ? 0 : 180,
            opacity: isFlipped ? 1 : 0,
          }}
          transition={{
            rotateY: { duration: 0.55, type: 'spring', stiffness: 130, damping: 18 },
            opacity: { duration: 0.2, delay: isFlipped ? 0.1 : 0.15 },
          }}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className={`absolute inset-0 w-full h-full rounded-[24px] bg-gradient-to-br from-teal-50 via-sky-100 to-indigo-100 p-4 text-slate-800 shadow-md border-2 border-teal-200 flex flex-col justify-between overflow-hidden ${
            isFlipped ? 'z-10' : 'pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between border-b border-teal-900/10 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-900">
              Kartu Petualang
            </span>
          </div>

          <div className="flex items-center gap-3 my-auto">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-teal-100 shrink-0">
              <QrCode className="w-14 h-14 text-teal-900" />
            </div>
            <div className="text-left text-[11px] space-y-1">
              <p className="font-extrabold text-slate-800">
                {playDuration}
              </p>
              <p className="font-extrabold text-teal-800">
                Fase {fase}
              </p>
              <p className="font-extrabold text-emerald-600">
                Aktif
              </p>
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-500 flex items-center justify-end pt-1 border-t border-teal-900/10">
            <span>Putar Kartu</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
