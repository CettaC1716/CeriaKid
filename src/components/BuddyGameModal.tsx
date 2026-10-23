import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Star,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Award,
  Palette,
} from 'lucide-react';
import { CharviMascot } from './CharviMascot';
import { PlayfulConfetti } from './PlayfulConfetti';
import { CharviEmotion } from '../types';
import { BiomeKey } from '../data/biomes';
import { BIOME_GAME_PACKS, BuddyChoiceOption } from '../data/biomeGames';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { recordBiomeCompletion } from '../utils/progressStorage';
import { speakTextUtterance, cancelSpeechSynthesis } from '../utils/speechUtils';

interface BuddyGameModalProps {
  isOpen: boolean;
  biomeKey: BiomeKey;
  activePhaseLabel?: string;
  onClose: () => void;
  onOpenDrawingStudio?: () => void;
}

export const BuddyGameModal: React.FC<BuddyGameModalProps> = ({
  isOpen,
  biomeKey,
  activePhaseLabel = 'FASE B',
  onClose,
  onOpenDrawingStudio,
}) => {
  const pack = BIOME_GAME_PACKS[biomeKey] || BIOME_GAME_PACKS.hutan;
  const rounds = pack.rounds;

  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'VICTORY'>('PLAYING');
  const [mascotEmotion, setMascotEmotion] = useState<CharviEmotion>('excited');
  const [mascotSpeech, setMascotSpeech] = useState<string>(pack.welcomeVoice);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [roundSolved, setRoundSolved] = useState<boolean>(false);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);

  // Sequence builder state
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [sequenceError, setSequenceError] = useState<boolean>(false);

  // Victory stars earned (1 to 3)
  const [earnedStars, setEarnedStars] = useState<number>(3);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const stopSpeech = useCallback(() => {
    cancelSpeechSynthesis();
    setIsSpeaking(false);
  }, []);

  const speakCincau = useCallback(
    (text: string, lang: 'id-ID' | 'en-US' = 'id-ID') => {
      if (isVoiceMuted) return;
      speakTextUtterance(text, {
        lang,
        rate: lang === 'en-US' ? 0.92 : 1.02,
        pitch: 1.25,
        onStart: () => {
          setIsSpeaking(true);
          setMascotEmotion('talking');
        },
        onEnd: () => {
          setIsSpeaking(false);
          setMascotEmotion((prev) => (prev === 'talking' ? 'happy' : prev));
        },
        onError: () => {
          setIsSpeaking(false);
        },
      });
    },
    [isVoiceMuted]
  );

  const currentRound = rounds[roundIdx] || rounds[0];

  // Reset round state when roundIdx or biomeKey changes
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      clearAllTimers();
      return;
    }

    setRoundSolved(false);
    setShowHint(false);
    setSelectedOptionId(null);
    setWrongOptionIds([]);
    setSelectedSequence([]);
    setSequenceError(false);

    if (gameState === 'PLAYING' && currentRound) {
      setMascotSpeech(currentRound.cincauPrompt);
      setMascotEmotion('talking');
      const t = window.setTimeout(() => {
        speakCincau(currentRound.cincauVoiceText, currentRound.voiceLang || 'id-ID');
      }, 180);
      timersRef.current.push(t);
    }

    return () => {
      clearAllTimers();
    };
  }, [isOpen, roundIdx, biomeKey, gameState, currentRound, speakCincau, stopSpeech, clearAllTimers]);

  // Reset entire game when opened on a biome
  useEffect(() => {
    if (isOpen) {
      setRoundIdx(0);
      setGameState('PLAYING');
      setMistakesCount(0);
      setEarnedStars(3);
    }
    return () => {
      stopSpeech();
      clearAllTimers();
    };
  }, [isOpen, biomeKey, stopSpeech, clearAllTimers]);

  if (!isOpen) return null;

  // Option tap handler for visual_choice & scenario_roleplay
  const handleSelectOption = (opt: BuddyChoiceOption) => {
    if (roundSolved) return;
    playPopSound();
    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      playCheerSound();
      setRoundSolved(true);
      setMascotEmotion('celebrating');
      setMascotSpeech(`${opt.feedbackVoice} ${currentRound.explanationText}`);
      speakCincau(opt.feedbackVoice, currentRound.voiceLang || 'id-ID');
    } else {
      setMistakesCount((prev) => prev + 1);
      if (!wrongOptionIds.includes(opt.id)) {
        setWrongOptionIds((prev) => [...prev, opt.id]);
      }
      setMascotEmotion('encouraging');
      setMascotSpeech(opt.feedbackVoice);
      speakCincau(opt.feedbackVoice, 'id-ID');
    }
  };

  // Sequence builder tap handler
  const handleTapSequenceItem = (item: string) => {
    if (roundSolved || selectedSequence.includes(item)) return;
    playPopSound();

    const targetList = currentRound.sequenceTarget || [];
    const nextIdx = selectedSequence.length;
    const expectedItem = targetList[nextIdx];

    if (item === expectedItem) {
      const nextSelected = [...selectedSequence, item];
      setSelectedSequence(nextSelected);
      setSequenceError(false);

      if (nextSelected.length === targetList.length) {
        // Completed the full sequence!
        playCheerSound();
        setRoundSolved(true);
        setMascotEmotion('celebrating');
        const msg = `Hebat sekali! Urutanmu 100% tepat! ${currentRound.explanationText}`;
        setMascotSpeech(msg);
        speakCincau('Hebat sekali! Urutanmu tepat!', 'id-ID');
      } else {
        setMascotEmotion('happy');
      }
    } else {
      // Wrong order
      setMistakesCount((prev) => prev + 1);
      setSequenceError(true);
      setMascotEmotion('encouraging');
      const retryMsg = `Hmm, belum tepat urutannya. Coba lihat petunjuk Budi ya!`;
      setMascotSpeech(retryMsg);
      speakCincau('Coba perhatikan lagi urutannya ya!', 'id-ID');
      const t = window.setTimeout(() => setSequenceError(false), 700);
      timersRef.current.push(t);
    }
  };

  // Next Round or Victory
  const handleNextRound = () => {
    playPopSound();
    stopSpeech();
    if (roundIdx + 1 < rounds.length) {
      setRoundIdx((prev) => prev + 1);
    } else {
      // Calculate stars based on mistakes
      const finalStars = mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1;
      setEarnedStars(finalStars);
      setGameState('VICTORY');
      setMascotEmotion('celebrating');
      setMascotSpeech(pack.victoryVoice);
      recordBiomeCompletion(biomeKey, finalStars, pack.xpReward);
      playCheerSound();
      speakCincau(pack.victoryVoice, 'id-ID');
    }
  };

  const handleRestartGame = () => {
    playPopSound();
    stopSpeech();
    setRoundIdx(0);
    setMistakesCount(0);
    setEarnedStars(3);
    setGameState('PLAYING');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#0d1117]/90 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-5 select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl bg-gradient-to-b from-[#161b26] via-[#121620] to-[#0e1118] border-2 border-white/15 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Confetti on Round Solved or Victory */}
          {(roundSolved || gameState === 'VICTORY') && (
            <PlayfulConfetti isActive={true} count={gameState === 'VICTORY' ? 65 : 30} playSound={false} />
          )}

          {/* ================= TOP HUD BAR ================= */}
          <header className="flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 bg-black/45 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{ backgroundColor: `${pack.accentColor}25`, borderColor: pack.accentColor, color: pack.accentColor }}
                className="px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                {pack.title}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-400 truncate">
                {pack.subjectBadge} • {activePhaseLabel}
              </span>
            </div>

            {/* Step Progress Dots */}
            {gameState === 'PLAYING' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {rounds.map((r, idx) => {
                  const isDone = idx < roundIdx || (idx === roundIdx && roundSolved);
                  const isCurrent = idx === roundIdx;
                  return (
                    <div
                      key={r.id}
                      className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'w-8 sm:w-10 bg-[#facc15] shadow-[0_0_10px_#facc15]'
                          : isDone
                          ? 'w-3 sm:w-4 bg-[#a3e635]'
                          : 'w-2.5 sm:w-3 bg-white/20'
                      }`}
                    />
                  );
                })}
                <span className="text-xs font-black text-white/80 ml-1 tabular-nums">
                  {roundIdx + 1}/{rounds.length}
                </span>
              </div>
            )}

            {/* Right Controls: Voice Toggle & Close (min 48x48 touch targets) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  const nextMute = !isVoiceMuted;
                  setIsVoiceMuted(nextMute);
                  if (nextMute) {
                    stopSpeech();
                  } else if (currentRound) {
                    speakCincau(currentRound.cincauVoiceText, currentRound.voiceLang || 'id-ID');
                  }
                }}
                className="min-w-[48px] min-h-[48px] px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title={isVoiceMuted ? 'Aktifkan Suara Budi' : 'Bisukan Suara Budi'}
              >
                {isVoiceMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className={`w-5 h-5 text-[#facc15] ${isSpeaking ? 'animate-bounce' : ''}`} />
                )}
                <span className="hidden sm:inline text-xs font-black whitespace-nowrap">
                  {isVoiceMuted ? 'Suara Mati' : 'Suara Budi'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  stopSpeech();
                  onClose();
                }}
                className="min-w-[48px] min-h-[48px] rounded-2xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/30 text-rose-200 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                title="Kembali ke Peta Pulau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* ================= MAIN STAGE CONTENT ================= */}
          {gameState === 'PLAYING' ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              {/* LEFT ZONE: BUDI COMPANION STAGE (5 cols on desktop) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#1e2638] to-[#151b28] rounded-3xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                {/* Top Companion Status & Replay Voice */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <span className="text-xs font-extrabold text-[#a3e635] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Teman Belajar: Budi</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      speakCincau(currentRound.cincauVoiceText, currentRound.voiceLang || 'id-ID');
                    }}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-[#facc15] flex items-center gap-1.5 border border-white/15 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Ulangi Suara</span>
                  </button>
                </div>

                {/* Budi Interactive Avatar Stage */}
                <div className="my-2 flex flex-col items-center justify-center relative py-2">
                  <div
                    className="w-36 h-36 sm:w-44 sm:h-44 relative cursor-pointer"
                    onClick={() => {
                      playPopSound();
                      setMascotEmotion('excited');
                      speakCincau(currentRound.cincauVoiceText, currentRound.voiceLang || 'id-ID');
                    }}
                  >
                    <CharviMascot
                      variant="compact-header"
                      emotion={mascotEmotion}
                      className="w-full h-full drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)]"
                    />
                  </div>

                  {/* Scene Visual Banner */}
                  <div className="mt-2 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <div className="text-2xl sm:text-3xl tracking-widest mb-0.5">{currentRound.visualSceneEmoji}</div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-300">
                      {currentRound.visualSceneCaption}
                    </p>
                  </div>
                </div>

                {/* Budi Conversational Speech Bubble */}
                <div className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-xl border-2 border-[#facc15] relative z-10">
                  <p className="text-xs sm:text-sm font-extrabold leading-relaxed text-slate-800">
                    "{mascotSpeech}"
                  </p>

                  {/* Hint Toggle Button */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setShowHint((prev) => !prev);
                        if (!showHint) {
                          speakCincau(currentRound.hintText, 'id-ID');
                        }
                      }}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>{showHint ? 'Sembunyikan Petunjuk' : 'Bantuan Budi'}</span>
                    </button>

                    <span className="text-[11px] font-bold text-slate-500">
                      {currentRound.modeBadge}
                    </span>
                  </div>

                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950"
                    >
                      💡 {currentRound.hintText}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* RIGHT ZONE: INTERACTIVE CHALLENGE DECK (7 cols on desktop) */}
              <div className="lg:col-span-7 bg-[#181e2c] rounded-3xl p-4 sm:p-6 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400">
                      Tantangan Babak {currentRound.roundNumber} dari {rounds.length}
                    </span>
                    {roundSolved && (
                      <span className="text-xs font-black text-[#a3e635] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Jawaban Benar!
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-white leading-snug mb-4">
                    {currentRound.questionTitle}
                  </h2>

                  {/* CHALLENGE TYPE 1 & 3: VISUAL CHOICE OR SCENARIO ROLEPLAY */}
                  {(currentRound.type === 'visual_choice' || currentRound.type === 'scenario_roleplay') &&
                    currentRound.options && (
                      <div className="grid grid-cols-1 gap-3">
                        {currentRound.options.map((opt) => {
                          const isSelected = selectedOptionId === opt.id;
                          const isWrong = wrongOptionIds.includes(opt.id);
                          const isCorrectSolved = roundSolved && opt.isCorrect;

                          return (
                            <motion.button
                              key={opt.id}
                              type="button"
                              whileHover={!roundSolved ? { scale: 1.01 } : {}}
                              whileTap={!roundSolved ? { scale: 0.97 } : {}}
                              onClick={() => handleSelectOption(opt)}
                              className={`w-full min-h-[76px] sm:min-h-[84px] p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3.5 transition-all cursor-pointer ${
                                isCorrectSolved
                                  ? 'bg-[#a3e635]/20 border-[#a3e635] text-white shadow-[0_0_24px_rgba(163,230,53,0.3)]'
                                  : isWrong
                                  ? 'bg-rose-950/40 border-rose-500/50 text-slate-300 opacity-75'
                                  : isSelected
                                  ? 'bg-white/15 border-[#facc15] text-white'
                                  : 'bg-[#222b3d] hover:bg-[#2a354b] border-white/15 hover:border-white/35 text-white'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/35 border border-white/10 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                                  {opt.emoji}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm sm:text-base font-black text-white truncate">
                                    {opt.label}
                                  </div>
                                  {opt.sublabel && (
                                    <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">
                                      {opt.sublabel}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isCorrectSolved ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-[#a3e635] text-slate-950 font-black text-xs flex items-center gap-1 whitespace-nowrap">
                                    <CheckCircle2 className="w-4 h-4" /> Tepat
                                  </span>
                                ) : isWrong ? (
                                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs whitespace-nowrap">
                                    Coba Lagi
                                  </span>
                                ) : (
                                  <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs whitespace-nowrap">
                                    Pilih
                                  </span>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                  {/* CHALLENGE TYPE 2: SEQUENCE BUILDER */}
                  {currentRound.type === 'sequence_builder' &&
                    currentRound.sequenceTarget &&
                    currentRound.sequenceScrambled && (
                      <div className="flex flex-col gap-4">
                        <p className="text-xs sm:text-sm font-bold text-slate-300">
                          {currentRound.sequencePrompt || 'Ketuk kartu di bawah secara berurutan:'}
                        </p>

                        {/* Answer Slots */}
                        <div
                          className={`p-3.5 rounded-2xl bg-black/40 border-2 min-h-[72px] flex flex-wrap items-center gap-2 transition-colors ${
                            sequenceError
                              ? 'border-rose-500 bg-rose-950/30'
                              : roundSolved
                              ? 'border-[#a3e635] bg-[#a3e635]/10'
                              : 'border-white/15'
                          }`}
                        >
                          {currentRound.sequenceTarget.map((_, slotIdx) => {
                            const filledItem = selectedSequence[slotIdx];
                            return (
                              <div
                                key={slotIdx}
                                className={`min-h-[48px] px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                                  filledItem
                                    ? 'bg-[#a3e635] text-slate-950 shadow-md'
                                    : 'bg-white/5 border border-dashed border-white/25 text-slate-400'
                                }`}
                              >
                                <span className="text-[11px] opacity-75 tabular-nums">{slotIdx + 1}.</span>
                                <span>{filledItem || '...?'}</span>
                              </div>
                            );
                          })}

                          {selectedSequence.length > 0 && !roundSolved && (
                            <button
                              type="button"
                              onClick={() => {
                                playPopSound();
                                setSelectedSequence([]);
                              }}
                              className="ml-auto min-h-[44px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Ulang</span>
                            </button>
                          )}
                        </div>

                        {/* Scrambled Choice Tiles */}
                        <div className="grid grid-cols-2 gap-3">
                          {currentRound.sequenceScrambled.map((item) => {
                            const isUsed = selectedSequence.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                disabled={isUsed || roundSolved}
                                onClick={() => handleTapSequenceItem(item)}
                                className={`min-h-[60px] p-3.5 rounded-2xl font-black text-sm sm:text-base border-2 transition-all flex items-center justify-center text-center cursor-pointer active:scale-95 ${
                                  isUsed
                                    ? 'bg-black/30 border-white/5 text-slate-500 opacity-40 cursor-not-allowed'
                                    : 'bg-[#253047] hover:bg-[#2f3d59] border-[#38bdf8]/40 hover:border-[#38bdf8] text-white shadow-md'
                                }`}
                              >
                                <span className="whitespace-nowrap">{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* Bottom Action / Next Round Bar */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Star className="w-4 h-4 text-[#facc15] fill-[#facc15]" />
                    <span>Hadiah Misi: +{pack.xpReward} XP &amp; Bintang</span>
                  </div>

                  <button
                    type="button"
                    disabled={!roundSolved}
                    onClick={handleNextRound}
                    className={`min-h-[52px] px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                      roundSolved
                        ? 'bg-[#a3e635] hover:bg-[#b5f547] text-slate-950 shadow-[0_8px_24px_rgba(163,230,53,0.4)] cursor-pointer active:scale-95'
                        : 'bg-white/10 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>
                      {roundIdx + 1 < rounds.length ? 'Babak Selanjutnya' : 'Selesaikan Misi & Klaim Bintang'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= VICTORY SUMMARY STAGE ================= */
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 mb-3">
                <CharviMascot
                  variant="large-bottom"
                  emotion="celebrating"
                  className="w-full h-full drop-shadow-2xl"
                />
              </div>

              {/* Earned Stars Row */}
              <div className="flex items-center justify-center gap-3 my-2">
                {[1, 2, 3].map((starNum) => {
                  const active = starNum <= earnedStars;
                  return (
                    <motion.div
                      key={starNum}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: starNum * 0.12, type: 'spring', stiffness: 220 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl ${
                        active
                          ? 'bg-amber-400/20 border-[#facc15] text-[#facc15]'
                          : 'bg-white/5 border-white/10 text-slate-600'
                      }`}
                    >
                      <Star className={`w-8 h-8 sm:w-9 sm:h-9 ${active ? 'fill-[#facc15]' : ''}`} />
                    </motion.div>
                  );
                })}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Misi {pack.title} Selesai!
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-300 max-w-lg mt-1.5 leading-relaxed">
                "{pack.victoryVoice}"
              </p>

              {/* Reward Stat Cards */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md my-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400">Bintang Diperoleh</span>
                  <span className="text-xl sm:text-2xl font-black text-[#facc15] mt-1 tabular-nums">
                    +{earnedStars} Bintang ⭐
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400">Skor Pengalaman</span>
                  <span className="text-xl sm:text-2xl font-black text-[#a3e635] mt-1 tabular-nums flex items-center gap-1">
                    <Award className="w-5 h-5" /> +{pack.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
                <button
                  type="button"
                  onClick={handleRestartGame}
                  className="min-h-[50px] px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Main Lagi</span>
                </button>

                {biomeKey === 'karya' && onOpenDrawingStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      stopSpeech();
                      onClose();
                      onOpenDrawingStudio();
                    }}
                    className="min-h-[50px] px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-lg"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Buka Kanvas Menggambar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playCheerSound();
                    stopSpeech();
                    onClose();
                  }}
                  className="min-h-[50px] px-6 py-3 rounded-2xl bg-[#a3e635] hover:bg-[#b4f547] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-[0_8px_20px_rgba(163,230,53,0.35)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kembali ke Pulau MerdekaKids</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
