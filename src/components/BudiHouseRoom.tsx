import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CharviMascot } from './CharviMascot';
import { CharviEmotion, ChildProfile } from '../types';
import { playPopSound, playCheerSound, playMunchSound } from '../utils/audioEffects';
import { speakTextUtterance, cancelSpeechSynthesis } from '../utils/speechUtils';
import { loadChildProgress, ChildProgressData } from '../utils/progressStorage';
import { HoneyBottleItem, RedAppleItem, WatermelonSliceItem } from './CincauFoodItems';

export const BUDI_HOUSE_INTERIOR_IMAGE =
  '/assets/aistudio/Generated_Image_October_23__2026_-_2_44AM_a92f59f9.jpg';

export const BUDI_HOUSE_TRANSITION_VIDEO =
  '/assets/aistudio/Generated_Video_October_23__2026_-_10_38AM_a85c92f5.mp4';

export const BUDI_HOUSE_TRANSITION_POSTER_2S =
  '/assets/aistudio/budi_house_transition_poster_2s.jpg';

export const BUDI_HOUSE_TRANSITION_START_SEC = 2.0;
export const BUDI_HOUSE_TRANSITION_END_SEC = 6.0;
export const BUDI_HOUSE_TRANSITION_DURATION_MS =
  (BUDI_HOUSE_TRANSITION_END_SEC - BUDI_HOUSE_TRANSITION_START_SEC) * 1000; // 4000ms (2.0s -> 6.0s)

/**
 * Warm Indoor Contact Shadow Filter for 3D Objects
 * Uses warm brownish base contact shadow matching the real toy car and potted plant in the room.
 * Free of yellow/gold rim-light glowing stickers.
 */
export const WARM_INDOOR_OBJECT_FILTER =
  'brightness(0.95) contrast(1.04) sepia(0.10) saturate(1.05) drop-shadow(-3px 5px 3px rgba(38, 18, 7, 0.62))';

export const WARM_INDOOR_BUDI_FILTER =
  'brightness(1.03) contrast(1.03) sepia(0.07) saturate(1.06) drop-shadow(-4px 6px 5px rgba(38, 18, 7, 0.50))';

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

const QUICK_TOPIC_CHIPS = [
  {
    id: 'dino',
    label: 'Dongeng Hewan',
    prompt: 'Budi, ceritakan dongeng seru tentang dinosaurus atau hewan ajaib dong!',
  },
  {
    id: 'riddle',
    label: 'Tebak-Tebakan',
    prompt: 'Budi, ayo kita main tebak-tebakan seru di rumahmu! Kasih aku satu tebakan ya!',
  },
  {
    id: 'world',
    label: 'Fakta Dunia',
    prompt: 'Budi, kasih tahu aku satu fakta ajaib tentang dunia atau luar angkasa dong!',
  },
  {
    id: 'school',
    label: 'Cerita Hari Ini',
    prompt: 'Budi, aku mau cerita tentang kegiatanku yang seru hari ini!',
  },
] as const;

interface SvgBadgeItem {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
  color: string;
  bgGlow: string;
  budiComment: string;
  medalImgSrc: string;
}

export interface BudiHouseTransitionOverlayProps {
  progress: number;
  transitionVideoSrc?: string;
  onProgressUpdate?: (pct: number) => void;
  onComplete?: () => void;
}

/**
 * Full-Screen Video Transition Overlay ("🏠 Masuk ke Rumah Budi...")
 * Plays specifically from 2.0s to 6.0s with an extracted 2.0s poster frame for zero black flash,
 * accompanied by a lightweight bottom glassmorphism progress capsule.
 */
export const BudiHouseTransitionOverlay: React.FC<BudiHouseTransitionOverlayProps> = ({
  progress,
  transitionVideoSrc = BUDI_HOUSE_TRANSITION_VIDEO,
  onProgressUpdate,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoSeekedTo2s, setIsVideoSeekedTo2s] = useState<boolean>(false);
  const completedRef = useRef<boolean>(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    completedRef.current = false;
    let rafId = 0;
    const startWallTime = performance.now();

    const seekAndPlayFrom2s = () => {
      try {
        if (vid.currentTime < BUDI_HOUSE_TRANSITION_START_SEC - 0.05) {
          vid.currentTime = BUDI_HOUSE_TRANSITION_START_SEC;
        }
      } catch {
        // ignore
      }
      vid.play().catch(() => {});
    };

    const handleSeeked = () => {
      if (vid.currentTime >= BUDI_HOUSE_TRANSITION_START_SEC - 0.1) {
        setIsVideoSeekedTo2s(true);
      }
    };

    vid.addEventListener('seeked', handleSeeked);

    if (vid.readyState >= 1) {
      seekAndPlayFrom2s();
    } else {
      vid.addEventListener('loadedmetadata', seekAndPlayFrom2s, { once: true });
    }

    const syncPlaybackWindow = (now: number) => {
      if (completedRef.current) return;

      const elapsedMs = now - startWallTime;
      const wallPct = Math.min(100, (elapsedMs / BUDI_HOUSE_TRANSITION_DURATION_MS) * 100);

      let currentPct = wallPct;
      if (vid && !vid.paused && vid.currentTime >= BUDI_HOUSE_TRANSITION_START_SEC - 0.05) {
        setIsVideoSeekedTo2s(true);
        const videoElapsedSec = Math.max(0, vid.currentTime - BUDI_HOUSE_TRANSITION_START_SEC);
        const totalWindowSec = BUDI_HOUSE_TRANSITION_END_SEC - BUDI_HOUSE_TRANSITION_START_SEC;
        const videoPct = Math.min(100, (videoElapsedSec / totalWindowSec) * 100);
        currentPct = Math.max(wallPct * 0.85, videoPct);
      }

      onProgressUpdate?.(currentPct);

      const reached6s =
        (vid && vid.currentTime >= BUDI_HOUSE_TRANSITION_END_SEC - 0.04) ||
        elapsedMs >= BUDI_HOUSE_TRANSITION_DURATION_MS;

      if (reached6s) {
        completedRef.current = true;
        onProgressUpdate?.(100);
        try {
          vid.pause();
        } catch {
          // ignore
        }
        onComplete?.();
        return;
      }

      rafId = requestAnimationFrame(syncPlaybackWindow);
    };

    rafId = requestAnimationFrame(syncPlaybackWindow);

    return () => {
      cancelAnimationFrame(rafId);
      vid.removeEventListener('seeked', handleSeeked);
    };
  }, [onProgressUpdate, onComplete]);

  return (
    <motion.div
      key="budi-house-loading-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-[110] w-full h-full overflow-hidden bg-[#241409] select-none"
    >
      {/* Base 2.0s Poster Layer to Guarantee Zero Black Flash & Zero Jump from 0.0s */}
      <img
        src={BUDI_HOUSE_TRANSITION_POSTER_2S}
        alt="Transisi Masuk Rumah Budi"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* Full-Screen Transition Video Playing Strictly 2.0s -> 6.0s */}
      <video
        ref={videoRef}
        src={transitionVideoSrc}
        poster={BUDI_HOUSE_TRANSITION_POSTER_2S}
        autoPlay
        playsInline
        muted
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-150 ${
          isVideoSeekedTo2s ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Lightweight Bottom Glassmorphism Capsule ("🏠 Masuk ke Rumah Budi...") */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[340px] pointer-events-none">
        <div className="px-4 py-3 rounded-3xl bg-black/35 backdrop-blur-xl border border-white/35 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Rumah Budi...
            </span>
            <span className="text-xs font-black text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden p-0.2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-400 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export interface BudiHouseRoomProps {
  onClose: () => void;
  onOpenReadingRoom?: () => void;
  onOpenDrawingStudio?: () => void;
  childProfile?: ChildProfile | null;
  onTrackInteraction?: () => void;
  onAddRewards?: (food: number, stars: number) => void;
  transitionVideoSrc?: string;
}

export const BudiHouseRoom: React.FC<BudiHouseRoomProps> = ({
  onClose,
  onOpenReadingRoom,
  onOpenDrawingStudio,
  childProfile,
  onTrackInteraction,
  onAddRewards,
  transitionVideoSrc = BUDI_HOUSE_TRANSITION_VIDEO,
}) => {
  // 4.0s (2.0s -> 6.0s) Video Entry Loading State ("🏠 Masuk ke Rumah Budi...")
  const [isEnteringLoading, setIsEnteringLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Mascot & Inclusive Chat State
  const [mascotEmotionOverride, setMascotEmotionOverride] = useState<CharviEmotion | null>(null);
  const [isMascotSpeaking, setIsMascotSpeaking] = useState<boolean>(false);
  const [isMascotWaving, setIsMascotWaving] = useState<boolean>(false);

  const [budiSpeechText, setBudiSpeechText] = useState<string>('');
  const [chatInputText, setChatInputText] = useState<string>('');
  const [isChatThinking, setIsChatThinking] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [micStatusHint, setMicStatusHint] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [isIdeaPopoverOpen, setIsIdeaPopoverOpen] = useState<boolean>(false);

  // SVG Kotak Lencana & Kotak Hadiah Modals
  const [activeRoomModal, setActiveRoomModal] = useState<'none' | 'badges' | 'gifts'>('none');
  const [progressData, setProgressData] = useState<ChildProgressData>(() => loadChildProgress());
  const [openedGiftIds, setOpenedGiftIds] = useState<string[]>([]);

  const voiceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const hasGreetedOnEnterRef = useRef<boolean>(false);

  const clearVoiceSequence = useCallback(() => {
    voiceTimersRef.current.forEach((t) => clearTimeout(t));
    voiceTimersRef.current = [];
    cancelSpeechSynthesis();
  }, []);

  const stopMicRecognition = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    setIsListeningMic(false);
  }, []);

  const runBudiChatSpeechAndPose = useCallback(
    (
      speechText: string,
      poseType: 'wave' | 'talk' | 'cheer' | 'react' | 'thumbs' | 'think'
    ) => {
      clearVoiceSequence();
      setBudiSpeechText(speechText);

      if (poseType === 'wave') {
        setIsMascotWaving(true);
        setIsMascotSpeaking(true);
        setMascotEmotionOverride('talking');
      } else if (poseType === 'cheer') {
        setIsMascotWaving(false);
        setIsMascotSpeaking(true);
        setMascotEmotionOverride('celebrating');
      } else if (poseType === 'react') {
        setIsMascotWaving(false);
        setIsMascotSpeaking(true);
        setMascotEmotionOverride('surprised');
      } else if (poseType === 'thumbs') {
        setIsMascotWaving(false);
        setIsMascotSpeaking(true);
        setMascotEmotionOverride('proud');
      } else if (poseType === 'think') {
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotionOverride('thinking');
        return;
      } else {
        setIsMascotWaving(false);
        setIsMascotSpeaking(true);
        setMascotEmotionOverride('talking');
      }

      if (poseType !== 'talk') {
        const switchToTalkTimer = setTimeout(() => {
          setIsMascotWaving(false);
          setIsMascotSpeaking(true);
          setMascotEmotionOverride('talking');
        }, 900);
        voiceTimersRef.current.push(switchToTalkTimer);
      }

      const handleSpeechComplete = () => {
        setIsMascotWaving(false);
        setIsMascotSpeaking(false);
        setMascotEmotionOverride(null);
      };

      speakTextUtterance(speechText, {
        lang: 'id-ID',
        rate: 1.01,
        pitch: 1.14,
        onEnd: handleSpeechComplete,
        onError: handleSpeechComplete,
      });

      const safetyTimer = setTimeout(handleSpeechComplete, 9500);
      voiceTimersRef.current.push(safetyTimer);
    },
    [clearVoiceSequence]
  );

  // Greet child as soon as the 2.0s -> 6.0s video loading transition finishes
  useEffect(() => {
    if (isEnteringLoading || hasGreetedOnEnterRef.current) return;
    hasGreetedOnEnterRef.current = true;

    playCheerSound();
    const childCallName = childProfile?.name?.trim() || 'Teman Petualang';
    const openingGreeting = `Selamat datang di Rumah Budi, ${childCallName}! 🏡✨ Nyaman kan ruang tamuku? Yuk kita ngobrol atau main tebak-tebakan seru! 😊`;
    setChatHistory([{ role: 'model', text: openingGreeting }]);
    runBudiChatSpeechAndPose(openingGreeting, 'wave');
  }, [isEnteringLoading, childProfile?.name, runBudiChatSpeechAndPose]);

  useEffect(() => {
    return () => {
      clearVoiceSequence();
      stopMicRecognition();
    };
  }, [clearVoiceSequence, stopMicRecognition]);

  const handleLeaveRoom = useCallback(() => {
    playPopSound();
    clearVoiceSequence();
    stopMicRecognition();
    onClose();
  }, [clearVoiceSequence, stopMicRecognition, onClose]);

  const handleOpenReadingRoom = useCallback(() => {
    playPopSound();
    clearVoiceSequence();
    stopMicRecognition();
    onTrackInteraction?.();
    if (onOpenReadingRoom) {
      onOpenReadingRoom();
    } else {
      onClose();
    }
  }, [clearVoiceSequence, stopMicRecognition, onTrackInteraction, onOpenReadingRoom, onClose]);

  const handleSendMessageToBudi = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isChatThinking) return;

      playPopSound();
      stopMicRecognition();
      clearVoiceSequence();
      setIsIdeaPopoverOpen(false);

      setChatInputText('');
      setMicStatusHint(null);
      setIsChatThinking(true);

      setIsMascotWaving(false);
      setIsMascotSpeaking(false);
      setMascotEmotionOverride('thinking');

      const updatedHistory: ChatTurn[] = [
        ...chatHistory.slice(-6),
        { role: 'user', text: trimmed },
      ];
      setChatHistory(updatedHistory);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            childProfile,
            notesContext: childProfile,
            chatHistory: updatedHistory,
          }),
        });

        const data = await res.json();
        setIsChatThinking(false);

        const replyText: string =
          data?.reply ||
          `😊 Wah, seru sekali ceritamu! Budi senang banget kita bisa ngobrol santai di rumah Budi. Yuk cerita lagi! 🌟`;
        const poseRaw: string = data?.pose || 'talk';
        const validPose: 'wave' | 'talk' | 'cheer' | 'react' | 'thumbs' | 'think' =
          poseRaw === 'cheer' ||
          poseRaw === 'react' ||
          poseRaw === 'thumbs' ||
          poseRaw === 'wave' ||
          poseRaw === 'talk'
            ? poseRaw
            : 'talk';

        setChatHistory((prev) => [...prev.slice(-6), { role: 'model', text: replyText }]);
        onTrackInteraction?.();

        runBudiChatSpeechAndPose(replyText, validPose);
      } catch {
        setIsChatThinking(false);
        const childCallName = childProfile?.name?.trim() || 'Teman Petualang';
        const fallbackReply = `😊 Wah, cerita yang seru sekali ${childCallName}! 👍✨ Budi suka banget mendengarnya di ruang tamu ini. Kita mau bahas tebak-tebakan atau fakta ajaib dunia sekarang? 🌟`;
        setChatHistory((prev) => [...prev.slice(-6), { role: 'model', text: fallbackReply }]);
        runBudiChatSpeechAndPose(fallbackReply, 'thumbs');
      }
    },
    [
      isChatThinking,
      stopMicRecognition,
      clearVoiceSequence,
      chatHistory,
      childProfile,
      onTrackInteraction,
      runBudiChatSpeechAndPose,
    ]
  );

  const handleToggleMicSpeechRecognition = useCallback(() => {
    playPopSound();
    setIsIdeaPopoverOpen(false);

    if (isListeningMic) {
      stopMicRecognition();
      setMicStatusHint(null);
      return;
    }

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      setMicStatusHint(
        '💡 Browser ini belum mendukung mikrofon langsung. Yuk ketik di kolom bawah!'
      );
      return;
    }

    try {
      clearVoiceSequence();
      const recognition = new SpeechRecognitionAPI();
      speechRecognitionRef.current = recognition;
      recognition.lang = 'id-ID';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      setIsListeningMic(true);
      setMicStatusHint('👂 Budi sedang mendengarkan suaramu... Silakan bicara!');
      setMascotEmotionOverride('listening');

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        const currentText = (finalTranscript || interim).trim();
        if (currentText) {
          setChatInputText(currentText);
        }
      };

      recognition.onend = () => {
        setIsListeningMic(false);
        speechRecognitionRef.current = null;
        const captured = finalTranscript.trim();
        if (captured) {
          setMicStatusHint(null);
          handleSendMessageToBudi(captured);
        } else {
          setMicStatusHint(
            '💡 Suara belum terdengar jelas. Coba tekan 🎤 Tekan & Bicara lagi atau ketik ya!'
          );
          setMascotEmotionOverride(null);
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
        speechRecognitionRef.current = null;
        setMicStatusHint(
          '💡 Mikrofon belum aktif. Kamu bisa langsung mengetik di bawah ya!'
        );
        setMascotEmotionOverride(null);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
      setMicStatusHint('💡 Yuk gunakan kolom ketik di bawah!');
    }
  }, [isListeningMic, stopMicRecognition, clearVoiceSequence, handleSendMessageToBudi]);

  // 6 3D Medal Badges List for "Kotak Lencana"
  const badgeItems: SvgBadgeItem[] = [
    {
      id: 'sahabat_budi',
      title: 'Lencana Sahabat Budi',
      subtitle: 'Tamu Kehormatan Rumah Budi',
      unlocked: true,
      color: '#F43F5E',
      bgGlow: 'rgba(244, 63, 94, 0.18)',
      budiComment:
        'Hore! Kamu sudah punya Lencana Sahabat Budi karena berkunjung dan mengobrol hangat di rumahku! 🌟',
      medalImgSrc: '/assets/ui3d/medal_1_3d.png',
    },
    {
      id: 'penjelajah_literasi',
      title: 'Lencana Dermaga Literasi',
      subtitle: 'Pendongeng & Pantun Nusantara',
      unlocked: (progressData.biomeProgress.pantai?.stars || 0) > 0,
      color: '#06B6D4',
      bgGlow: 'rgba(6, 182, 212, 0.18)',
      budiComment:
        'Keren! Lencana Dermaga Literasi menunjukkan kamu rajin membaca cerita dan pantun nusantara! 📖✨',
      medalImgSrc: '/assets/ui3d/medal_2_3d.png',
    },
    {
      id: 'penjaga_rimba',
      title: 'Lencana Pelindung Alam',
      subtitle: 'Sahabat Flora & Fauna IPAS',
      unlocked: (progressData.biomeProgress.hutan?.stars || 0) > 0,
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.18)',
      budiComment:
        'Mantap sekali! Lencana Pelindung Alam ini bukti kamu peduli pada satwa dan hutan Indonesia! 🌿🐯',
      medalImgSrc: '/assets/ui3d/medal_3_3d.png',
    },
    {
      id: 'seniman_kreatif',
      title: 'Lencana Seniman P5',
      subtitle: 'Kreator Warna & Imajinasi',
      unlocked:
        progressData.savedArtworks.length > 0 ||
        (progressData.biomeProgress.karya?.stars || 0) > 0,
      color: '#C084FC',
      bgGlow: 'rgba(192, 132, 252, 0.2)',
      budiComment:
        'Wah, Lencana Seniman P5! Karya lukisan dan imajinasimu selalu membuat Budi kagum! 🎨🌈',
      medalImgSrc: '/assets/ui3d/medal_4_3d.png',
    },
    {
      id: 'arsitek_angka',
      title: 'Lencana Logika Angka',
      subtitle: 'Pemecah Teka-Teki Matematika',
      unlocked: progressData.totalStars >= 6,
      color: '#FB923C',
      bgGlow: 'rgba(251, 146, 60, 0.18)',
      budiComment:
        'Hebat! Dengan Lencana Logika Angka, kamu makin tangkas berhitung dan memecahkan teka-teki! 🔢🚀',
      medalImgSrc: '/assets/ui3d/medal_5_3d.png',
    },
    {
      id: 'bintang_pancasila',
      title: 'Lencana Anak Pancasila',
      subtitle: 'Teladan Sopan, Jujur & Gotong Royong',
      unlocked: true,
      color: '#FACC15',
      bgGlow: 'rgba(250, 204, 21, 0.22)',
      budiComment:
        'Budi bangga banget! Anak Indonesia yang ramah, jujur, dan suka menolong berhak mendapat Lencana Anak Pancasila! 🦅⭐',
      medalImgSrc: '/assets/ui3d/medal_6_3d.png',
    },
  ];

  const handleOpenGiftItem = (
    giftId: string,
    _title: string,
    speechReaction: string,
    pose: 'cheer' | 'thumbs' | 'react'
  ) => {
    playMunchSound();
    setTimeout(() => playCheerSound(), 200);
    if (!openedGiftIds.includes(giftId)) {
      setOpenedGiftIds((prev) => [...prev, giftId]);
      onAddRewards?.(1, 2);
    }
    onTrackInteraction?.();
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#34d399', '#38bdf8'],
      });
    } catch {
      // ignore
    }
    setActiveRoomModal('none');
    runBudiChatSpeechAndPose(speechReaction, pose);
  };

  // Show at most 2 short suggestion chips only before the conversation starts
  const showInitialShortChips = chatHistory.length <= 1 && !isChatThinking && !isIdeaPopoverOpen;

  return (
    <div className="fixed inset-0 z-[80] w-full h-full overflow-hidden bg-[#241409] select-none font-sans">
      {/* 4.0s (2.0s -> 6.0s) VIDEO LOADING STATE TRANSITION ("🏠 Masuk ke Rumah Budi...") */}
      <AnimatePresence>
        {isEnteringLoading && (
          <BudiHouseTransitionOverlay
            progress={loadingProgress}
            transitionVideoSrc={transitionVideoSrc}
            onProgressUpdate={setLoadingProgress}
            onComplete={() => setIsEnteringLoading(false)}
          />
        )}
      </AnimatePresence>

      {/* =====================================================================
          ZOOMED & CROPPED INTERIOR BACKGROUND IMAGE OF RUMAH BUDI
          Zoomed (`scale-[1.4] origin-bottom-left`) to focus on the warm wooden
          floor and left-center table/chair area, pushing busy side clutter away
          and making the foreground wooden floor wide and close.
          ===================================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <img
          src={BUDI_HOUSE_INTERIOR_IMAGE}
          alt="Interior Ruang Tamu Rumah Budi"
          className="w-full h-full object-cover object-left-bottom scale-[1.4] origin-bottom-left pointer-events-none select-none"
          draggable={false}
        />
        {/* Warm Golden Indoor Sunlight & Window Backlight Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_38%,rgba(254,240,138,0.16)_0%,rgba(245,158,11,0.08)_48%,rgba(28,15,8,0.28)_100%)]" />
      </div>

      {/* =====================================================================
          GROUNDED CHARACTER BUDI (SEPATU UTUH MENAPAK DI LANTAI KAYU)
          Saat Kotak Lencana / Peti Hadiah dibuka, Budi berada di atas layer blur (z-40)
          dan bergeser halus ke sisi kiri agar tetap terlihat utuh memamerkan koleksinya di kanan.
          ===================================================================== */}
      <div
        style={{
          bottom: '-10.8%',
          left: activeRoomModal !== 'none' ? '24%' : '41.8%',
          width: '52.6vh',
          height: '92vh',
          transform: 'translateX(-50%)',
        }}
        className={`absolute pointer-events-none flex flex-col items-center justify-end transition-all duration-500 ease-out ${
          activeRoomModal !== 'none' ? 'z-40' : 'z-20'
        }`}
      >
        <div
          onClick={() => {
            playPopSound();
            onTrackInteraction?.();
            runBudiChatSpeechAndPose(
              'Hehe, terima kasih sudah menyapaku di rumah! Yuk kita ngobrol atau tekan tombol mikrofon di bawah! 😊✨',
              'wave'
            );
          }}
          className="pointer-events-auto cursor-pointer relative w-full h-full flex flex-col items-center justify-end"
        >
          {/* Budi dengan Warm Indoor Shading & Directional Backlight Shadow */}
          <div
            style={{ filter: WARM_INDOOR_BUDI_FILTER }}
            className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-200"
          >
            <CharviMascot
              variant="large-bottom"
              lighting="studio"
              emotion={mascotEmotionOverride || 'happy'}
              isSpeaking={isMascotSpeaking}
              isWaving={isMascotWaving}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Bayangan Kontak Elips Gelap Kecokelatan Tepat di Bawah Sepatu Visual Budi */}
      <div
        style={{
          bottom: '3.6%',
          left: activeRoomModal !== 'none' ? '24%' : '41.8%',
          transform: 'translateX(-50%)',
        }}
        className={`absolute w-[195px] sm:w-[230px] h-[22px] sm:h-[26px] bg-[radial-gradient(ellipse_at_center,rgba(38,18,7,0.88)_0%,rgba(28,12,4,0.52)_55%,transparent_76%)] rounded-full blur-[2.5px] pointer-events-none transition-all duration-500 ease-out ${
          activeRoomModal !== 'none' ? 'z-39' : 'z-19'
        }`}
      />

      {/* =====================================================================
          5 OBJEK INTERAKTIF 3D DI DALAM RUMAH BUDI (KALIBRASI PRESISI SCREENSHOT 8)
          1. Ikon Rumah (Beranda): Dinaikkan sedikit di atas meja kayu (left: 23.1%, width: 6.5%, bottom: 28.7%)
          2. Rak Buku 3D: Dinaikkan sedikit di atas kereta mainan (left: 54.4%, width: 11.2%, bottom: 14.8%)
          3. Kotak Lencana 3D: Diperkecil sedikit di atas kusen jendela (left: 64.8%, width: 10.8%, bottom: 34.8%)
          4. Kuas & Palet Cat 3D: Di lantai kayu di antara kereta mainan & kotak hijau (left: 72.9%, width: 6.5%, bottom: 8.8%)
          5. Peti Hadiah 3D: Diperbesar sesuai kotak kanan bawah (left: 85.5%, width: 13.2%, bottom: 2.2%)
          ===================================================================== */}
      <div className="absolute inset-0 z-25 pointer-events-none">
        {/* 1. Ikon Rumah 3D ("naikan sedikit lagi icon rumah" - Sesuai Kotak Screenshot 8) */}
        <div
          style={{
            bottom: '28.7%',
            left: '23.1%',
            width: '6.5%',
          }}
          className="absolute z-25 flex flex-col items-center justify-end pointer-events-none"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleLeaveRoom}
            className="pointer-events-auto relative group flex flex-col items-center cursor-pointer focus:outline-none"
            title="Kembali ke Beranda Utama"
            aria-label="Kembali ke Beranda Utama"
          >
            <div className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-0.5 rounded-full bg-[#241105]/92 backdrop-blur-xs border border-amber-300/80 text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-lg flex items-center justify-center z-30">
              <span>Beranda</span>
            </div>
            <img
              src="/assets/ui3d/icon_house_3d.png"
              alt="Beranda"
              style={{ filter: WARM_INDOOR_OBJECT_FILTER }}
              className="w-[64px] sm:w-[74px] tablet:w-[84px] max-w-none h-auto object-contain select-none pointer-events-none relative z-10"
              draggable={false}
            />
            {/* Bayangan Pijakan di Atas Permukaan Meja Kayu */}
            <div className="w-[62px] sm:w-[72px] h-[9px] -mt-1.5 bg-[radial-gradient(ellipse_at_center,rgba(42,19,7,0.82)_0%,rgba(30,13,4,0.45)_58%,transparent_80%)] rounded-full blur-[1.5px] pointer-events-none" />
          </motion.button>
        </div>

        {/* 2. Rak Buku 3D ("naikan sedikit lagi icon rak buku" - Sesuai Kotak Screenshot 8) */}
        <div
          style={{
            bottom: '14.8%',
            left: '54.4%',
            width: '11.2%',
          }}
          className="absolute z-24 flex flex-col items-center justify-end pointer-events-none"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenReadingRoom}
            className="pointer-events-auto relative group flex flex-col items-center cursor-pointer focus:outline-none"
            title="Ruang Baca"
            aria-label="Ruang Baca"
          >
            <div className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-0.5 rounded-full bg-[#241105]/92 backdrop-blur-xs border border-amber-300/80 text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-lg flex items-center justify-center z-30">
              <span>Ruang Baca</span>
            </div>
            <img
              src="/assets/ui3d/budi_book_cabinet_3d.png"
              alt="Ruang Baca"
              style={{ filter: WARM_INDOOR_OBJECT_FILTER }}
              className="w-[96px] sm:w-[114px] tablet:w-[128px] max-w-none h-auto object-contain select-none pointer-events-none relative z-10"
              draggable={false}
            />
            {/* Bayangan Pijakan Kaki Lemari di Lantai Dinding Bawah Jendela */}
            <div className="w-[92px] sm:w-[110px] h-[10px] -mt-1.5 bg-[radial-gradient(ellipse_at_center,rgba(38,16,5,0.88)_0%,rgba(28,11,3,0.52)_60%,transparent_82%)] rounded-full blur-[1.5px] pointer-events-none" />
          </motion.button>
        </div>

        {/* 3. Kotak Lencana Berpenutup Kaca 3D ("perkecil sedikit lagi icon peti lenjana" - Sesuai Kotak Screenshot 8) */}
        <div
          style={{
            bottom: '34.8%',
            left: '64.8%',
            width: '10.8%',
          }}
          className="absolute z-25 flex flex-col items-center justify-end pointer-events-none"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playPopSound();
              setProgressData(loadChildProgress());
              setActiveRoomModal('badges');
              runBudiChatSpeechAndPose(
                'Lihat nih koleksi 6 Lencana Sahabat Budi di sebelah kananku! Ketuk medali mana saja untuk dengar ceritanya ya!',
                'thumbs'
              );
            }}
            className="pointer-events-auto relative group flex flex-col items-center cursor-pointer focus:outline-none"
            title="Lencana"
            aria-label="Lencana"
          >
            <div className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-0.5 rounded-full bg-[#241105]/92 backdrop-blur-xs border border-amber-300/80 text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-lg flex items-center justify-center z-30">
              <span>Lencana</span>
            </div>
            <img
              src="/assets/ui3d/budi_badge_case_3d.png"
              alt="Lencana"
              style={{ filter: WARM_INDOOR_OBJECT_FILTER }}
              className="w-[78px] sm:w-[92px] tablet:w-[104px] max-w-none h-auto object-contain select-none pointer-events-none relative z-10"
              draggable={false}
            />
            {/* Bayangan Pijakan Kotak Lencana di Atas Kusen Jendela */}
            <div className="w-[74px] sm:w-[88px] h-[8px] -mt-1.5 bg-[radial-gradient(ellipse_at_center,rgba(38,16,5,0.85)_0%,rgba(28,11,3,0.48)_62%,transparent_82%)] rounded-full blur-[1.5px] pointer-events-none" />
          </motion.button>
        </div>

        {/* 4. Kuas & Palet Melukis 3D (Di Lantai Kayu Sebelah Kanan Kereta Mainan) */}
        <div
          style={{
            bottom: '8.8%',
            left: '72.9%',
            width: '6.5%',
          }}
          className="absolute z-25 flex flex-col items-center justify-end pointer-events-none"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playPopSound();
              if (onOpenDrawingStudio) {
                onOpenDrawingStudio();
              } else {
                runBudiChatSpeechAndPose(
                  'Ayo kita menggambar dan berkreasi di Studio Lukis!',
                  'cheer'
                );
              }
            }}
            className="pointer-events-auto relative group flex flex-col items-center cursor-pointer focus:outline-none"
            title="Menggambar"
            aria-label="Menggambar"
          >
            <div className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-0.5 rounded-full bg-[#241105]/92 backdrop-blur-xs border border-amber-300/80 text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-lg flex items-center justify-center z-30">
              <span>Menggambar</span>
            </div>
            <img
              src="/assets/ui3d/icon_palette_brush_3d.png"
              alt="Menggambar"
              style={{ filter: WARM_INDOOR_OBJECT_FILTER }}
              className="w-[52px] sm:w-[60px] tablet:w-[68px] max-w-none h-auto object-contain select-none pointer-events-none relative z-10"
              draggable={false}
            />
            {/* Bayangan Pijakan Palet di Lantai Kayu */}
            <div className="w-[48px] sm:w-[56px] h-[8px] -mt-1.5 bg-[radial-gradient(ellipse_at_center,rgba(38,16,5,0.82)_0%,rgba(28,11,3,0.45)_60%,transparent_80%)] rounded-full blur-[1.5px] pointer-events-none" />
          </motion.button>
        </div>

        {/* 5. Peti Hadiah Menghadap Samping 3D ("perbesar kotak hadiah" - Sesuai Kotak Screenshot 8) */}
        <div
          style={{
            bottom: '2.2%',
            left: '85.5%',
            width: '13.2%',
          }}
          className="absolute z-25 flex flex-col items-center justify-end pointer-events-none"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playPopSound();
              setActiveRoomModal('gifts');
              runBudiChatSpeechAndPose(
                'Wah, Peti Hadiah Kejutan terbuka! Pilih camilan sehat di sebelah kananku untuk dinikmati bersama ya!',
                'cheer'
              );
            }}
            className="pointer-events-auto relative group flex flex-col items-center cursor-pointer focus:outline-none"
            title="Hadiah"
            aria-label="Hadiah"
          >
            <div className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-0.5 rounded-full bg-[#241105]/92 backdrop-blur-xs border border-amber-300/80 text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-lg flex items-center justify-center z-30">
              <span>Hadiah</span>
            </div>
            <img
              src="/assets/ui3d/budi_chest_side_3d.png"
              alt="Peti Hadiah & Koleksi 3D"
              style={{ filter: WARM_INDOOR_OBJECT_FILTER }}
              className="w-[116px] sm:w-[136px] tablet:w-[154px] max-w-none h-auto object-contain select-none pointer-events-none relative z-10"
              draggable={false}
            />
            {/* Bayangan Pijakan Peti di Lantai Kayu */}
            <div className="w-[110px] sm:w-[128px] h-[14px] -mt-2 bg-[radial-gradient(ellipse_at_center,rgba(38,16,5,0.86)_0%,rgba(28,11,3,0.50)_60%,transparent_80%)] rounded-full blur-[2px] pointer-events-none" />
          </motion.button>
        </div>
      </div>

      {/* =====================================================================
          1 LAYER WARM SUNLIGHT AMBIENT OVERLAY
          Menyelimuti seluruh ruangan, Budi, dan ke-5 ikon sekaligus agar menyatu alami
          ===================================================================== */}
      <div className="pointer-events-none absolute inset-0 z-28 bg-gradient-to-tr from-amber-500/6 via-transparent to-amber-100/14" />

      {/* =====================================================================
          FOREGROUND INTERACTIVE UI LAYER (SPEECH BUBBLE & COMPACT KEYBOARD CAPSULE)
          ===================================================================== */}
      <div
        className={`relative w-full h-full pointer-events-none ${
          activeRoomModal !== 'none' ? 'z-45' : 'z-30'
        }`}
      >
        {/* =====================================================================
            1 GELEMBUNG KOMIK BERSIH DI ATAS KEPALA BUDI
            Ikut bergeser ke kiri saat Budi memamerkan Lencana / Hadiah di kanan.
            ===================================================================== */}
        <div
          style={{
            top: '8%',
            left: activeRoomModal !== 'none' ? '8%' : '26%',
          }}
          className="absolute left-3 top-[6%] sm:top-[8%] right-3 sm:right-auto pointer-events-none z-30 transition-all duration-500 ease-out"
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className={`pointer-events-auto relative w-full max-w-[290px] sm:max-w-[330px] tablet:max-w-[350px] rounded-[22px] bg-[#FFFDF8]/96 backdrop-blur-md border-3 px-3 py-2 sm:px-3.5 sm:py-2.5 pr-9 sm:pr-10 transition-all duration-300 ${
              isMascotSpeaking
                ? 'border-amber-400 ring-4 ring-amber-300/70 shadow-[0_0_24px_rgba(251,191,36,0.5),0_12px_26px_rgba(15,23,42,0.25)]'
                : isChatThinking
                  ? 'border-sky-400 ring-4 ring-sky-300/70 shadow-[0_12px_26px_rgba(15,23,42,0.22)]'
                  : 'border-amber-300 shadow-[0_10px_24px_rgba(15,23,42,0.22)]'
            }`}
          >
            {/* 1 Ikon Kecil 🔊 di Sudut Gelembung untuk Mengulang Suara */}
            <button
              type="button"
              onClick={() => {
                if (budiSpeechText && !isChatThinking) {
                  playPopSound();
                  runBudiChatSpeechAndPose(budiSpeechText, 'talk');
                }
              }}
              title="Ulangi suara Budi"
              aria-label="Ulangi suara Budi"
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 flex items-center justify-center text-[11px] shadow-xs active:scale-90 transition-all cursor-pointer"
            >
              🔊
            </button>

            {/* Teks Ucapan Budi yang Bersih & Lega */}
            {isChatThinking ? (
              <div className="py-0.5 flex items-center gap-1.5 text-xs sm:text-[13px] font-black text-sky-900">
                <span className="text-base animate-bounce">💭</span>
                <span>Budi sedang memikirkan jawaban seru... ✨</span>
              </div>
            ) : (
              <p className="text-[11px] sm:text-xs tablet:text-[13px] font-black text-[#1e293b] leading-relaxed tracking-tight">
                {budiSpeechText}
              </p>
            )}

            {/* Ekor Gelembung Komik Mengarah Tepat ke Kepala Budi */}
            <div className="hidden sm:block absolute left-24 sm:left-32 -bottom-2.5 w-4 h-4 bg-[#FFFDF8] border-r-3 border-b-3 border-amber-400 rotate-45 rounded-br-xs" />
          </motion.div>
        </div>

        {/* =====================================================================
            BAR INPUT CHAT DIPERKECIL & DIPOSISIKAN DI ATAS KARPET KOLONG MEJA KIRI
            Kalibrasi presisi dari kotak biru screenshot_6:
            left: 5.6% s/d 23.9% (width 18.3%), bottom: 3.7%
            ===================================================================== */}
        <div
          style={{
            bottom: '3.7%',
            left: '5.6%',
            width: '18.3%',
          }}
          className="absolute min-w-[190px] max-w-[235px] flex flex-col items-start gap-1 pointer-events-auto z-30"
        >
          {micStatusHint && (
            <div className="px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-200 font-extrabold text-[9px] border border-amber-300/60 shadow-md">
              {micStatusHint}
            </div>
          )}

          {/* Popover Pilihan Topik Saat Tombol `💡 Ide` Diklik */}
          <AnimatePresence>
            {isIdeaPopoverOpen && (
              <motion.div
                key="idea-topic-popover"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="w-[260px] sm:w-[290px] rounded-2xl bg-[#28150a]/95 backdrop-blur-md border border-amber-400/50 shadow-[0_14px_30px_rgba(15,23,42,0.5)] p-2 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between px-1 pb-1 border-b border-amber-400/30">
                  <span className="text-[10px] font-black text-amber-200">
                    Topik Obrolan
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsIdeaPopoverOpen(false)}
                    className="px-2 py-0.5 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-black text-[10px] flex items-center justify-center cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {QUICK_TOPIC_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      disabled={isChatThinking}
                      onClick={() => handleSendMessageToBudi(chip.prompt)}
                      className="px-2 py-1 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 text-amber-100 font-extrabold text-[10px] border border-amber-400/30 text-left flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="truncate">{chip.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1 Chip Saran Singkat Lebih Ringkas di Atas Bar */}
          {showInitialShortChips && (
            <div className="flex items-center gap-1 w-full overflow-hidden">
              {QUICK_TOPIC_CHIPS.slice(0, 1).map((chip) => (
                <motion.button
                  key={chip.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessageToBudi(chip.prompt)}
                  className="truncate w-full px-2 py-0.5 rounded-full bg-[#241308]/88 hover:bg-[#341b0b]/92 text-amber-200 font-black text-[9px] border border-amber-400/40 shadow-xs cursor-pointer transition-all text-left"
                >
                  {chip.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* 1 KAPSUL OBROLAN RINGKAS (PAS DI KOTAK KARPET KOLONG MEJA KIRI) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessageToBudi(chatInputText);
            }}
            className="w-full bg-[#241308]/88 backdrop-blur-md border border-amber-400/45 rounded-full p-0.5 sm:p-1 shadow-[0_6px_18px_rgba(20,10,5,0.48)] flex items-center gap-1"
          >
            {/* Tombol Ide */}
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setIsIdeaPopoverOpen((prev) => !prev);
              }}
              title="Topik"
              className={`px-2 h-6 rounded-full font-black text-[9.5px] border flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 ${
                isIdeaPopoverOpen
                  ? 'bg-amber-400 text-amber-950 border-amber-600 shadow-inner'
                  : 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border-amber-400/40'
              }`}
            >
              <span className="leading-none">Ide</span>
            </button>

            {/* Kolom Ketik Ringkas */}
            <div className="flex-1 min-w-0 flex items-center bg-[#150a04]/65 rounded-full px-2 py-0.5 border border-amber-400/30 focus-within:border-amber-400 focus-within:bg-[#1a0d05]/85 transition-colors">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                disabled={isChatThinking}
                placeholder="Ketik..."
                aria-label="Ketik obrolan ke Budi"
                className="flex-1 min-w-0 bg-transparent text-amber-100 placeholder:text-amber-200/55 font-extrabold text-[9.5px] sm:text-[10px] focus:outline-none"
              />
              {chatInputText.trim().length > 0 && (
                <button
                  type="submit"
                  disabled={isChatThinking}
                  title="Kirim"
                  className="ml-1 px-1.5 h-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs active:scale-90 transition-all cursor-pointer shrink-0"
                >
                  Kirim
                </button>
              )}
            </div>

            {/* Tombol Utama Bicara Ringkas */}
            <button
              type="button"
              onClick={handleToggleMicSpeechRecognition}
              disabled={isChatThinking}
              title={isListeningMic ? 'Mendengar...' : 'Bicara'}
              className={`px-2.5 py-0.5 h-6 rounded-full font-black text-[9.5px] sm:text-[10px] border border-white/80 shadow-[0_2px_8px_rgba(79,70,229,0.32)] active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isListeningMic
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white ring-2 ring-rose-300 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 text-white hover:brightness-105'
              }`}
            >
              <span>{isListeningMic ? '...' : 'Bicara'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* =====================================================================
          LAYER BLUR LATAR RUANGAN SAAT KOTAK LENCANA / PETI HADIAH DIBUKA (z-35)
          Berada di bawah Budi (z-40) dan Gelembung Ucapan Budi (z-45) sehingga
          ruangan di belakang menjadi sedikit blur & temaram (backdrop-blur-md bg-black/25),
          tetapi Budi tetap terlihat tajam di sebelah kiri memamerkan koleksinya!
          ===================================================================== */}
      <AnimatePresence>
        {activeRoomModal !== 'none' && (
          <motion.div
            key="room-showcase-backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => {
              playPopSound();
              setActiveRoomModal('none');
            }}
            className="fixed inset-0 z-35 bg-black/25 backdrop-blur-md cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* =====================================================================
          SHOWCASE 1: KOTAK LENCANA 3D — DIRECT SCREEN GLASSMORPHISM DI KANAN BUDI
          Tanpa kotak wadah modal konvensional; ke-6 medali 3D langsung melayang
          dalam grid 3 kolom di atas podium Glassmorphism transparan di kanan Budi.
          ===================================================================== */}
      <AnimatePresence>
        {activeRoomModal === 'badges' && (
          <motion.div
            key="budi-badge-direct-glass-showcase"
            initial={{ opacity: 0, x: 28, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-[4%] sm:right-[5%] top-1/2 -translate-y-1/2 z-45 w-[92%] sm:w-[52%] lg:w-[50%] max-w-xl pointer-events-none flex flex-col gap-4 max-h-[88vh] overflow-y-auto scrollbar-none py-2"
          >
            {/* Header Melayang Manis + Tombol Kapsul Kaca "✕ Tutup" */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/assets/ui3d/budi_badge_case_3d.png"
                  alt="Kotak Lencana 3D"
                  className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] shrink-0"
                  draggable={false}
                />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] leading-tight truncate">
                    Koleksi Lencana
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveRoomModal('none');
                }}
                className="px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-white font-black text-xs shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>Tutup</span>
              </button>
            </div>

            {/* Grid 3 Kolom Podium Glassmorphism Transparan (6 Medali 3D) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4"
            >
              {badgeItems.map((badge) => (
                <motion.button
                  key={badge.id}
                  type="button"
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    playCheerSound();
                    runBudiChatSpeechAndPose(badge.budiComment, 'thumbs');
                  }}
                  className={`bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.25)] rounded-3xl p-4 flex flex-col items-center text-center gap-2 cursor-pointer transition-all ${
                    badge.unlocked ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  <div className="w-18 h-20 sm:w-20 sm:h-22 flex items-center justify-center p-1">
                    <img
                      src={badge.medalImgSrc}
                      alt={badge.title}
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.38)] select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                  <div>
                    <span className="text-xs sm:text-[13px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] block leading-snug">
                      {badge.title}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          SHOWCASE 2: PETI HADIAH 3D — DIRECT SCREEN GLASSMORPHISM DI KANAN BUDI
          ===================================================================== */}
      <AnimatePresence>
        {activeRoomModal === 'gifts' && (
          <motion.div
            key="budi-gift-direct-glass-showcase"
            initial={{ opacity: 0, x: 28, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-[4%] sm:right-[5%] top-1/2 -translate-y-1/2 z-45 w-[92%] sm:w-[52%] lg:w-[50%] max-w-xl pointer-events-none flex flex-col gap-4 max-h-[88vh] overflow-y-auto scrollbar-none py-2"
          >
            {/* Header Melayang Manis + Tombol Kapsul Kaca "Tutup" */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/assets/ui3d/budi_chest_side_3d.png"
                  alt="Peti Hadiah 3D"
                  className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] shrink-0"
                  draggable={false}
                />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] leading-tight truncate">
                    Peti Hadiah
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveRoomModal('none');
                }}
                className="px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-white font-black text-xs shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>Tutup</span>
              </button>
            </div>

            {/* Grid 3 Kolom Podium Glassmorphism Transparan (Koleksi Hadiah Kejutan) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4"
            >
              {/* Hadiah 1: Madu Hutan Emas */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  handleOpenGiftItem(
                    'honey_gift',
                    'Madu Hutan',
                    'Nyam! Terima kasih hadiah Madu Hutan Emasnya! Manis dan bikin Budi makin semangat mengobrol!',
                    'cheer'
                  )
                }
                className="bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.25)] rounded-3xl p-4 flex flex-col items-center text-center gap-2.5 cursor-pointer transition-all"
              >
                <div className="w-20 h-20 flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)]">
                  <HoneyBottleItem className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] block">
                    Madu Hutan
                  </span>
                </div>
              </motion.button>

              {/* Hadiah 2: Apel Merah Segar */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  handleOpenGiftItem(
                    'apple_gift',
                    'Apel Merah',
                    'Kriuk! Apel merahnya segar sekali! Terima kasih ya sahabat baikku, Budi jadi sehat dan kuat!',
                    'thumbs'
                  )
                }
                className="bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.25)] rounded-3xl p-4 flex flex-col items-center text-center gap-2.5 cursor-pointer transition-all"
              >
                <div className="w-20 h-20 flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)]">
                  <RedAppleItem className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] block">
                    Apel Merah
                  </span>
                </div>
              </motion.button>

              {/* Hadiah 3: Semangka Manis */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  handleOpenGiftItem(
                    'watermelon_gift',
                    'Semangka Segar',
                    'Wah segarnya semangka merah ini! Cocok banget dinikmati sambil melihat pemandangan pantai dari jendela rumahku!',
                    'react'
                  )
                }
                className="bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.25)] rounded-3xl p-4 flex flex-col items-center text-center gap-2.5 cursor-pointer transition-all"
              >
                <div className="w-20 h-20 flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)]">
                  <WatermelonSliceItem className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] block">
                    Semangka Segar
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudiHouseRoom;
