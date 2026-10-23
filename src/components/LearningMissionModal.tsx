import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, XCircle, X } from 'lucide-react';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { PlayfulConfetti } from './PlayfulConfetti';

import { SAMPLE_MISSIONS, MissionQuestion } from '../data/missions';

export type { MissionQuestion };

interface LearningMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fase: 'A' | 'B' | 'C';
  category?: string;
  onMissionSuccess: (foodEarned: number, starsEarned: number) => void;
}

export const LearningMissionModal: React.FC<LearningMissionModalProps> = ({
  isOpen,
  onClose,
  fase,
  category,
  onMissionSuccess,
}) => {
  const allFaseMissions = SAMPLE_MISSIONS[fase] || SAMPLE_MISSIONS.A;
  
  // Filter missions by category if provided, otherwise use all missions for that fase
  const missions = category 
    ? allFaseMissions.filter(m => m.category.toLowerCase().includes(category.toLowerCase()) || m.id.includes(category.toLowerCase()))
    : allFaseMissions;
    
  // Fallback to all fase missions if filter results in empty list
  const activeMissions = missions.length > 0 ? missions : allFaseMissions;

  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentMission = activeMissions[missionIndex % activeMissions.length];

  const handleSelectOption = (index: number) => {
    if (isAnswerChecked) return;
    playPopSound();
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerChecked(true);

    if (selectedAnswer === currentMission.correctIndex) {
      playCheerSound();
      setIsSuccess(true);
      onMissionSuccess(1, 5); // +1 Food Bowl, +5 Stars!
    } else {
      playPopSound();
      setIsSuccess(false);
    }
  };

  const handleNextMission = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsSuccess(false);
    setMissionIndex((prev) => (prev + 1) % activeMissions.length);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-xl border-2 border-amber-200 p-5 flex flex-col gap-4 pointer-events-auto"
        >
          {/* Playful Confetti Effect when answered correctly */}
          <PlayfulConfetti isActive={isSuccess} />

          {/* Simple Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                📚
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-base text-stone-900 leading-tight truncate">
                  {currentMission.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mt-0.5">
                  <span>{currentMission.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Fase {fase}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Question */}
          <p className="text-sm tablet:text-base font-extrabold text-stone-800 leading-snug bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
            {currentMission.question}
          </p>

          {/* Answer Options */}
          <div className="flex flex-col gap-2">
            {currentMission.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentMission.correctIndex;
              let optionClasses =
                'border border-stone-200 bg-white text-stone-800 hover:border-amber-300 hover:bg-amber-50/40';

              if (isAnswerChecked) {
                if (isCorrect) {
                  optionClasses = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-950';
                } else if (isSelected) {
                  optionClasses = 'border-2 border-rose-300 bg-rose-50 text-rose-950';
                }
              } else if (isSelected) {
                optionClasses = 'border-2 border-amber-400 bg-amber-50 text-amber-950';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerChecked}
                  className={`w-full py-3 px-3.5 rounded-2xl text-left text-sm font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${optionClasses}`}
                >
                  <span>{option}</span>
                  {isAnswerChecked && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Simple Feedback */}
          {isAnswerChecked && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-2xl border text-xs font-semibold leading-relaxed ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <p className="font-extrabold text-sm mb-0.5">
                {isSuccess ? 'Jawabanmu Benar! 🎉 (+1 Makanan & +5 Bintang)' : 'Belum tepat, coba lagi nanti ya!'}
              </p>
              <p>{currentMission.explanation}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            {!isAnswerChecked ? (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                  selectedAnswer === null
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:translate-y-0.5 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Jawab</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleNextMission}
                  className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  Soal Berikutnya
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  Selesai
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
