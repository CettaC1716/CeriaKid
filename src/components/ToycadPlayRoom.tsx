import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CharviMascot } from './CharviMascot';
import { BuddyGameModal } from './BuddyGameModal';
import { BudiHouseRoom, BUDI_HOUSE_TRANSITION_VIDEO } from './BudiHouseRoom';
import { DrawingStudioModal } from './DrawingStudioModal';
import { ChildProfile } from '../types';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { loadChildProgress, ChildProgressData } from '../utils/progressStorage';
import {
  OrigamiBackArrowIcon,
  OrigamiChevronDownIcon,
  OrigamiAwardStarIcon,
  OrigamiVolumeIcon,
} from './OrigamiIcons';

import {
  BiomeKey,
  BiomeInfo,
  BIOMES_DATA,
  LEVEL_SEQUENCE,
  ISLAND_VIDEO_SRC,
  ISLAND_POSTER_IMAGE,
  ISLAND_STABLE_START_SEC,
  ISLAND_LOOP_FPS,
  ISLAND_OVERLAP_FRAMES,
} from '../data/biomes';
import { speakTextUtterance, cancelSpeechSynthesis } from '../utils/speechUtils';

export type { BiomeKey, BiomeInfo };
export { BIOMES_DATA };

export interface ToycadPlayRoomProps {
  onClose: () => void;
  childProfile?: ChildProfile | null;
  onTrackInteraction?: () => void;
  onAddRewards?: (food: number, stars: number) => void;
}

export const ToycadPlayRoom: React.FC<ToycadPlayRoomProps> = ({
  onClose,
  childProfile,
  onTrackInteraction,
  onAddRewards,
}) => {
  // Start awal saat pengguna masuk ruang bermain: Rumah Budi di puncak bukit langsung aktif & menyala
  const [activeBiomeKey, setActiveBiomeKey] = useState<BiomeKey>('rumah_budi');
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isMissionDrawerExpanded, setIsMissionDrawerExpanded] = useState<boolean>(false);
  const [activePhase, setActivePhase] = useState<{ grade: string; code: string }>({
    grade: 'Kelas 4 SD',
    code: 'FASE B',
  });

  // Interactive Buddy.ai Game Modal, BudiHouseRoom & Drawing Studio Modal
  const [isBuddyGameOpen, setIsBuddyGameOpen] = useState<boolean>(false);
  const [isBudiHouseRoomOpen, setIsBudiHouseRoomOpen] = useState<boolean>(false);
  const [isDrawingStudioOpen, setIsDrawingStudioOpen] = useState<boolean>(false);

  // Persisted Child Progress State
  const [progressData, setProgressData] = useState<ChildProgressData>(() => loadChildProgress());

  useEffect(() => {
    const refreshProgress = () => {
      setProgressData(loadChildProgress());
    };
    window.addEventListener('merdekakids-progress-updated', refreshProgress);
    return () => window.removeEventListener('merdekakids-progress-updated', refreshProgress);
  }, []);

  // Modal Visibility
  const [showPhaseModal, setShowPhaseModal] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string, icon = 'check_circle') => {
    setToast({ msg, icon });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Forward-Only Stabilized Segment Cross-Dissolve Buffer (5.2s -> N with 20-frame alpha overlap at 24 FPS)
  const islandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const extractorVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const frameBufferRef = useRef<HTMLCanvasElement[]>([]);
  const isBufferCompleteRef = useRef<boolean>(false);

  // Sync background music mute state & pause while inside BudiHouseRoom
  useEffect(() => {
    const audio = bgmAudioRef.current;
    if (!audio) return;
    if (isBudiHouseRoomOpen) {
      audio.pause();
      return;
    }
    audio.muted = isAudioMuted;
    audio.volume = isAudioMuted ? 0 : 0.32;
    if (!isAudioMuted && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [isAudioMuted, isBudiHouseRoomOpen]);

  useEffect(() => {
    const canvas = islandCanvasRef.current;
    const vid = extractorVideoRef.current;
    if (!canvas || !vid) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const BUFFER_W = 1920;
    const BUFFER_H = 1080;
    canvas.width = BUFFER_W;
    canvas.height = BUFFER_H;

    // 1. Draw the 5.2s stable island poster immediately so the canvas is never blank
    const posterImg = new Image();
    posterImg.decoding = 'async';
    posterImg.src = ISLAND_POSTER_IMAGE;
    posterImg.onload = () => {
      if (frameBufferRef.current.length === 0) {
        ctx.clearRect(0, 0, BUFFER_W, BUFFER_H);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(posterImg, 0, 0, BUFFER_W, BUFFER_H);
      }
    };

    frameBufferRef.current = [];
    isBufferCompleteRef.current = false;

    const frameStepSec = 1 / ISLAND_LOOP_FPS; // 1/24s (~41.67ms)
    let nextCaptureVideoTime = ISLAND_STABLE_START_SEC;
    let frameIndex = ISLAND_OVERLAP_FRAMES; // Starts at frame 20 after the initial 20-frame cross-dissolve completes
    let lastTickPerf = performance.now();
    let frameAccumulatorMs = 0;
    let rafId = 0;

    const finalizeBufferAndStartForwardLoop = () => {
      if (isBufferCompleteRef.current) return;
      const totalCaptured = frameBufferRef.current.length;
      if (totalCaptured >= 2) {
        isBufferCompleteRef.current = true;
        const overlapCount = Math.min(ISLAND_OVERLAP_FRAMES, Math.floor(totalCaptured / 3));
        // Continue forward right from frame L_overlap (frame 20) since frames 0..19 were just alpha-blended to 1.0!
        frameIndex = overlapCount > 0 ? overlapCount : 0;
        try {
          vid.pause();
        } catch {
          // ignore
        }
      }
    };

    const startStableSegmentExtraction = () => {
      try {
        vid.currentTime = ISLAND_STABLE_START_SEC;
      } catch {
        // ignore
      }
      vid.muted = true;
      vid.play().catch(() => {});
    };

    if (vid.readyState >= 1) {
      startStableSegmentExtraction();
    } else {
      vid.addEventListener('loadedmetadata', startStableSegmentExtraction, { once: true });
    }

    const onVideoEnded = () => {
      finalizeBufferAndStartForwardLoop();
    };
    vid.addEventListener('ended', onVideoEnded);

    const renderLoop = (now: number) => {
      const dtMs = Math.min(100, Math.max(0, now - lastTickPerf));
      lastTickPerf = now;

      if (!isBufferCompleteRef.current) {
        // Phase A: Forward live playback of stabilized segment (5.2s -> end) while capturing raw frames at 24 FPS
        if (vid.readyState >= 2 && vid.videoWidth > 0) {
          const curTime = vid.currentTime;
          const totalDur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 10.0;

          if (curTime >= ISLAND_STABLE_START_SEC - 0.05) {
            if (curTime >= nextCaptureVideoTime && frameBufferRef.current.length < 140) {
              const offCanvas = document.createElement('canvas');
              offCanvas.width = BUFFER_W;
              offCanvas.height = BUFFER_H;
              const offCtx = offCanvas.getContext('2d', { alpha: false });
              if (offCtx) {
                offCtx.clearRect(0, 0, BUFFER_W, BUFFER_H);
                offCtx.globalAlpha = 1.0;
                offCtx.drawImage(vid, 0, 0, BUFFER_W, BUFFER_H);
                frameBufferRef.current.push(offCanvas);
              }
              nextCaptureVideoTime = curTime + frameStepSec;
            }

            // Clear & draw current base frame with globalAlpha = 1.0 before any transition overlay
            ctx.clearRect(0, 0, BUFFER_W, BUFFER_H);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(vid, 0, 0, BUFFER_W, BUFFER_H);

            const overlapDurationSec = ISLAND_OVERLAP_FRAMES * frameStepSec;
            const overlapStartSec = totalDur - overlapDurationSec;
            if (curTime >= overlapStartSec && frameBufferRef.current.length >= ISLAND_OVERLAP_FRAMES) {
              const rawProgress = Math.min(1, Math.max(0, (curTime - overlapStartSec) / overlapDurationSec));
              const smoothProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
              const headIdx = Math.min(
                ISLAND_OVERLAP_FRAMES - 1,
                Math.floor(rawProgress * ISLAND_OVERLAP_FRAMES)
              );
              const headFrame = frameBufferRef.current[headIdx];
              if (headFrame) {
                ctx.globalAlpha = smoothProgress;
                ctx.drawImage(headFrame, 0, 0, BUFFER_W, BUFFER_H);
                ctx.globalAlpha = 1.0;
              }
            }
          }

          if (totalDur > 0 && curTime >= totalDur - 0.04 && frameBufferRef.current.length >= 10) {
            finalizeBufferAndStartForwardLoop();
          } else if (vid.paused && curTime < totalDur - 0.08) {
            vid.play().catch(() => {});
          }
        }
      } else {
        // Phase B: Continuous Forward-Only Alpha Cross-Dissolve Loop at 24 FPS (Zero Rewind!)
        const frames = frameBufferRef.current;
        const N = frames.length;
        if (N >= 2) {
          const L_overlap = Math.min(ISLAND_OVERLAP_FRAMES, Math.floor(N / 3));
          frameAccumulatorMs += dtMs;
          const targetFrameDurationMs = 1000 / ISLAND_LOOP_FPS; // 41.67ms (24 FPS)

          while (frameAccumulatorMs >= targetFrameDurationMs) {
            frameAccumulatorMs -= targetFrameDurationMs;
            // Strictly advance forward (frameIndex++) — NEVER decrement frameIndex!
            frameIndex += 1;
            if (frameIndex >= N) {
              // At frame N - 1, frames[L_overlap - 1] reached globalAlpha = 1.0,
              // so we seamlessly continue forward from frame L_overlap (frame 20)!
              frameIndex = L_overlap;
            }
          }

          if (L_overlap > 0 && frameIndex >= N - L_overlap) {
            // Last 20 frames (N - 20 .. N - 1): Clear & draw base frame[i] with globalAlpha = 1.0, then blend head frame[i - (N - 20)]
            const overlapIdx = frameIndex - (N - L_overlap); // 0 .. 19
            const linearProgress = (overlapIdx + 1) / L_overlap;
            const smoothProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);

            const tailFrame = frames[frameIndex];
            if (tailFrame) {
              ctx.clearRect(0, 0, BUFFER_W, BUFFER_H);
              ctx.globalAlpha = 1.0;
              ctx.drawImage(tailFrame, 0, 0, BUFFER_W, BUFFER_H);
            }

            const headFrame = frames[overlapIdx];
            if (headFrame) {
              ctx.globalAlpha = smoothProgress;
              ctx.drawImage(headFrame, 0, 0, BUFFER_W, BUFFER_H);
              ctx.globalAlpha = 1.0;
            }
          } else {
            // Main forward segment (frame 20 .. N - 21): Clear & draw base frame[i] at full opacity (globalAlpha = 1.0)
            const activeFrame = frames[frameIndex];
            if (activeFrame) {
              ctx.clearRect(0, 0, BUFFER_W, BUFFER_H);
              ctx.globalAlpha = 1.0;
              ctx.drawImage(activeFrame, 0, 0, BUFFER_W, BUFFER_H);
            }
          }
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      vid.removeEventListener('loadedmetadata', startStableSegmentExtraction);
      vid.removeEventListener('ended', onVideoEnded);
      try {
        vid.pause();
      } catch {
        // ignore
      }
      if (bgmAudioRef.current) {
        try {
          bgmAudioRef.current.pause();
        } catch {
          // ignore
        }
      }
      frameBufferRef.current = [];
      isBufferCompleteRef.current = false;
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      cancelSpeechSynthesis();
    };
  }, []);

  // Helper to check if a biome level is locked based on child's total stars (Rumah Budi is always open)
  const isBiomeLocked = useCallback(
    (key: BiomeKey) => {
      if (key === 'rumah_budi') return false;
      const b = BIOMES_DATA[key];
      return progressData.totalStars < b.requiredStars;
    },
    [progressData.totalStars]
  );

  // Gesture/Dragging Refs
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningClass, setIsPanningClass] = useState<boolean>(false);

  const minZoom = 1.0;
  const maxZoom = 1.85;
  const zoomStep = 0.15;

  const clampOffsets = useCallback((zoom: number, px: number, py: number) => {
    if (!viewportRef.current) return { x: 0, y: 0 };
    const w = viewportRef.current.clientWidth || window.innerWidth;
    const h = viewportRef.current.clientHeight || window.innerHeight;
    const maxPanX = Math.max(0, ((zoom - 1) * w) / 2);
    const maxPanY = Math.max(0, ((zoom - 1) * h) / 2);
    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, px));
    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, py));
    return { x: clampedX, y: clampedY };
  }, []);

  // Handle Zooming
  const handleZoomIn = () => {
    playPopSound();
    setCurrentZoom((prev) => {
      const next = Math.min(maxZoom, +(prev + zoomStep).toFixed(2));
      showToast(`Zoom: ${Math.round(next * 100)}%`, 'zoom_in');
      return next;
    });
  };

  const handleZoomOut = () => {
    playPopSound();
    setCurrentZoom((prev) => {
      let next = Math.max(minZoom, +(prev - zoomStep).toFixed(2));
      if (next <= minZoom + 0.01) {
        next = minZoom;
        setPanX(0);
        setPanY(0);
      }
      showToast(`Zoom: ${Math.round(next * 100)}%`, 'zoom_out');
      return next;
    });
  };

  const handleResetZoom = () => {
    playPopSound();
    setCurrentZoom(1.0);
    setPanX(0);
    setPanY(0);
    showToast('Peta di-reset ke skala awal (100%)', 'crop_free');
  };

  // Wheel Zoom
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setCurrentZoom((prev) => Math.min(maxZoom, +(prev + 0.1).toFixed(2)));
      } else {
        setCurrentZoom((prev) => {
          const next = Math.max(minZoom, +(prev - 0.1).toFixed(2));
          if (next <= minZoom) {
            setPanX(0);
            setPanY(0);
          }
          return next;
        });
      }
    };

    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse & Touch Pan Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (currentZoom <= 1.0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('#biomeDetailCard') ||
      target.closest('#missionDrawerContainer')
    ) {
      return;
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX - panX, y: e.clientY - panY };
    setIsPanningClass(true);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const newX = e.clientX - dragStartPosRef.current.x;
      const newY = e.clientY - dragStartPosRef.current.y;

      if (Math.abs(newX - panX) > 4 || Math.abs(newY - panY) > 4) {
        hasMovedRef.current = true;
      }

      const { x: cx, y: cy } = clampOffsets(currentZoom, newX, newY);
      setPanX(cx);
      setPanY(cy);
    },
    [clampOffsets, currentZoom, panX, panY]
  );

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPanningClass(false);
    window.setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);
  };

  // Speak Biome Audio Helper (supports Rumah Budi, Unlocked & Sneak Peek narration)
  const speakBiomeNarration = useCallback(
    (biome: BiomeInfo, locked: boolean) => {
      if (isAudioMuted) return;
      const narrationText =
        biome.key === 'rumah_budi'
          ? `Selamat datang di ${biome.title}! ${biome.desc}`
          : locked
          ? `Mode Intip Level ${biome.level}, ${biome.title}. ${biome.sneakPeekTeaser}`
          : `Level ${biome.level}, ${biome.title}. ${biome.desc}`;
      speakTextUtterance(narrationText, {
        lang: 'id-ID',
        rate: 1.02,
        pitch: 1.2,
      });
    },
    [isAudioMuted]
  );

  // Pin Click: Opens the Pin Modal (Room entry is exclusively via the main CTA button inside the modal)
  const handlePinClick = (key: BiomeKey, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMovedRef.current) return;
    playPopSound();
    setActiveBiomeKey(key);
    setIsPinModalOpen(true);
    const locked = isBiomeLocked(key);
    if (!isAudioMuted) {
      speakBiomeNarration(BIOMES_DATA[key], locked);
    }
  };

  // Audio speech toggle
  const toggleAudioSpeech = () => {
    playPopSound();
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (next) {
        cancelSpeechSynthesis();
        showToast('Panduan Suara dinonaktifkan (Mute)', 'volume_off');
      } else {
        const curr = BIOMES_DATA[activeBiomeKey];
        const locked = isBiomeLocked(activeBiomeKey);
        showToast(`Panduan Suara Aktif: ${curr.title}!`, 'volume_up');
        speakBiomeNarration(curr, locked);
      }
      return next;
    });
  };

  const startBiomeMission = (overrideBiomeKey?: BiomeKey) => {
    const targetKey = overrideBiomeKey || activeBiomeKey;
    const targetBiome = BIOMES_DATA[targetKey];
    const locked = isBiomeLocked(targetKey);

    if (targetKey === 'rumah_budi') {
      playPopSound();
      cancelSpeechSynthesis();
      setActiveBiomeKey('rumah_budi');
      setIsMissionDrawerExpanded(false);
      setIsBudiHouseRoomOpen(true);
      return;
    }

    if (locked) {
      playPopSound();
      const needed = Math.max(1, targetBiome.requiredStars - progressData.totalStars);
      showToast(
        `🔒 Mode Intip: Kumpulkan ★ ${needed} Bintang lagi di level sebelumnya untuk membuka ${targetBiome.title}!`,
        'lock'
      );
      return;
    }

    playCheerSound();
    if (overrideBiomeKey) {
      setActiveBiomeKey(overrideBiomeKey);
    }
    setIsMissionDrawerExpanded(false);
    setIsBuddyGameOpen(true);
  };

  const selectPhase = (grade: string, code: string) => {
    playPopSound();
    setActivePhase({ grade, code });
    showToast(`Beralih ke kurikulum ${grade} (${code})!`, 'school');
    setShowPhaseModal(false);
  };

  const activeBiome = BIOMES_DATA[activeBiomeKey];
  const isActiveLocked = isBiomeLocked(activeBiomeKey);
  const starsNeededForActive = Math.max(0, activeBiome.requiredStars - progressData.totalStars);

  const activeBiomeStats = progressData.biomeProgress[activeBiomeKey] || {
    stars: 1,
    completedRounds: 2,
    totalRounds: 8,
    highScore: 50,
    unlockedLevel: 1,
  };
  const dynamicProgressPercent = `${Math.min(
    100,
    Math.round((activeBiomeStats.completedRounds / activeBiomeStats.totalRounds) * 100)
  )}%`;
  const dynamicRatioLabel = `${activeBiomeStats.completedRounds}/${activeBiomeStats.totalRounds} Bab`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0b0e] text-white font-sans antialiased overflow-hidden select-none">
      {/* ======================================================== */}
      {/* FULLSCREEN INTERACTIVE STAGE & VIEWPORT                  */}
      {/* ======================================================== */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full h-full overflow-hidden select-none ${
          currentZoom > 1.05 ? 'cursor-grab' : 'cursor-default'
        } ${isPanningClass ? 'cursor-grabbing!' : ''}`}
      >
        {/* MAP STAGE WITH 24 FPS FORWARD-ONLY STABILIZED SEGMENT CROSS-DISSOLVE */}
        <div
          id="mapStage"
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 ease-out overflow-hidden"
          style={{
            backgroundImage: `url(${ISLAND_POSTER_IMAGE})`,
            transform: `translate3d(${panX}px, ${panY}px, 0px) scale(${currentZoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Full-Bleed 24 FPS Forward Cross-Dissolve Canvas (5.2s -> end with 20-frame seamless overlap) */}
          <canvas
            ref={islandCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-[2]"
          />

          {/* Offscreen Frame Extractor Video & Gentle Acoustic BGM Audio */}
          <video
            ref={extractorVideoRef}
            src={ISLAND_VIDEO_SRC}
            poster={ISLAND_POSTER_IMAGE}
            playsInline
            muted
            preload="auto"
            className="fixed -left-[9999px] -top-[9999px] w-px h-px opacity-0 pointer-events-none select-none"
          />
          <audio
            ref={bgmAudioRef}
            src={ISLAND_VIDEO_SRC}
            autoPlay
            loop
            muted={isAudioMuted}
            onLoadedMetadata={(e) => {
              const aud = e.currentTarget;
              aud.volume = isAudioMuted ? 0 : 0.32;
              aud.play().catch(() => {});
            }}
            className="hidden"
          />

          {/* 8 LEVELING PINS: CALM & DIMMED WHEN IDLE, VIVID & GLOWING WHEN ACTIVE */}
          {LEVEL_SEQUENCE.map((k) => {
            const b = BIOMES_DATA[k];
            const isActive = activeBiomeKey === k;
            const locked = isBiomeLocked(k);

            return (
              <div
                key={`pin-${k}`}
                style={{
                  top: b.pinStyle.top,
                  left: b.pinStyle.left,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute select-none transition-all duration-300 ${
                  isActive ? 'z-45' : 'z-30'
                }`}
              >
                {/* Budi Mascot Avatar Token floating above the active pin */}
                {isActive && (
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce z-40">
                    <div
                      style={{
                        borderColor: b.color,
                        boxShadow: `0 0 22px ${b.cardBorderGlow}`,
                      }}
                      className="w-11 h-11 rounded-full p-1 border-2 overflow-hidden bg-[#141419]/90 flex items-center justify-center"
                    >
                      <CharviMascot
                        variant="compact-header"
                        emotion={locked ? 'thinking' : 'excited'}
                        className="w-full h-full scale-125 drop-shadow-md"
                      />
                    </div>
                    <div className="w-2.5 h-1 bg-black/60 rounded-full blur-[1px] mt-0.5" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => handlePinClick(k, e)}
                  style={
                    isActive
                      ? {
                          borderColor: b.color,
                          boxShadow: `0 0 26px ${b.cardBorderGlow}, 0 8px 20px rgba(0,0,0,0.65)`,
                          background: `linear-gradient(135deg, rgba(20, 20, 26, 0.96) 0%, rgba(28, 28, 36, 0.92) 100%)`,
                        }
                      : undefined
                  }
                  className={`flex items-center gap-2 rounded-full border cursor-pointer transition-all duration-300 active:scale-95 ${
                    isActive
                      ? 'opacity-100 scale-105 min-h-[42px] px-3.5 py-1.5 backdrop-blur-xl ring-2 ring-white/20'
                      : 'opacity-55 hover:opacity-90 scale-90 min-h-[36px] px-2.5 py-1 backdrop-blur-sm bg-black/40 border-white/15 hover:scale-95 shadow-md'
                  }`}
                >
                  {k !== 'rumah_budi' && (
                    <span
                      style={{
                        backgroundColor: isActive ? b.color : 'rgba(255,255,255,0.14)',
                        color: isActive ? '#090D16' : '#FFFFFF',
                      }}
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase shrink-0"
                    >
                      LV.{b.level}
                    </span>
                  )}

                  {/* Biome Pin Title */}
                  <span
                    className={`font-bold text-xs whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-white/90'
                    }`}
                  >
                    {b.pinLabel}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* FLOATING MICRO-HUD OVERLAYS                              */}
        {/* ======================================================== */}

        {/* Top Left: Branding "PULAU CERIAKIDS", Phase Selector, Stars & Back Button */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-40 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-[#141419]/90 backdrop-blur-xl border border-white/15 text-white hover:bg-neutral-800 transition-colors shadow-xl cursor-pointer"
            title="Kembali ke Beranda CeriaKids"
          >
            <OrigamiBackArrowIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-[#141419]/90 backdrop-blur-xl border border-white/15 rounded-full px-4 py-2.5 shadow-xl">
            <span className="text-xs font-black text-white tracking-wider uppercase whitespace-nowrap">
              PULAU CERIAKIDS
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              setShowPhaseModal(true);
            }}
            className="hidden sm:flex items-center gap-1.5 bg-[#141419]/90 hover:bg-[#1f1f26] backdrop-blur-xl border border-white/15 hover:border-white/30 rounded-full px-3.5 py-2.5 shadow-xl cursor-pointer transition-all active:scale-95"
          >
            <span className="text-xs font-bold text-neutral-200 whitespace-nowrap">
              {activePhase.grade}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs font-black text-[#A3E635] whitespace-nowrap">
              {activePhase.code}
            </span>
            <OrigamiChevronDownIcon className="w-4 h-4" />
          </button>

          {/* Persisted Stars & XP Badge */}
          <div className="flex items-center gap-2 bg-[#141419]/90 backdrop-blur-xl border border-[#FACC15]/30 rounded-full px-3.5 py-2 shadow-xl tabular-nums">
            <OrigamiAwardStarIcon className="w-4 h-4" />
            <span className="text-xs font-black text-[#FACC15] whitespace-nowrap">
              {progressData.totalStars}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-xs font-black text-[#A3E635] whitespace-nowrap">
              {progressData.totalXP} XP
            </span>
          </div>
        </div>

        {/* Top Right: Audio Guide (Cleanly positioned at top right without DEPAN 0° button) */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-40 flex items-center gap-2">
          <button
            onClick={toggleAudioSpeech}
            type="button"
            className="min-h-[44px] flex items-center gap-2 bg-[#141419]/90 hover:bg-[#1f1f26] backdrop-blur-xl border border-white/15 px-3.5 sm:px-4 py-2 rounded-full shadow-xl cursor-pointer transition-all active:scale-95"
          >
            <OrigamiVolumeIcon
              muted={isAudioMuted}
              className={`w-5 h-5 ${!isAudioMuted ? 'animate-bounce' : ''}`}
            />
            <span className="hidden sm:inline text-xs font-extrabold text-white whitespace-nowrap">
              Panduan Suara
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM LEFT: WARM WOOD PIN MODAL ("Vibe Kayu Hangat")    */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isPinModalOpen && (
            <motion.div
              key={`pin-modal-${activeBiome.key}`}
              id="biomeDetailCard"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 w-[325px] sm:w-[380px] max-w-[92vw] bg-gradient-to-b from-[#4E342E] via-[#3E2723] to-[#2D1B18] rounded-3xl border-2 border-[#8D6E63]/40 shadow-[0_20px_50px_rgba(20,10,6,0.88)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. Room Background Banner with rounded-t-3xl and subtle bottom dark/warm gradient overlay */}
              <div className="relative w-full h-36 sm:h-40 rounded-t-3xl overflow-hidden bg-[#2D1B18]">
                <img
                  src={activeBiome.bannerImage}
                  alt={activeBiome.title}
                  style={{ objectPosition: activeBiome.bannerPosition || 'center center' }}
                  className="w-full h-full object-cover rounded-t-3xl select-none pointer-events-none transition-transform duration-500"
                  draggable={false}
                />
                {/* Subtle bottom gradient overlay so banner blends seamlessly into the warm wood modal */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#4E342E] via-[#4E342E]/45 to-black/15 pointer-events-none" />
              </div>

              {/* 2. Modal Body with Warm Wood Vibe Palette */}
              <div className="relative z-10 p-4 pt-3 flex flex-col gap-3">
                {/* Title (#FFE082) */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#FFE082] truncate tracking-tight leading-snug">
                    {activeBiome.title}
                  </h3>
                </div>

                {/* Progress Bar Card */}
                {isActiveLocked ? (
                  <div className="p-2.5 rounded-2xl bg-[#2D1B18]/75 border border-[#8D6E63]/35 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                      <span className="font-black text-[#FFE082]">
                        Level {activeBiome.level}
                      </span>
                      <span className="font-extrabold text-[#FFE082] text-[10px] tabular-nums">
                        {progressData.totalStars}/{activeBiome.requiredStars} Bintang
                      </span>
                    </div>
                    <div className="w-full bg-[#1F120F] rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((progressData.totalStars / activeBiome.requiredStars) * 100)
                          )}%`,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-[#FFB74D] to-[#F57C00] transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-[#2D1B18]/75 border border-[#8D6E63]/35 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                      <span className="font-black text-[#FFE082]">
                        {activeBiome.key === 'rumah_budi'
                          ? 'Rumah Budi'
                          : `Level ${activeBiome.level}`}
                      </span>
                      <span className="font-extrabold text-[#D7CCC8] text-[10px] tabular-nums">
                        {activeBiome.key === 'rumah_budi' ? 'Siap' : dynamicRatioLabel}
                      </span>
                    </div>
                    <div className="w-full bg-[#1F120F] rounded-full h-1.5 overflow-hidden shadow-inner">
                      <div
                        style={{
                          width: activeBiome.key === 'rumah_budi' ? '100%' : dynamicProgressPercent,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-[#FFB74D] to-[#F57C00] transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Action Triggers: Warm Golden-Orange Primary CTA + Soft Brown Cancel (X) Button */}
                <div className="pt-0.5 flex items-center justify-between gap-2.5">
                  {isActiveLocked ? (
                    <button
                      onClick={() => startBiomeMission()}
                      type="button"
                      className="flex-1 min-h-[48px] flex items-center justify-center font-bold text-xs py-2.5 px-3.5 rounded-2xl border-2 border-[#8D6E63]/50 bg-[#2D1B18]/80 hover:bg-[#3E2723] active:scale-95 transition-all cursor-pointer text-[#FFE082]"
                    >
                      <span className="truncate">
                        Butuh {starsNeededForActive} Bintang
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startBiomeMission()}
                      type="button"
                      className="flex-1 min-h-[48px] flex items-center justify-center py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFB74D] to-[#F57C00] text-[#3E2723] font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(245,124,0,0.35)] hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span className="text-[#3E2723] font-bold tracking-tight">
                        {activeBiome.key === 'rumah_budi' ? 'Masuk' : 'Mulai Main'}
                      </span>
                    </button>
                  )}

                  {/* Cancel / Close (X) Button replacing the old speaker button */}
                  <button
                    onClick={() => {
                      playPopSound();
                      cancelSpeechSynthesis();
                      setIsPinModalOpen(false);
                    }}
                    type="button"
                    aria-label="Tutup Modal"
                    title="Tutup Modal"
                    className="w-12 h-12 rounded-2xl bg-[#5D4037]/80 hover:bg-[#6D4C41] text-[#FFE082] border border-[#8D6E63]/40 flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* BOTTOM RIGHT: MISSIONS PULL-UP DRAWER ("Misi Pulau CeriaKids") */}
        {/* ======================================================== */}
        <div
          id="missionDrawerContainer"
          className="absolute bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Collapsed Trigger Button */}
          <button
            onClick={() => {
              playPopSound();
              setIsMissionDrawerExpanded((prev) => !prev);
            }}
            type="button"
            className="min-h-[48px] group flex items-center gap-2 bg-[#141419]/95 hover:bg-[#1a1a22] backdrop-blur-xl border border-[#FACC15]/40 hover:border-[#FACC15] px-5 py-2.5 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-[#FACC15]/20"
          >
            <span className="font-black text-xs sm:text-sm text-white tracking-tight whitespace-nowrap">
              Peta Level
            </span>
          </button>

          {/* Expanded Drawer Card */}
          <AnimatePresence>
            {isMissionDrawerExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className="flex flex-col max-w-sm w-[310px] sm:w-[370px] bg-[#141419]/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-[#FACC15]/30 mt-2 z-50"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    Peta Level
                  </h4>
                  <button
                    onClick={() => setIsMissionDrawerExpanded(false)}
                    type="button"
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="flex flex-col gap-2 mt-2.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                  {LEVEL_SEQUENCE.map((bKey) => {
                    const bInfo = BIOMES_DATA[bKey];
                    const bStat = progressData.biomeProgress[bKey];
                    const locked = isBiomeLocked(bKey);
                    return (
                      <div
                        key={bKey}
                        onClick={() => {
                          playPopSound();
                          setActiveBiomeKey(bKey);
                          setIsPinModalOpen(true);
                          setIsMissionDrawerExpanded(false);
                        }}
                        className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 hover:border-[#FACC15]/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: `${bInfo.color}25`, color: bInfo.color }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px]"
                          >
                            {bKey === 'rumah_budi' ? 'RB' : `LV.${bInfo.level}`}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">
                              {bInfo.title}
                            </span>
                            <span className="text-[10px] font-bold text-[#FACC15] tabular-nums">
                              {bKey === 'rumah_budi'
                                ? 'Terbuka'
                                : locked
                                ? `${bInfo.requiredStars} Bintang`
                                : `${bStat?.stars || 1}/3 Bintang`}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (locked) {
                              playPopSound();
                              setActiveBiomeKey(bKey);
                              setIsMissionDrawerExpanded(false);
                            } else {
                              startBiomeMission(bKey);
                            }
                          }}
                          style={{
                            background: locked ? 'rgba(255,255,255,0.1)' : bInfo.buttonGradient,
                            color: locked ? '#FDE047' : '#090D16',
                          }}
                          className="min-h-[34px] px-3 py-1 font-black text-xs rounded-lg active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          <span>{locked ? 'Intip' : bKey === 'rumah_budi' ? 'Masuk' : 'Main'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zoom & Reset HUD (Anchored Right) */}
        <div
          id="zoomControls"
          className="absolute right-4 bottom-24 sm:right-6 sm:bottom-20 z-40 flex flex-col items-center bg-[#141419]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-1 shadow-2xl gap-1 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleZoomIn}
            type="button"
            title="Perbesar Peta (+)"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#FACC15] font-bold">
              add
            </span>
          </button>
          <button
            onClick={handleResetZoom}
            type="button"
            title="Reset Skala (100%)"
            className="px-2 py-1 rounded hover:bg-white/10 active:scale-95 text-neutral-300 hover:text-white transition-all cursor-pointer text-center"
          >
            <span className="text-[10px] font-black tracking-wider text-[#FACC15] block tabular-nums">
              {Math.round(currentZoom * 100)}%
            </span>
          </button>
          <button
            onClick={handleZoomOut}
            disabled={currentZoom <= minZoom + 0.01}
            type="button"
            title="Perkecil Peta (-)"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base text-[#38BDF8] font-bold">
              remove
            </span>
          </button>
        </div>
      </div>

      {/* TOAST FEEDBACK CAPSULE */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-[#141419]/95 text-white border border-[#FACC15]/40 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 pointer-events-none"
          >
            <span className="material-symbols-outlined text-[#FACC15] text-lg">{toast.icon}</span>
            <span className="text-xs font-bold text-neutral-100">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sudut pandang 360 modal dihapus sesuai permintaan penghapusan tombol DEPAN 0° */}

      {/* MODAL: PILIH FASE BELAJAR KURIKULUM MERDEKA */}
      <AnimatePresence>
        {showPhaseModal && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowPhaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141419] border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#A3E635] text-xl">school</span>
                  <h3 className="text-sm font-black text-white">Pilih Fase Belajar CeriaKids</h3>
                </div>
                <button
                  onClick={() => setShowPhaseModal(false)}
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div className="flex flex-col gap-2.5 mt-4">
                <button
                  onClick={() => selectPhase('Kelas 1-2', 'FASE A')}
                  className={`flex items-center justify-between p-3 rounded-2xl bg-white/5 border hover:border-[#A3E635] text-left cursor-pointer transition-all hover:scale-102 ${
                    activePhase.code === 'FASE A' ? 'border-[#A3E635]' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">Fase A (Kelas 1 - 2 SD)</span>
                    <span className="text-[10px] text-neutral-400">
                      Pengenalan Huruf, Angka &amp; Alam Sekitar
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-neutral-500 text-sm">
                    arrow_forward
                  </span>
                </button>

                <button
                  onClick={() => selectPhase('Kelas 4 SD', 'FASE B')}
                  className={`flex items-center justify-between p-3 rounded-2xl bg-white/5 border text-left cursor-pointer transition-all ${
                    activePhase.code === 'FASE B' ? 'border-[#A3E635]' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#A3E635] flex items-center gap-1.5">
                      Fase B (Kelas 3 - 4 SD)
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Eksplorasi Konsep, Logika Sains &amp; Proyek P5
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#A3E635] text-base">
                    check_circle
                  </span>
                </button>

                <button
                  onClick={() => selectPhase('Kelas 5-6', 'FASE C')}
                  className={`flex items-center justify-between p-3 rounded-2xl bg-white/5 border hover:border-[#A3E635] text-left cursor-pointer transition-all hover:scale-102 ${
                    activePhase.code === 'FASE C' ? 'border-[#A3E635]' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">Fase C (Kelas 5 - 6 SD)</span>
                    <span className="text-[10px] text-neutral-400">
                      Pemecahan Masalah Kritis &amp; Sains Lanjutan
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-neutral-500 text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BUDDY.AI INTERACTIVE COMPANION GAME MODAL */}
      <BuddyGameModal
        isOpen={isBuddyGameOpen}
        biomeKey={activeBiomeKey}
        activePhaseLabel={`${activePhase.grade} • ${activePhase.code}`}
        onClose={() => setIsBuddyGameOpen(false)}
        onOpenDrawingStudio={() => setIsDrawingStudioOpen(true)}
      />

      {/* RUANG KHUSUS "DALAM RUMAH BUDI" (Accessible via Pin Rumah Budi & Tombol Masuk Rumah Budi) */}
      <AnimatePresence>
        {isBudiHouseRoomOpen && (
          <BudiHouseRoom
            onClose={() => setIsBudiHouseRoomOpen(false)}
            childProfile={childProfile}
            onTrackInteraction={onTrackInteraction}
            onAddRewards={onAddRewards}
            transitionVideoSrc={BUDI_HOUSE_TRANSITION_VIDEO}
          />
        )}
      </AnimatePresence>

      {/* DRAWING STUDIO MODAL (Accessible from Markas Kreatif P5) */}
      <DrawingStudioModal
        isOpen={isDrawingStudioOpen}
        onClose={() => setIsDrawingStudioOpen(false)}
      />
    </div>
  );
};
