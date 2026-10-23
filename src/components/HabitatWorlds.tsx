import React from 'react';
import { SkyThemeId } from '../types';

export interface HabitatWorldsProps {
  skyTheme?: SkyThemeId;
}

const STAR_POSITIONS = [
  { top: '7%', left: '12%', size: 3.5, delay: '0s', duration: '2.4s' },
  { top: '11%', left: '26%', size: 2.5, delay: '0.6s', duration: '3.1s' },
  { top: '6%', left: '42%', size: 4.0, delay: '1.1s', duration: '2.7s' },
  { top: '15%', left: '54%', size: 2.5, delay: '0.3s', duration: '3.4s' },
  { top: '8%', left: '68%', size: 3.5, delay: '1.5s', duration: '2.6s' },
  { top: '13%', left: '83%', size: 3.0, delay: '0.8s', duration: '2.9s' },
  { top: '20%', left: '18%', size: 2.5, delay: '1.2s', duration: '3.2s' },
  { top: '22%', left: '36%', size: 3.0, delay: '0.4s', duration: '2.5s' },
  { top: '19%', left: '74%', size: 2.5, delay: '1.8s', duration: '3.0s' },
  { top: '26%', left: '62%', size: 3.5, delay: '0.9s', duration: '2.8s' },
  { top: '16%', left: '91%', size: 2.5, delay: '0.2s', duration: '3.3s' },
  { top: '28%', left: '10%', size: 3.0, delay: '1.4s', duration: '2.6s' },
];

const FIREFLY_POSITIONS = [
  { bottom: '18%', left: '16%', delay: '0s', duration: '3.8s' },
  { bottom: '24%', left: '28%', delay: '0.9s', duration: '4.3s' },
  { bottom: '14%', left: '38%', delay: '1.6s', duration: '3.5s' },
  { bottom: '28%', left: '48%', delay: '0.4s', duration: '4.1s' },
  { bottom: '20%', left: '61%', delay: '1.2s', duration: '3.9s' },
  { bottom: '15%', left: '73%', delay: '2.0s', duration: '4.4s' },
  { bottom: '26%', left: '84%', delay: '0.7s', duration: '3.7s' },
  { bottom: '32%', left: '22%', delay: '1.5s', duration: '4.2s' },
];

export const HabitatWorlds: React.FC<HabitatWorldsProps> = ({
  skyTheme = 'sunset',
}) => {
  const isMorning = skyTheme === 'morning';
  const isNight = skyTheme === 'night';

  const imageFilterClass = isMorning
    ? 'brightness-[1.12] saturate-[1.22] hue-rotate-[18deg] contrast-[1.03]'
    : isNight
      ? 'brightness-[0.58] saturate-[0.88] hue-rotate-[-32deg] contrast-[1.12]'
      : 'brightness-100 saturate-100';

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#1e1b2e]">
      <img
        src="/assets/aistudio/Gemini_Generated_Image_iujeuuiujeuuiuje__1__e36bd8b8.jpeg"
        alt="Pemandangan Bukit Senja CeriaKids"
        className={`w-full h-full object-cover pointer-events-none select-none transition-all duration-700 ease-out ${imageFilterClass}`}
      />

      {/* ☀️ Pagi Cerah: Langit biru cerah, awan putih bersih, cahaya matahari pagi hangat, rumput hijau segar */}
      {isMorning && (
        <div className="absolute inset-0 transition-opacity duration-700">
          <div
            className="absolute inset-x-0 top-0 h-[68%]"
            style={{
              background:
                'linear-gradient(180deg, rgba(14,165,233,0.92) 0%, rgba(56,189,248,0.82) 38%, rgba(186,230,253,0.55) 72%, rgba(254,249,195,0.0) 100%)',
            }}
          />
          <div
            className="absolute -top-12 left-[8%] w-56 h-56 rounded-full opacity-90"
            style={{
              background:
                'radial-gradient(circle, rgba(254,240,138,0.95) 0%, rgba(253,224,71,0.45) 42%, rgba(254,240,138,0) 75%)',
            }}
          />
          <div className="absolute top-[10%] left-[18%] w-36 h-12 bg-white/85 rounded-full blur-[1px] shadow-sm flex items-center justify-around">
            <div className="w-16 h-16 bg-white/90 rounded-full -mt-6" />
            <div className="w-12 h-12 bg-white/90 rounded-full -mt-4" />
          </div>
          <div className="absolute top-[14%] right-[22%] w-44 h-12 bg-white/80 rounded-full blur-[1px] shadow-sm flex items-center justify-around">
            <div className="w-14 h-14 bg-white/90 rounded-full -mt-5" />
            <div className="w-20 h-20 bg-white/95 rounded-full -mt-8" />
            <div className="w-12 h-12 bg-white/85 rounded-full -mt-4" />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-[44%] mix-blend-overlay"
            style={{
              background:
                'linear-gradient(0deg, rgba(34,197,94,0.42) 0%, rgba(132,204,22,0.32) 55%, rgba(254,240,138,0.0) 100%)',
            }}
          />
        </div>
      )}

      {/* 🌌 Malam Bintang: Langit malam biru tua bertabur bintang berkilau & kunang-kunang emas */}
      {isNight && (
        <div className="absolute inset-0 transition-opacity duration-700">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(9,13,38,0.92) 0%, rgba(20,30,70,0.82) 38%, rgba(30,41,91,0.52) 68%, rgba(15,23,42,0.38) 100%)',
            }}
          />
          <div
            className="absolute top-[8%] right-[28%] w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle, rgba(254,249,195,0.35) 0%, rgba(199,210,254,0.12) 55%, transparent 75%)',
            }}
          >
            <div className="w-11 h-11 rounded-full bg-amber-100 shadow-[0_0_24px_rgba(254,240,138,0.85)] relative overflow-hidden">
              <div className="absolute -top-1.5 -left-2 w-9 h-9 rounded-full bg-[#121A42]/90" />
            </div>
          </div>

          {STAR_POSITIONS.map((star, idx) => (
            <span
              key={`star-${idx}`}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
                animationDuration: star.duration,
                boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.85)',
              }}
            />
          ))}

          {FIREFLY_POSITIONS.map((fly, idx) => (
            <span
              key={`firefly-${idx}`}
              className="absolute w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce"
              style={{
                bottom: fly.bottom,
                left: fly.left,
                animationDelay: fly.delay,
                animationDuration: fly.duration,
                boxShadow: '0 0 12px 4px rgba(251, 191, 36, 0.9)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
