import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Undo2, Redo2, Trash2, Star, Home, Palette } from 'lucide-react';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { recordArtworkSaved, loadChildProgress } from '../utils/progressStorage';

interface DrawingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ToolType = 'pencil' | 'brush' | 'crayon' | 'glow' | 'stars' | 'eraser' | 'stamp';
export type StampType = 'cincau' | 'star' | 'heart' | 'flower';
export type TemplateType = 'blank' | 'turtle' | 'chick' | 'bear';

const PALETTE_SWATCHES = [
  { name: 'Merah Stroberi', hex: '#EF4444' },
  { name: 'Oranye Jeruk', hex: '#F97316' },
  { name: 'Kuning Pisang', hex: '#FACC15' },
  { name: 'Hijau Apel', hex: '#84CC16' },
  { name: 'Biru Langit', hex: '#0EA5E9' },
  { name: 'Biru Samudra', hex: '#06B6D4' },
  { name: 'Ungu Berry', hex: '#A855F7' },
  { name: 'Pink Permen', hex: '#EC4899' },
  { name: 'Cokelat Kayu', hex: '#854D0E' },
  { name: 'Hitam Arang', hex: '#1E293B' },
];

const CREATIVE_TIPS = [
  'Sentuh untuk ide melukis!',
  'Coba Kuas Halus untuk gradasi lembut!',
  'Tempel stiker Bintang di lukisanmu!',
  'Gunakan Spidol Neon agar berkilau!',
  'Warnai Penyu Lucu dengan warna pelangi!',
];

// Custom SVG Icons matching screen.png tool badges & Cincau stamp
const CincauStampIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="20" cy="21" r="14" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
    <ellipse cx="20" cy="11" rx="7" ry="3.5" fill="#67E8F9" opacity="0.65" />
    <circle cx="14.5" cy="19" r="2.4" fill="#FFFFFF" />
    <circle cx="25.5" cy="19" r="2.4" fill="#FFFFFF" />
    <circle cx="14.5" cy="19" r="1.2" fill="#0F172A" />
    <circle cx="25.5" cy="19" r="1.2" fill="#0F172A" />
    <path d="M15 24.5C16.8 27 23.2 27 25 24.5" stroke="#083344" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="11.5" cy="22" r="2" fill="#FB7185" opacity="0.6" />
    <circle cx="28.5" cy="22" r="2" fill="#FB7185" opacity="0.6" />
  </svg>
);

export const DrawingStudioModal: React.FC<DrawingStudioModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paperContainerRef = useRef<HTMLDivElement | null>(null);

  // Studio States
  const [currentTool, setCurrentTool] = useState<ToolType>('pencil');
  const [currentStamp, setCurrentStamp] = useState<StampType>('cincau');
  const [currentColor, setCurrentColor] = useState<string>('#EF4444');
  const [currentSize, setCurrentSize] = useState<number>(14);
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('turtle');
  const [tipIndex, setTipIndex] = useState<number>(0);

  // Toast Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const historyStepRef = useRef<number>(-1);

  useEffect(() => {
    historyStepRef.current = historyStep;
  }, [historyStep]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  }, []);

  // Drawing pointer refs
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Save Canvas State into Undo/Redo Stack
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const step = historyStepRef.current;

    setHistoryStack((prev) => {
      const sliced = prev.slice(0, step + 1);
      if (sliced.length >= 20) sliced.shift();
      return [...sliced, snapshot];
    });
    setHistoryStep((prev) => Math.min(prev + 1, 19));
  }, []);

  // Helper: Clear canvas to warm white paper
  const clearCanvasSurface = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, []);

  // Draw Template Outlines (Blank, Penyu Lucu, Ayam Manis, Beruang Madu)
  const renderTemplateOnCanvas = useCallback(
    (template: TemplateType, shouldSave = true) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      clearCanvasSurface(ctx, canvas);

      if (template !== 'blank') {
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) / 480;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.lineWidth = Math.max(3, 4 * scale);
        ctx.strokeStyle = '#23252a';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#FFFFFF';

        if (template === 'turtle') {
          // Back flippers
          ctx.beginPath();
          ctx.ellipse(cx - 95 * scale, cy + 90 * scale, 35 * scale, 22 * scale, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(cx + 95 * scale, cy + 90 * scale, 35 * scale, 22 * scale, 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Front flippers
          ctx.beginPath();
          ctx.ellipse(cx - 130 * scale, cy - 25 * scale, 55 * scale, 28 * scale, -0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(cx + 130 * scale, cy - 25 * scale, 55 * scale, 28 * scale, 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Turtle Head
          ctx.beginPath();
          ctx.arc(cx, cy - 125 * scale, 58 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Sprout / leaf on head
          ctx.beginPath();
          ctx.ellipse(cx - 10 * scale, cy - 185 * scale, 12 * scale, 22 * scale, -0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(cx + 10 * scale, cy - 185 * scale, 12 * scale, 22 * scale, 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Eyes
          ctx.beginPath();
          ctx.arc(cx - 24 * scale, cy - 130 * scale, 12 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 24 * scale, cy - 130 * scale, 12 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Pupils
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(cx - 22 * scale, cy - 130 * scale, 7 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 26 * scale, cy - 130 * scale, 7 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Catchlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx - 24 * scale, cy - 133 * scale, 2.5 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 24 * scale, cy - 133 * scale, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Sweet smile
          ctx.beginPath();
          ctx.arc(cx, cy - 110 * scale, 18 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();

          // Big Turtle Shell
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(cx, cy + 20 * scale, 118 * scale, 105 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Shell Rim
          ctx.beginPath();
          ctx.ellipse(cx, cy + 20 * scale, 100 * scale, 88 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Hexagonal Shell Plates
          const drawHex = (hx: number, hy: number, r: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = ((i * 60 - 30) * Math.PI) / 180;
              const x = hx + r * Math.cos(a);
              const y = hy + r * Math.sin(a);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
          };
          drawHex(cx, cy + 18 * scale, 34 * scale);
          drawHex(cx, cy - 35 * scale, 28 * scale);
          drawHex(cx, cy + 70 * scale, 28 * scale);
          drawHex(cx - 52 * scale, cy + 18 * scale, 26 * scale);
          drawHex(cx + 52 * scale, cy + 18 * scale, 26 * scale);

          // Water Bubbles
          ctx.beginPath();
          ctx.arc(cx - 150 * scale, cy - 100 * scale, 14 * scale, 0, Math.PI * 2);
          ctx.moveTo(cx - 157 * scale, cy - 135 * scale);
          ctx.arc(cx - 165 * scale, cy - 135 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.moveTo(cx + 171 * scale, cy - 90 * scale);
          ctx.arc(cx + 155 * scale, cy - 90 * scale, 16 * scale, 0, Math.PI * 2);
          ctx.moveTo(cx + 184 * scale, cy - 125 * scale);
          ctx.arc(cx + 175 * scale, cy - 125 * scale, 9 * scale, 0, Math.PI * 2);
          ctx.stroke();
        } else if (template === 'chick') {
          // Feet
          ctx.beginPath();
          ctx.moveTo(cx - 30 * scale, cy + 110 * scale);
          ctx.lineTo(cx - 30 * scale, cy + 145 * scale);
          ctx.moveTo(cx - 45 * scale, cy + 145 * scale);
          ctx.lineTo(cx - 15 * scale, cy + 145 * scale);
          ctx.moveTo(cx + 30 * scale, cy + 110 * scale);
          ctx.lineTo(cx + 30 * scale, cy + 145 * scale);
          ctx.moveTo(cx + 15 * scale, cy + 145 * scale);
          ctx.lineTo(cx + 45 * scale, cy + 145 * scale);
          ctx.stroke();

          // Round body
          ctx.beginPath();
          ctx.arc(cx, cy + 15 * scale, 105 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Wings
          ctx.beginPath();
          ctx.ellipse(cx - 75 * scale, cy + 20 * scale, 22 * scale, 48 * scale, 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(cx + 75 * scale, cy + 20 * scale, 22 * scale, 48 * scale, -0.3, 0, Math.PI * 2);
          ctx.stroke();

          // Comb / crown
          ctx.beginPath();
          ctx.arc(cx - 20 * scale, cy - 90 * scale, 16 * scale, Math.PI, 0);
          ctx.arc(cx, cy - 98 * scale, 20 * scale, Math.PI, 0);
          ctx.arc(cx + 20 * scale, cy - 90 * scale, 16 * scale, Math.PI, 0);
          ctx.stroke();

          // Eyes
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(cx - 35 * scale, cy - 10 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 35 * scale, cy - 10 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Beak
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(cx - 18 * scale, cy + 5 * scale);
          ctx.lineTo(cx + 18 * scale, cy + 5 * scale);
          ctx.lineTo(cx, cy + 28 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (template === 'bear') {
          // Body
          ctx.beginPath();
          ctx.arc(cx, cy + 60 * scale, 95 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Belly patch
          ctx.beginPath();
          ctx.arc(cx, cy + 75 * scale, 55 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Ears
          ctx.beginPath();
          ctx.arc(cx - 62 * scale, cy - 105 * scale, 28 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx + 62 * scale, cy - 105 * scale, 28 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Inner ears
          ctx.beginPath();
          ctx.arc(cx - 62 * scale, cy - 105 * scale, 15 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx + 62 * scale, cy - 105 * scale, 15 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Head
          ctx.beginPath();
          ctx.arc(cx, cy - 45 * scale, 75 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Muzzle
          ctx.beginPath();
          ctx.ellipse(cx, cy - 30 * scale, 32 * scale, 24 * scale, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Nose
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.ellipse(cx, cy - 38 * scale, 10 * scale, 7 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Mouth
          ctx.beginPath();
          ctx.moveTo(cx, cy - 31 * scale);
          ctx.lineTo(cx, cy - 20 * scale);
          ctx.arc(cx - 9 * scale, cy - 20 * scale, 9 * scale, 0, 0.8 * Math.PI);
          ctx.moveTo(cx, cy - 20 * scale);
          ctx.arc(cx + 9 * scale, cy - 20 * scale, 9 * scale, Math.PI, 0.2 * Math.PI, true);
          ctx.stroke();

          // Eyes
          ctx.beginPath();
          ctx.arc(cx - 28 * scale, cy - 56 * scale, 6 * scale, 0, Math.PI * 2);
          ctx.arc(cx + 28 * scale, cy - 56 * scale, 6 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (shouldSave) {
        saveSnapshot();
      }
    },
    [clearCanvasSurface, saveSnapshot]
  );

  // Initialize Canvas Size and Default Turtle Template
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = paperContainerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    clearCanvasSurface(ctx, canvas);
    renderTemplateOnCanvas(activeTemplate, false);

    const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistoryStack([initialSnapshot]);
    setHistoryStep(0);
    historyStepRef.current = 0;
  }, [activeTemplate, clearCanvasSurface, renderTemplateOnCanvas]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        initCanvas();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initCanvas]);

  // Pointer Coordinates in CSS pixels
  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Sparkle Spray Effect
  const renderSparkle = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = currentColor;
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = 8;

    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * (currentSize * 2.2);
      const offsetY = (Math.random() - 0.5) * (currentSize * 2.2);
      const radius = Math.random() * 4 + 2;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Vector Stamp Effect (Cincau, Star, Heart, Rainbow/Flower)
  const renderStamp = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    playPopSound();
    ctx.save();
    ctx.scale(dpr, dpr);

    if (currentStamp === 'cincau') {
      // Cute Cincau Cyan Jelly Mascot Stamp (matches screen.png)
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - 7, y - 4, 3.5, 0, Math.PI * 2);
      ctx.arc(x + 7, y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#082F49';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x, y + 2, 8, 0.12 * Math.PI, 0.88 * Math.PI);
      ctx.stroke();
    } else if (currentStamp === 'star') {
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = ((i * 72 - 90) * Math.PI) / 180;
        const innerAngle = (((i * 72 + 36) - 90) * Math.PI) / 180;
        const ox = x + Math.cos(outerAngle) * 22;
        const oy = y + Math.sin(outerAngle) * 22;
        const ix = x + Math.cos(innerAngle) * 10;
        const iy = y + Math.sin(innerAngle) * 10;
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (currentStamp === 'heart') {
      ctx.fillStyle = '#F43F5E';
      ctx.strokeStyle = '#BE123C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 18);
      ctx.bezierCurveTo(x - 24, y + 2, x - 22, y - 18, x, y - 8);
      ctx.bezierCurveTo(x + 22, y - 18, x + 24, y + 2, x, y + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (currentStamp === 'flower') {
      // Rainbow / Flower Stamp
      const colors = ['#EF4444', '#FACC15', '#84CC16', '#0EA5E9', '#A855F7'];
      colors.forEach((col, idx) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y + 10, 22 - idx * 3.2, Math.PI, 0);
        ctx.stroke();
      });
    }

    ctx.restore();
  };

  // Configure Brush Stroke Context
  const applyBrushContext = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    if (currentTool === 'pencil') {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = currentSize;
      ctx.globalAlpha = 1.0;
    } else if (currentTool === 'brush') {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = currentSize * 1.5;
      ctx.globalAlpha = 0.45;
    } else if (currentTool === 'glow') {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = currentSize;
      ctx.globalAlpha = 0.85;
      ctx.shadowBlur = 12;
      ctx.shadowColor = currentColor;
    } else if (currentTool === 'crayon') {
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = currentSize * 1.25;
      ctx.globalAlpha = 0.72;
      ctx.shadowBlur = 3;
      ctx.shadowColor = currentColor;
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = currentSize * 2.4;
      ctx.globalAlpha = 1.0;
    }
  };

  const handleStartDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return;
    const pos = getPointerPos(e);
    isDrawingRef.current = true;
    lastPosRef.current = pos;

    if (currentTool === 'stamp') {
      renderStamp(pos.x, pos.y);
      saveSnapshot();
      isDrawingRef.current = false;
      return;
    }

    if (currentTool === 'stars') {
      renderSparkle(pos.x, pos.y);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    applyBrushContext(ctx);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, currentSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const pos = getPointerPos(e);

    if (currentTool === 'stamp') return;

    if (currentTool === 'stars') {
      renderSparkle(pos.x, pos.y);
      lastPosRef.current = pos;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    applyBrushContext(ctx);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();

    lastPosRef.current = pos;
  };

  const handleStopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveSnapshot();
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyStep <= 0) return;
    playPopSound();
    const nextStep = historyStep - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(historyStack[nextStep], 0, 0);
    setHistoryStep(nextStep);
    historyStepRef.current = nextStep;
    showToast('Goresan terakhir diurungkan');
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyStep >= historyStack.length - 1) return;
    playPopSound();
    const nextStep = historyStep + 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(historyStack[nextStep], 0, 0);
    setHistoryStep(nextStep);
    historyStepRef.current = nextStep;
    showToast('Goresan dikembalikan');
  };

  // Clear Canvas Handler
  const handleClear = () => {
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    clearCanvasSurface(ctx, canvas);
    setActiveTemplate('blank');
    saveSnapshot();
    showToast('Kanvas telah dibersihkan!');
  };

  // Switch Template
  const handleSelectTemplate = (tmpl: TemplateType, label: string) => {
    playPopSound();
    setActiveTemplate(tmpl);
    renderTemplateOnCanvas(tmpl, true);
    showToast(`Template "${label}" siap diwarnai!`);
  };

  // Save Artwork
  const handleSaveArtwork = () => {
    playCheerSound();
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        recordArtworkSaved(
          `Lukisan Kreatif #${loadChildProgress().savedArtworks.length + 1}`,
          dataUrl,
          30
        );
        const link = document.createElement('a');
        link.download = 'Karya-MerdekaKids-PenaPintar.png';
        link.href = dataUrl;
        link.click();
      } catch {
        // ignore download restriction
      }
    }
    showToast('🌟 Hore! Karyamu berhasil disimpan (+30 XP)!');
  };

  // Active Tool Status Label (top-right of paper, matching screen.png)
  const getActiveToolBadgeText = () => {
    if (currentTool === 'stamp') {
      return `Stempel ${currentStamp === 'cincau' ? 'Budi' : currentStamp}`;
    }
    const labels: Record<ToolType, string> = {
      pencil: 'Pensil Ajaib',
      brush: 'Kuas Halus',
      crayon: 'Krayon Lilin',
      glow: 'Spidol Neon',
      stars: 'Semprot Bintang',
      eraser: 'Penghapus Karet',
      stamp: 'Stempel',
    };
    return `${labels[currentTool]} (${currentSize}px)`;
  };

  if (!isOpen) return null;

  const TOOL_ITEMS: { id: ToolType; label: string; emoji: string }[] = [
    { id: 'pencil', label: 'Pensil Ajaib', emoji: '✏️' },
    { id: 'brush', label: 'Kuas Halus', emoji: '🖌️' },
    { id: 'crayon', label: 'Krayon Lilin', emoji: '🖍️' },
    { id: 'glow', label: 'Spidol Neon', emoji: '🪄' },
    { id: 'stars', label: 'Semprot Bintang', emoji: '✨' },
    { id: 'eraser', label: 'Penghapus Karet', emoji: '🧼' },
  ];

  const SIZE_ITEMS = [
    { size: 5, label: 'Biji', dotClass: 'w-2.5 h-2.5' },
    { size: 14, label: 'Apel', dotClass: 'w-4 h-4' },
    { size: 26, label: 'Semangka', dotClass: 'w-5 h-5' },
  ];

  const TEMPLATES: { id: TemplateType; label: string; emoji: string }[] = [
    { id: 'blank', label: 'Kanvas Bebas', emoji: '📖' },
    { id: 'turtle', label: 'Penyu Lucu', emoji: '🐢' },
    { id: 'chick', label: 'Ayam Manis', emoji: '🐥' },
    { id: 'bear', label: 'Beruang Madu', emoji: '🧸' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 w-screen h-screen overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 select-none font-sans text-stone-800"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, #e8c499 0%, #d8a873 45%, #be8449 85%, #9e642e 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 80px, rgba(120,60,10,0.06) 80px, rgba(120,60,10,0.06) 82px)',
          boxShadow: 'inset 0 0 100px rgba(90,40,10,0.35)',
        }}
      >
        {/* Playful Cozy Tabletop Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />

        {/* ===================================================================== */}
        {/* TOP APP BAR: Big Chunky Kid-Friendly Action Buttons                   */}
        {/* ===================================================================== */}
        <header
          className="relative z-20 w-full shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl"
          style={{
            background: 'linear-gradient(rgb(252, 237, 216) 0%, rgb(237, 211, 178) 100%)',
            border: '3px solid rgb(183, 130, 75)',
            boxShadow:
              'rgba(88, 43, 11, 0.35) 0px 10px 25px -5px, rgba(255, 255, 255, 0.8) 0px 2px 4px inset, rgba(120, 60, 10, 0.15) 0px -3px 6px inset',
          }}
        >
          {/* Left: Kembali Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                onClose();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-sm sm:text-base active:scale-95 transition-all cursor-pointer group"
              style={{
                background: 'linear-gradient(rgb(255, 249, 240) 0%, rgb(250, 232, 208) 100%)',
                border: '2px solid rgb(200, 149, 88)',
                color: 'rgb(92, 53, 16)',
                boxShadow:
                  'rgba(100, 50, 15, 0.15) 0px 4px 10px, rgba(255, 255, 255, 0.9) 0px 1px 2px inset',
              }}
              title="Kembali ke Beranda"
            >
              <Home className="w-5 h-5 text-[#65a30d] group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-extrabold">Kembali</span>
            </button>
          </div>

          {/* Center: Storybook Templates Pills */}
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-2xl overflow-x-auto no-scrollbar"
            style={{
              background: 'rgb(222, 181, 133)',
              border: '2px solid rgb(179, 126, 70)',
              boxShadow: 'rgba(80, 40, 10, 0.28) 0px 3px 6px inset',
            }}
          >
            {TEMPLATES.map((tmpl) => {
              const isSelected = activeTemplate === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id, tmpl.label)}
                  className="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold active:scale-95 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(rgb(116, 168, 25) 0%, rgb(87, 133, 14) 100%)',
                          color: '#ffffff',
                          border: '1.5px solid rgb(67, 105, 6)',
                          boxShadow: 'rgba(60, 95, 10, 0.3) 0px 3px 6px',
                        }
                      : {
                          background: 'rgba(255, 250, 242, 0.65)',
                          color: 'rgb(90, 52, 17)',
                          border: '1px solid rgba(160, 100, 40, 0.25)',
                        }
                  }
                >
                  <span>{tmpl.emoji}</span>
                  <span>{tmpl.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Chunky Undo, Redo, Clear & Big Sparkle Save */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              title="Batal (Urungkan)"
              className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-all cursor-pointer disabled:opacity-45"
              style={{
                background: 'linear-gradient(rgb(255, 253, 248) 0%, rgb(250, 232, 206) 100%)',
                border: '2px solid rgb(202, 160, 109)',
                color: 'rgb(84, 49, 16)',
                boxShadow: 'rgba(90, 45, 10, 0.15) 0px 4px 8px',
              }}
            >
              <Undo2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              disabled={historyStep >= historyStack.length - 1}
              title="Ulangi (Redo)"
              className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-all cursor-pointer disabled:opacity-45"
              style={{
                background: 'linear-gradient(rgb(255, 253, 248) 0%, rgb(250, 232, 206) 100%)',
                border: '2px solid rgb(202, 160, 109)',
                color: 'rgb(84, 49, 16)',
                boxShadow: 'rgba(90, 45, 10, 0.15) 0px 4px 8px',
              }}
            >
              <Redo2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              title="Hapus Bersih"
              className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(rgb(255, 244, 240) 0%, rgb(254, 223, 215) 100%)',
                border: '2px solid rgb(226, 155, 140)',
                color: 'rgb(180, 35, 24)',
                boxShadow: 'rgba(140, 40, 20, 0.15) 0px 4px 8px',
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleSaveArtwork}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-sm sm:text-base hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(rgb(245, 158, 11) 0%, rgb(217, 119, 6) 100%)',
                border: '2px solid rgb(180, 83, 9)',
                color: '#ffffff',
                boxShadow:
                  'rgba(180, 83, 9, 0.4) 0px 6px 14px, rgba(255, 255, 255, 0.4) 0px 1px 2px inset',
              }}
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Simpan Karya 🌟</span>
            </button>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* MAIN WORKSPACE: 12-Column Tactile Drawing Easel & Tool Stations       */}
        {/* ===================================================================== */}
        <div className="relative z-10 w-full flex-1 min-h-0 grid grid-cols-12 gap-3 md:gap-4 items-stretch mt-2.5 sm:mt-3">
          {/* LEFT DOCK: Chunky Stationery Tools, Nib Sizing & Stamps */}
          <div className="col-span-3 lg:col-span-2 flex flex-col justify-between gap-2.5 min-h-0">
            {/* 1. Peralatan Menggambar Card */}
            <div
              className="p-2.5 rounded-2xl flex flex-col gap-1.5 flex-1 min-h-0 justify-between"
              style={{
                background: 'linear-gradient(rgb(247, 230, 206) 0%, rgb(235, 211, 181) 100%)',
                border: '3px solid rgb(184, 134, 83)',
                boxShadow:
                  'rgba(80, 40, 10, 0.3) 0px 12px 24px -6px, rgba(255, 255, 255, 0.8) 0px 2px 4px inset',
              }}
            >
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-xs">🎨</span>
                <span
                  className="font-extrabold text-[10px] uppercase tracking-wider leading-tight"
                  style={{ color: 'rgb(140, 74, 18)' }}
                >
                  Peralatan Menggambar
                </span>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 justify-evenly min-h-0">
                {TOOL_ITEMS.map((tool) => {
                  const isActive = currentTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setCurrentTool(tool.id);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl font-bold transition-all active:scale-95 text-left cursor-pointer min-h-0"
                      style={
                        isActive
                          ? {
                              background:
                                'linear-gradient(rgb(116, 168, 25) 0%, rgb(87, 133, 14) 100%)',
                              color: '#ffffff',
                              border: '2px solid rgb(63, 101, 5)',
                              boxShadow: 'rgba(70, 110, 10, 0.35) 0px 4px 10px',
                            }
                          : {
                              background: 'rgb(255, 248, 239)',
                              color: 'rgb(83, 48, 15)',
                              border: '1.5px solid rgb(212, 173, 125)',
                              boxShadow: 'rgba(90, 45, 10, 0.08) 0px 2px 5px',
                            }
                      }
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-black/20' : 'bg-[#292a2d]'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{tool.emoji}</span>
                      </div>
                      <span className="text-[11px] xl:text-xs font-extrabold leading-tight line-clamp-2">
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Ukuran Goresan Card */}
            <div
              className="p-2.5 rounded-2xl flex flex-col gap-1.5 shrink-0"
              style={{
                background: 'linear-gradient(rgb(247, 230, 206) 0%, rgb(235, 211, 181) 100%)',
                border: '3px solid rgb(184, 134, 83)',
                boxShadow:
                  'rgba(80, 40, 10, 0.3) 0px 12px 24px -6px, rgba(255, 255, 255, 0.8) 0px 2px 4px inset',
              }}
            >
              <div className="flex items-center justify-between px-0.5">
                <span
                  className="font-extrabold text-[10px] uppercase tracking-wider leading-tight"
                  style={{ color: 'rgb(123, 67, 18)' }}
                >
                  Ukuran Goresan
                </span>
                <span className="text-[11px] font-extrabold" style={{ color: 'rgb(180, 83, 9)' }}>
                  Tebal-Tipis
                </span>
              </div>

              <div
                className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl"
                style={{
                  background: 'rgb(222, 181, 133)',
                  border: '2px solid rgb(179, 126, 70)',
                  boxShadow: 'rgba(80, 40, 10, 0.25) 0px 2px 5px inset',
                }}
              >
                {SIZE_ITEMS.map((item) => {
                  const isSelected = currentSize === item.size;
                  return (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setCurrentSize(item.size);
                      }}
                      className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 cursor-pointer overflow-hidden"
                      style={
                        isSelected
                          ? {
                              background:
                                'linear-gradient(rgb(116, 168, 25) 0%, rgb(87, 133, 14) 100%)',
                              color: '#ffffff',
                              border: '1.5px solid rgb(63, 101, 5)',
                              boxShadow: 'rgba(60, 95, 10, 0.3) 0px 3px 6px',
                            }
                          : {
                              background: 'rgba(255, 250, 242, 0.65)',
                              color: 'rgb(83, 48, 15)',
                              border: '1px solid rgba(160, 100, 40, 0.2)',
                            }
                      }
                    >
                      <div className={`${item.dotClass} rounded-full bg-current mb-1 shrink-0`} />
                      <span className="text-[9px] xl:text-[10px] font-extrabold whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Tactile Sticker Stamps Pill Picker */}
            <div
              className="p-2 rounded-2xl flex items-center justify-around gap-1 shrink-0"
              style={{
                background: 'linear-gradient(rgb(247, 230, 206) 0%, rgb(235, 211, 181) 100%)',
                border: '3px solid rgb(184, 134, 83)',
                boxShadow:
                  'rgba(80, 40, 10, 0.3) 0px 12px 24px -6px, rgba(255, 255, 255, 0.8) 0px 2px 4px inset',
              }}
            >
              {(
                [
                  { id: 'cincau' as const, title: 'Stempel Budi', render: <CincauStampIcon className="w-6 h-6" /> },
                  { id: 'star' as const, title: 'Stempel Bintang', render: <span className="text-lg">⭐</span> },
                  { id: 'heart' as const, title: 'Stempel Hati', render: <span className="text-lg">💖</span> },
                  { id: 'flower' as const, title: 'Stempel Pelangi', render: <span className="text-lg">🌈</span> },
                ]
              ).map((st) => {
                const isSelected = currentTool === 'stamp' && currentStamp === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setCurrentTool('stamp');
                      setCurrentStamp(st.id);
                    }}
                    title={st.title}
                    className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                      isSelected ? 'ring-2 ring-[#65a30d] scale-105' : ''
                    }`}
                    style={{
                      background: 'rgb(255, 248, 237)',
                      border: '1.5px solid rgb(204, 162, 112)',
                      boxShadow: 'rgba(90, 45, 10, 0.12) 0px 2px 5px',
                    }}
                  >
                    {st.render}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTER: Tactile Storybook / Drawing Pad Easel with Top Spiral Ring Binder */}
          <div className="col-span-6 lg:col-span-8 flex flex-col items-center justify-center min-h-0 h-full">
            <div
              className="relative w-full h-full p-3 sm:p-5 rounded-[2.2rem] flex flex-col justify-between"
              style={{
                background:
                  'linear-gradient(135deg, rgb(124, 70, 29) 0%, rgb(93, 50, 16) 50%, rgb(71, 36, 10) 100%)',
                border: '6px solid rgb(153, 92, 43)',
                boxShadow:
                  'rgba(50, 20, 5, 0.65) 0px 24px 50px -10px, rgba(255, 220, 180, 0.25) 0px 3px 6px inset, rgba(0, 0, 0, 0.4) 0px -4px 8px inset',
              }}
            >
              {/* 7 Realistic Sketchbook Spiral Binder Rings on Top */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-7 z-30 pointer-events-none">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-4 sm:w-5 h-7 sm:h-8 bg-gradient-to-b from-stone-300 via-stone-100 to-stone-400 rounded-full shadow-lg border border-stone-500 -rotate-6"
                  />
                ))}
              </div>

              {/* Watercolor Drawing Paper Surface Canvas */}
              <div
                ref={paperContainerRef}
                className="relative w-full flex-1 min-h-0 bg-[#fffdfa] rounded-3xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.06),0_10px_30px_rgba(0,0,0,0.3)] border-2 border-stone-200 overflow-hidden"
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleStartDrawing}
                  onMouseMove={handleDrawMove}
                  onMouseUp={handleStopDrawing}
                  onMouseLeave={handleStopDrawing}
                  onTouchStart={handleStartDrawing}
                  onTouchMove={handleDrawMove}
                  onTouchEnd={handleStopDrawing}
                  className="w-full h-full rounded-2xl cursor-crosshair touch-none bg-[#fffdfa] block"
                />

                {/* Top-Right Floating Active Stroke Badge */}
                <div className="absolute top-3.5 right-4 pointer-events-none flex items-center gap-2 bg-[#1b1b1f]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-md">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs shrink-0"
                    style={{ backgroundColor: currentColor }}
                  />
                  <span className="text-xs font-bold text-[#e3e2e6]">
                    {getActiveToolBadgeText()}
                  </span>
                </div>

                {/* Bottom-Right Paper Corner Decal */}
                <div className="absolute bottom-2.5 right-4 pointer-events-none flex items-center gap-1.5 opacity-60 text-stone-500 text-[11px] font-bold">
                  <span>🎨 MerdekaKids Buku Gambar A4</span>
                </div>
              </div>

              {/* Wooden Desk Bottom Ruler / Indicator Strip */}
              <div
                className="w-full flex items-center justify-between pt-2.5 px-2 text-[11px] sm:text-xs font-bold shrink-0"
                style={{ color: 'rgb(255, 238, 211)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ccff80] animate-ping" />
                  <span>Kuas Siap Berkreasi! Tekan &amp; Tarik di Kertas</span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span>Kertas Gambar Tekstur Halus</span>
                  <span className="text-[#fccd24]">✨ Kurikulum Merdeka Fase B</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT DOCK: Candy Paint Blob Palette Rack & Tips Seru Cincau */}
          <div className="col-span-3 lg:col-span-2 flex flex-col justify-between gap-2.5 min-h-0">
            {/* 1. Cat Warna Ceria Rack */}
            <div
              className="p-2.5 rounded-2xl flex flex-col gap-2 flex-1 min-h-0 justify-between"
              style={{
                background: 'linear-gradient(180deg, #f7e6ce 0%, #ebd3b5 100%)',
                border: '3px solid #b88653',
                boxShadow:
                  '0 12px 24px -6px rgba(80,40,10,0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
              }}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🍬</span>
                  <span
                    className="font-extrabold text-[10px] uppercase tracking-wider leading-tight"
                    style={{ color: '#8c4a12' }}
                  >
                    Cat Warna Ceria
                  </span>
                </div>
                <Palette className="w-4 h-4 text-[#b45309] shrink-0" />
              </div>

              {/* 10 Candy Paint Swatches (2 Columns x 5 Rows) */}
              <div className="grid grid-cols-2 gap-2 p-0.5 flex-1 min-h-0">
                {PALETTE_SWATCHES.map((swatch) => {
                  const isSelected = currentColor.toUpperCase() === swatch.hex.toUpperCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setCurrentColor(swatch.hex);
                        if (currentTool === 'eraser') {
                          setCurrentTool('pencil');
                        }
                      }}
                      title={swatch.name}
                      style={{ backgroundColor: swatch.hex }}
                      className={`w-full h-full min-h-[34px] rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-103 active:scale-92 cursor-pointer border-2 ${
                        isSelected
                          ? 'ring-3 ring-[#a3e635] border-white/80'
                          : 'border-white/40'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className="w-4 h-4 stroke-[3.5]"
                          style={{ color: 'rgb(180, 83, 9)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Rainbow Color Picker */}
              <div className="pt-1.5 border-t border-[#424936]/15 shrink-0">
                <label
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all active:scale-95 relative"
                  style={{
                    background: 'linear-gradient(rgb(255, 252, 246) 0%, rgb(250, 236, 215) 100%)',
                    border: '2px solid rgb(207, 163, 109)',
                    color: 'rgb(83, 48, 15)',
                    boxShadow: 'rgba(90, 45, 10, 0.12) 0px 3px 6px',
                  }}
                >
                  <span className="text-sm">🌈</span>
                  <span className="whitespace-nowrap">Pilih Warna Pelangi</span>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => {
                      setCurrentColor(e.target.value);
                      if (currentTool === 'eraser') {
                        setCurrentTool('pencil');
                      }
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* 2. Interactive Mascot Tip Bubble Card */}
            <button
              type="button"
              onClick={() => {
                playPopSound();
                const nextIdx = (tipIndex + 1) % CREATIVE_TIPS.length;
                setTipIndex(nextIdx);
                showToast(`💡 Tips Budi: ${CREATIVE_TIPS[nextIdx]}`);
              }}
              className="p-2.5 rounded-2xl flex items-center gap-2.5 text-left cursor-pointer active:scale-95 transition-transform shrink-0"
              style={{
                background: 'linear-gradient(180deg, #f7e6ce 0%, #ebd3b5 100%)',
                border: '3px solid #b88653',
                boxShadow:
                  '0 10px 20px -5px rgba(80,40,10,0.25), inset 0 2px 4px rgba(255,255,255,0.8)',
              }}
            >
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgb(255, 245, 228)',
                  border: '2px solid rgb(223, 179, 124)',
                }}
              >
                <span className="text-lg">💡</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className="text-[10px] uppercase tracking-wide font-extrabold"
                  style={{ color: '#934c0e' }}
                >
                  Tips Seru Budi
                </span>
                <span
                  className="text-[11px] font-bold leading-snug line-clamp-2"
                  style={{ color: 'rgb(74, 38, 8)' }}
                >
                  {CREATIVE_TIPS[tipIndex]}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Toast Notification Pill */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full font-extrabold text-xs sm:text-sm shadow-xl pointer-events-none flex items-center gap-2"
              style={{
                background: 'linear-gradient(rgb(252, 237, 216) 0%, rgb(237, 211, 178) 100%)',
                border: '2px solid rgb(183, 130, 75)',
                color: 'rgb(84, 49, 16)',
              }}
            >
              <span>✨</span>
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
