import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { PlayfulConfetti } from './PlayfulConfetti';
import {
  OrigamiCheckIcon,
  OrigamiCloseIcon,
} from './OrigamiIcons';

interface DailyChecklistWidgetProps {
  completedCount: number;
  totalTasks: number;
  isAllCompleted: boolean;
  streak: number;
  tasks: {
    feed: { current: number; target: number; completed: boolean };
    quiz: { current: number; target: number; completed: boolean };
    pet: { current: number; target: number; completed: boolean };
  };
  claimedBonusToday: boolean;
  onClaimBonus: () => void;
  onOpenFeedMenu?: () => void;
  onOpenQuizMenu?: () => void;
  onPetMascotAction?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  onVoiceGuideClick?: () => void;
  isGuidingVoice?: boolean;
  isInline?: boolean;
  className?: string;
}



export const DailyChecklistWidget: React.FC<DailyChecklistWidgetProps> = ({
  completedCount,
  totalTasks,
  isAllCompleted,
  tasks,
  claimedBonusToday,
  onClaimBonus,
  onOpenFeedMenu,
  onOpenQuizMenu,
  onPetMascotAction,
  onOpenChange,
  onVoiceGuideClick,
  isGuidingVoice = false,
  isInline = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTriggeredRef = useRef(false);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen && isAllCompleted) {
      if (!confettiTriggeredRef.current) {
        setShowConfetti(true);
        confettiTriggeredRef.current = true;
      }
    } else if (!isOpen) {
      confettiTriggeredRef.current = false;
      setShowConfetti(false);
    }
  }, [isOpen, isAllCompleted]);

  const triggerManualConfetti = () => {
    setShowConfetti(false);
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    confettiTimerRef.current = setTimeout(() => {
      setShowConfetti(true);
    }, 50);
  };

  const handleToggle = () => {
    playPopSound();
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onOpenChange) onOpenChange(nextState);
    if (nextState && onVoiceGuideClick) {
      onVoiceGuideClick();
    }
  };


  return (
    <>
      {/* ========================================================= */}
      {/* TACTILE 3D BELL ICON BUTTON FOR MISI HARIAN (BOTTOM-RIGHT DOCK) */}
      {/* ========================================================= */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={
          isInline
            ? `inline-flex items-center select-none ${className}`
            : `absolute bottom-[40%] left-4 tablet:left-8 z-40 select-none ${className}`
        }
      >
        <div
          className={`relative group flex items-center justify-center bg-white/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/85 shadow-lg transition-all ${
            isGuidingVoice
              ? 'ring-4 ring-amber-300/90 shadow-[0_0_24px_rgba(251,191,36,0.65)]'
              : ''
          }`}
        >
          {/* Hover Tooltip Label above 3D Bell */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#241105]/92 backdrop-blur-xs border border-amber-300/80 text-[10px] tablet:text-xs font-black text-amber-200 whitespace-nowrap shadow-lg flex items-center z-50">
            <span>Misi Harian</span>
          </div>

          <motion.button
            type="button"
            onClick={handleToggle}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-11 h-11 tablet:w-12 tablet:h-12 rounded-2xl bg-gradient-to-b from-amber-100 via-yellow-50 to-amber-200 border-2 border-amber-400 ring-2 ring-amber-200/80 shadow-md flex items-center justify-center shrink-0 transition-all cursor-pointer p-1"
            title="Misi Harian"
            aria-label="Misi Harian"
          >
            {/* 3D Bell Icon with Subtle Ringing Animation */}
            <motion.img
              src="/assets/ui3d/icon_bell_3d.png"
              alt="Misi Harian"
              animate={{
                rotate: isAllCompleted
                  ? [0, -8, 8, -5, 5, 0]
                  : [0, -14, 14, -10, 10, -5, 5, 0],
              }}
              transition={{
                duration: 2.0,
                repeat: Infinity,
                repeatDelay: 2.4,
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: '50% 18%' }}
              className="w-8 h-8 tablet:w-9 tablet:h-9 object-contain filter drop-shadow-[0_3px_5px_rgba(180,83,9,0.35)] select-none pointer-events-none"
              draggable={false}
            />

            {/* Small Notification Number Badge in Top Corner of Bell */}
            <motion.span
              key={`${completedCount}-${totalTasks}-${isAllCompleted}`}
              initial={{ scale: 0.7 }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full text-[10px] tablet:text-[11px] font-black flex items-center justify-center border-2 border-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] leading-none ${
                isAllCompleted
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white'
                  : 'bg-gradient-to-b from-rose-500 to-red-600 text-white'
              }`}
            >
              {completedCount}/{totalTasks}
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* SIMPLE & CLEAN MISI HARIAN MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs select-none">
            {/* Backdrop click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                if (onOpenChange) onOpenChange(false);
              }}
              className="absolute inset-0"
            />

            {/* Compact, Simple Misi Harian Card */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[360px] bg-white rounded-3xl shadow-xl border-2 border-amber-200 p-5 pointer-events-auto z-10 flex flex-col gap-4"
            >
              {/* Confetti Animation Trigger */}
              <PlayfulConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

              {/* 1. Compact Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <img
                      src="/assets/ui3d/icon_bell_3d.png"
                      alt="Misi Harian"
                      className="w-7 h-7 object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                  <div>
                    <h3 className="text-base tablet:text-lg font-black text-stone-900 leading-tight">
                      Misi Harian
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mt-0.5 tabular-nums">
                      <span>{completedCount}/{totalTasks} Selesai</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setIsOpen(false);
                    if (onOpenChange) onOpenChange(false);
                  }}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Tutup"
                >
                  <OrigamiCloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* 2. Simple Progress Bar */}
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isAllCompleted ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((completedCount / Math.max(1, totalTasks)) * 100))}%` }}
                />
              </div>

              {/* 3. Direct Mission List */}
              <div className="flex flex-col gap-2">
                {[
                  {
                    id: 'feed',
                    title: 'Rumah Budi',
                    task: tasks.feed,
                    action: onOpenFeedMenu,
                  },
                  {
                    id: 'quiz',
                    title: 'Sesi Belajar',
                    task: tasks.quiz,
                    action: onOpenQuizMenu,
                  },
                  {
                    id: 'pet',
                    title: 'Sapa Budi',
                    task: tasks.pet,
                    action: onPetMascotAction,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!item.task.completed) {
                        playPopSound();
                        if (item.id !== 'pet') {
                          setIsOpen(false);
                          if (onOpenChange) onOpenChange(false);
                        }
                        if (item.action) item.action();
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      item.task.completed
                        ? 'bg-emerald-50/60 border-emerald-200/80'
                        : 'bg-stone-50 hover:bg-amber-50/60 border-stone-200/80 hover:border-amber-300'
                    }`}
                  >
                    <p
                      className={`text-sm font-extrabold leading-snug truncate ${
                        item.task.completed ? 'text-stone-400 line-through' : 'text-stone-800'
                      }`}
                    >
                      {item.title}
                    </p>

                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-stone-300'
                      }`}
                    >
                      {item.task.completed && <OrigamiCheckIcon className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* 4. Single Action Button */}
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  if (isAllCompleted && !claimedBonusToday) {
                    playCheerSound();
                    triggerManualConfetti();
                    onClaimBonus();
                  } else {
                    setIsOpen(false);
                    if (onOpenChange) onOpenChange(false);
                  }
                }}
                className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm text-white transition-all cursor-pointer active:translate-y-0.5 whitespace-nowrap ${
                  isAllCompleted && !claimedBonusToday
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-sm'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-sm'
                }`}
              >
                {isAllCompleted && !claimedBonusToday ? 'Ambil Hadiah' : 'Tutup'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
