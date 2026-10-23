import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChildProfile, SkyThemeId } from '../types';
import { MemberCard, INTEREST_STICKERS } from './MemberCard';
import { playPopSound } from '../utils/audioEffects';
import { BIOMES_DATA, BiomeKey } from '../data/biomes';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  childProfile: ChildProfile | null;
  onLogout?: () => void;
  onEditProfile?: () => void;
  skyTheme?: SkyThemeId;
  onSelectSkyTheme?: (theme: SkyThemeId) => void;
}

const BOOKMARK_TABS = [
  { id: 'pink', label: 'Profil', bg: 'from-pink-400 to-rose-500', border: 'border-rose-700', top: 'top-[14%]' },
  { id: 'blue', label: 'Poin', bg: 'from-sky-400 to-blue-600', border: 'border-blue-800', top: 'top-[32%]' },
  { id: 'green', label: 'Progres', bg: 'from-emerald-400 to-green-600', border: 'border-green-800', top: 'top-[50%]' },
  { id: 'purple', label: 'Ortu', bg: 'from-purple-400 to-violet-600', border: 'border-violet-800', top: 'top-[68%]' },
];

const SKY_TIME_OPTIONS: {
  id: SkyThemeId;
  icon: string;
  label: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}[] = [
  {
    id: 'morning',
    icon: '☀️',
    label: 'Pagi',
    activeBg: 'bg-gradient-to-b from-sky-400 to-blue-500 text-white shadow-[0_4px_0_#1d4ed8]',
    activeBorder: 'border-blue-700',
    activeText: 'text-white',
  },
  {
    id: 'sunset',
    icon: '🌅',
    label: 'Sore',
    activeBg: 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-[0_4px_0_#c2410c]',
    activeBorder: 'border-orange-700',
    activeText: 'text-white',
  },
  {
    id: 'night',
    icon: '🌙',
    label: 'Malam',
    activeBg: 'bg-gradient-to-b from-indigo-500 to-purple-700 text-white shadow-[0_4px_0_#312e81]',
    activeBorder: 'border-indigo-900',
    activeText: 'text-white',
  },
];

const REPORT_BIOMES: { key: BiomeKey; label: string }[] = [
  { key: 'pantai', label: 'Literasi Nusantara' },
  { key: 'sawah', label: 'Sains & Ekologi' },
  { key: 'hutan', label: 'Numerasi & Logika' },
  { key: 'karya', label: 'Kreativitas & Seni' },
];

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  childProfile,
  onLogout,
  onEditProfile,
  skyTheme = 'sunset',
  onSelectSkyTheme,
}) => {
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const adventurerStats = useMemo(() => {
    let stars = 12;
    let xp = 240;
    let artworks = 2;

    if (typeof window !== 'undefined') {
      try {
        const rawTama = localStorage.getItem('cincau_tamagotchi_state');
        if (rawTama) {
          const parsed = JSON.parse(rawTama);
          if (typeof parsed?.starPoints === 'number') {
            stars = parsed.starPoints;
            xp = stars * 25 + 60;
          }
        }
        const rawDrawings = localStorage.getItem('ceriakids_saved_drawings');
        if (rawDrawings) {
          const parsedDrawings = JSON.parse(rawDrawings);
          if (Array.isArray(parsedDrawings)) {
            artworks = Math.max(1, parsedDrawings.length);
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    return { stars, xp, artworks };
  }, [isOpen]);

  const phaseLabel = useMemo(() => {
    const fase = childProfile?.fase || 'A';
    if (fase === 'A') return 'Fase A (Kelas 1–2 SD)';
    if (fase === 'B') return 'Fase B (Kelas 3–4 SD)';
    return 'Fase C (Kelas 5–6 SD)';
  }, [childProfile]);

  const childInterestsLabel = useMemo(() => {
    if (childProfile?.stickers && childProfile.stickers.length > 0) {
      const names = childProfile.stickers
        .map((id) => INTEREST_STICKERS.find((s) => s.id === id)?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    if (childProfile?.skills && childProfile.skills.length > 0) {
      return childProfile.skills.join(', ');
    }
    return childProfile?.favoriteSubject || 'Membaca, Berhitung & Menggambar';
  }, [childProfile]);

  const positiveBudiNote = useMemo(() => {
    const name = childProfile?.name || 'Petualang Cilik';
    const duration = childProfile?.playDuration || '30 Menit';
    if (adventurerStats.stars >= 15) {
      return `Hebat sekali! ${name} sangat aktif menyelesaikan tantangan literasi, logika, dan kreativitas dengan penuh percaya diri!`;
    }
    return `${name} menunjukkan rasa ingin tahu yang tinggi saat bereksplorasi. Terus dampingi sesi bermain-belajar harian (${duration}/hari) ya, Ayah & Bunda!`;
  }, [childProfile, adventurerStats.stars]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5 bg-rose-950/65 backdrop-blur-md overflow-y-auto"
          style={{ perspective: '1200px' }}
          onClick={() => {
            playPopSound();
            onClose();
          }}
        >
          {/* 3D Open Pink Notebook Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.78, rotateY: -38, rotateX: 8, y: 24 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotateY: -25, y: 16 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.9 }}
            style={{ transformStyle: 'preserve-3d' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[920px] my-auto pr-4 sm:pr-7"
          >
            {/* 4 Colorful Bookmark Tabs on the Right Edge of the Book */}
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-11 pointer-events-none z-0">
              {BOOKMARK_TABS.map((tab, idx) => (
                <motion.div
                  key={tab.id}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.16 + idx * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                  className={`absolute ${tab.top} right-0 w-9 sm:w-12 h-14 sm:h-16 rounded-r-2xl bg-gradient-to-r ${tab.bg} border-2 border-l-0 ${tab.border} shadow-[0_5px_0_rgba(0,0,0,0.22)] flex items-center justify-end pr-1.5 sm:pr-2`}
                >
                  <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-tighter [writing-mode:vertical-rl] rotate-180 drop-shadow-sm select-none">
                    {tab.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Thick Pink 3D Hardcover Outer Shell */}
            <div className="relative z-10 w-full rounded-[2rem] sm:rounded-[2.4rem] bg-gradient-to-b from-[#FF7EB3] via-[#F43F5E] to-[#E11D48] p-2.5 sm:p-4 border-4 border-[#881337] shadow-[0_14px_0_#881337,0_26px_50px_rgba(0,0,0,0.5)]">
              {/* Top Glossy Hardcover Highlight & Decorative Stitch Border */}
              <div className="w-full rounded-[1.6rem] sm:rounded-[2rem] border-2 border-dashed border-pink-200/55 p-1.5 sm:p-2.5 bg-gradient-to-b from-pink-500/35 to-rose-700/35">
                {/* Stacked Cream Paper Pages Edge Effect (3D page thickness) */}
                <div className="relative w-full rounded-[1.35rem] sm:rounded-[1.65rem] bg-[#E8DEC8] pb-1.5 pr-1 shadow-inner">
                  {/* Main 2-Page Open Cream Spread */}
                  <div className="relative w-full rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#FFFDF6] border-2 border-[#D6C7B2] shadow-inner overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    {/* Center Book Spine Shadow & Stitching Crease (Desktop/Tablet 2-page divider) */}
                    <div
                      aria-hidden="true"
                      className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 z-20 pointer-events-none flex-col items-center justify-evenly"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(180,145,110,0) 0%, rgba(138,98,64,0.18) 38%, rgba(92,58,33,0.34) 50%, rgba(138,98,64,0.18) 62%, rgba(180,145,110,0) 100%)',
                      }}
                    >
                      {/* Center Notebook Rings / Stitches */}
                      {[0, 1, 2, 3, 4, 5].map((stitch) => (
                        <div
                          key={stitch}
                          className="w-5 h-2.5 rounded-full bg-gradient-to-b from-rose-200 via-pink-300 to-rose-400 border border-rose-700/60 shadow-sm"
                        />
                      ))}
                    </div>

                    {/* =========================================================
                        LEFT PAGE: Kartu Pelajar, Ubah Profil, Waktu Latar & Quit
                       ========================================================= */}
                    <div className="relative p-4 sm:p-6 md:pr-7 flex flex-col justify-between bg-gradient-to-br from-[#FFFDF7] via-[#FFF9ED] to-[#FDF3DF] border-b-2 md:border-b-0 border-dashed border-[#E2D4C0]">
                      <div>
                        {/* Left Page Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src="/assets/ui3d/icon_pink_profile_book_3d.png"
                              alt="Buku Profil Pink"
                              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_4px_6px_rgba(225,29,72,0.3)]"
                            />
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-[#4A2511] leading-tight">
                                Kartu Petualang
                              </h3>
                            </div>
                          </div>

                          {/* Mobile-only Close Button */}
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound();
                              onClose();
                            }}
                            className="md:hidden px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 active:translate-y-0.5 text-white font-black text-xs border-2 border-rose-800 shadow-[0_3px_0_#881337] flex items-center justify-center cursor-pointer"
                          >
                            <span>Tutup</span>
                          </button>
                        </div>

                        {/* Official MerdekaKids Club Student Card (Supports Tap to Flip Front/Back) */}
                        <div className="w-full flex flex-col items-center">
                          <MemberCard
                            childProfile={childProfile}
                            isFlipped={isCardFlipped}
                            onFlip={setIsCardFlipped}
                          />

                          <div className="mt-2 flex items-center justify-between w-full max-w-[340px] gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                playPopSound();
                                setIsCardFlipped((prev) => !prev);
                              }}
                              className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200/80 active:translate-y-0.5 text-amber-950 font-black text-xs border-2 border-amber-300 shadow-[0_3px_0_#fcd34d] flex items-center justify-center transition-all cursor-pointer shrink-0"
                            >
                              <span>Putar Kartu</span>
                            </button>

                            {/* Clean "Ubah Profil" Button Right Below Student Card */}
                            {onEditProfile && (
                              <button
                                type="button"
                                onClick={() => {
                                  playPopSound();
                                  onClose();
                                  onEditProfile();
                                }}
                                className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-b from-pink-400 to-rose-500 hover:from-pink-300 hover:to-rose-400 active:translate-y-0.5 text-white font-black text-xs sm:text-sm border-2 border-rose-800 shadow-[0_4px_0_#9f1239] flex items-center justify-center transition-all cursor-pointer"
                              >
                                <span>Ubah Profil</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Controls: 3 Homescreen Time-of-Day Background Icons + Quit Button */}
                      <div className="mt-3 pt-3 border-t-2 border-dashed border-amber-900/15 flex flex-col gap-2.5">
                        {/* 3 Ikon Pengubah Suasana Waktu Latar Belakang Homescreen */}
                        <div className="bg-amber-100/55 rounded-2xl p-2.5 border-2 border-amber-200/80">
                          <div className="flex items-center justify-between mb-1.5 px-0.5">
                            <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">
                              Suasana Latar
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {SKY_TIME_OPTIONS.map((item) => {
                              const isActive = skyTheme === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    playPopSound();
                                    if (onSelectSkyTheme) {
                                      onSelectSkyTheme(item.id);
                                    }
                                  }}
                                  className={`py-2 px-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer active:translate-y-0.5 ${
                                    isActive
                                      ? `${item.activeBg} ${item.activeBorder} scale-[1.02]`
                                      : 'bg-white/90 hover:bg-white border-amber-300/90 text-amber-950 shadow-[0_3px_0_#e5d3b3]'
                                  }`}
                                >
                                  <span className="text-lg sm:text-xl leading-none mb-1 drop-shadow-sm">
                                    {item.icon}
                                  </span>
                                  <span
                                    className={`text-[10px] sm:text-[11px] font-black leading-tight ${
                                      isActive ? item.activeText : 'text-amber-950'
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tombol Quit / Keluar di Bagian Bawah Halaman Kiri */}
                        {onLogout && (
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound();
                              onClose();
                              onLogout();
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:translate-y-0.5 text-rose-700 font-black text-xs sm:text-sm border-2 border-rose-300 shadow-[0_3px_0_#fda4af] flex items-center justify-center transition-all cursor-pointer"
                          >
                            <span>Keluar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* =========================================================
                        RIGHT PAGE: Lined Notebook Page — Poin & Catatan Orang Tua
                       ========================================================= */}
                    <div
                      className="relative p-4 sm:p-5 pl-8 sm:pl-10 md:pl-12 flex flex-col justify-between overflow-hidden"
                      style={{
                        backgroundColor: '#FFFDF7',
                        backgroundImage:
                          'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(244, 114, 182, 0.22) 28px)',
                      }}
                    >
                      {/* Vertical Notebook Margin Line */}
                      <div
                        aria-hidden="true"
                        className="absolute top-0 bottom-0 left-5 sm:left-6 md:left-8 w-[2px] bg-rose-400/70 pointer-events-none"
                      />

                      <div className="relative z-10 flex flex-col gap-2.5">
                        {/* Top Header & "Tutup" Capsule Button in Top-Right Corner */}
                        <div className="flex items-center justify-between gap-2 h-[28px] mb-1">
                          <h3 className="text-base sm:text-lg font-black text-[#4A2511] leading-[28px]">
                            Laporan Belajar
                          </h3>

                          <button
                            type="button"
                            onClick={() => {
                              playPopSound();
                              onClose();
                            }}
                            className="px-3.5 py-1 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:translate-y-0.5 text-white font-black text-xs border-2 border-rose-900 shadow-[0_3px_0_#881337] flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            <span>Tutup</span>
                          </button>
                        </div>

                        {/* Panel Poin & Pencapaian Petualang (Pas di Garis Vertikal & Horisontal Buku) */}
                        <div className="grid grid-cols-3 gap-2 py-1 border-b border-rose-200/60 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-base sm:text-lg font-black text-amber-950 leading-tight">
                              {adventurerStats.stars}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-800 uppercase tracking-tight">
                              Total Bintang
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <span className="text-base sm:text-lg font-black text-sky-950 leading-tight">
                              {adventurerStats.xp} XP
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-sky-800 uppercase tracking-tight">
                              Poin Petualang
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <span className="text-base sm:text-lg font-black text-pink-950 leading-tight">
                              {adventurerStats.artworks}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-pink-800 uppercase tracking-tight">
                              Karya Lukis
                            </span>
                          </div>
                        </div>

                        {/* Fase Kurikulum Merdeka & Target Belajar */}
                        <div className="flex flex-col gap-1 py-1 border-b border-rose-200/60 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800 leading-[28px]">
                            <span className="text-slate-600">Fase Belajar:</span>
                            <span className="font-black text-indigo-800">
                              {phaseLabel}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-bold text-slate-800 leading-[28px]">
                            <span className="text-slate-600">Durasi Harian:</span>
                            <span className="font-black text-emerald-800">
                              {childProfile?.playDuration || '30 Menit'} / Hari
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-bold text-slate-800 leading-[28px]">
                            <span className="text-slate-600 shrink-0">Minat Utama:</span>
                            <span className="font-black text-rose-800 text-right truncate max-w-[180px]">
                              {childInterestsLabel}
                            </span>
                          </div>
                        </div>

                        {/* Capaian Bioma */}
                        <div className="pt-1 flex flex-col gap-1.5">
                          <h4 className="text-xs font-black text-[#4A2511] uppercase tracking-wider leading-[28px]">
                            Progres Belajar
                          </h4>
                          <div className="space-y-2">
                            {REPORT_BIOMES.map((item) => {
                              const biome = BIOMES_DATA[item.key];
                              return (
                                <div key={item.key} className="flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-800 truncate">
                                      {item.label}
                                    </span>
                                    <span className="text-slate-600 font-black shrink-0">
                                      {biome.ratio} ({biome.progress})
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden border border-stone-300/40">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: biome.progress,
                                        backgroundColor: biome.color,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Catatan Orang Tua dengan Format Tulisan Tangan */}
                        <div className="pt-2 mt-0.5 border-t border-rose-200/60 font-serif italic text-rose-950 leading-snug">
                          <span className="font-extrabold not-italic text-[10px] uppercase tracking-wider text-rose-800 block mb-0.5 font-sans">
                            Catatan Orang Tua:
                          </span>
                          <p className="font-serif italic text-[11px] text-rose-900 leading-relaxed drop-shadow-xs">
                            "{positiveBudiNote}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
