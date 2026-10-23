import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playCheerSound } from '../utils/audioEffects';

export interface ConfettiParticle {
  id: string;
  x: number; // initial x offset %
  y: number; // initial y offset px
  targetX: number;
  targetY: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'star' | 'heart' | 'paw' | 'ribbon' | 'sparkle';
  delay: number;
  duration: number;
}

const PASTEL_COLORS = [
  '#f43f5e', // rose
  '#ec4899', // pink
  '#a855f7', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#fbbf24', // yellow
  '#14b8a6', // teal
  '#ff70a6', // bright pink
  '#ffd670', // soft yellow
  '#70d6ff', // sky blue
];

const SHAPES: ConfettiParticle['shape'][] = [
  'circle',
  'square',
  'star',
  'heart',
  'paw',
  'ribbon',
  'sparkle',
];

interface PlayfulConfettiProps {
  isActive?: boolean;
  count?: number;
  playSound?: boolean;
  onComplete?: () => void;
}

export const PlayfulConfetti: React.FC<PlayfulConfettiProps> = ({
  isActive = true,
  count = 45,
  playSound = true,
  onComplete,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    if (playSound) {
      playCheerSound();
    }

    // Generate random particles
    const newParticles: ConfettiParticle[] = Array.from({ length: count }).map((_, i) => {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
      const startX = 20 + Math.random() * 60; // center-ish start (20% to 80%)
      const targetX = (Math.random() - 0.5) * 320; // spread -160px to +160px
      const burstUpY = -(120 + Math.random() * 180); // burst upwards
      const targetY = 250 + Math.random() * 300; // fall down past container

      return {
        id: `particle-${Date.now()}-${i}-${Math.random()}`,
        x: startX,
        y: 0,
        targetX,
        targetY: targetY + Math.abs(burstUpY),
        rotation: (Math.random() - 0.5) * 1080,
        scale: 0.6 + Math.random() * 0.9,
        color,
        shape,
        delay: Math.random() * 0.35,
        duration: 2.2 + Math.random() * 1.3,
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3800);

    return () => clearTimeout(timer);
  }, [isActive, count, playSound, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.x}%`,
              top: '40%',
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              x: [0, p.targetX * 0.5, p.targetX],
              y: [0, -(100 + Math.random() * 100), p.targetY],
              rotate: p.rotation,
              scale: [0, p.scale, p.scale * 0.8],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.3, 1],
            }}
            style={{ position: 'absolute' }}
          >
            {p.shape === 'paw' && <span className="text-xl select-none filter drop-shadow-xs">🐾</span>}
            {p.shape === 'star' && <span className="text-xl select-none filter drop-shadow-xs">⭐</span>}
            {p.shape === 'heart' && <span className="text-xl select-none filter drop-shadow-xs">💖</span>}
            {p.shape === 'sparkle' && <span className="text-xl select-none filter drop-shadow-xs">✨</span>}
            {p.shape === 'circle' && (
              <div
                className="w-3.5 h-3.5 rounded-full shadow-xs"
                style={{ backgroundColor: p.color }}
              />
            )}
            {p.shape === 'square' && (
              <div
                className="w-3.5 h-3.5 rounded-xs shadow-xs"
                style={{ backgroundColor: p.color }}
              />
            )}
            {p.shape === 'ribbon' && (
              <div
                className="w-1.5 h-5 rounded-full shadow-xs"
                style={{ backgroundColor: p.color }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
