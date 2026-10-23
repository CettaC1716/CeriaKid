import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChildProfile } from '../types';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { MengenalHewanModal } from './MengenalHewanModal';
import { FloraInteractiveModal } from './FloraInteractiveModal';
import { DrawingStudioModal } from './DrawingStudioModal';
import { recordBookExplored } from '../utils/progressStorage';
import { cancelSpeechSynthesis } from '../utils/speechUtils';
import {
  SavedBookItem,
  loadSavedBooks,
  toggleBookInChest,
  removeBookFromChest,
  isBookInChest,
} from '../utils/bookChestStorage';

interface ToycadLearningRoomProps {
  onClose: () => void;
  childProfile?: ChildProfile | null;
}

type ShelfSubject = 'all' | 'ipas' | 'seni' | 'bahasa' | 'matematika' | 'pancasila';

const SHELF_BOOKS: {
  subject: ShelfSubject;
  title: string;
  ribbonClass: string;
  spineGradient: string;
  spineBorder: string;
  titleColor: string;
}[] = [
  {
    subject: 'all',
    title: 'Semua',
    ribbonClass: 'from-red-600 via-red-500 to-red-700 border-red-300',
    spineGradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
    spineBorder: 'border-amber-200/90',
    titleColor: 'text-amber-950',
  },
  {
    subject: 'ipas',
    title: 'IPAS',
    ribbonClass: 'from-emerald-500 to-emerald-700 border-emerald-300',
    spineGradient: 'from-[#10b981] via-[#059669] to-[#065f46]',
    spineBorder: 'border-emerald-300/70',
    titleColor: 'text-emerald-50',
  },
  {
    subject: 'seni',
    title: 'Seni',
    ribbonClass: 'from-fuchsia-500 to-fuchsia-700 border-fuchsia-300',
    spineGradient: 'from-[#c026d3] via-[#9333ea] to-[#581c87]',
    spineBorder: 'border-fuchsia-300/70',
    titleColor: 'text-fuchsia-50',
  },
  {
    subject: 'bahasa',
    title: 'Bahasa',
    ribbonClass: 'from-sky-500 to-sky-700 border-sky-300',
    spineGradient: 'from-[#0284c7] via-[#0369a1] to-[#075985]',
    spineBorder: 'border-sky-300/70',
    titleColor: 'text-sky-50',
  },
  {
    subject: 'matematika',
    title: 'Matematika',
    ribbonClass: 'from-orange-500 to-orange-700 border-orange-300',
    spineGradient: 'from-[#ea580c] via-[#c2410c] to-[#9a3412]',
    spineBorder: 'border-orange-300/70',
    titleColor: 'text-orange-50',
  },
  {
    subject: 'pancasila',
    title: 'Pancasila',
    ribbonClass: 'from-red-500 to-red-700 border-red-300',
    spineGradient: 'from-[#dc2626] via-[#b91c1c] to-[#7f1d1d]',
    spineBorder: 'border-red-300/70',
    titleColor: 'text-red-50',
  },
];

export const ToycadLearningRoom: React.FC<ToycadLearningRoomProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'gallery'>('all');
  const [activeSubject, setActiveSubject] = useState<ShelfSubject>('all');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  // Saved Books in Chest (localStorage: ceriakids_saved_books)
  const [savedBooks, setSavedBooks] = useState<SavedBookItem[]>(() => loadSavedBooks());

  useEffect(() => {
    const handleSavedBooksSync = () => setSavedBooks(loadSavedBooks());
    window.addEventListener('ceriakids-saved-books-updated', handleSavedBooksSync);
    return () => window.removeEventListener('ceriakids-saved-books-updated', handleSavedBooksSync);
  }, []);

  // Modals (Preserving FloraInteractiveModal, MengenalHewanModal, DrawingStudioModal)
  const [isMengenalHewanModalOpen, setIsMengenalHewanModalOpen] = useState(false);
  const [initialFaunaSubKey, setInitialFaunaSubKey] = useState<string | undefined>(undefined);
  const [isFloraInteractiveModalOpen, setIsFloraInteractiveModalOpen] = useState(false);
  const [initialFloraSubKey, setInitialFloraSubKey] = useState<string | undefined>(undefined);
  const [isDrawingStudioModalOpen, setIsDrawingStudioModalOpen] = useState(false);

  // Book Highlighter State (Only active when a book is open)
  const [isHighlighterActive, setIsHighlighterActive] = useState(false);

  const isAnyBookOpen = isMengenalHewanModalOpen || isFloraInteractiveModalOpen;

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleToggleSaveBookToChest = (
    book: Omit<SavedBookItem, 'savedAt'>,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    playPopSound();
    const res = toggleBookInChest(book);
    setSavedBooks(res.list);
    showToast(res.saved ? 'Tersimpan' : 'Dihapus');
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current);
      cancelSpeechSynthesis();
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isHighlighterActive) {
          setIsHighlighterActive(false);
        } else if (!isMengenalHewanModalOpen && !isFloraInteractiveModalOpen && !isDrawingStudioModalOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isHighlighterActive,
    isMengenalHewanModalOpen,
    isFloraInteractiveModalOpen,
    isDrawingStudioModalOpen,
    onClose,
  ]);

  const handleFilterBySubject = (subjectKey: ShelfSubject) => {
    playPopSound();
    setActiveTab('all');
    setActiveSubject(subjectKey);

    if (subjectKey === 'ipas') {
      setHighlightedCardId('flora');
      if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedCardId(null);
      }, 1800);
    }
  };

  // Handlers for launching interactive modals
  const handleLaunchFlora = (e?: React.MouseEvent, subKey?: string) => {
    if (e) e.stopPropagation();
    playCheerSound();
    const targetSub = subKey || 'mawar';
    setInitialFloraSubKey(targetSub);
    recordBookExplored('flora', targetSub);
    setIsFloraInteractiveModalOpen(true);
  };

  const handleLaunchFauna = (e?: React.MouseEvent, subKey?: string) => {
    if (e) e.stopPropagation();
    playCheerSound();
    const targetSub = subKey || 'singa';
    setInitialFaunaSubKey(targetSub);
    recordBookExplored('fauna', targetSub);
    setIsMengenalHewanModalOpen(true);
  };

  const hasVisibleCards = activeSubject === 'all' || activeSubject === 'ipas';

  return (
    <div className="fixed inset-0 z-50 bg-[#080b12] text-white font-sans h-screen overflow-hidden flex flex-col justify-between select-none">
      {/* ================= BEGIN: UltraRealisticWoodenBookshelf (3D Jati Perpustakaan) ================= */}
      <section
        className="relative pt-2 pb-1.5 px-2.5 lg:px-4 border-b-4 border-[#120501] shadow-2xl overflow-visible shrink-0 z-30"
        data-purpose="ultra-realistic-bookshelf"
        style={{
          backgroundColor: 'rgb(18, 7, 3)',
          backgroundImage:
            'radial-gradient(at 50% 0%, rgba(251, 191, 36, 0.22) 0%, rgba(180, 83, 9, 0.12) 40%, transparent 75%), radial-gradient(at 15% 15%, rgba(245, 158, 11, 0.14) 0%, transparent 45%), radial-gradient(at 85% 15%, rgba(245, 158, 11, 0.14) 0%, transparent 45%), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 120px), repeating-linear-gradient(rgba(255, 255, 255, 0.016) 0px, rgba(0, 0, 0, 0.25) 2px, transparent 3px, transparent 8px), linear-gradient(rgb(36, 14, 5) 0%, rgb(26, 9, 3) 35%, rgb(19, 6, 2) 70%, rgb(13, 4, 1) 100%)',
          boxShadow:
            'rgba(0, 0, 0, 0.8) 0px -12px 24px inset, rgba(251, 191, 36, 0.15) 0px 2px 4px inset, rgba(0, 0, 0, 0.9) 0px 20px 30px',
        }}
      >
        {/* Spotlights ambient lighting di atas rak */}
        <div className="absolute top-0 left-1/4 w-72 h-24 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-1">
          <div className="relative pt-1 pb-1">
            <div
              className="flex items-end justify-between sm:justify-center gap-[clamp(6px,1.2vw,22px)] overflow-x-auto sm:overflow-visible no-scrollbar pt-3.5 pb-1 px-2 relative z-10 w-full"
              id="bookshelf-row"
            >
              {/* 1. Miniatur Rumah 3D (Beranda) */}
              <div
                onClick={() => {
                  playPopSound();
                  onClose();
                }}
                className="shelf-interactive-item flex flex-col items-center justify-end self-end mb-0.5 cursor-pointer group flex-shrink-0 z-20"
                data-purpose="home-miniature"
                title="Beranda"
              >
                <div className="relative flex flex-col items-center transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 active:scale-90">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 px-2.5 py-0.5 bg-black/85 backdrop-blur-md border border-amber-400/40 rounded-full text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-xl pointer-events-none z-30">
                    Beranda
                  </div>
                  <div className="relative flex flex-col items-center">
                    <img
                      src="/assets/ui3d/icon_house_3d.png"
                      alt="Beranda"
                      className="w-[72px] sm:w-[84px] lg:w-[100px] h-[72px] sm:h-[84px] lg:h-[100px] object-contain filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.75)] select-none pointer-events-none"
                      draggable={false}
                    />
                    <div className="w-14 lg:w-20 h-2 bg-black/65 rounded-full blur-[3px] -mt-1.5" />
                  </div>
                </div>
              </div>

              {/* 2. Buku Pop-Up 3D */}
              <div
                onClick={() => {
                  handleFilterBySubject('bahasa');
                }}
                className="shelf-interactive-item flex flex-col items-center justify-end self-end mb-0.5 cursor-pointer group flex-shrink-0 z-20"
                data-purpose="children-storybook"
                title="Cerita"
              >
                <div className="relative flex flex-col items-center transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 active:scale-90">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 px-2.5 py-0.5 bg-black/85 backdrop-blur-md border border-amber-400/40 rounded-full text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-xl pointer-events-none z-30">
                    Cerita
                  </div>
                  <div className="relative flex flex-col items-center">
                    <img
                      src="/assets/ui3d/icon_magic_book_3d.png"
                      alt="Cerita"
                      className="w-[88px] sm:w-[102px] lg:w-[122px] h-[66px] sm:h-[76px] lg:h-[92px] object-contain filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.78)] select-none pointer-events-none"
                      draggable={false}
                    />
                    <div className="w-16 lg:w-22 h-2 bg-black/65 rounded-full blur-[3px] -mt-1" />
                  </div>
                </div>
              </div>

              {/* 3. Penyekat Kayu Solid Kiri (JATI Bookend Left) */}
              <div
                className="flex flex-col items-center justify-end self-end mb-0.5 flex-shrink-0 z-20 pointer-events-none"
                data-purpose="wooden-bookend-left"
              >
                <div className="relative flex flex-col items-end filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.85)]">
                  <div className="w-5 sm:w-6 lg:w-7 h-[80px] sm:h-[90px] lg:h-[106px] rounded-tl-lg bg-gradient-to-r from-[#854d0e] via-[#5c2b09] to-[#3a1b0a] border-l-2 border-t-2 border-amber-300/40 flex flex-col justify-between p-1 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-y-0 right-0 w-1 bg-black/40 border-l border-amber-900/50" />
                    <div className="flex flex-col items-center gap-1 mt-1 opacity-75">
                      <div className="w-2.5 h-2.5 rounded-full border border-amber-400/50 bg-amber-500/20" />
                      <div className="w-1 h-5 bg-amber-400/20 rounded-full" />
                    </div>
                  </div>
                  <div className="w-8 sm:w-10 lg:w-12 h-3 bg-gradient-to-b from-[#6f3411] to-[#2e1103] rounded-l-md border-t border-l border-b border-amber-400/40 shadow-inner flex items-center px-1">
                    <div className="w-full h-0.5 bg-amber-500/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* 4. 6 Punggung Buku Kulit 3D (Hanya 1 Kata Nama Pelajaran) */}
              {SHELF_BOOKS.map((book) => {
                const isSelected = activeSubject === book.subject && activeTab === 'all';
                return (
                  <button
                    key={book.subject}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleFilterBySubject(book.subject)}
                    className={`subject-book-btn group flex-shrink-0 flex flex-col items-center focus:outline-none transition-all duration-300 cursor-pointer active:scale-95 ${
                      isSelected
                        ? '-translate-y-2.5 opacity-100'
                        : 'hover:-translate-y-1.5 opacity-85'
                    }`}
                  >
                    {/* Pita pembatas buku satin tanpa simbol */}
                    <div
                      className={`ribbon-marker w-3 lg:w-3.5 h-5 lg:h-6 bg-gradient-to-b ${book.ribbonClass} rounded-b -mb-1.5 z-30 shadow-md border-x transition-all duration-300 relative ${
                        isSelected ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Badan Punggung Buku Kulit - Hanya 1 Kata Nama Pelajaran */}
                    <div
                      className={`book-leather-spine book-spine w-[58px] sm:w-[66px] lg:w-[84px] h-[94px] sm:h-[106px] lg:h-[126px] rounded-t-md rounded-br-[2px] bg-gradient-to-b ${book.spineGradient} p-1.5 flex items-center justify-center border-l-[4px] lg:border-l-[5px] ${book.spineBorder} relative ${
                        isSelected ? 'ring-2 ring-amber-300 shadow-book-elevated' : ''
                      }`}
                    >
                      <span
                        className={`text-[10px] sm:text-[11px] lg:text-xs font-extrabold ${book.titleColor} tracking-tight text-center font-fredoka leading-tight`}
                      >
                        {book.title}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* 5. Penyekat Kayu Solid Kanan (JATI Bookend Right) */}
              <div
                className="flex flex-col items-center justify-end self-end mb-0.5 flex-shrink-0 z-20 pointer-events-none"
                data-purpose="wooden-bookend-right"
              >
                <div className="relative flex flex-col items-start filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.85)]">
                  <div className="w-5 sm:w-6 lg:w-7 h-[80px] sm:h-[90px] lg:h-[106px] rounded-tr-lg bg-gradient-to-l from-[#854d0e] via-[#5c2b09] to-[#3a1b0a] border-r-2 border-t-2 border-amber-300/40 flex flex-col justify-between p-1 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1 bg-black/40 border-r border-amber-900/50" />
                    <div className="flex flex-col items-center gap-1 mt-1 opacity-75">
                      <div className="w-2.5 h-2.5 rounded-full border border-amber-400/50 bg-amber-500/20" />
                      <div className="w-1 h-5 bg-amber-400/20 rounded-full" />
                    </div>
                  </div>
                  <div className="w-8 sm:w-10 lg:w-12 h-3 bg-gradient-to-b from-[#6f3411] to-[#2e1103] rounded-r-md border-t border-r border-b border-amber-400/40 shadow-inner flex items-center justify-end px-1">
                    <div className="w-full h-0.5 bg-amber-500/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* 6. Kuas & Peti */}
              <div className="flex items-end gap-2 lg:gap-3.5 self-end mb-0.5 flex-shrink-0 z-20">
                {/* Ikon Palet & Kuas 3D -> "Kuas" */}
                <div
                  onClick={() => {
                    playPopSound();
                    if (!isAnyBookOpen) {
                      showToast('Buka Buku Dulu');
                      return;
                    }
                    const next = !isHighlighterActive;
                    setIsHighlighterActive(next);
                    showToast(next ? 'Kuas Aktif' : 'Kuas Nonaktif');
                  }}
                  className={`shelf-interactive-item flex flex-col items-center justify-end cursor-pointer group transition-all ${
                    !isAnyBookOpen ? 'opacity-50 grayscale-[35%]' : 'opacity-100'
                  }`}
                  data-purpose="book-highlighter-stand"
                  title="Kuas"
                >
                  <div className="relative flex flex-col items-center transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 active:scale-90">
                    <div
                      className={`relative flex flex-col items-center rounded-2xl p-0.5 transition-all ${
                        isAnyBookOpen && isHighlighterActive
                          ? 'ring-2 ring-[#a3e635] bg-lime-400/20 shadow-[0_0_20px_rgba(163,230,53,0.55)]'
                          : isAnyBookOpen
                            ? 'ring-2 ring-amber-400/70 bg-amber-400/10 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                            : ''
                      }`}
                    >
                      <img
                        src="/assets/ui3d/icon_palette_brush_3d.png"
                        alt="Kuas"
                        className="w-[62px] sm:w-[72px] lg:w-[86px] h-[72px] sm:h-[82px] lg:h-[98px] object-contain filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.78)] select-none pointer-events-none"
                        draggable={false}
                      />
                      <span className="mt-0.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-amber-400/35 text-[9px] lg:text-[10px] font-extrabold text-amber-200 whitespace-nowrap">
                        Kuas
                      </span>
                      <div className="w-12 lg:w-16 h-2 bg-black/65 rounded-full blur-[3px] -mt-1" />
                    </div>
                  </div>
                </div>

                {/* Ikon Peti 3D -> "Peti (0)" */}
                <div
                  onClick={() => {
                    playPopSound();
                    const nextTab = activeTab === 'gallery' ? 'all' : 'gallery';
                    setActiveTab(nextTab);
                  }}
                  className="shelf-interactive-item flex flex-col items-center justify-end cursor-pointer group"
                  data-purpose="favorite-books-chest"
                  title={`Peti (${savedBooks.length})`}
                >
                  <div className="relative flex flex-col items-center transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 active:scale-90">
                    <div
                      className={`relative flex flex-col items-center rounded-2xl p-0.5 transition-all ${
                        activeTab === 'gallery'
                          ? 'ring-2 ring-[#a3e635] bg-lime-400/15 shadow-[0_0_18px_rgba(163,230,53,0.45)]'
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src="/assets/ui3d/icon_chest_front_3d.png"
                          alt="Peti"
                          className="w-[74px] sm:w-[86px] lg:w-[104px] h-[68px] sm:h-[78px] lg:h-[94px] object-contain filter drop-shadow-[0_10px_14px_rgba(0,0,0,0.82)] select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>
                      <span className="mt-0.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-amber-400/35 text-[9px] lg:text-[10px] font-extrabold text-amber-200 whitespace-nowrap">
                        Peti ({savedBooks.length})
                      </span>
                      <div className="w-16 lg:w-20 h-2 bg-black/65 rounded-full blur-[3px] -mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Balok Papan Kayu Jati Tebal 3D (Wood Shelf Beam) */}
            <div className="wood-beam-realistic h-4 lg:h-5 w-full rounded-lg -mt-1.5 z-20 flex items-center px-6 justify-between shadow-shelf-3d">
              <div className="wood-beam-surface-reflection absolute inset-0 rounded-lg pointer-events-none" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#3d1607] border border-amber-600/50 shadow-inner" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#3d1607] border border-amber-600/50 shadow-inner" />
            </div>
          </div>
        </div>
      </section>
      {/* ================= END: UltraRealisticWoodenBookshelf ================= */}

      {/* ================= BEGIN: Main Content (Hanya Kartu Flora & Fauna atau Coming Soon) ================= */}
      {activeTab === 'all' ? (
        <main
          className="flex-1 min-h-0 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-start justify-center overflow-hidden"
          data-purpose="learning-modules-carousel-container"
        >
          {hasVisibleCards ? (
            <div
              className="w-full flex items-stretch justify-start gap-4 lg:gap-6 overflow-x-auto no-scrollbar py-2 px-1"
              id="module-carousel-track"
            >
              {/* CARD 1: MENGENAL FLORA */}
              <article
                onClick={() => handleLaunchFlora()}
                className={`module-card flex-initial w-[320px] sm:w-[350px] lg:w-[380px] h-[clamp(340px,64vh,480px)] rounded-[24px] lg:rounded-[28px] p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-amber-400/45 text-gray-900 transition-all duration-300 hover:shadow-glow-lime-btn group cursor-pointer shrink-0 ${
                  highlightedCardId === 'flora' ? 'ring-4 ring-amber-400 -translate-y-1.5' : ''
                }`}
                style={{
                  background: 'linear-gradient(180deg, #f3e9dc 0%, #dfcBB4 50%, #c2a385 100%)',
                }}
              >
                {/* Judul Singkat */}
                <div className="relative z-10 text-center pb-2 shrink-0">
                  <h3 className="text-lg lg:text-xl font-black text-[#2e1406] font-sans tracking-tight leading-tight">
                    Mengenal Flora
                  </h3>
                </div>

                {/* Sampul Utama Buku Flora (Utuh & Bersih Tanpa Floating Badge) */}
                <div className="w-full flex-1 min-h-0 rounded-2xl border-2 border-amber-700/45 shadow-xl relative overflow-hidden my-1 bg-[#1c2c1e]">
                  <img
                    src="/assets/aistudio/screen_87d1c205.png"
                    alt="Mengenal Flora"
                    className="absolute inset-0 w-full h-full object-cover object-[center_45%] transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Tombol Simpan & Baca (Tanpa Ikon Ganda / Emoji) */}
                <div className="relative z-10 flex items-center gap-2 mt-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleToggleSaveBookToChest(
                        {
                          id: 'book-flora-main',
                          bookType: 'flora',
                          title: 'Mengenal Flora',
                          subtitle: '',
                          icon: '',
                          badge: '',
                          xp: '',
                          gradient: 'from-emerald-700 via-teal-700 to-amber-700',
                          subKey: 'mawar',
                        },
                        e
                      )
                    }
                    className={`flex-1 py-2.5 px-3 rounded-full font-extrabold text-xs lg:text-sm flex items-center justify-center border transition active:scale-95 cursor-pointer shadow-sm ${
                      isBookInChest('book-flora-main', savedBooks)
                        ? 'bg-rose-600 text-white border-rose-300 shadow-md'
                        : 'bg-amber-950/90 hover:bg-amber-950 text-amber-100 border-amber-700/60'
                    }`}
                  >
                    {isBookInChest('book-flora-main', savedBooks) ? 'Tersimpan' : 'Simpan'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleLaunchFlora(e)}
                    className="action-card-btn flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-xs lg:text-sm flex items-center justify-center shadow-lg transition duration-150 active:scale-95 hover:shadow-xl cursor-pointer"
                    data-purpose="launch-flora"
                  >
                    Baca
                  </button>
                </div>
              </article>

              {/* CARD 2: MENGENAL FAUNA */}
              <article
                onClick={() => handleLaunchFauna()}
                className={`module-card flex-initial w-[320px] sm:w-[350px] lg:w-[380px] h-[clamp(340px,64vh,480px)] rounded-[24px] lg:rounded-[28px] p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-amber-500/45 bg-[#0c2419] text-white transition-all duration-300 hover:shadow-glow-lime-btn group cursor-pointer shrink-0 ${
                  highlightedCardId === 'fauna' ? 'ring-4 ring-amber-400 -translate-y-1.5' : ''
                }`}
                style={{
                  background: 'linear-gradient(180deg, #18281b 0%, #0d1e13 45%, #08120b 100%)',
                }}
              >
                {/* Judul Singkat */}
                <div className="relative z-10 text-center pb-2 shrink-0">
                  <h3 className="text-lg lg:text-xl font-black text-amber-300 font-sans tracking-tight leading-tight">
                    Mengenal Fauna
                  </h3>
                </div>

                {/* Sampul Utama Buku Fauna (Utuh & Bersih Tanpa Floating Badge) */}
                <div className="w-full flex-1 min-h-0 rounded-2xl border-2 border-emerald-400/45 shadow-xl relative overflow-hidden my-1 bg-[#101e14]">
                  <img
                    src="/assets/aistudio/screen_5b10fe87.png"
                    alt="Mengenal Fauna"
                    className="absolute inset-0 w-full h-full object-cover object-[center_58%] transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Tombol Simpan & Baca (Tanpa Ikon Ganda / Emoji) */}
                <div className="relative z-10 flex items-center gap-2 mt-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleToggleSaveBookToChest(
                        {
                          id: 'book-fauna-main',
                          bookType: 'fauna',
                          title: 'Mengenal Fauna',
                          subtitle: '',
                          icon: '',
                          badge: '',
                          xp: '',
                          gradient: 'from-amber-600 via-emerald-700 to-teal-900',
                          subKey: 'singa',
                        },
                        e
                      )
                    }
                    className={`flex-1 py-2.5 px-3 rounded-full font-extrabold text-xs lg:text-sm flex items-center justify-center border transition active:scale-95 cursor-pointer shadow-sm ${
                      isBookInChest('book-fauna-main', savedBooks)
                        ? 'bg-rose-500 text-white border-rose-300 shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-amber-100 border-amber-400/35'
                    }`}
                  >
                    {isBookInChest('book-fauna-main', savedBooks) ? 'Tersimpan' : 'Simpan'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleLaunchFauna(e)}
                    className="action-card-btn flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-xs lg:text-sm flex items-center justify-center shadow-lg transition duration-150 active:scale-95 hover:shadow-xl cursor-pointer"
                    data-purpose="launch-fauna"
                  >
                    Baca
                  </button>
                </div>
              </article>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-200 tracking-tight">
                Coming Soon
              </span>
            </div>
          )}
        </main>
      ) : (
        /* ================= PETI BUKU (SAVED IN LOCALSTORAGE: ceriakids_saved_books) ================= */
        <main className="flex-1 min-h-0 max-w-[1440px] w-full mx-auto px-4 py-4 overflow-y-auto">
          <div className="h-full bg-[#111622]/95 backdrop-blur-xl rounded-3xl border-2 border-amber-400/35 p-5 sm:p-6 text-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
              <h2 className="text-lg sm:text-xl font-black text-amber-300 font-fredoka tracking-wide">
                Peti Buku
              </h2>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveTab('all');
                }}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs cursor-pointer transition active:scale-95"
              >
                Kembali
              </button>
            </div>

            {savedBooks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
                <h3 className="text-xl sm:text-2xl font-black text-amber-200">
                  Peti Kosong
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
                {savedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-gradient-to-b from-[#1a2234] to-[#0f1522] rounded-2xl p-4 text-white shadow-xl flex flex-col justify-between border-2 border-amber-400/35 hover:border-amber-400 transition-all"
                  >
                    <h4 className="text-base sm:text-lg font-black text-white font-fredoka leading-snug">
                      {book.title}
                    </h4>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playCheerSound();
                          if (book.bookType === 'flora') {
                            handleLaunchFlora(undefined, book.subKey);
                          } else if (book.bookType === 'fauna') {
                            handleLaunchFauna(undefined, book.subKey);
                          }
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#a3e635] to-[#84cc16] hover:brightness-110 text-gray-950 font-black text-xs flex items-center justify-center shadow-md cursor-pointer active:scale-95 transition"
                      >
                        Baca
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playPopSound();
                          const nextList = removeBookFromChest(book.id);
                          setSavedBooks(nextList);
                          showToast('Dihapus');
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/35 text-rose-200 font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
      {/* ================= END: Main Content ================= */}

      {/* ================= BEGIN: ToastNotification ================= */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.92 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-black/90 backdrop-blur-lg border-2 border-amber-400 text-amber-200 px-5 py-2 rounded-full text-xs md:text-sm font-bold shadow-2xl whitespace-nowrap">
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ================= END: ToastNotification ================= */}

      {/* ================= PRESERVED INTERACTIVE BOOK & DRAWING MODALS ================= */}
      <MengenalHewanModal
        isOpen={isMengenalHewanModalOpen}
        onClose={() => setIsMengenalHewanModalOpen(false)}
        initialAnimalKey={initialFaunaSubKey}
      />

      <FloraInteractiveModal
        isOpen={isFloraInteractiveModalOpen}
        onClose={() => setIsFloraInteractiveModalOpen(false)}
        initialFloraKey={initialFloraSubKey}
      />

      <DrawingStudioModal
        isOpen={isDrawingStudioModalOpen}
        onClose={() => setIsDrawingStudioModalOpen(false)}
      />
    </div>
  );
};
