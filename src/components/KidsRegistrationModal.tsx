import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Check,
  Lock,
  Mail,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharviMascot, GreenScreenVideoConfig } from './CharviMascot';
import { ChildProfile, CharviEmotion } from '../types';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import {
  speakTextUtterance,
  cancelSpeechSynthesis,
} from '../utils/speechUtils';
import { MemberCard } from './MemberCard';
import { INTEREST_STICKERS } from '../data/stickers';
import { ISLAND_VIDEO_SRC, ISLAND_LOADING_POSTER_IMAGE } from '../data/biomes';

interface KidsRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: ChildProfile) => void;
  onPrepareHome?: (profile: ChildProfile) => void;
  initialProfile?: ChildProfile | null;
  initialStep?: number;
}

const NAME_SUGGESTIONS = ['Bintang', 'Langit', 'Pelangi', 'Cahaya', 'Jagoan', 'Alana'];

interface MemoizedBudiCanvasProps {
  isWaving: boolean;
  isSpeaking: boolean;
  emotion: CharviEmotion;
  greenScreenVideo: GreenScreenVideoConfig | null;
  onReplayVoice: () => void;
}

const MemoizedBudiCanvas = React.memo<MemoizedBudiCanvasProps>(
  ({ isWaving, isSpeaking, emotion, greenScreenVideo, onReplayVoice }) => {
    return (
      <div
        onClick={onReplayVoice}
        title="Ulangi Suara"
        className="relative w-[240px] h-[360px] min-w-[240px] min-h-[360px] max-w-[240px] max-h-[360px] shrink-0 flex items-center justify-center cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
      >
        <CharviMascot
          variant="large-bottom"
          lighting="studio"
          hideQuickButtons
          lockStageCoordinates
          isWaving={isWaving}
          isSpeaking={isSpeaking}
          emotion={emotion}
          greenScreenVideo={greenScreenVideo}
          className="w-[240px] h-[360px] object-contain object-bottom"
        />
      </div>
    );
  },
  (prev, next) =>
    prev.isWaving === next.isWaving &&
    prev.isSpeaking === next.isSpeaking &&
    prev.emotion === next.emotion &&
    prev.greenScreenVideo === next.greenScreenVideo &&
    prev.onReplayVoice === next.onReplayVoice
);
MemoizedBudiCanvas.displayName = 'MemoizedBudiCanvas';

interface PersistentBudiStageProps {
  isWaving: boolean;
  isSpeaking: boolean;
  emotion: CharviEmotion;
  greenScreenVideo: GreenScreenVideoConfig | null;
  isBudiTalking: boolean;
  onReplayVoice: () => void;
}

const PersistentBudiStage = React.memo<PersistentBudiStageProps>(
  ({ isWaving, isSpeaking, emotion, greenScreenVideo, isBudiTalking, onReplayVoice }) => {
    return (
      <div className="w-full md:w-[40%] shrink-0 bg-gradient-to-b from-[#FFF7E6] via-[#FFFDF7] to-[#FEF3C7]/75 border-b-2 md:border-b-0 md:border-r-2 border-[#FED7AA]/80 flex flex-col items-center justify-between p-4 sm:p-5 relative overflow-hidden select-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full pointer-events-none blur-2xl opacity-75"
          style={{
            background: 'radial-gradient(circle, rgba(253, 230, 138, 0.55) 0%, transparent 70%)',
          }}
        />

        {/* Top Stage Badge */}
        <div className="w-full h-[32px] shrink-0 flex items-center justify-center z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-200/90 shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isBudiTalking ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-extrabold text-amber-900 tracking-wide">
              {isBudiTalking ? 'Menyapa...' : 'Budi'}
            </span>
          </div>
        </div>

        {/* Full-Size Persistent Budi Character Stage */}
        <div className="flex-1 w-full flex items-center justify-center py-1 z-10">
          <MemoizedBudiCanvas
            isWaving={isWaving}
            isSpeaking={isSpeaking}
            emotion={emotion}
            greenScreenVideo={greenScreenVideo}
            onReplayVoice={onReplayVoice}
          />
        </div>

        {/* Bottom Replay Voice Pill */}
        <div className="w-full h-[34px] shrink-0 flex items-center justify-center z-10">
          <button
            type="button"
            onClick={onReplayVoice}
            className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-amber-50 border border-amber-200/90 text-[11px] font-bold text-amber-900/80 hover:text-amber-950 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <span>Ulangi Suara</span>
          </button>
        </div>
      </div>
    );
  }
);
PersistentBudiStage.displayName = 'PersistentBudiStage';

export const KidsRegistrationModal: React.FC<KidsRegistrationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onPrepareHome,
  initialProfile,
  initialStep = 0,
}) => {
  const [step, setStep] = useState<number>(initialStep);
  const [registrationFlowState, setRegistrationFlowState] = useState<'REGISTRATION' | 'ISLAND_FLYOVER_10S'>('REGISTRATION');
  const isIslandFlyover = registrationFlowState === 'ISLAND_FLYOVER_10S';

  const [childName, setChildName] = useState<string>(initialProfile?.name || '');
  const [gender] = useState<'boy' | 'girl'>(initialProfile?.gender || 'boy');
  const [birthDate, setBirthDate] = useState<{ day: number; month: number; year: number }>(
    initialProfile?.birthDate || { day: 1, month: 1, year: 2018 }
  );
  const [fase, setFase] = useState<'A' | 'B' | 'C'>(initialProfile?.fase || 'B');
  const [hasSelectedAge, setHasSelectedAge] = useState<boolean>(Boolean(initialProfile?.fase));
  const [selectedStickers, setSelectedStickers] = useState<string[]>(
    initialProfile?.stickers?.length ? initialProfile.stickers.slice(0, 3) : []
  );
  const [playDurationMinutes] = useState<number>(30);
  const [parentEmail, setParentEmail] = useState<string>(initialProfile?.parentEmail || '');
  const [parentPassword, setParentPassword] = useState<string>('');

  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [isBudiTalking, setIsBudiTalking] = useState<boolean>(true);
  const [unlockBounceActive, setUnlockBounceActive] = useState<boolean>(false);

  const [mascotEmotion, setMascotEmotion] = useState<CharviEmotion>('idle');
  const [isMascotWaving, setIsMascotWaving] = useState<boolean>(false);
  const [isMascotSpeaking, setIsMascotSpeaking] = useState<boolean>(false);
  const [isCtaPulsing, setIsCtaPulsing] = useState<boolean>(false);
  const [stageVideoPlayKey, setStageVideoPlayKey] = useState<number>(0);

  const sequenceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const speechSessionIdRef = useRef<number>(0);
  const wasOpenRef = useRef<boolean>(false);
  const savedFinalProfileRef = useRef<ChildProfile | null>(null);
  const latestFormRef = useRef({
    childName,
    hasSelectedAge,
    selectedStickersCount: selectedStickers.length,
  });
  latestFormRef.current = {
    childName,
    hasSelectedAge,
    selectedStickersCount: selectedStickers.length,
  };

  const clearAllSequenceTimers = useCallback(() => {
    sequenceTimersRef.current.forEach((t) => clearTimeout(t));
    sequenceTimersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, delayMs: number) => {
    const id = setTimeout(fn, delayMs);
    sequenceTimersRef.current.push(id);
    return id;
  }, []);

  const stopAllVoiceAndTimers = useCallback(() => {
    speechSessionIdRef.current += 1;
    clearAllSequenceTimers();
    cancelSpeechSynthesis();
  }, [clearAllSequenceTimers]);

  const handleBudiSpeechFinished = useCallback(() => {
    setIsBudiTalking(false);
    setIsCtaPulsing(true);
    setUnlockBounceActive(true);
    const bounceTimer = setTimeout(() => {
      setUnlockBounceActive(false);
    }, 1100);
    sequenceTimersRef.current.push(bounceTimer);
  }, []);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      savedFinalProfileRef.current = null;
      setRegistrationFlowState('REGISTRATION');
      setStep(initialStep ?? 0);
      if (!initialProfile) {
        setSelectedStickers([]);
        setHasSelectedAge(false);
      }
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      stopAllVoiceAndTimers();
      setRegistrationFlowState('REGISTRATION');
      setIsMascotWaving(false);
      setIsMascotSpeaking(false);
      setMascotEmotion('idle');
      setIsCtaPulsing(false);
      setIsBudiTalking(false);
      setUnlockBounceActive(false);
    }
  }, [isOpen, initialStep, initialProfile, stopAllVoiceAndTimers]);

  useEffect(() => {
    return () => {
      stopAllVoiceAndTimers();
    };
  }, [stopAllVoiceAndTimers]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#00e5ff', '#10b981', '#f59e0b', '#ec4899', '#f97316'],
      });
    } catch {
      // ignore
    }
  };

  const runVoiceChoreography = useCallback(
    (options: {
      text: string;
      estimatedMs: number;
    }) => {
      stopAllVoiceAndTimers();
      const sessionId = speechSessionIdRef.current;
      const startTime = Date.now();

      setIsBudiTalking(true);
      setUnlockBounceActive(false);
      setIsCtaPulsing(false);
      setIsMascotWaving(false);
      setIsMascotSpeaking(true);
      setMascotEmotion('talking');

      let hasFinishedSpeech = false;

      const handleSpeechComplete = () => {
        if (hasFinishedSpeech || speechSessionIdRef.current !== sessionId) return;
        hasFinishedSpeech = true;

        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotion('idle');
        handleBudiSpeechFinished();
      };

      scheduleTimer(() => {
        handleSpeechComplete();
      }, options.estimatedMs + 2200);

      scheduleTimer(() => {
        if (speechSessionIdRef.current !== sessionId) return;
        speakTextUtterance(options.text, {
          lang: 'id-ID',
          rate: 1.02,
          pitch: 1.15,
          onEnd: () => {
            if (speechSessionIdRef.current !== sessionId) return;
            const elapsed = Date.now() - startTime;
            const remainingMin = elapsed < 250 ? Math.max(0, options.estimatedMs - elapsed) : 0;
            if (remainingMin > 0) {
              scheduleTimer(handleSpeechComplete, remainingMin);
            } else {
              handleSpeechComplete();
            }
          },
          onError: () => {
            if (speechSessionIdRef.current !== sessionId) return;
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, options.estimatedMs - elapsed);
            scheduleTimer(handleSpeechComplete, remaining);
          },
        });
      }, 40);
    },
    [scheduleTimer, stopAllVoiceAndTimers, handleBudiSpeechFinished]
  );

  const playCurrentStageIntroVoice = useCallback(
    (targetStep: number) => {
      if (!isOpen || isIslandFlyover || targetStep === 8) {
        stopAllVoiceAndTimers();
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotion('idle');
        setIsBudiTalking(false);
        return;
      }

      const { childName: latestName } = latestFormRef.current;
      const callName = latestName.trim() || 'teman petualang';

      if (targetStep === 0) {
        stopAllVoiceAndTimers();
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotion('idle');
        setIsCtaPulsing(false);
        setUnlockBounceActive(false);
        setIsBudiTalking(true);
        setStageVideoPlayKey((prev) => prev + 1);
        scheduleTimer(() => {
          handleBudiSpeechFinished();
        }, 8500);
      } else if (targetStep === 1) {
        stopAllVoiceAndTimers();
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotion('idle');
        setIsCtaPulsing(false);
        setUnlockBounceActive(false);
        setIsBudiTalking(true);
        setStageVideoPlayKey((prev) => prev + 1);
        scheduleTimer(() => {
          handleBudiSpeechFinished();
        }, 5500);
      } else if (targetStep === 2) {
        runVoiceChoreography({
          text: `Halo ${callName}! Kamu sekarang umur berapa? Pilih salah satu kotak umurmu di samping ya!`,
          estimatedMs: 4800,
        });
      } else if (targetStep === 3) {
        stopAllVoiceAndTimers();
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotion('idle');
        setIsCtaPulsing(false);
        setUnlockBounceActive(false);
        setIsBudiTalking(true);
        setStageVideoPlayKey((prev) => prev + 1);
        scheduleTimer(() => {
          handleBudiSpeechFinished();
        }, 7000);
      } else if (targetStep === 7) {
        runVoiceChoreography({
          text: 'Yuk minta bantuan Ayah atau Bunda untuk mengisi email dan kata sandi pengaman.',
          estimatedMs: 4300,
        });
      } else if (targetStep === 9) {
        stopAllVoiceAndTimers();
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotion('idle');
        setIsCtaPulsing(false);
        setUnlockBounceActive(false);
        setIsBudiTalking(true);
        setStageVideoPlayKey((prev) => prev + 1);
        scheduleTimer(() => {
          handleBudiSpeechFinished();
        }, 10200);
      }
    },
    [isOpen, isIslandFlyover, runVoiceChoreography, scheduleTimer, stopAllVoiceAndTimers, handleBudiSpeechFinished]
  );

  const activeGreenScreenVideo: GreenScreenVideoConfig | null = React.useMemo(() => {
    if (!isOpen || isIslandFlyover || step === 8) return null;
    if (step === 0) {
      return {
        src: '/mascots/videos/tahap2_intro.mp4?v=clean_upright_idle_2',
        speechEndSec: 7.88,
        idleLoopStartSec: 8.05,
        idleLoopEndSec: 13.95,
        playKey: stageVideoPlayKey,
        onSpeechComplete: handleBudiSpeechFinished,
      };
    }
    if (step === 1) {
      return {
        src: '/mascots/videos/tahap3_nama.mp4?v=clean_upright_idle_2',
        speechEndSec: 4.85,
        idleLoopStartSec: 5.05,
        idleLoopEndSec: 10.95,
        playKey: stageVideoPlayKey,
        onSpeechComplete: handleBudiSpeechFinished,
      };
    }
    if (step === 3) {
      return {
        src: '/mascots/videos/tahap4_stiker.mp4?v=clean_upright_idle_2',
        speechEndSec: 6.25,
        idleLoopStartSec: 6.70,
        idleLoopEndSec: 12.65,
        playKey: stageVideoPlayKey,
        onSpeechComplete: handleBudiSpeechFinished,
      };
    }
    if (step === 9) {
      return {
        src: '/mascots/videos/tahap5_kartu.mp4?v=clean_upright_idle_2',
        speechEndSec: 9.45,
        idleLoopStartSec: 9.65,
        idleLoopEndSec: 15.55,
        playKey: stageVideoPlayKey,
        onSpeechComplete: handleBudiSpeechFinished,
      };
    }
    return null;
  }, [isOpen, isIslandFlyover, step, stageVideoPlayKey, handleBudiSpeechFinished]);

  useEffect(() => {
    if (!isOpen || isIslandFlyover || step === 8) return;
    playCurrentStageIntroVoice(step);
    return () => {
      stopAllVoiceAndTimers();
    };
  }, [isOpen, isIslandFlyover, step, playCurrentStageIntroVoice, stopAllVoiceAndTimers]);

  const handleReplayBudiVoice = useCallback(() => {
    playPopSound();
    playCurrentStageIntroVoice(step);
  }, [step, playCurrentStageIntroVoice]);

  const handleSelectAgeBox = (selectedFase: 'A' | 'B' | 'C', birthYear: number) => {
    playPopSound();
    setFase(selectedFase);
    setBirthDate({ day: 1, month: 1, year: birthYear });
    setHasSelectedAge(true);
  };

  const handleToggleSticker = (id: string) => {
    playPopSound();
    const isAlreadySelected = selectedStickers.includes(id);

    if (isAlreadySelected) {
      const next = selectedStickers.filter((s) => s !== id);
      setSelectedStickers(next);
      return;
    }

    const next =
      selectedStickers.length >= 3
        ? [...selectedStickers.slice(1), id]
        : [...selectedStickers, id];

    setSelectedStickers(next);
    if (next.length === 3) {
      playCheerSound();
    }
  };

  const handleCardFlip = useCallback((nextFlipped: boolean) => {
    playPopSound();
    setIsCardFlipped(nextFlipped);
  }, []);

  const buildFinalProfile = (): ChildProfile => ({
    name: childName.trim() || 'Bintang',
    gender,
    birthDate: birthDate || { day: 1, month: 1, year: 2018 },
    fase,
    favoriteSubject: selectedStickers[0] || 'stories',
    learningGoals: (selectedStickers.length ? selectedStickers : ['stories', 'math', 'drawing']).map(
      (id) => INTEREST_STICKERS.find((s) => s.id === id)?.name || id
    ),
    playDuration: `${playDurationMinutes} Menit`,
    stickers: selectedStickers.length ? selectedStickers : ['stories', 'math', 'drawing'],
    memberId: `CRK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    hasOwnDevice: true,
    voiceInteractionEnabled: true,
    parentEmail: parentEmail || 'orangtua@ceriakids.id',
    isRegistered: true,
    createdAt: new Date().toISOString(),
  });

  const finishRegistration = useCallback(() => {
    stopAllVoiceAndTimers();
    const finalProfile = savedFinalProfileRef.current || buildFinalProfile();
    savedFinalProfileRef.current = finalProfile;

    try {
      localStorage.setItem('cincau_child_profile', JSON.stringify(finalProfile));
      localStorage.removeItem('ceria_tutorial_done');
      localStorage.setItem('ceria_intro_pending', 'true');
    } catch {
      // ignore
    }

    onComplete(finalProfile);
  }, [
    childName,
    gender,
    birthDate,
    fase,
    selectedStickers,
    playDurationMinutes,
    parentEmail,
    onComplete,
    stopAllVoiceAndTimers,
  ]);

  const [videoLoadingProgress, setVideoLoadingProgress] = useState<number>(0);
  const [isTransitionFadingOut, setIsTransitionFadingOut] = useState<boolean>(false);
  const hasTriggeredFinishRef = useRef<boolean>(false);
  const flyoverStartTimeRef = useRef<number>(0);
  const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeWithSmoothFadeOut = useCallback(() => {
    if (hasTriggeredFinishRef.current) return;
    hasTriggeredFinishRef.current = true;
    setVideoLoadingProgress(100);
    setIsTransitionFadingOut(true);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    fadeOutTimerRef.current = setTimeout(() => {
      finishRegistration();
    }, 450);
  }, [finishRegistration]);

  useEffect(() => {
    return () => {
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    };
  }, []);

  const startIslandFlyoverTransition = useCallback(() => {
    stopAllVoiceAndTimers();
    setIsCtaPulsing(false);
    setUnlockBounceActive(false);

    const finalProfile = savedFinalProfileRef.current || buildFinalProfile();
    savedFinalProfileRef.current = finalProfile;

    try {
      localStorage.setItem('cincau_child_profile', JSON.stringify(finalProfile));
      localStorage.removeItem('ceria_tutorial_done');
      localStorage.setItem('ceria_intro_pending', 'true');
    } catch {
      // ignore
    }

    onPrepareHome?.(finalProfile);
    playCheerSound();
    hasTriggeredFinishRef.current = false;
    setVideoLoadingProgress(0);
    setIsTransitionFadingOut(false);
    setRegistrationFlowState('ISLAND_FLYOVER_10S');
    setStep(8);
  }, [
    childName,
    gender,
    birthDate,
    fase,
    selectedStickers,
    playDurationMinutes,
    parentEmail,
    onPrepareHome,
    stopAllVoiceAndTimers,
  ]);

  useEffect(() => {
    if (!isOpen || (!isIslandFlyover && step !== 8)) {
      setVideoLoadingProgress(0);
      setIsTransitionFadingOut(false);
      hasTriggeredFinishRef.current = false;
      return;
    }

    flyoverStartTimeRef.current = Date.now();
    const FLYOVER_DURATION_MS = 10000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - flyoverStartTimeRef.current;
      const pct = Math.min(100, Math.max(0, (elapsed / FLYOVER_DURATION_MS) * 100));
      setVideoLoadingProgress(pct);
    }, 80);

    const tenSecondTimer = setTimeout(() => {
      completeWithSmoothFadeOut();
    }, FLYOVER_DURATION_MS);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(tenSecondTimer);
    };
  }, [isOpen, isIslandFlyover, step, completeWithSmoothFadeOut]);

  const handleNext = () => {
    if (isBudiTalking) return;
    playPopSound();
    stopAllVoiceAndTimers();
    setIsCtaPulsing(false);
    setUnlockBounceActive(false);

    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3 || step === 7) {
      playCheerSound();
      triggerConfetti();
      setIsCardFlipped(false);
      setStep(9);
      return;
    }
    if (step === 9) {
      startIslandFlyoverTransition();
      return;
    }
  };

  const handleBack = () => {
    if (isIslandFlyover || step === 8) return;
    playPopSound();
    stopAllVoiceAndTimers();
    setIsCtaPulsing(false);
    setUnlockBounceActive(false);

    if (step === initialStep) {
      onClose();
      return;
    }
    if (step === 9) {
      setStep(3);
      return;
    }
    if (step === 7) {
      setStep(0);
      return;
    }
    if (step > 0 && step !== 8) {
      setStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (isIslandFlyover || step === 8) {
    return (
      <motion.div
        key="fullscreen-video-loading-transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitionFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        style={{ backgroundImage: `url(${ISLAND_LOADING_POSTER_IMAGE})` }}
        className="fixed inset-0 z-[100] w-screen h-screen bg-sky-900 bg-cover bg-center overflow-hidden select-none"
      >
        <video
          src={ISLAND_VIDEO_SRC}
          poster={ISLAND_LOADING_POSTER_IMAGE}
          autoPlay
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            try {
              vid.currentTime = 0;
              if (Number.isFinite(vid.duration) && vid.duration > 0) {
                vid.playbackRate = vid.duration < 9.8 ? Math.max(0.5, vid.duration / 10.0) : 1.0;
              } else {
                vid.playbackRate = 0.8;
              }
            } catch {
              // ignore
            }
            vid.muted = false;
            vid.volume = 0.65;
            vid.play().catch(() => {
              vid.muted = true;
              vid.play().catch(() => {});
            });
          }}
          onTimeUpdate={(e) => {
            const vid = e.currentTarget;
            const totalDur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 10.0;
            const videoPct = Math.min(100, Math.max(0, (vid.currentTime / totalDur) * 100));
            setVideoLoadingProgress((prev) => Math.max(prev, videoPct));
          }}
          onEnded={() => {
            completeWithSmoothFadeOut();
          }}
          onError={() => {
            const elapsed = Date.now() - flyoverStartTimeRef.current;
            if (elapsed >= 9500) {
              completeWithSmoothFadeOut();
            }
          }}
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pb-7 sm:pb-10 pt-16 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[280px] sm:w-[360px] max-w-[92vw] bg-black/50 backdrop-blur-md border border-white/30 rounded-full px-5 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.45)] flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs sm:text-[13px] font-extrabold text-white tracking-tight drop-shadow-xs">
                Menuju Pulau...
              </span>
              <span className="text-[11px] font-black text-amber-300 tabular-nums shrink-0">
                {Math.round(videoLoadingProgress)}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/20 p-0.5 overflow-hidden border border-white/25">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#fde047] via-[#a3e635] to-[#38bdf8] relative overflow-hidden"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.max(0, Math.min(100, videoLoadingProgress))}%` }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const isFormIncomplete =
    (step === 1 && !childName.trim()) ||
    (step === 2 && !hasSelectedAge) ||
    (step === 3 && selectedStickers.length < 3);

  const isNextDisabled = isBudiTalking || isFormIncomplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-5 select-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="max-w-4xl w-full min-h-[520px] md:h-[570px] max-h-[92vh] bg-[#FFFDF7] rounded-[32px] tablet:rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col md:flex-row overflow-hidden relative border-4 border-[#FED7AA]"
      >
        {/* KOLOM KIRI */}
        <PersistentBudiStage
          isWaving={isMascotWaving}
          isSpeaking={isMascotSpeaking}
          emotion={mascotEmotion}
          greenScreenVideo={activeGreenScreenVideo}
          isBudiTalking={isBudiTalking}
          onReplayVoice={handleReplayBudiVoice}
        />

        {/* KOLOM KANAN */}
        <div className="w-full md:w-[60%] flex-1 min-w-0 flex flex-col justify-between bg-[#FFFDF7] relative overflow-hidden">
          {/* Top Navigation Bar */}
          <div className="w-full h-[56px] px-5 sm:px-7 pt-3 pb-1 flex items-center justify-between shrink-0 relative border-b border-amber-100/70">
            <button
              onClick={handleBack}
              className="h-[38px] w-[38px] rounded-2xl bg-white shadow-xs border border-amber-200/80 flex items-center justify-center text-amber-900 hover:bg-amber-50 active:scale-95 transition-all cursor-pointer z-10"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {step >= 1 && step <= 3 ? (
              <div className="flex items-center gap-2 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-200/70 shadow-2xs pointer-events-none">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`transition-all duration-300 rounded-full ${
                      dot === step
                        ? 'w-6 h-2.5 bg-gradient-to-r from-amber-500 to-orange-500 shadow-xs'
                        : dot < step
                        ? 'w-2.5 h-2.5 bg-amber-400'
                        : 'w-2.5 h-2.5 bg-amber-200/80'
                    }`}
                  />
                ))}
                <span className="text-[11px] font-extrabold text-amber-900 ml-1">
                  Tahap {step}/3
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200/70 text-[11px] font-extrabold text-amber-900">
                <span>{step === 0 ? 'Pendaftaran' : 'Kartu Petualang'}</span>
              </div>
            )}

            <button
              onClick={() => {
                playPopSound();
                stopAllVoiceAndTimers();
                if (step === 0) {
                  onClose();
                } else {
                  startIslandFlyoverTransition();
                }
              }}
              className="h-[38px] flex items-center text-xs font-bold text-amber-900/70 hover:text-amber-950 px-3 rounded-full hover:bg-amber-100/60 transition-colors cursor-pointer z-10"
            >
              {step === 0 ? 'Tutup' : step === 9 ? 'Selesai' : 'Lewati'}
            </button>
          </div>

          {/* Middle Sliding Stage Card Container */}
          <div className="flex-1 min-h-0 w-full px-5 sm:px-7 py-3 flex flex-col justify-center overflow-y-auto overflow-x-hidden no-scrollbar relative">
            <AnimatePresence mode="wait">
              {/* STEP 0: KARTU INTRO PENDAFTARAN */}
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -48 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center text-center my-auto"
                >
                  <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                    Halo, Aku Budi
                  </h2>

                  <div className="mt-4 w-full max-w-[380px] bg-[#FFFDF5] rounded-[24px] p-4 border-3 border-[#5C4033]/20 shadow-[0_10px_28px_rgba(92,64,51,0.10)] space-y-2.5 text-left">
                    {[
                      { num: '1', title: 'Tulis Nama' },
                      { num: '2', title: 'Pilih Usia' },
                      { num: '3', title: 'Pilih Stiker' },
                    ].map((item) => (
                      <div
                        key={item.num}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xs font-black text-amber-900 shrink-0">
                          {item.num}
                        </div>
                        <h4 className="text-sm font-extrabold text-[#5C4033] truncate">
                          {item.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAHAP 1: INPUT NAMA */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -48 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center text-center my-auto"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
                    Nama Panggilan
                  </h2>

                  <div className="mt-4 w-full bg-[#FFFDF5] rounded-[22px] p-4 sm:p-5 border-4 border-[#5C4033] shadow-[0_12px_35px_rgba(92,64,51,0.18)] relative max-w-[380px] mx-auto overflow-visible">
                    <div className="absolute -top-3 left-6 w-20 h-5 bg-amber-300 shadow-xs rotate-[-2deg] rounded-xs border border-amber-400/60 z-20" />

                    <div className="relative py-1">
                      <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Ketik nama..."
                        autoFocus
                        className="w-full text-center placeholder:text-center text-xl sm:text-2xl font-bold placeholder:font-semibold text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400 tracking-tight py-1 border-b-3 border-[#5C4033]/15 focus:border-[#5C4033]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block mb-1.5">
                      Pilihan Nama
                    </span>
                    <div className="flex flex-wrap justify-center gap-1.5 max-w-sm mx-auto">
                      {NAME_SUGGESTIONS.map((suggestion) => {
                        const isChosen = childName.trim().toLowerCase() === suggestion.toLowerCase();
                        return (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setChildName(suggestion);
                            }}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold active:scale-95 transition-all shadow-2xs cursor-pointer ${
                              isChosen
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-white border-amber-300/80 text-amber-900 hover:bg-amber-50'
                            }`}
                          >
                            {suggestion}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAHAP 2: PILIH USIA / KELAS */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -48 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center text-center my-auto"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
                    Pilih Usia
                  </h2>

                  <div className="mt-3 w-full bg-[#FFFDF5] rounded-[22px] p-3.5 border-4 border-[#5C4033] shadow-[0_12px_35px_rgba(92,64,51,0.18)] relative max-w-[400px] mx-auto overflow-visible">
                    <div className="absolute -top-3 right-8 w-20 h-5 bg-amber-300 shadow-xs rotate-[1.5deg] rounded-xs border border-amber-400/60 z-20" />

                    <div className="space-y-2.5 mt-0.5">
                      {[
                        {
                          faseKey: 'A' as const,
                          ageLabel: '4–6 Tahun',
                          classLabel: 'PAUD & TK',
                          birthYear: 2020,
                          color: 'border-emerald-400 bg-emerald-50/70',
                        },
                        {
                          faseKey: 'B' as const,
                          ageLabel: '6–8 Tahun',
                          classLabel: 'SD Kelas 1–2',
                          birthYear: 2018,
                          color: 'border-sky-400 bg-sky-50/70',
                        },
                        {
                          faseKey: 'C' as const,
                          ageLabel: '8–10 Tahun',
                          classLabel: 'SD Kelas 3–4',
                          birthYear: 2016,
                          color: 'border-amber-400 bg-amber-50/70',
                        },
                      ].map((item) => {
                        const isSelected = hasSelectedAge && fase === item.faseKey;
                        return (
                          <button
                            key={item.faseKey}
                            type="button"
                            onClick={() => handleSelectAgeBox(item.faseKey, item.birthYear)}
                            className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? `${item.color} shadow-xs ring-2 ring-amber-300 border-[#5C4033] scale-[1.01]`
                                : 'border-[#5C4033]/15 bg-white/75 hover:bg-white hover:border-[#5C4033]/35'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-sm font-extrabold text-[#5C4033]">
                                {item.ageLabel}
                              </h4>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/70">
                                {item.classLabel}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#5C4033] text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[4]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAHAP 3: PAPAN TEMPEL STIKER MINAT */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -48 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center text-center my-auto"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
                    Pilih 3 Stiker
                  </h2>

                  <div className="mt-2.5 w-full bg-[#FFFDF5] p-3 sm:p-3.5 rounded-[24px] border-3 border-[#5C4033]/25 shadow-[0_8px_25px_rgba(92,64,51,0.08)] max-w-[440px] mx-auto relative">
                    <div className="flex items-center justify-between pb-1.5 px-1 border-b-2 border-[#5C4033]/10 mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#5C4033] tracking-[0.12em]">
                        Papan Stiker
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs transition-colors ${
                          selectedStickers.length >= 3
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            : 'bg-amber-100/80 text-amber-800 border-amber-300/80'
                        }`}
                      >
                        {selectedStickers.length}/3 Dipilih
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                      {INTEREST_STICKERS.map((sticker) => {
                        const isStuck = selectedStickers.includes(sticker.id);
                        return (
                          <motion.button
                            key={sticker.id}
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleToggleSticker(sticker.id)}
                            className={`relative p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none min-h-[60px] ${
                              isStuck
                                ? 'bg-gradient-to-b from-amber-50 to-orange-100/90 border-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300/60'
                                : 'bg-white border-neutral-200/90 hover:border-amber-300/80 hover:bg-amber-50/40 text-neutral-600'
                            }`}
                          >
                            {isStuck && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-1.5 ring-white z-10">
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              </div>
                            )}
                            <span className="text-xl sm:text-2xl filter drop-shadow-2xs leading-none">
                              {sticker.icon}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold leading-tight text-center line-clamp-1 mt-1 w-full px-0.5">
                              {sticker.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 7: PARENT SHIELD STEP */}
              {step === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -48 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center text-center my-auto"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                    Akun Orang Tua
                  </h2>

                  <div className="mt-3 bg-white rounded-[22px] p-4 border-2 border-amber-200/90 shadow-xs w-full max-w-[390px] mx-auto space-y-3 text-left">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-neutral-700 tracking-wider block mb-1">
                        Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-amber-500 absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          placeholder="orangtua@email.com"
                          className="w-full h-10 pl-10 pr-3.5 text-xs font-bold placeholder:font-semibold text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 border-2 border-neutral-200 rounded-xl outline-none focus:border-amber-400 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-neutral-700 tracking-wider block mb-1">
                        Kata Sandi
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 pointer-events-none" />
                        <input
                          type="password"
                          value={parentPassword}
                          onChange={(e) => setParentPassword(e.target.value)}
                          placeholder="Kata sandi..."
                          className="w-full h-10 pl-10 pr-3.5 text-xs font-bold placeholder:font-semibold text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 border-2 border-neutral-200 rounded-xl outline-none focus:border-amber-400 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAHAP AKHIR (STEP 9): KARTU PETUALANG SELESAI */}
              {step === 9 && (
                <motion.div
                  key="step-9"
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -48 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center text-center my-auto"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight mb-2">
                    Kartu Petualang
                  </h2>

                  <div className="w-full scale-[0.92] origin-center">
                    <MemberCard
                      isFlipped={isCardFlipped}
                      onFlip={handleCardFlip}
                      childProfile={{
                        name: childName || 'Bintang',
                        fase: fase,
                        gender: gender,
                        birthDate: birthDate,
                        playDuration: `${playDurationMinutes} Menit`,
                        stickers: selectedStickers.length
                          ? selectedStickers
                          : ['stories', 'math', 'drawing'],
                        memberId: 'CRK-2026-VIP',
                        favoriteSubject: '',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER KANAN */}
          <div className="w-full shrink-0 px-5 sm:px-7 pt-2.5 pb-4 sm:pb-5 flex flex-col items-center justify-end z-20 bg-[#FFFDF7] border-t border-amber-100/70">
            <div className="w-full max-w-sm mx-auto flex flex-col items-center">
              <div className="h-[22px] mb-1.5 flex items-center justify-center">
                {isBudiTalking ? (
                  <span className="inline-flex items-center text-xs font-extrabold text-amber-800 bg-amber-100/90 px-3 py-0.5 rounded-full border border-amber-300/80 animate-pulse">
                    <span>Dengarkan Budi...</span>
                  </span>
                ) : isFormIncomplete ? (
                  <span className="text-[11px] font-bold text-neutral-500">
                    {step === 1 && 'Isi Nama'}
                    {step === 2 && 'Pilih Usia'}
                    {step === 3 && 'Pilih 3 Stiker'}
                  </span>
                ) : (
                  <span className="text-[11px] font-extrabold text-emerald-700">
                    Siap
                  </span>
                )}
              </div>

              <motion.button
                animate={
                  isCtaPulsing && !isNextDisabled
                    ? {
                        scale: [1, 1.035, 1],
                        boxShadow:
                          step === 9
                            ? [
                                '0 10px 25px -5px rgba(16, 185, 129, 0.35), 0 0 0 0px rgba(52, 211, 153, 0.5)',
                                '0 14px 34px -3px rgba(16, 185, 129, 0.65), 0 0 0 6px rgba(52, 211, 153, 0.35)',
                                '0 10px 25px -5px rgba(16, 185, 129, 0.35), 0 0 0 0px rgba(52, 211, 153, 0.5)',
                              ]
                            : [
                                '0 10px 25px -5px rgba(249, 115, 22, 0.35), 0 0 0 0px rgba(251, 191, 36, 0.5)',
                                '0 14px 34px -3px rgba(249, 115, 22, 0.7), 0 0 0 6px rgba(251, 191, 36, 0.4)',
                                '0 10px 25px -5px rgba(249, 115, 22, 0.35), 0 0 0 0px rgba(251, 191, 36, 0.5)',
                              ],
                      }
                    : { scale: 1 }
                }
                transition={
                  isCtaPulsing && !isNextDisabled
                    ? { duration: 1.25, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.2 }
                }
                whileHover={isNextDisabled ? undefined : { scale: 1.03 }}
                whileTap={isNextDisabled ? undefined : { scale: 0.96 }}
                disabled={isNextDisabled}
                onClick={handleNext}
                className={`relative overflow-hidden w-full h-[50px] px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center transition-all ${
                  unlockBounceActive && !isNextDisabled ? 'animate-bounce' : ''
                } ${
                  isBudiTalking
                    ? 'bg-amber-400 text-white opacity-50 cursor-not-allowed border-2 border-amber-300 shadow-none'
                    : isNextDisabled
                    ? 'bg-neutral-200 text-neutral-400 opacity-50 cursor-not-allowed shadow-none border-2 border-neutral-300'
                    : step === 9
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 border-2 border-emerald-300 cursor-pointer'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 border-2 border-amber-300 cursor-pointer'
                }`}
              >
                {!isNextDisabled && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '-120%' }}
                    animate={{ x: '220%' }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                  />
                )}

                {step === 0 && <span>Mulai</span>}
                {(step === 1 || step === 2) && <span>Lanjut</span>}
                {(step === 3 || step === 7) && <span>Buat Kartu</span>}
                {step === 9 && <span>Mulai Main</span>}
              </motion.button>

              {/* Secondary Action Slot */}
              <div className="h-[22px] mt-1.5 flex items-center justify-center w-full">
                {step === 0 && (
                  <button
                    onClick={() => {
                      playPopSound();
                      stopAllVoiceAndTimers();
                      const finalProfile = buildFinalProfile();
                      try {
                        localStorage.setItem('cincau_child_profile', JSON.stringify(finalProfile));
                        localStorage.setItem('ceria_tutorial_done', 'true');
                        localStorage.removeItem('ceria_intro_pending');
                      } catch {
                        // ignore
                      }
                      onComplete(finalProfile);
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-amber-800 underline transition-colors cursor-pointer text-center"
                  >
                    Masuk Langsung
                  </button>
                )}
                {step === 9 && (
                  <button
                    onClick={() => handleCardFlip(!isCardFlipped)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <span>Putar Kartu</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
