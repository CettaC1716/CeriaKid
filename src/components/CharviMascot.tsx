import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { CharviEmotion, OutfitThemeId } from '../types';
import {
  speakTextUtterance,
  cancelSpeechSynthesis,
} from '../utils/speechUtils';

export interface GreenScreenVideoConfig {
  src: string;
  speechEndSec?: number;
  idleLoopStartSec?: number;
  idleLoopEndSec?: number;
  playKey?: number;
  onSpeechComplete?: () => void;
  onMutedAutoplayFallback?: () => void;
}

export interface CharviMascotProps {
  variant?: 'large-bottom' | 'compact-header';
  emotion?: CharviEmotion;
  onEmotionChange?: (emotion: CharviEmotion) => void;
  isSpeaking?: boolean;
  isWaving?: boolean;
  lighting?: 'studio' | 'sunset';
  hideQuickButtons?: boolean;
  onClick?: () => void;
  className?: string;
  outfitTheme?: OutfitThemeId;
  equippedHat?: string | null;
  greenScreenVideo?: GreenScreenVideoConfig | null;
  lockStageCoordinates?: boolean;
}

type AutonomousActivity =
  | 'curious_glance'
  | 'thinking_ponder'
  | 'cheerful_bounce'
  | 'warm_greeting'
  | 'ok_pose'
  | 'surprised_pose';

// 4K Studio White-Background Extracted Sprite Sheet Specs (6 cols x 4 rows = 24 frames, 640x1120 per tile -> 4:7 exact aspect ratio)
const SHEET_COLS = 6;
const SHEET_ROWS = 4;
const TILE_ASPECT = 640 / 1120; // Exact 4:7 aspect ratio -> zero horizontal or vertical squishing ("anti-gepeng")

// 1. wave_sheet.webp (All 24 frames in full sequential order):
// - Indices 23..16: 8 consecutive frames raising/lowering arm between hip (23) and wave height (16)
// - Indices 0..15: 16 consecutive frames waving hand smoothly left and right
const WAVE_FULL_ORDERED_FRAMES = [
  23, 22, 21, 20, 19, 18, 17, 16,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
] as const;
const WAVE_LOOP_MIN_IDX = 8; // Frame 0 (keep hand raised while actively waving, then reverse 8..0 on exit)

// 2. idle_talk_sheet.webp (24-tile 4K studio sheet with consecutive 24fps registration talking frames):
// - Frame 0: Crisp Base Neutral Frame (calm warm smile, locked neck/body/feet)
// - Frames 1..5: Seamless 5-frame eye blink sequence (0.0px head/body shift)
// - Frames 6..23: 18 consecutive 24fps talking frames extracted directly from the registration video
//   (wide-open bright eyes, continuous lip/cheek/jaw articulation, 0.0px body/foot shift)
const IDLE_BASE_FRAME = 0;

// Full 19-frame consecutive talking sequence (neutral closed smile 0 -> 18 consecutive 24fps talking frames 6..23)
const TALK_FULL_ORDERED_FRAMES = [
  0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
] as const;

// Default real smiling idle video segment (100% upright, hands at sides, bright open eyes, calm warm smile)
const DEFAULT_REAL_IDLE_VIDEO_SRC = '/mascots/videos/budi_idle.mp4?v=clean_upright_idle_2';
const DEFAULT_IDLE_LOOP_START_SEC = 0.15;
const DEFAULT_IDLE_LOOP_END_SEC = 6.00;

// 3. cheer_think_sheet.webp (All 24 frames from 4K Pose & Expression Video):
// - Indices 0..11: Full 12-frame sequential two-fisted cheer animation
const CHEER_FULL_ORDERED_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
// - Indices 12..23: Full 12-frame sequential hand-on-chin thinking ("Hmm...") animation
const THINK_FULL_ORDERED_FRAMES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] as const;

// 4. react_thumbs_sheet.webp (All 24 frames from 4K Pose & Expression Video):
// - Indices 0..11: Full 12-frame sequential wide-eyed surprised ("Wah!") animation
const SURPRISED_FULL_ORDERED_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
// - Indices 12..23: Full 12-frame sequential right-hand thumbs-up ("Mantap!") animation
const THUMBS_FULL_ORDERED_FRAMES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] as const;

// 5. point_left_sheet.webp (All 24 frames pointing to the 3 activity cards on the left):
// - Indices 0..7: 8 frames smoothly raising arm to point left
// - Indices 8..23: 16 frames actively pointing left while smiling & speaking
const POINT_LEFT_FULL_ORDERED_FRAMES = [
  0, 1, 2, 3, 4, 5, 6, 7,
  8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
] as const;
const POINT_LEFT_LOOP_MIN_IDX = 8;

// Apex Moving-Hold Index (Rossark Principle: travel into the pose 0..7, then hold a subtle living micro-loop 7..11 instead of dropping arms to 0 repeatedly)
const POSE_APEX_MIN_IDX = 7;

// Frame Stepping Rates (20.5 FPS smooth ping-pong talking loop within 18-24 FPS, 22.0 FPS smooth return to neutral Frame 0)
const DISCRETE_FPS = {
  talk: 20.5,        // Stable 18-24 FPS ping-pong talking cadence across 19 consecutive registration frames
  talkRelease: 22.0, // Smooth reverse return to neutral Frame 0 when speech ends (onend)
  wave: 11.5,        // ~87ms per frame discrete waving
  poseEntry: 12.0,   // Crisp entry/exit into gesture pose (0 -> 7 and 7 -> 0)
  poseHold: 6.8,     // Calm living "moving hold" at the apex of the gesture (7 <-> 11)
} as const;

function sampleDiscreteFrame(frames: readonly number[], pos: number): number {
  const maxIdx = frames.length - 1;
  const idx = THREE.MathUtils.clamp(Math.floor(pos), 0, maxIdx);
  return frames[idx];
}

// Preload all sprite sheets in memory at module load & keep references alive
const SPRITE_SHEET_SOURCES = {
  idleTalk: '/mascots/origami_sd/idle_talk_sheet.webp?v=4k_smooth_talk_2',
  wave: '/mascots/origami_sd/wave_sheet.webp?v=4k_white_1',
  cheerThink: '/mascots/origami_sd/cheer_think_sheet.webp?v=4k_poses_1',
  reactThumbs: '/mascots/origami_sd/react_thumbs_sheet.webp?v=4k_poses_1',
  pointLeft: '/mascots/origami_sd/point_left_sheet.webp?v=4k_poses_1',
  avatarCloseup: '/mascots/origami_sd/avatar_closeup.webp?v=4k_white_1',
} as const;

const PRELOADED_IMAGE_CACHE: Record<string, HTMLImageElement> = {};

if (typeof window !== 'undefined') {
  Object.values(SPRITE_SHEET_SOURCES).forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    PRELOADED_IMAGE_CACHE[src] = img;
  });
}

function isTextureReady(tex: THREE.Texture | null | undefined): boolean {
  if (!tex || !tex.image) return false;
  const img = tex.image as HTMLImageElement;
  if (typeof img.complete === 'boolean') {
    return img.complete && img.naturalWidth > 0;
  }
  return true;
}

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export const CharviMascot: React.FC<CharviMascotProps> = ({
  variant = 'large-bottom',
  emotion = 'happy',
  onEmotionChange,
  isSpeaking = false,
  isWaving,
  lighting = 'studio',
  hideQuickButtons = false,
  onClick,
  className = '',
  outfitTheme = 0,
  equippedHat = null,
  greenScreenVideo = null,
  lockStageCoordinates = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const videoSpeechDoneRef = useRef<boolean>(false);
  const greenScreenConfigRef = useRef<GreenScreenVideoConfig | null>(greenScreenVideo);
  greenScreenConfigRef.current = greenScreenVideo;

  const [tapEmotion, setTapEmotion] = useState<CharviEmotion | null>(null);
  const [tapSpeaking, setTapSpeaking] = useState<boolean>(false);
  const [webglReady, setWebglReady] = useState<boolean>(true);

  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customActivityRef = useRef<{ mode: AutonomousActivity; until: number } | null>(null);
  const tapCycleRef = useRef<number>(0);

  // Clear local tap override when parent drives emotion, speech, or wave state directly
  useEffect(() => {
    if (isSpeaking || isWaving || (emotion && emotion !== 'idle' && emotion !== 'happy')) {
      customActivityRef.current = null;
      setTapEmotion(null);
      setTapSpeaking(false);
    }
  }, [emotion, isSpeaking, isWaving]);

  const activeEmotion: CharviEmotion = tapEmotion || emotion;
  const effectiveIsSpeaking: boolean = isSpeaking || tapSpeaking;

  const stateRef = useRef({
    emotion: activeEmotion,
    isSpeaking: effectiveIsSpeaking,
    isWaving,
    lighting,
    outfitTheme,
    hasGreenScreenVideo: Boolean(greenScreenVideo?.src),
    lockStageCoordinates,
  });

  useEffect(() => {
    stateRef.current = {
      emotion: activeEmotion,
      isSpeaking: effectiveIsSpeaking,
      isWaving,
      lighting,
      outfitTheme,
      hasGreenScreenVideo: Boolean(greenScreenVideo?.src),
      lockStageCoordinates,
    };
  }, [activeEmotion, effectiveIsSpeaking, isWaving, lighting, outfitTheme, greenScreenVideo?.src, lockStageCoordinates]);

  // Track whether the current video element has decoded at least one playable frame for the new src
  const isVideoFrameReadyRef = useRef<boolean>(false);

  // Synchronize green-screen stage video playback & real smiling idle video loop
  useEffect(() => {
    const vid = videoElRef.current;
    if (!vid) return;

    // When no explicit stage video is passed (e.g. HOME_IDLE_READY), play the clean upright smiling idle video (budi_idle.mp4)
    if (!greenScreenVideo?.src) {
      videoSpeechDoneRef.current = true;
      const idleTargetUrl = new URL(DEFAULT_REAL_IDLE_VIDEO_SRC, window.location.origin).href;
      vid.loop = true;
      vid.muted = true;

      const onCanPlayIdle = () => {
        isVideoFrameReadyRef.current = true;
        vid.muted = true;
        vid.loop = true;
        vid.play().catch(() => {});
      };

      vid.addEventListener('canplay', onCanPlayIdle);

      if (vid.src !== idleTargetUrl) {
        // Keep isVideoFrameReadyRef.current false until canplay fires so the canvas holds the last clean frame!
        isVideoFrameReadyRef.current = false;
        vid.src = DEFAULT_REAL_IDLE_VIDEO_SRC;
        vid.load();
      } else if (vid.readyState >= 2) {
        onCanPlayIdle();
      }

      return () => {
        vid.removeEventListener('canplay', onCanPlayIdle);
      };
    }

    videoSpeechDoneRef.current = false;
    vid.loop = false;
    const targetUrl = new URL(greenScreenVideo.src, window.location.origin).href;

    const startPlayback = () => {
      isVideoFrameReadyRef.current = true;
      const p = vid.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          vid.muted = true;
          vid.play().catch(() => {});
          greenScreenConfigRef.current?.onMutedAutoplayFallback?.();
        });
      }
    };

    const onLoadedMeta = () => {
      try {
        vid.currentTime = 0;
      } catch {
        // ignore
      }
    };

    vid.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
    vid.addEventListener('canplay', startPlayback, { once: true });

    if (vid.src !== targetUrl) {
      // Hold previous clean frame on canvas until the new video's first frame is decoded (canplay)
      isVideoFrameReadyRef.current = false;
      vid.src = greenScreenVideo.src;
      vid.load();
    } else {
      isVideoFrameReadyRef.current = false;
      try {
        vid.currentTime = 0;
      } catch {
        // ignore
      }
      if (vid.readyState >= 2) {
        startPlayback();
      }
    }

    vid.muted = false;
    vid.volume = 1.0;

    return () => {
      vid.removeEventListener('loadedmetadata', onLoadedMeta);
      vid.removeEventListener('canplay', startPlayback);
    };
  }, [greenScreenVideo?.src, greenScreenVideo?.playKey]);

  // If a dynamic TTS reaction takes over during a stage, mute & jump video to silent real idle tail
  useEffect(() => {
    const vid = videoElRef.current;
    const cfg = greenScreenConfigRef.current;
    if (!vid || !cfg) return;

    const isDynamicOverride =
      effectiveIsSpeaking ||
      isWaving === true ||
      (activeEmotion && activeEmotion !== 'idle' && activeEmotion !== 'happy');

    if (isDynamicOverride) {
      vid.muted = true;
      if (!videoSpeechDoneRef.current) {
        videoSpeechDoneRef.current = true;
      }
      const loopStart = cfg.idleLoopStartSec ?? 0;
      if (vid.readyState >= 1 && loopStart > 0 && vid.currentTime < loopStart) {
        try {
          vid.currentTime = loopStart;
        } catch {
          // ignore
        }
      }
    }
  }, [effectiveIsSpeaking, isWaving, activeEmotion]);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      if (videoElRef.current) {
        videoElRef.current.pause();
      }
      cancelSpeechSynthesis();
    };
  }, []);

  const triggerCustomActivity = (
    mode: AutonomousActivity,
    emo: CharviEmotion,
    _badge: string,
    text: string,
    durationSec = 4.2
  ) => {
    const now = performance.now() * 0.001;
    customActivityRef.current = { mode, until: now + durationSec };
    setTapEmotion(emo);
    setTapSpeaking(true);
    onEmotionChange?.(emo);

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    cancelSpeechSynthesis();

    const finishSpeechCleanly = () => {
      setTapSpeaking(false);
      if (mode === 'curious_glance' || emo === 'talking' || emo === 'excited') {
        customActivityRef.current = null;
        setTapEmotion(null);
        onEmotionChange?.('idle');
      }
    };

    const cleanSpeech = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    if (cleanSpeech) {
      speakTextUtterance(cleanSpeech, {
        lang: 'id-ID',
        rate: 1.02,
        pitch: 1.15,
        onEnd: finishSpeechCleanly,
        onError: finishSpeechCleanly,
      });
    }

    tapTimerRef.current = setTimeout(() => {
      customActivityRef.current = null;
      setTapEmotion(null);
      setTapSpeaking(false);
      onEmotionChange?.('idle');
    }, durationSec * 1000);
  };

  const handleMascotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.();
    if (variant === 'compact-header' || hideQuickButtons) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / Math.max(1, rect.height);
    const relX = (e.clientX - rect.left) / Math.max(1, rect.width);

    if (relY < 0.28) {
      triggerCustomActivity(
        'cheerful_bounce',
        'celebrating',
        '✊ Semangat Anak SD!',
        'Topi Merah Putihku sudah rapi! Semangat berangkat sekolah dan belajar! ✊🇮🇩',
        4.2
      );
    } else if (relY < 0.58 && (relX < 0.34 || relX > 0.66)) {
      triggerCustomActivity(
        'warm_greeting',
        'happy',
        '👋 Halo Sahabat Budi!',
        'Halo! Selamat pagi semuanya, mari kita belajar bersama! 👋🌟',
        4.2
      );
    } else if (relY < 0.52) {
      const faceCycle = tapCycleRef.current % 3;
      tapCycleRef.current += 1;
      if (faceCycle === 0) {
        triggerCustomActivity(
          'thinking_ponder',
          'thinking',
          '🤔 Hmm... Budi Berpikir',
          'Hmm... kira-kira petualangan seru apa ya yang akan kita buka hari ini? 🤔💡',
          4.2
        );
      } else if (faceCycle === 1) {
        triggerCustomActivity(
          'surprised_pose',
          'surprised',
          '😲 Wah, Seru Banget!',
          'Hah?! Banyak sekali ilmu pengetahuan menarik di CeriaKids! 😲✨',
          4.0
        );
      } else {
        triggerCustomActivity(
          'curious_glance',
          'excited',
          '🗣️ Ayo Belajar Bersama!',
          'Halo! Hari ini kita akan belajar banyak hal baru yang seru bersama-sama! 🗣️📚',
          4.4
        );
      }
    } else {
      triggerCustomActivity(
        'ok_pose',
        'happy',
        '👍 Mantap & Hebat!',
        'Mantap! Tas sekolahku penuh buku cerita dan bekal sehat! 👍🎒',
        4.2
      );
    }
  };

  useEffect(() => {
    if (variant === 'compact-header') return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglReady(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const targetDpr = isSoftwareGl
      ? 2.0
      : Math.max(2.5, Math.min((window.devicePixelRatio || 1) * 2.0, 3.5));
    renderer.setPixelRatio(targetDpr);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 5);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const isStudio = stateRef.current.lighting !== 'sunset';
      const grad = sCtx.createRadialGradient(isStudio ? 128 : 136, 64, 10, isStudio ? 128 : 136, 64, 115);
      if (isStudio) {
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.18)');
        grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.07)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      } else {
        grad.addColorStop(0, 'rgba(24, 34, 22, 0.52)');
        grad.addColorStop(0.5, 'rgba(32, 42, 30, 0.26)');
        grad.addColorStop(1, 'rgba(24, 34, 22, 0.0)');
      }
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowGeo = new THREE.PlaneGeometry(1.05, 0.24);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0.0, -0.88, -0.1);
    scene.add(shadowMesh);

    const loader = new THREE.TextureLoader();
    const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 8;

    const configureAtlasTexture = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.anisotropy = maxAniso;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      try {
        renderer.initTexture(tex);
      } catch {
        // ignore if context lost
      }
    };

    const loadPrewarmedTexture = (src: string): THREE.Texture => {
      const cachedImg = PRELOADED_IMAGE_CACHE[src];
      if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
        const tex = new THREE.Texture(cachedImg) as THREE.Texture;
        configureAtlasTexture(tex);
        return tex;
      }
      return loader.load(src, configureAtlasTexture);
    };

    const idleTalkTex = loadPrewarmedTexture(SPRITE_SHEET_SOURCES.idleTalk);
    const waveTex = loadPrewarmedTexture(SPRITE_SHEET_SOURCES.wave);
    const cheerThinkTex = loadPrewarmedTexture(SPRITE_SHEET_SOURCES.cheerThink);
    const reactThumbsTex = loadPrewarmedTexture(SPRITE_SHEET_SOURCES.reactThumbs);
    const pointLeftTex = loadPrewarmedTexture(SPRITE_SHEET_SOURCES.pointLeft);

    // Dedicated 2D Frame Buffer Canvas for Budi's Video (clears & draws with globalAlpha = 1.0 and holds last valid frame during transitions)
    const videoFrameCanvas = document.createElement('canvas');
    videoFrameCanvas.width = 640;
    videoFrameCanvas.height = 1120;
    const videoFrameCtx = videoFrameCanvas.getContext('2d');
    let hasPersistentVideoFrame = false;

    const videoTex = new THREE.CanvasTexture(videoFrameCanvas);
    videoTex.colorSpace = THREE.NoColorSpace;
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;
    videoTex.generateMipmaps = false;
    videoTex.wrapS = THREE.ClampToEdgeWrapping;
    videoTex.wrapT = THREE.ClampToEdgeWrapping;

    // 9-Tap Premultiplied Super-Sampling Atlas Shader + Real-Time WebGL Green Screen Chroma Key (Zero Double-Layer Ghosting)
    const spriteUniforms: {
      uTex: { value: THREE.Texture };
      uVideoTex: { value: THREE.Texture };
      uUseVideo: { value: number };
      uFrame: { value: number };
      uCols: { value: number };
      uRows: { value: number };
      uStudioLighting: { value: number };
      uOutfitTheme: { value: number };
    } = {
      uTex: { value: idleTalkTex },
      uVideoTex: { value: videoTex },
      uUseVideo: { value: 0.0 },
      uFrame: { value: 0.0 },
      uCols: { value: SHEET_COLS },
      uRows: { value: SHEET_ROWS },
      uStudioLighting: { value: stateRef.current.lighting === 'sunset' ? 0.0 : 1.0 },
      uOutfitTheme: { value: stateRef.current.outfitTheme },
    };

    const spriteMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: spriteUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex;
        uniform sampler2D uVideoTex;
        uniform float uUseVideo;
        uniform float uFrame;
        uniform float uCols;
        uniform float uRows;
        uniform float uStudioLighting;
        uniform float uOutfitTheme;
        varying vec2 vUv;

        vec4 sampleTileFromTex(sampler2D tex, vec2 tileUv, float col, float row) {
          vec2 clampedUv = clamp(tileUv, vec2(0.002), vec2(0.998));
          float u = (col + clampedUv.x) / uCols;
          float v = 1.0 - ((row + (1.0 - clampedUv.y)) / uRows);
          return texture2D(tex, vec2(u, v));
        }

        vec4 sampleFilteredPose(sampler2D tex, float frameIdx, vec2 uv, vec2 fw) {
          float col = mod(frameIdx, uCols);
          float row = floor(frameIdx / uCols);
          vec3 premulRgb = vec3(0.0);
          float totalAlpha = 0.0;
          float totalWeight = 0.0;

          for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
              float w = (dx == 0 && dy == 0) ? 4.0 : ((dx == 0 || dy == 0) ? 2.0 : 1.0);
              vec2 offset = vec2(float(dx), float(dy)) * fw;
              vec4 s = sampleTileFromTex(tex, uv + offset, col, row);
              premulRgb += s.rgb * s.a * w;
              totalAlpha += s.a * w;
              totalWeight += w;
            }
          }
          return vec4(premulRgb / totalWeight, totalAlpha / totalWeight);
        }

        vec4 sampleChromaKeyVideo(sampler2D vidTex, vec2 uv, vec2 fw) {
          vec2 clampedUv = clamp(uv, vec2(0.003), vec2(0.997));
          vec3 cCenter = texture2D(vidTex, clampedUv).rgb;

          vec3 cLeft  = texture2D(vidTex, clamp(clampedUv + vec2(-fw.x * 1.4, 0.0), vec2(0.003), vec2(0.997))).rgb;
          vec3 cRight = texture2D(vidTex, clamp(clampedUv + vec2( fw.x * 1.4, 0.0), vec2(0.003), vec2(0.997))).rgb;
          vec3 cUp    = texture2D(vidTex, clamp(clampedUv + vec2(0.0,  fw.y * 1.4), vec2(0.003), vec2(0.997))).rgb;
          vec3 cDown  = texture2D(vidTex, clamp(clampedUv + vec2(0.0, -fw.y * 1.4), vec2(0.003), vec2(0.997))).rgb;

          float exC = cCenter.g - max(cCenter.r, cCenter.b);
          float exL = cLeft.g   - max(cLeft.r,   cLeft.b);
          float exR = cRight.g  - max(cRight.r,  cRight.b);
          float exU = cUp.g     - max(cUp.r,     cUp.b);
          float exD = cDown.g   - max(cDown.r,   cDown.b);

          float aC = 1.0 - smoothstep(0.06, 0.36, exC);
          float aL = 1.0 - smoothstep(0.06, 0.36, exL);
          float aR = 1.0 - smoothstep(0.06, 0.36, exR);
          float aU = 1.0 - smoothstep(0.06, 0.36, exU);
          float aD = 1.0 - smoothstep(0.06, 0.36, exD);

          float alpha = (aC * 4.0 + aL + aR + aU + aD) / 8.0;

          // Complete green spill suppression & foreground color recovery on silhouette edges
          float maxRB = max(cCenter.r, cCenter.b);
          float minRB = min(cCenter.r, cCenter.b);
          vec3 despilled = cCenter;
          float spillFactor = smoothstep(0.015, 0.13, exC);
          despilled.g = mix(cCenter.g, maxRB * 0.94 + minRB * 0.06, spillFactor);

          vec3 greenKeyColor = vec3(0.04, 0.92, 0.04);
          vec3 unmixed = (cCenter - greenKeyColor * (1.0 - aC)) / max(aC, 0.30);
          unmixed.g = min(unmixed.g, max(unmixed.r, unmixed.b) * 0.96);
          vec3 finalFg = clamp(mix(despilled, unmixed, (1.0 - aC) * 0.62), 0.0, 1.0);

          return vec4(finalFg * alpha, alpha);
        }

        void main() {
          vec2 fw = fwidth(vUv) * 0.38;

          // Strictly render a single layer (either chroma-keyed video OR single discrete sprite tile — NEVER stack two frames)
          vec4 currSample;
          if (uUseVideo > 0.5) {
            currSample = sampleChromaKeyVideo(uVideoTex, vUv, fw);
          } else {
            currSample = sampleFilteredPose(uTex, uFrame, vUv, fw);
          }
          float outAlpha = currSample.a;
          if (outAlpha < 0.015) discard;

          // Un-premultiply RGB so semi-transparent boundary pixels never darken toward black
          vec3 cleanRgb = currSample.rgb / max(outAlpha, 0.0001);

          // Real-Time Uniform Color Replacement (Hat, Tie, Shorts)
          float redLevel = smoothstep(0.31, 0.39, cleanRgb.r);
          float redOverGreen = smoothstep(1.38, 1.52, cleanRgb.r / max(cleanRgb.g, 0.001));
          float redOverBlue = smoothstep(1.28, 1.42, cleanRgb.r / max(cleanRgb.b, 0.001));
          float redExcess = smoothstep(0.10, 0.20, cleanRgb.r - max(cleanRgb.g * 1.20, cleanRgb.b * 1.15));
          float mouthArea = smoothstep(0.59, 0.62, vUv.y) * (1.0 - smoothstep(0.67, 0.70, vUv.y)) * (1.0 - smoothstep(0.04, 0.08, abs(vUv.x - 0.5)));
          float outfitMask = redLevel * redOverGreen * redOverBlue * redExcess * (1.0 - mouthArea);

          if (uOutfitTheme > 0.5 && outfitMask > 0.001) {
            float luma = dot(cleanRgb, vec3(0.299, 0.587, 0.114));
            float fabricShade = clamp(cleanRgb.r * 0.78 + luma * 0.38, 0.0, 1.22);
            float specHighlight = max(0.0, min(cleanRgb.g, cleanRgb.b) - cleanRgb.r * 0.20);
            vec3 targetUniformRgb = cleanRgb;

            if (uOutfitTheme < 1.5) {
              vec3 navyShadow = vec3(0.06, 0.18, 0.48);
              vec3 electricBlue = vec3(0.12, 0.48, 0.96);
              targetUniformRgb = mix(navyShadow, electricBlue, clamp(fabricShade, 0.0, 1.0)) + vec3(specHighlight * 0.60);
            } else if (uOutfitTheme < 2.5) {
              vec3 forestShadow = vec3(0.07, 0.30, 0.18);
              vec3 emeraldGreen = vec3(0.13, 0.66, 0.40);
              targetUniformRgb = mix(forestShadow, emeraldGreen, clamp(fabricShade, 0.0, 1.0)) + vec3(specHighlight * 0.55);
            } else {
              vec3 royalShadow = vec3(0.24, 0.08, 0.46);
              vec3 royalPurple = vec3(0.56, 0.20, 0.92);
              targetUniformRgb = mix(royalShadow, royalPurple, clamp(fabricShade, 0.0, 1.0)) + vec3(specHighlight * 0.58);
            }

            cleanRgb = mix(cleanRgb, clamp(targetUniformRgb, 0.0, 1.0), outfitMask);
          }

          // Bright Studio Lighting (1:1 clean vibrant studio colors, zero twilight darkening)
          vec3 studioRgb = clamp(pow(cleanRgb, vec3(0.97)) * 1.02, 0.0, 1.0);

          // Optional Sunset/Twilight Ambient Relighting
          float col = mod(uFrame, uCols);
          float row = floor(uFrame / uCols);
          vec3 baseRgb = pow(cleanRgb, vec3(0.98)) * 0.91;
          float sunSide = 1.0 - smoothstep(0.18, 0.84, vUv.x);
          vec3 sunsetKeyTint = vec3(1.06, 0.90, 0.74);
          vec3 twilightShadowTint = vec3(0.73, 0.66, 0.81);
          vec3 horizLight = mix(twilightShadowTint, sunsetKeyTint, sunSide);
          vec3 skyAmbient = vec3(1.00, 0.93, 0.92);
          vec3 meadowBounce = vec3(0.84, 0.89, 0.74);
          vec3 vertLight = mix(meadowBounce, skyAmbient, smoothstep(0.08, 0.65, vUv.y));
          vec3 sunsetRgb = baseRgb * horizLight * vertLight;
          float leftNeighborAlpha = (uUseVideo > 0.5)
            ? outAlpha
            : sampleTileFromTex(uTex, vUv - vec2(max(fw.x * 3.2, 0.0045), 0.0), col, row).a;
          float leftRim = clamp(outAlpha - leftNeighborAlpha, 0.0, 1.0) * smoothstep(0.72, 0.18, vUv.x);
          sunsetRgb += vec3(1.0, 0.76, 0.40) * leftRim * 0.26;
          float soleAo = smoothstep(0.02, 0.13, vUv.y);
          sunsetRgb *= mix(0.86, 1.0, soleAo);

          vec3 finalRgb = mix(sunsetRgb, studioRgb, uStudioLighting);
          gl_FragColor = vec4(clamp(finalRgb, 0.0, 1.0), smoothstep(0.015, 0.98, outAlpha));
        }
      `,
    });

    const spriteGeo = new THREE.PlaneGeometry(1, 1);
    const spriteMesh = new THREE.Mesh(spriteGeo, spriteMat);
    scene.add(spriteMesh);

    let baseScaleX = 1.0;
    let baseScaleY = 1.0;

    const updateSize = () => {
      if (!container) return;
      const w = Math.max(64, container.clientWidth);
      const h = Math.max(64, container.clientHeight);
      const containerAspect = w / h;

      let charH = 1.88;
      let charW = charH * (TILE_ASPECT / containerAspect);
      if (charW > 1.88) {
        charW = 1.88;
        charH = charW * (containerAspect / TILE_ASPECT);
      }

      baseScaleX = charW;
      baseScaleY = charH;
      spriteMesh.scale.set(baseScaleX, baseScaleY, 1);
      spriteMesh.position.set(0, 0, 0);
      spriteMesh.rotation.z = 0;
      shadowMesh.scale.set(baseScaleX * 0.72, 1, 1);
      shadowMesh.position.set(0, -baseScaleY * 0.47, -0.1);

      renderer.setSize(w, h, false);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    let frameId = 0;
    let prevTime = performance.now() * 0.001;

    // Discrete ping-pong sequence trackers (10–12 FPS forward + reverse back to index 0)
    let wavePos = stateRef.current.isWaving === true ? WAVE_LOOP_MIN_IDX : 0;
    let waveDir: 1 | -1 = 1;

    let cheerPos = 0;
    let cheerDir: 1 | -1 = 1;

    let thinkPos = 0;
    let thinkDir: 1 | -1 = 1;

    let surprisedPos = 0;
    let surprisedDir: 1 | -1 = 1;

    let thumbsPos = 0;
    let thumbsDir: 1 | -1 = 1;

    let pointPos = 0;
    let pointDir: 1 | -1 = 1;

    // Continuous Ping-Pong Loop tracker for Talking (0 -> 1 -> ... -> 18 -> ... -> 1 -> 0 at 20.5 FPS, zero hard reset)
    let talkPos = 0;
    let talkDir: 1 | -1 = 1;

    let lastValidTex: THREE.Texture = idleTalkTex;

    const stepPingPongSequence = (
      pos: number,
      dir: 1 | -1,
      wantActive: boolean,
      maxIdx: number,
      minLoopIdx: number,
      entryFps: number,
      holdFps: number,
      dt: number
    ): { pos: number; dir: 1 | -1 } => {
      if (wantActive) {
        const activeFps = pos < minLoopIdx ? entryFps : holdFps;
        let nextPos = pos + dir * dt * activeFps;
        let nextDir = dir;
        if (nextPos >= maxIdx) {
          nextPos = maxIdx - (nextPos - maxIdx);
          nextDir = -1;
        } else if (nextPos <= minLoopIdx && dir === -1) {
          nextPos = minLoopIdx + (minLoopIdx - nextPos);
          nextDir = 1;
        }
        return {
          pos: THREE.MathUtils.clamp(nextPos, 0, maxIdx),
          dir: nextDir,
        };
      } else {
        // Reverse sequentially at crisp entryFps back to index 0 (neutral frame)
        const nextPos = Math.max(0, pos - dt * entryFps);
        return {
          pos: nextPos,
          dir: nextPos > 0 ? -1 : 1,
        };
      }
    };

    const tick = () => {
      const now = performance.now() * 0.001;
      const dt = Math.min(0.05, Math.max(0.001, now - prevTime));
      prevTime = now;

      const {
        emotion: curEmo,
        isSpeaking: curSpeaking,
        isWaving: curIsWaving,
        lighting: curLighting,
        outfitTheme: curOutfitTheme,
        hasGreenScreenVideo,
      } = stateRef.current;

      spriteUniforms.uStudioLighting.value = curLighting === 'sunset' ? 0.0 : 1.0;
      spriteUniforms.uOutfitTheme.value = curOutfitTheme;

      const customAct =
        customActivityRef.current && now < customActivityRef.current.until
          ? customActivityRef.current.mode
          : null;

      // Strictly deterministic pose mapping
      const wantWave =
        curIsWaving === true ||
        customAct === 'warm_greeting';

      const wantPointLeft =
        !wantWave &&
        curEmo === 'point';

      const wantCheer =
        !wantWave &&
        !wantPointLeft &&
        (customAct === 'cheerful_bounce' || curEmo === 'celebrating');

      const wantThink =
        !wantWave &&
        !wantPointLeft &&
        !wantCheer &&
        (customAct === 'thinking_ponder' ||
          curEmo === 'thinking' ||
          curEmo === 'confused' ||
          curEmo === 'listening');

      const wantSurprised =
        !wantWave &&
        !wantPointLeft &&
        !wantCheer &&
        !wantThink &&
        (customAct === 'surprised_pose' || curEmo === 'surprised');

      const wantThumbs =
        !wantWave &&
        !wantPointLeft &&
        !wantCheer &&
        !wantThink &&
        !wantSurprised &&
        (customAct === 'ok_pose' ||
          curEmo === 'shy' ||
          curEmo === 'proud' ||
          curEmo === 'encouraging' ||
          curEmo === 'giggle');

      const wantTalk =
        !wantWave &&
        !wantPointLeft &&
        !wantCheer &&
        !wantThink &&
        !wantSurprised &&
        !wantThumbs &&
        (curSpeaking || curEmo === 'talking');

      const hasActiveDynamicReaction =
        wantWave || wantPointLeft || wantCheer || wantThink || wantSurprised || wantThumbs || wantTalk;

      // Step each active pose sequence
      const waveStep = stepPingPongSequence(
        wavePos,
        waveDir,
        wantWave,
        WAVE_FULL_ORDERED_FRAMES.length - 1,
        WAVE_LOOP_MIN_IDX,
        DISCRETE_FPS.wave,
        DISCRETE_FPS.wave,
        dt
      );
      wavePos = waveStep.pos;
      waveDir = waveStep.dir;

      const cheerStep = stepPingPongSequence(
        cheerPos,
        cheerDir,
        wantCheer,
        CHEER_FULL_ORDERED_FRAMES.length - 1,
        POSE_APEX_MIN_IDX,
        DISCRETE_FPS.poseEntry,
        DISCRETE_FPS.poseHold,
        dt
      );
      cheerPos = cheerStep.pos;
      cheerDir = cheerStep.dir;

      const thinkStep = stepPingPongSequence(
        thinkPos,
        thinkDir,
        wantThink,
        THINK_FULL_ORDERED_FRAMES.length - 1,
        POSE_APEX_MIN_IDX,
        DISCRETE_FPS.poseEntry,
        DISCRETE_FPS.poseHold,
        dt
      );
      thinkPos = thinkStep.pos;
      thinkDir = thinkStep.dir;

      const surprisedStep = stepPingPongSequence(
        surprisedPos,
        surprisedDir,
        wantSurprised,
        SURPRISED_FULL_ORDERED_FRAMES.length - 1,
        POSE_APEX_MIN_IDX,
        DISCRETE_FPS.poseEntry,
        DISCRETE_FPS.poseHold,
        dt
      );
      surprisedPos = surprisedStep.pos;
      surprisedDir = surprisedStep.dir;

      const thumbsStep = stepPingPongSequence(
        thumbsPos,
        thumbsDir,
        wantThumbs,
        THUMBS_FULL_ORDERED_FRAMES.length - 1,
        POSE_APEX_MIN_IDX,
        DISCRETE_FPS.poseEntry,
        DISCRETE_FPS.poseHold,
        dt
      );
      thumbsPos = thumbsStep.pos;
      thumbsDir = thumbsStep.dir;

      const pointStep = stepPingPongSequence(
        pointPos,
        pointDir,
        wantPointLeft,
        POINT_LEFT_FULL_ORDERED_FRAMES.length - 1,
        POINT_LEFT_LOOP_MIN_IDX,
        DISCRETE_FPS.poseEntry,
        DISCRETE_FPS.talk,
        dt
      );
      pointPos = pointStep.pos;
      pointDir = pointStep.dir;

      const talkStep = stepPingPongSequence(
        talkPos,
        talkDir,
        wantTalk,
        TALK_FULL_ORDERED_FRAMES.length - 1,
        0,
        DISCRETE_FPS.talkRelease,
        DISCRETE_FPS.talk,
        dt
      );
      talkPos = talkStep.pos;
      talkDir = talkStep.dir;

      const isPoseReturningToZero =
        wavePos > 0.001 ||
        pointPos > 0.001 ||
        cheerPos > 0.001 ||
        thinkPos > 0.001 ||
        surprisedPos > 0.001 ||
        thumbsPos > 0.001 ||
        talkPos > 0.001;

      // Manage Green-Screen Stage Video & Real Smiling Idle Video loop
      const vid = videoElRef.current;
      const vidCfg = greenScreenConfigRef.current;
      let isGreenVideoActive = false;

      if (vid && !hasActiveDynamicReaction && !isPoseReturningToZero) {
        if (hasGreenScreenVideo && vidCfg) {
          const speechEnd =
            typeof vidCfg.speechEndSec === 'number'
              ? vidCfg.speechEndSec
              : vid.duration > 0
                ? Math.max(0, vid.duration - 0.15)
                : 0;

          const idleStart = vidCfg.idleLoopStartSec ?? speechEnd;
          const idleEnd =
            typeof vidCfg.idleLoopEndSec === 'number' && vid.duration > 0
              ? Math.min(vidCfg.idleLoopEndSec, vid.duration - 0.08)
              : vid.duration > 0
                ? Math.max(idleStart + 0.5, vid.duration - 0.08)
                : 0;

          if (!videoSpeechDoneRef.current && speechEnd > 0 && vid.currentTime >= speechEnd) {
            videoSpeechDoneRef.current = true;
            vid.muted = true;
            vidCfg.onSpeechComplete?.();
            if (idleStart > speechEnd + 0.04 && vid.currentTime < idleStart) {
              try {
                vid.currentTime = idleStart;
              } catch {
                // ignore
              }
            }
          }

          // Seamless loop strictly inside the upright open-eyed smiling idle window [idleStart..idleEnd]
          if (videoSpeechDoneRef.current && idleEnd > idleStart && vid.currentTime >= idleEnd) {
            try {
              vid.currentTime = idleStart;
              vid.muted = true;
              if (vid.paused) {
                vid.play().catch(() => {});
              }
            } catch {
              // ignore seek error
            }
          }
        } else {
          // Default real smiling idle video (budi_idle.mp4: 100% upright, hands at sides, bright open eyes)
          if (vid.duration > 0 && vid.currentTime >= Math.min(DEFAULT_IDLE_LOOP_END_SEC, vid.duration - 0.08)) {
            try {
              vid.currentTime = DEFAULT_IDLE_LOOP_START_SEC;
            } catch {
              // ignore
            }
          }
          if (vid.paused && vid.readyState >= 2) {
            vid.muted = true;
            vid.play().catch(() => {});
          }
        }

        // Only overwrite the persistent canvas when the new video has decoded a valid frame;
        // otherwise keep displaying the last clean frame from the previous state (zero flicker/blank flash!)
        if (
          videoFrameCtx &&
          isVideoFrameReadyRef.current &&
          vid.readyState >= 2 &&
          vid.videoWidth > 0 &&
          !vid.seeking
        ) {
          videoFrameCtx.clearRect(0, 0, videoFrameCanvas.width, videoFrameCanvas.height);
          videoFrameCtx.globalAlpha = 1.0;
          videoFrameCtx.drawImage(vid, 0, 0, videoFrameCanvas.width, videoFrameCanvas.height);
          videoTex.needsUpdate = true;
          hasPersistentVideoFrame = true;
        }

        if (hasPersistentVideoFrame) {
          isGreenVideoActive = true;
        }
      }

      spriteUniforms.uUseVideo.value = isGreenVideoActive ? 1.0 : 0.0;

      let activeTex = idleTalkTex;
      let activeFrame = IDLE_BASE_FRAME;

      if ((wantWave || wavePos > 0.001) && isTextureReady(waveTex)) {
        activeTex = waveTex;
        activeFrame = sampleDiscreteFrame(WAVE_FULL_ORDERED_FRAMES, wavePos);
      } else if ((wantPointLeft || pointPos > 0.001) && isTextureReady(pointLeftTex)) {
        activeTex = pointLeftTex;
        activeFrame = sampleDiscreteFrame(POINT_LEFT_FULL_ORDERED_FRAMES, pointPos);
      } else if ((wantCheer || cheerPos > 0.001) && isTextureReady(cheerThinkTex)) {
        activeTex = cheerThinkTex;
        activeFrame = sampleDiscreteFrame(CHEER_FULL_ORDERED_FRAMES, cheerPos);
      } else if ((wantThink || thinkPos > 0.001) && isTextureReady(cheerThinkTex)) {
        activeTex = cheerThinkTex;
        activeFrame = sampleDiscreteFrame(THINK_FULL_ORDERED_FRAMES, thinkPos);
      } else if ((wantSurprised || surprisedPos > 0.001) && isTextureReady(reactThumbsTex)) {
        activeTex = reactThumbsTex;
        activeFrame = sampleDiscreteFrame(SURPRISED_FULL_ORDERED_FRAMES, surprisedPos);
      } else if ((wantThumbs || thumbsPos > 0.001) && isTextureReady(reactThumbsTex)) {
        activeTex = reactThumbsTex;
        activeFrame = sampleDiscreteFrame(THUMBS_FULL_ORDERED_FRAMES, thumbsPos);
      } else if (wantTalk || talkPos > 0.001) {
        activeTex = idleTalkTex;
        activeFrame = sampleDiscreteFrame(TALK_FULL_ORDERED_FRAMES, talkPos);
      }

      if (isTextureReady(activeTex)) {
        lastValidTex = activeTex;
      }

      spriteUniforms.uTex.value = lastValidTex;
      spriteUniforms.uFrame.value = activeFrame;

      // Strictly lock scale, position, and rotation (zero synthetic CSS/WebGL scaling)
      spriteMesh.scale.set(baseScaleX, baseScaleY, 1);
      spriteMesh.position.set(0, 0, 0);
      spriteMesh.rotation.z = 0;

      shadowMesh.position.set(0, -baseScaleY * 0.47, -0.1);
      shadowMesh.scale.set(baseScaleX * 0.72, 1, 1);

      renderer.clear(true, true, true);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      spriteGeo.dispose();
      spriteMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      idleTalkTex.dispose();
      waveTex.dispose();
      cheerThinkTex.dispose();
      reactThumbsTex.dispose();
      pointLeftTex.dispose();
      videoTex.dispose();
      renderer.dispose();
    };
  }, [variant]);

  const preloadDomNode = (
    <div
      aria-hidden="true"
      className="fixed -left-[9999px] -top-[9999px] w-px h-px overflow-hidden opacity-0 pointer-events-none select-none"
    >
      <img src={SPRITE_SHEET_SOURCES.idleTalk} alt="" decoding="sync" draggable={false} />
      <img src={SPRITE_SHEET_SOURCES.wave} alt="" decoding="sync" draggable={false} />
      <img src={SPRITE_SHEET_SOURCES.cheerThink} alt="" decoding="sync" draggable={false} />
      <img src={SPRITE_SHEET_SOURCES.reactThumbs} alt="" decoding="sync" draggable={false} />
      <img src={SPRITE_SHEET_SOURCES.pointLeft} alt="" decoding="sync" draggable={false} />
      <img src={SPRITE_SHEET_SOURCES.avatarCloseup} alt="" decoding="sync" draggable={false} />
      <video
        ref={videoElRef}
        playsInline
        preload="auto"
        loop={false}
        onTimeUpdate={() => {
          const vid = videoElRef.current;
          const cfg = greenScreenConfigRef.current;
          if (!vid || !cfg) return;
          if (
            !videoSpeechDoneRef.current &&
            typeof cfg.speechEndSec === 'number' &&
            vid.currentTime >= cfg.speechEndSec
          ) {
            videoSpeechDoneRef.current = true;
            vid.muted = true;
            cfg.onSpeechComplete?.();
          }
        }}
        onEnded={() => {
          const vid = videoElRef.current;
          const cfg = greenScreenConfigRef.current;
          if (vid && cfg) {
            if (!videoSpeechDoneRef.current) {
              videoSpeechDoneRef.current = true;
              cfg.onSpeechComplete?.();
            }
            try {
              vid.currentTime = cfg.idleLoopStartSec ?? 0;
              vid.muted = true;
              vid.play().catch(() => {});
            } catch {
              // ignore
            }
          } else if (vid) {
            try {
              vid.currentTime = 0;
              vid.muted = true;
              vid.play().catch(() => {});
            } catch {
              // ignore
            }
          }
        }}
        onError={() => {
          const cfg = greenScreenConfigRef.current;
          if (cfg && !videoSpeechDoneRef.current) {
            videoSpeechDoneRef.current = true;
            cfg.onSpeechComplete?.();
          }
        }}
      />
    </div>
  );

  const isCompact = variant === 'compact-header';
  const hatSizeClass = isCompact ? 'w-7 h-7 -top-1.5' : 'w-16 h-16 top-[0%]';
  const hatOverlayNode =
    equippedHat && equippedHat !== 'none' ? (
      <div
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center ${hatSizeClass}`}
      >
        {(equippedHat === 'hat_crown' || equippedHat === 'crown') && (
          <svg viewBox="0 0 64 48" className="w-full h-full drop-shadow-md">
            <polygon
              points="8,40 4,14 20,26 32,8 44,26 60,14 56,40"
              fill="#FACC15"
              stroke="#CA8A04"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="28" r="4" fill="#EF4444" />
            <circle cx="18" cy="31" r="3" fill="#3B82F6" />
            <circle cx="46" cy="31" r="3" fill="#10B981" />
          </svg>
        )}
        {(equippedHat === 'hat_flower' || equippedHat === 'flower') && (
          <svg viewBox="0 0 80 40" className="w-full h-full drop-shadow-md">
            <circle cx="22" cy="24" r="8" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
            <circle cx="40" cy="20" r="9" fill="#FB7185" stroke="#BE185D" strokeWidth="2.5" />
            <circle cx="58" cy="24" r="8" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
            <circle cx="22" cy="24" r="3" fill="#FEF08A" />
            <circle cx="40" cy="20" r="3.5" fill="#FEF08A" />
            <circle cx="58" cy="24" r="3" fill="#FEF08A" />
          </svg>
        )}
        {equippedHat === 'bow' && (
          <svg viewBox="0 0 64 56" className="w-full h-full drop-shadow-md">
            <path
              d="M22 30 L12 52 L24 46 L29 54 L32 34"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M42 30 L52 52 L40 46 L35 54 L32 34"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M32 24 C20 10 6 12 8 26 C10 38 22 36 32 24 Z"
              fill="#FB7185"
              stroke="#9F1239"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M32 24 C44 10 58 12 56 26 C54 38 42 36 32 24 Z"
              fill="#F43F5E"
              stroke="#9F1239"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="24" r="8" fill="#FACC15" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="32" cy="24" r="3.5" fill="#FEF08A" />
          </svg>
        )}
        {(equippedHat === 'star' || equippedHat === 'hat_wizard') && (
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
            <path
              d="M32 6 L39.5 21.2 L56.3 23.6 L44.1 35.5 L47.0 52.2 L32 44.3 L17.0 52.2 L19.9 35.5 L7.7 23.6 L24.5 21.2 Z"
              fill="#FACC15"
              stroke="#CA8A04"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M32 13 L36.8 22.8 L47.6 24.4 L39.8 32.0 L41.6 42.7 L32 37.6 L22.4 42.7 L24.2 32.0 L16.4 24.4 L27.2 22.8 Z"
              fill="#FEF08A"
              opacity="0.7"
            />
          </svg>
        )}
        {equippedHat === 'glasses' && (
          <svg viewBox="0 0 80 32" className="w-full h-full drop-shadow-md translate-y-6">
            <rect x="8" y="6" width="26" height="18" rx="6" fill="#0EA5E9" fillOpacity="0.45" stroke="#0F172A" strokeWidth="3" />
            <rect x="46" y="6" width="26" height="18" rx="6" fill="#0EA5E9" fillOpacity="0.45" stroke="#0F172A" strokeWidth="3" />
            <line x1="34" y1="14" x2="46" y2="14" stroke="#0F172A" strokeWidth="3" />
          </svg>
        )}
        {(equippedHat === 'palette' || equippedHat === 'hat_explorer') && (
          <svg viewBox="0 0 80 48" className="w-full h-full drop-shadow-md">
            <ellipse cx="40" cy="34" rx="34" ry="10" fill="#EC4899" stroke="#9D174D" strokeWidth="3" />
            <path d="M16,32 C16,12 64,12 64,32 Z" fill="#F472B6" stroke="#9D174D" strokeWidth="3" />
            <circle cx="40" cy="12" r="4" fill="#9D174D" />
          </svg>
        )}
      </div>
    ) : null;

  if (variant === 'compact-header') {
    const hasExplicitSize = /\b(w-|h-)/.test(className);
    return (
      <div
        onClick={handleMascotClick}
        className={`relative inline-flex items-center justify-center cursor-pointer select-none [-webkit-tap-highlight-color:transparent] group ${
          hasExplicitSize ? '' : 'w-11 h-11 sm:w-12 sm:h-12'
        } ${className}`}
        title="Ketuk untuk menyapa Budi!"
      >
        {preloadDomNode}
        {hatOverlayNode}
        <img
          src={SPRITE_SHEET_SOURCES.avatarCloseup}
          alt="Budi — Maskot Anak SD CeriaKids"
          className="w-full h-full object-contain drop-shadow-sm select-none pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  const hasExplicitDimensions = /\b(w-|h-)/.test(className);
  const defaultLargeSize = hasExplicitDimensions
    ? ''
    : 'w-[200px] h-[260px] sm:w-[230px] sm:h-[300px]';

  return (
    <div
      onClick={handleMascotClick}
      className={`group relative flex items-center justify-center select-none [-webkit-tap-highlight-color:transparent] cursor-pointer ${defaultLargeSize} ${className}`}
      title="Ketuk untuk mendengarkan Budi!"
    >
      {preloadDomNode}
      {hatOverlayNode}
      {webglReady ? (
        <div
          ref={mountRef}
          className="w-full h-full select-none [-webkit-tap-highlight-color:transparent]"
        />
      ) : (
        <img
          src={SPRITE_SHEET_SOURCES.avatarCloseup}
          alt="Budi — Maskot Anak SD CeriaKids"
          className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
          draggable={false}
        />
      )}
    </div>
  );
};

export default CharviMascot;

