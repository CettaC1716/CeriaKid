/* =========================================================================
   [LOCKED DESIGN] ONBOARDING VIEW
   INSTRUKSI USER: "Mohon design onboard di kunci agar kamu tidak merubahnya tanpa persetujuan ku"
   DESAIN INI DIKUNCI DAN TIDAK BOLEH DIUBAH TANPA PERSETUJUAN EKSPLISIT USER
   ========================================================================= */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CharviMascot, GreenScreenVideoConfig } from './CharviMascot';
import { ChildProfileModal } from './ChildProfileModal';
import { CharviEmotion, ChildProfile, SkyThemeId } from '../types';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { speakTextUtterance, cancelSpeechSynthesis } from '../utils/speechUtils';
import { HabitatWorlds } from './HabitatWorlds';
import { useTamagotchi } from '../hooks/useTamagotchi';
import { useDailyChecklist } from '../hooks/useDailyChecklist';
import { DailyChecklistWidget } from './DailyChecklistWidget';
import { LearningMissionModal } from './LearningMissionModal';
import { ToycadLearningRoom } from './ToycadLearningRoom';
import { ToycadPlayRoom } from './ToycadPlayRoom';
import { BudiHouseRoom, BUDI_HOUSE_TRANSITION_VIDEO } from './BudiHouseRoom';
import { BentoActionCards } from './BentoActionCards';
import { DrawingStudioModal } from './DrawingStudioModal';
import { CincauNavBar } from './CincauNavBar';

const TUTORIAL_STORAGE_KEY = 'ceria_tutorial_done';
const INTRO_PENDING_STORAGE_KEY = 'ceria_intro_pending';

interface OnboardingViewProps {
  childProfile?: ChildProfile | null;
  isRegistrationOpen?: boolean;
  onOpenRegistration?: () => void;
  onLogout?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  childProfile,
  isRegistrationOpen = false,
  onOpenRegistration,
  onLogout,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isToycadLearningRoomOpen, setIsToycadLearningRoomOpen] = useState(false);
  const [isToycadPlayRoomOpen, setIsToycadPlayRoomOpen] = useState(false);
  const [isDrawingStudioOpen, setIsDrawingStudioOpen] = useState(false);
  const [skyTheme, setSkyTheme] = useState<SkyThemeId>(() => {
    try {
      const saved = localStorage.getItem('ceriakids_sky_theme');
      if (saved === 'sunset' || saved === 'morning' || saved === 'night') return saved;
    } catch {
      // ignore
    }
    return 'sunset';
  });

  // Mascot & Room States
  const [mascotEmotionOverride, setMascotEmotionOverride] = useState<CharviEmotion | null>(null);
  const [isMascotSpeaking, setIsMascotSpeaking] = useState(false);
  const [isMascotWaving, setIsMascotWaving] = useState(false);
  const [isGuidingDailyMission, setIsGuidingDailyMission] = useState(false);
  const [isBudiHouseOpen, setIsBudiHouseOpen] = useState(false);
  const [highlightedCardIndex, setHighlightedCardIndex] = useState<0 | 1 | 2 | 3 | null>(null);
  const [isPlayingReturningWelcome, setIsPlayingReturningWelcome] = useState(false);
  const [returningWelcomePlayKey, setReturningWelcomePlayKey] = useState(0);
  const hasPlayedReturningWelcomeRef = useRef(false);

  // Strict Sequential Post-Registration & Tutorial State Machine:
  // REGISTRATION -> ISLAND_FLYOVER_10S -> HOME_CENTER_GREETING -> HOME_SLIDE_TO_RIGHT -> TUTORIAL_STEP_1 -> TUTORIAL_STEP_2 -> TUTORIAL_STEP_3 -> HOME_IDLE_READY
  type HomescreenFlowState =
    | 'REGISTRATION'
    | 'HOME_CENTER_GREETING'
    | 'HOME_SLIDE_TO_RIGHT'
    | 'TUTORIAL_STEP_1'
    | 'TUTORIAL_STEP_2'
    | 'TUTORIAL_STEP_3'
    | 'HOME_IDLE_READY';

  const [homeFlowState, setHomeFlowState] = useState<HomescreenFlowState>(() => {
    if (isRegistrationOpen) return 'REGISTRATION';
    try {
      const isDone = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
      const isIntroPending = localStorage.getItem(INTRO_PENDING_STORAGE_KEY) === 'true';
      if (!isDone || isIntroPending) {
        return 'HOME_CENTER_GREETING';
      }
    } catch {
      // ignore
    }
    return 'HOME_IDLE_READY';
  });

  const introPhase: 'none' | 'center-greeting' | 'sliding-right' =
    homeFlowState === 'HOME_CENTER_GREETING'
      ? 'center-greeting'
      : homeFlowState === 'HOME_SLIDE_TO_RIGHT'
        ? 'sliding-right'
        : 'none';

  const tutorialStep: 0 | 1 | 2 | 3 =
    homeFlowState === 'TUTORIAL_STEP_1'
      ? 1
      : homeFlowState === 'TUTORIAL_STEP_2'
        ? 2
        : homeFlowState === 'TUTORIAL_STEP_3'
          ? 3
          : 0;

  const [isTutorialTalking, setIsTutorialTalking] = useState<boolean>(false);
  const [tutorialVideoPlayKey, setTutorialVideoPlayKey] = useState<number>(0);

  // Persistence & State Hook
  const {
    addMisiRewards,
    getEmotion,
  } = useTamagotchi();

  // Birthday Detection & Celebration Trigger
  const isBirthdayToday = useMemo(() => {
    if (!childProfile?.birthDate) return false;
    const today = new Date();
    return (
      today.getDate() === childProfile.birthDate.day &&
      today.getMonth() + 1 === childProfile.birthDate.month
    );
  }, [childProfile]);

  useEffect(() => {
    if (isBirthdayToday && introPhase === 'none') {
      try {
        playCheerSound();
      } catch {
        // ignore
      }
      setMascotEmotionOverride('celebrating');
    }
  }, [isBirthdayToday, introPhase]);

  // Pawchi Daily Checklist & Habit Streak Hook
  const {
    completedCount: dailyCompletedCount,
    totalTasks: dailyTotalTasks,
    isAllCompleted: isDailyAllCompleted,
    streak: dailyStreak,
    tasks: dailyTasks,
    claimedBonusToday: dailyClaimedBonusToday,
    trackQuiz: trackDailyQuiz,
    trackPet: trackDailyPet,
    claimBonus: claimDailyBonus,
  } = useDailyChecklist();

  // Refs
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mascotContainerRef = useRef<HTMLDivElement | null>(null);
  const viewContainerRef = useRef<HTMLDivElement | null>(null);

  const clearVoiceSequence = useCallback(() => {
    voiceTimersRef.current.forEach((t) => clearTimeout(t));
    voiceTimersRef.current = [];
    setHighlightedCardIndex(null);
    cancelSpeechSynthesis();
  }, []);

  const wasRegistrationOpenRef = useRef<boolean>(Boolean(isRegistrationOpen));

  // Transition from REGISTRATION / ISLAND_FLYOVER_10S -> HOME_CENTER_GREETING when KidsRegistrationModal unmounts
  useEffect(() => {
    const justClosedRegistration = wasRegistrationOpenRef.current && !isRegistrationOpen;
    wasRegistrationOpenRef.current = Boolean(isRegistrationOpen);

    if (isRegistrationOpen) {
      if (homeFlowState !== 'REGISTRATION') {
        clearVoiceSequence();
        setHomeFlowState('REGISTRATION');
      }
      return;
    }

    if (!childProfile) return;
    try {
      const isIntroPending = localStorage.getItem(INTRO_PENDING_STORAGE_KEY) === 'true';
      const isDone = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
      if (justClosedRegistration && isIntroPending) {
        setIsBudiHouseOpen(false);
        setIsPlayingReturningWelcome(false);
        setHomeFlowState('HOME_CENTER_GREETING');
        setTutorialVideoPlayKey((k) => k + 1);
        return;
      }
      if (homeFlowState === 'REGISTRATION') {
        if (isIntroPending || !isDone) {
          setIsPlayingReturningWelcome(false);
          setHomeFlowState('HOME_CENTER_GREETING');
        } else {
          setHomeFlowState('HOME_IDLE_READY');
        }
      }
    } catch {
      // ignore
    }
  }, [isRegistrationOpen, childProfile, homeFlowState, clearVoiceSequence]);

  // KOREOGRAFI ANAK YANG SUDAH TERDAFTAR MEMBUKA APLIKASI (HOME_IDLE_READY):
  // Budi langsung berada di kanan bukit dan menyapa sambil menunjuk ke 4 kartu aktivitas
  useEffect(() => {
    if (isRegistrationOpen || !childProfile || homeFlowState !== 'HOME_IDLE_READY' || isBudiHouseOpen) return;
    try {
      const isIntroPending = localStorage.getItem(INTRO_PENDING_STORAGE_KEY) === 'true';
      const isDone = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
      if (isIntroPending || !isDone) return;
    } catch {
      return;
    }

    if (hasPlayedReturningWelcomeRef.current) return;
    hasPlayedReturningWelcomeRef.current = true;

    clearVoiceSequence();
    setIsMascotWaving(false);
    setIsMascotSpeaking(false);
    setMascotEmotionOverride(null);
    setIsPlayingReturningWelcome(true);
    setReturningWelcomePlayKey((prev) => prev + 1);

    const tCard0 = setTimeout(() => setHighlightedCardIndex(0), 3750);
    const tCard1 = setTimeout(() => setHighlightedCardIndex(1), 4350);
    const tCard2 = setTimeout(() => setHighlightedCardIndex(2), 4950);
    const tCard3 = setTimeout(() => setHighlightedCardIndex(3), 5550);
    const tCardClear = setTimeout(() => setHighlightedCardIndex(null), 6250);
    const tFinishVideo = setTimeout(() => {
      setIsPlayingReturningWelcome(false);
      setHighlightedCardIndex(null);
      setMascotEmotionOverride(null);
    }, 6500);

    voiceTimersRef.current.push(tCard0, tCard1, tCard2, tCard3, tCardClear, tFinishVideo);

    return () => {
      clearVoiceSequence();
    };
  }, [isRegistrationOpen, childProfile, homeFlowState, isBudiHouseOpen, clearVoiceSequence]);

  // STATE MACHINE STEP: HOME_CENTER_GREETING -> HOME_SLIDE_TO_RIGHT -> TUTORIAL_STEP_1
  const handleCenterIntroSpeechComplete = useCallback(() => {
    clearVoiceSequence();
    setIsMascotWaving(false);
    setIsMascotSpeaking(false);
    setMascotEmotionOverride(null);

    // Biarkan Budi berada di potongan video idle berdiri tegak tersenyum sejenak (~450ms), lalu geser halus ke kanan bukit (HOME_SLIDE_TO_RIGHT)
    const startSlideTimer = setTimeout(() => {
      setHomeFlowState((prev) => (prev === 'HOME_CENTER_GREETING' ? 'HOME_SLIDE_TO_RIGHT' : prev));

      const finishSlideTimer = setTimeout(() => {
        try {
          localStorage.removeItem(INTRO_PENDING_STORAGE_KEY);
        } catch {
          // ignore
        }
        setIsTutorialTalking(true);
        setTutorialVideoPlayKey((k) => k + 1);
        setHomeFlowState('TUTORIAL_STEP_1');
      }, 1000);
      voiceTimersRef.current.push(finishSlideTimer);
    }, 450);

    voiceTimersRef.current.push(startSlideTimer);
  }, [clearVoiceSequence]);

  const handleTutorialStepSpeechComplete = useCallback(() => {
    setIsTutorialTalking(false);
    setHighlightedCardIndex(null);
  }, []);

  useEffect(() => {
    if (isRegistrationOpen || !childProfile || homeFlowState !== 'HOME_CENTER_GREETING') return;

    clearVoiceSequence();
    setIsGuidingDailyMission(false);
    setIsMascotWaving(false);
    setIsMascotSpeaking(false);
    setMascotEmotionOverride(null);
    setTutorialVideoPlayKey((k) => k + 1);

    // Safety fallback jika video di tengah layar tertahan
    const safetySlideTimer = setTimeout(() => {
      handleCenterIntroSpeechComplete();
    }, 6400);
    voiceTimersRef.current.push(safetySlideTimer);

    return () => {
      clearTimeout(safetySlideTimer);
    };
  }, [isRegistrationOpen, childProfile, homeFlowState, clearVoiceSequence, handleCenterIntroSpeechComplete]);

  // Synchronized Budi Video Choreography & Lock for TUTORIAL_STEP_1, TUTORIAL_STEP_2, TUTORIAL_STEP_3
  useEffect(() => {
    if (
      homeFlowState !== 'TUTORIAL_STEP_1' &&
      homeFlowState !== 'TUTORIAL_STEP_2' &&
      homeFlowState !== 'TUTORIAL_STEP_3'
    ) {
      return;
    }

    clearVoiceSequence();
    setIsGuidingDailyMission(false);
    setIsMascotWaving(false);
    setIsMascotSpeaking(false);
    setMascotEmotionOverride(null);
    setIsTutorialTalking(true);
    setTutorialVideoPlayKey((k) => k + 1);

    if (homeFlowState === 'TUTORIAL_STEP_1') {
      const fallback1 = setTimeout(() => {
        setIsTutorialTalking(false);
      }, 5500);
      voiceTimersRef.current.push(fallback1);
    } else if (homeFlowState === 'TUTORIAL_STEP_2') {
      const tCard0 = setTimeout(() => setHighlightedCardIndex(0), 3750);
      const tCard1 = setTimeout(() => setHighlightedCardIndex(1), 4350);
      const tCard2 = setTimeout(() => setHighlightedCardIndex(2), 4950);
      const tCard3 = setTimeout(() => setHighlightedCardIndex(3), 5550);
      const tCardClear = setTimeout(() => setHighlightedCardIndex(null), 6250);
      const fallback2 = setTimeout(() => {
        setIsTutorialTalking(false);
        setHighlightedCardIndex(null);
      }, 7000);
      voiceTimersRef.current.push(tCard0, tCard1, tCard2, tCard3, tCardClear, fallback2);
    } else if (homeFlowState === 'TUTORIAL_STEP_3') {
      const fallback3 = setTimeout(() => {
        setIsTutorialTalking(false);
      }, 10200);
      voiceTimersRef.current.push(fallback3);
    }

    return () => {
      clearVoiceSequence();
    };
  }, [homeFlowState, clearVoiceSequence]);

  const activeHomescreenGreenScreenVideo: GreenScreenVideoConfig | null = useMemo(() => {
    if (isRegistrationOpen || isBudiHouseOpen || homeFlowState === 'REGISTRATION') return null;

    // 1. HOME_CENTER_GREETING & HOME_SLIDE_TO_RIGHT (Video Awal Registrasi + segmen idle berdiri tegak mata terbuka cerah)
    if (homeFlowState === 'HOME_CENTER_GREETING' || homeFlowState === 'HOME_SLIDE_TO_RIGHT') {
      return {
        src: '/mascots/videos/tahap2_intro_home.mp4?v=clean_upright_idle_2',
        speechEndSec: 5.25,
        idleLoopStartSec: 5.65,
        idleLoopEndSec: 11.65,
        playKey: tutorialVideoPlayKey,
        onSpeechComplete: handleCenterIntroSpeechComplete,
      };
    }

    // 2. TUTORIAL_STEP_1 (Sorot Misi Harian + segmen idle berdiri tegak mata terbuka cerah)
    if (homeFlowState === 'TUTORIAL_STEP_1') {
      return {
        src: '/mascots/videos/tahap3_nama.mp4?v=clean_upright_idle_2',
        speechEndSec: 4.85,
        idleLoopStartSec: 5.05,
        idleLoopEndSec: 10.95,
        playKey: tutorialVideoPlayKey,
        onSpeechComplete: handleTutorialStepSpeechComplete,
      };
    }

    // 3. TUTORIAL_STEP_2 (Sorot 4 Kartu Aktivitas Kiri + segmen idle berdiri tegak mata terbuka cerah)
    if (homeFlowState === 'TUTORIAL_STEP_2') {
      return {
        src: '/mascots/videos/homescreen_welcome.mp4?v=clean_upright_idle_2',
        speechEndSec: 6.30,
        idleLoopStartSec: 6.65,
        idleLoopEndSec: 9.75,
        playKey: tutorialVideoPlayKey,
        onSpeechComplete: handleTutorialStepSpeechComplete,
      };
    }

    // 4. TUTORIAL_STEP_3 (Sorot Dock Buku Profil Pink & Misi Harian + segmen idle berdiri tegak mata terbuka cerah)
    if (homeFlowState === 'TUTORIAL_STEP_3') {
      return {
        src: '/mascots/videos/tahap5_kartu.mp4?v=clean_upright_idle_2',
        speechEndSec: 9.45,
        idleLoopStartSec: 9.65,
        idleLoopEndSec: 15.55,
        playKey: tutorialVideoPlayKey,
        onSpeechComplete: handleTutorialStepSpeechComplete,
      };
    }

    // 5. HOME_IDLE_READY (Anak yang sudah terdaftar kembali ke Beranda -> sapaan lalu kembali ke budi_idle.mp4 berdiri tegak)
    if (isPlayingReturningWelcome && homeFlowState === 'HOME_IDLE_READY') {
      return {
        src: '/mascots/videos/homescreen_welcome.mp4?v=clean_upright_idle_2',
        speechEndSec: 6.30,
        idleLoopStartSec: 6.65,
        idleLoopEndSec: 9.75,
        playKey: returningWelcomePlayKey,
        onSpeechComplete: () => {
          setIsPlayingReturningWelcome(false);
          setHighlightedCardIndex(null);
        },
        onMutedAutoplayFallback: () => {
          speakTextUtterance(
            'Selamat datang! Bagaimana perasaanmu hari ini? Silakan pilih aktivitasmu ya!',
            {
              lang: 'id-ID',
              rate: 1.01,
              pitch: 1.14,
            }
          );
        },
      };
    }

    return null;
  }, [
    isRegistrationOpen,
    isBudiHouseOpen,
    homeFlowState,
    tutorialVideoPlayKey,
    isPlayingReturningWelcome,
    returningWelcomePlayKey,
    handleCenterIntroSpeechComplete,
    handleTutorialStepSpeechComplete,
  ]);

  // =========================================================================
  // HANDLER FOR "MENGOBROL BERSAMA BUDI" -> MASUK RUMAH BUDI (BudiHouseRoom)
  // =========================================================================
  const handleOpenChatWithBudi = useCallback(() => {
    playPopSound();
    clearVoiceSequence();
    setIsPlayingReturningWelcome(false);
    setIsGuidingDailyMission(false);
    setIsMascotWaving(false);
    setIsMascotSpeaking(false);
    setMascotEmotionOverride(null);
    setHomeFlowState('HOME_IDLE_READY');
    setIsBudiHouseOpen(true);
  }, [clearVoiceSequence]);

  const handleStartTutorialReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playPopSound();
    setIsBudiHouseOpen(false);
    setIsTutorialTalking(true);
    setTutorialVideoPlayKey((k) => k + 1);
    setHomeFlowState('TUTORIAL_STEP_1');
  };

  const handleNextTutorialStep = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTutorialTalking) return;
    playPopSound();
    if (homeFlowState === 'TUTORIAL_STEP_1') {
      setIsTutorialTalking(true);
      setHomeFlowState('TUTORIAL_STEP_2');
    } else if (homeFlowState === 'TUTORIAL_STEP_2') {
      setIsTutorialTalking(true);
      setHomeFlowState('TUTORIAL_STEP_3');
    } else if (homeFlowState === 'TUTORIAL_STEP_3') {
      handleFinishTutorial(true);
    }
  };

  const handleFinishTutorial = (withCelebration: boolean) => {
    if (isTutorialTalking) return;
    clearVoiceSequence();
    setIsTutorialTalking(false);
    setIsPlayingReturningWelcome(false);
    hasPlayedReturningWelcomeRef.current = true;
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      localStorage.removeItem(INTRO_PENDING_STORAGE_KEY);
    } catch {
      // ignore
    }
    setHomeFlowState('HOME_IDLE_READY');
    setIsMascotWaving(false);
    setIsMascotSpeaking(false);
    setHighlightedCardIndex(null);
    setMascotEmotionOverride(null);

    if (withCelebration) {
      playCheerSound();
      try {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.65 },
          colors: ['#fbbf24', '#a3e635', '#38bdf8', '#f97316', '#ec4899'],
        });
      } catch {
        // ignore
      }
    } else {
      playPopSound();
    }
  };

  // Trigger short cheerful voice & pose (Semangat ✊ or Jempol 👍) followed by smooth talking animation
  const triggerStudioStyleReaction = (poseEmotion: 'celebrating' | 'proud', voiceLine: string) => {
    clearVoiceSequence();
    setIsGuidingDailyMission(false);
    setIsMascotWaving(false);
    setIsMascotSpeaking(true);
    setMascotEmotionOverride(poseEmotion);

    const switchToTalkTimer = setTimeout(() => {
      setIsMascotSpeaking(true);
      setMascotEmotionOverride('talking');
    }, 900);
    voiceTimersRef.current.push(switchToTalkTimer);

    const settleToIdle = () => {
      setIsMascotSpeaking(false);
      setMascotEmotionOverride(null);
    };

    speakTextUtterance(voiceLine, {
      lang: 'id-ID',
      rate: 1.02,
      pitch: 1.15,
      onEnd: settleToIdle,
      onError: settleToIdle,
    });

    const fallbackTimer = setTimeout(settleToIdle, 5200);
    voiceTimersRef.current.push(fallbackTimer);
  };

  const handleSelectSkyTheme = (nextSky: SkyThemeId) => {
    setSkyTheme(nextSky);
    try {
      localStorage.setItem('ceriakids_sky_theme', nextSky);
    } catch {
      // ignore
    }

    const reactions: Record<SkyThemeId, { pose: 'celebrating' | 'proud'; text: string }> = {
      sunset: {
        pose: 'proud',
        text: 'Suasana Bukit Senja yang hangat! Nyaman sekali buat belajar sore.',
      },
      morning: {
        pose: 'celebrating',
        text: 'Segarnya Pagi Cerah! Matahari bersinar hangat, ayo semangat beraktivitas!',
      },
      night: {
        pose: 'celebrating',
        text: 'Indahnya Malam Bintang! Lihat bintang berkilau dan kunang-kunang emas itu!',
      },
    };
    const chosen = reactions[nextSky];
    triggerStudioStyleReaction(chosen.pose, chosen.text);
  };

  // Misi Harian Voice & Smooth Talking Sequence
  const handleDailyMissionVoiceGuide = () => {
    if (tutorialStep === 1) {
      if (!isTutorialTalking) {
        handleNextTutorialStep();
      }
      return;
    }

    clearVoiceSequence();
    setIsGuidingDailyMission(true);

    // Phase 1 (0 - 0.85s): 👋 Sapa (Wave) singkat saat "Halo teman petualang!"
    setIsMascotWaving(true);
    setIsMascotSpeaking(true);
    setMascotEmotionOverride('talking');

    // Phase 2 (0.85s -> end of speech): 🗣️ Bicara mulus (Ping-Pong Talking Loop dari frame registrasi)
    const talkPhaseTimer = setTimeout(() => {
      setIsMascotWaving(false);
      setIsMascotSpeaking(true);
      setMascotEmotionOverride('talking');
    }, 850);
    voiceTimersRef.current.push(talkPhaseTimer);

    const onMissionSpeechEnd = () => {
      // Begitu suara Budi selesai (onend), kembalikan transisi frame secara mulus menuju frame netral (idle frame 0)
      setIsMascotWaving(false);
      setIsMascotSpeaking(false);
      setMascotEmotionOverride(null);
      setIsGuidingDailyMission(false);
    };

    speakTextUtterance(
      'Halo teman petualang! Misi harianmu sudah selesai dua dari tiga! Tinggal satu misi lagi untuk dapat hadiah. Yuk pilih kartu Membaca, Berpetualang, Menggambar, atau Mengobrol bersama Budi!',
      {
        lang: 'id-ID',
        rate: 1.01,
        pitch: 1.14,
        onEnd: onMissionSpeechEnd,
        onError: onMissionSpeechEnd,
      }
    );

    const safetyTimer = setTimeout(onMissionSpeechEnd, 11500);
    voiceTimersRef.current.push(safetyTimer);
  };

  // Landscape / Horizontal Screen Detection
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (viewContainerRef.current) {
        const rect = viewContainerRef.current.getBoundingClientRect();
        setIsLandscape(rect.width > rect.height * 1.05);
      } else if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && viewContainerRef.current) {
      ro = new ResizeObserver(checkOrientation);
      ro.observe(viewContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
      clearVoiceSequence();
    };
  }, [clearVoiceSequence]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBudiHouseOpen) {
          setIsBudiHouseOpen(false);
        } else if (tutorialStep > 0 && !isTutorialTalking) {
          handleFinishTutorial(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tutorialStep, isTutorialTalking, isBudiHouseOpen]);

  const handleMascotTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    playPopSound();
    trackDailyPet();
  };

  const mascotEmotion: CharviEmotion = useMemo(() => {
    return mascotEmotionOverride || getEmotion();
  }, [mascotEmotionOverride, getEmotion]);

  return (
    <div
      ref={viewContainerRef}
      className="relative w-full h-full bg-white text-neutral-900 flex flex-col justify-start overflow-hidden select-none cursor-default"
    >
      <HabitatWorlds skyTheme={skyTheme} />

      {/* Interactive First-Time Spotlight Tutorial Backdrop (3 Langkah Singkat Tanpa Pindah Halaman) */}
      <AnimatePresence>
        {tutorialStep > 0 && (
          <motion.div
            key="spotlight-tutorial-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Birthday Celebration Banner */}
      {isBirthdayToday && !isBudiHouseOpen && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs tablet:text-sm py-2 px-4 shadow-md flex items-center justify-center gap-2 border-b-2 border-amber-300 z-30 tracking-wide"
        >
          <span>🥳 SELAMAT ULANG TAHUN, {childProfile?.name?.toUpperCase() || 'SI KECIL'}! 🎉🎂</span>
        </motion.div>
      )}

      {/* Top-Right Control: Tur Panduan ("pindahkan tur panduan ke sini") */}
      {tutorialStep === 0 && (
        <motion.div
          animate={{
            opacity: introPhase !== 'none' ? 0 : 1,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`absolute top-3 sm:top-4 right-3 sm:right-6 tablet:right-8 z-30 transition-all duration-500 ${
            introPhase !== 'none'
              ? 'opacity-0 pointer-events-none -translate-y-4'
              : 'opacity-100 pointer-events-auto translate-y-0'
          }`}
        >
          <motion.button
            type="button"
            onClick={handleStartTutorialReplay}
            whileHover={{ scale: 1.05, y: 2 }}
            whileTap={{ scale: 0.95 }}
            title="Putar ulang Tur Panduan bersama Budi"
            className="px-3 py-2 tablet:px-3.5 tablet:py-2.5 rounded-2xl bg-[#FFFDF5]/95 hover:bg-[#FFFDF5] border-2 border-amber-300 shadow-[0_6px_16px_rgba(245,158,11,0.18)] text-amber-950 font-extrabold text-xs tablet:text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 backdrop-blur-sm"
          >
            <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs leading-none shadow-2xs">
              ❓
            </span>
            <span>Tur Panduan</span>
          </motion.button>
        </motion.div>
      )}

      {/* Bottom-Right Dock: Misi Harian & Buku Profil Pink */}
      <motion.div
        animate={{
          opacity: introPhase !== 'none' ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClickCapture={(e) => {
          if (tutorialStep === 3) {
            e.stopPropagation();
            if (!isTutorialTalking) {
              handleFinishTutorial(true);
            }
          }
        }}
        className={`absolute bottom-3 sm:bottom-4 tablet:bottom-5 lg:bottom-6 right-3 sm:right-6 tablet:right-8 flex items-center gap-2 sm:gap-2.5 transition-all duration-500 ${
          introPhase !== 'none'
            ? 'opacity-0 pointer-events-none -translate-x-6'
            : 'opacity-100 pointer-events-auto translate-x-0'
        } ${
          tutorialStep === 1 || tutorialStep === 3
            ? 'z-50'
            : 'z-30'
        }`}
      >

        {/* Misi Harian Panel (Berdampingan Rapi di Sebelah Tombol Buku Profil Pink) */}
        <div
          className={`relative rounded-2xl transition-all duration-300 ${
            tutorialStep === 1 || tutorialStep === 3
              ? 'animate-pulse ring-4 ring-amber-300 shadow-[0_0_38px_rgba(251,191,36,0.85)] bg-amber-200/20 p-1'
              : ''
          }`}
        >
          {/* Step 1 Pointer Badge */}
          {tutorialStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{ y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } }}
              className="absolute -top-11 right-0 bg-amber-400 text-amber-950 font-black text-xs tablet:text-sm px-3.5 py-1 rounded-full border-2 border-white shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1.5"
            >
              <span>👇</span>
              <span>Langkah 1: Misi Harianmu!</span>
            </motion.div>
          )}

          <DailyChecklistWidget
            isInline={true}
            completedCount={dailyCompletedCount}
            totalTasks={dailyTotalTasks}
            isAllCompleted={isDailyAllCompleted}
            streak={dailyStreak}
            tasks={dailyTasks}
            claimedBonusToday={dailyClaimedBonusToday}
            onVoiceGuideClick={handleDailyMissionVoiceGuide}
            isGuidingVoice={isGuidingDailyMission || tutorialStep === 1}
            onClaimBonus={() => {
              claimDailyBonus();
              addMisiRewards(1, 10);
            }}
            onOpenFeedMenu={handleOpenChatWithBudi}
            onOpenQuizMenu={() => {
              setSelectedCategory(undefined);
              setIsQuizModalOpen(true);
            }}
            onPetMascotAction={() => {
              trackDailyPet();
              if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
              setMascotEmotionOverride('excited');
              emotionTimerRef.current = setTimeout(() => setMascotEmotionOverride(null), 2000);
            }}
          />
        </div>

        {/* Buku Profil Pink (Dock Kanan Bawah) */}
        <div
          className={`relative rounded-2xl transition-all duration-300 ${
            tutorialStep === 3
              ? 'animate-pulse ring-4 ring-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.9)] p-1 bg-amber-200/20'
              : ''
          }`}
        >
          {/* Step 3 Pointer Badge */}
          {tutorialStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{ y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } }}
              className="absolute -top-11 right-0 bg-amber-400 text-amber-950 font-black text-xs tablet:text-sm px-3.5 py-1 rounded-full border-2 border-white shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1.5"
            >
              <span>👇</span>
              <span>Langkah 3: Buku Profil &amp; Misi Harian!</span>
            </motion.div>
          )}

          <CincauNavBar
            direction="horizontal"
            childProfile={childProfile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        </div>
      </motion.div>

      {/* Main 2-Column Home Stage (Left: 4 Stacked White Cards | Right/Center: Animated Budi Mascot) */}
      <div className="w-full relative flex-1 min-h-0 flex flex-col tablet:block px-3 sm:px-6 tablet:px-8 lg:px-10 xl:px-12 pb-16 tablet:pb-5 pt-4 sm:pt-5 tablet:pt-4 lg:pt-5 overflow-y-auto tablet:overflow-hidden pointer-events-none">
        {/* LEFT COLUMN: 4 Vertically Stacked White Action Cards */}
        <motion.div
          initial={false}
          animate={{
            opacity: introPhase !== 'none' ? 0 : 1,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClickCapture={(e) => {
            if (tutorialStep === 2) {
              e.stopPropagation();
              if (!isTutorialTalking) {
                handleNextTutorialStep();
              }
            }
          }}
          className={`relative w-full tablet:w-[56%] lg:w-[54%] xl:w-[52%] max-w-[640px] xl:max-w-[680px] tablet:h-full flex flex-col justify-between items-center tablet:items-start mx-auto tablet:mx-0 transition-all duration-500 ${
            introPhase !== 'none'
              ? 'opacity-0 pointer-events-none -translate-x-6'
              : 'opacity-100 pointer-events-auto translate-x-0'
          } ${
            tutorialStep === 2
              ? 'z-50 rounded-[34px] animate-pulse ring-4 ring-amber-300 shadow-[0_0_42px_rgba(251,191,36,0.85)] p-1.5 bg-amber-300/15'
              : 'z-20'
          }`}
        >
          {/* Step 2 Pointer Badge */}
          {tutorialStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: [0, 6, 0] }}
              transition={{ x: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } }}
              className="mb-1.5 self-start bg-amber-400 text-amber-950 font-black text-xs tablet:text-sm px-3.5 py-1 rounded-full border-2 border-white shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1.5"
            >
              <span>🌟</span>
              <span>Langkah 2: Pilih 4 Aktivitas Seru!</span>
            </motion.div>
          )}

          <BentoActionCards
            onOpenLearningRoom={() => {
              setIsToycadLearningRoomOpen(true);
            }}
            onOpenPlayRoom={() => {
              setIsToycadPlayRoomOpen(true);
            }}
            onOpenDrawingStudio={() => {
              setIsDrawingStudioOpen(true);
            }}
            onOpenChatWithBudi={handleOpenChatWithBudi}
            isCompact={isLandscape}
            highlightedCardIndex={highlightedCardIndex}
          />
        </motion.div>

        {/* SINGLE MAIN BUDI MASCOT ON HILL:
            - Center during HOME_CENTER_GREETING (same scale-100 and bottom coordinate so HOME_SLIDE_TO_RIGHT has zero scale/vertical jump)
            - Right Hill during HOME_SLIDE_TO_RIGHT, TUTORIAL_STEP_1..3, and HOME_IDLE_READY */}
        {!isRegistrationOpen && !isToycadPlayRoomOpen && !isToycadLearningRoomOpen && !isBudiHouseOpen && (
          <div
            className={`pointer-events-none transition-all duration-1000 ease-in-out ${
              homeFlowState === 'HOME_CENTER_GREETING'
                ? 'absolute bottom-[18%] tablet:bottom-[24.5%] left-1/2 -translate-x-1/2 scale-100 z-50'
                : homeFlowState === 'HOME_SLIDE_TO_RIGHT'
                  ? 'absolute bottom-[18%] tablet:bottom-[24.5%] left-[76%] tablet:left-[82.5%] -translate-x-1/2 scale-100 z-50'
                  : `w-full tablet:w-auto flex justify-center tablet:block mt-2 tablet:mt-0 tablet:absolute tablet:bottom-[24.5%] tablet:left-[82.5%] tablet:-translate-x-1/2 scale-100 ${
                      tutorialStep > 0 ? 'z-50' : 'z-10'
                    }`
            }`}
          >
            <div
              ref={mascotContainerRef}
              onClick={handleMascotTap}
              className="pointer-events-auto cursor-pointer select-none [-webkit-tap-highlight-color:transparent] flex flex-col justify-end items-center shrink-0"
            >
              <div className="flex justify-center items-end select-none [-webkit-tap-highlight-color:transparent]">
                <CharviMascot
                  variant="large-bottom"
                  lighting={skyTheme === 'sunset' ? 'sunset' : 'studio'}
                  emotion={mascotEmotion}
                  isSpeaking={isMascotSpeaking}
                  isWaving={isMascotWaving}
                  greenScreenVideo={activeHomescreenGreenScreenVideo}
                  onEmotionChange={(emo) => {
                    setMascotEmotionOverride(emo === 'idle' ? null : emo);
                  }}
                  className="w-[240px] h-[340px] tablet:w-[34vh] tablet:h-[59vh] tablet:min-w-[220px] tablet:min-h-[380px] tablet:max-w-[330px] tablet:max-h-[560px] drop-shadow-[8px_14px_20px_rgba(38,24,56,0.42)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigasi Tutorial Ramah Anak (Floating Bottom-Center CTA + Top-Left Skip) */}
      <AnimatePresence>
        {tutorialStep > 0 && (
          <>
            {/* Tombol "Lewati ⏭️" Kecil di Pojok (Dikunci selama Budi masih berbicara) */}
            <motion.button
              key="tutorial-skip-btn"
              type="button"
              disabled={isTutorialTalking}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={isTutorialTalking ? undefined : { scale: 1.05 }}
              whileTap={isTutorialTalking ? undefined : { scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                if (isTutorialTalking) return;
                handleFinishTutorial(false);
              }}
              className={`fixed top-3 left-3 sm:top-4 sm:left-6 z-[60] px-3.5 py-2 rounded-full bg-slate-900/80 text-white/95 font-extrabold text-xs tablet:text-sm border-2 border-white/30 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all ${
                isTutorialTalking
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-slate-900 cursor-pointer'
              }`}
            >
              <span>Lewati</span>
              <span>⏭️</span>
            </motion.button>

            {/* Tombol Melayang Besar & Ceria di Bawah-Tengah Layar */}
            <motion.div
              key="tutorial-bottom-nav"
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-auto"
            >
              {/* Indikator "🔊 Dengarkan Budi dulu ya..." saat Budi masih berbicara */}
              {isTutorialTalking && (
                <div className="px-3.5 py-1 rounded-full bg-amber-100/95 border-2 border-amber-300 text-amber-950 font-extrabold text-xs shadow-md animate-pulse flex items-center gap-1.5">
                  <span>🔊 Dengarkan Budi dulu ya...</span>
                </div>
              )}

              {/* Indikator 3 Langkah */}
              <div className="flex items-center gap-2 bg-slate-900/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25 shadow-md">
                {[1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      tutorialStep === idx
                        ? 'w-7 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                        : tutorialStep > idx
                          ? 'w-2.5 bg-emerald-400'
                          : 'w-2.5 bg-white/35'
                    }`}
                  />
                ))}
                <span className="text-[11px] font-black text-amber-200 ml-1">
                  {tutorialStep}/3
                </span>
              </div>

              {tutorialStep < 3 ? (
                <motion.button
                  type="button"
                  disabled={isTutorialTalking}
                  whileHover={isTutorialTalking ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={isTutorialTalking ? undefined : { scale: 0.95 }}
                  onClick={handleNextTutorialStep}
                  className={`px-7 py-3.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-amber-950 font-black text-base sm:text-lg tablet:text-xl border-4 border-white shadow-[0_8px_0_0_#b45309,0_16px_32px_rgba(0,0,0,0.45)] flex items-center gap-2.5 transition-all ${
                    isTutorialTalking
                      ? 'opacity-50 cursor-not-allowed'
                      : 'active:translate-y-1 active:shadow-[0_3px_0_0_#b45309] cursor-pointer'
                  }`}
                >
                  <span>Lanjut</span>
                  <span className="text-xl sm:text-2xl leading-none">👉</span>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  disabled={isTutorialTalking}
                  whileHover={isTutorialTalking ? undefined : { scale: 1.06, y: -2 }}
                  whileTap={isTutorialTalking ? undefined : { scale: 0.95 }}
                  onClick={() => handleFinishTutorial(true)}
                  className={`px-7 py-3.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-b from-lime-300 via-lime-400 to-emerald-500 text-emerald-950 font-black text-base sm:text-lg tablet:text-xl border-4 border-white shadow-[0_8px_0_0_#15803d,0_16px_32px_rgba(0,0,0,0.45)] flex items-center gap-2.5 transition-all ${
                    isTutorialTalking
                      ? 'opacity-50 cursor-not-allowed'
                      : 'active:translate-y-1 active:shadow-[0_3px_0_0_#15803d] cursor-pointer animate-bounce'
                  }`}
                >
                  <span>Ayo Mulai Main!</span>
                  <span className="text-xl sm:text-2xl leading-none">🚀</span>
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Learning Mission Quiz Modal */}
      <LearningMissionModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        fase={childProfile?.fase || 'A'}
        category={selectedCategory}
        onMissionSuccess={(earnedFood, earnedStars) => {
          addMisiRewards(earnedFood, earnedStars);
          trackDailyQuiz();
          if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
          setMascotEmotionOverride('excited');
          emotionTimerRef.current = setTimeout(() => setMascotEmotionOverride(null), 2800);
        }}
      />

      {/* 3D Open Pink Profile Notebook Modal (2-Page Spread) */}
      <ChildProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        childProfile={childProfile || null}
        skyTheme={skyTheme}
        onSelectSkyTheme={handleSelectSkyTheme}
        onLogout={() => {
          if (onLogout) onLogout();
        }}
        onEditProfile={() => {
          if (onOpenRegistration) onOpenRegistration();
        }}
      />

      {/* Dedicated Tactile Polygonal Play Learning Room (ToyCAD / MerdekaKids Aesthetic - No Bottom Nav Bar) */}
      <AnimatePresence>
        {isToycadLearningRoomOpen && (
          <ToycadLearningRoom
            onClose={() => setIsToycadLearningRoomOpen(false)}
            childProfile={childProfile}
          />
        )}
      </AnimatePresence>

      {/* Dedicated Tactile Polygonal Ruang Bermain 3D (ToyCAD / MerdekaKids Aesthetic) */}
      <AnimatePresence>
        {isToycadPlayRoomOpen && (
          <ToycadPlayRoom
            onClose={() => setIsToycadPlayRoomOpen(false)}
            childProfile={childProfile}
            onTrackInteraction={trackDailyPet}
            onAddRewards={addMisiRewards}
          />
        )}
      </AnimatePresence>

      {/* Ruang Khusus "Dalam Rumah Budi" (BudiHouseRoom) */}
      <AnimatePresence>
        {isBudiHouseOpen && (
          <BudiHouseRoom
            onClose={() => setIsBudiHouseOpen(false)}
            onOpenReadingRoom={() => {
              setIsBudiHouseOpen(false);
              setIsToycadLearningRoomOpen(true);
            }}
            onOpenDrawingStudio={() => {
              setIsBudiHouseOpen(false);
              setIsDrawingStudioOpen(true);
            }}
            childProfile={childProfile}
            onTrackInteraction={trackDailyPet}
            onAddRewards={addMisiRewards}
            transitionVideoSrc={BUDI_HOUSE_TRANSITION_VIDEO}
          />
        )}
      </AnimatePresence>

      {/* Pena Pintar Studio - Interactive Canvas Drawing Modal */}
      <DrawingStudioModal
        isOpen={isDrawingStudioOpen}
        onClose={() => setIsDrawingStudioOpen(false)}
      />
    </div>
  );
};
