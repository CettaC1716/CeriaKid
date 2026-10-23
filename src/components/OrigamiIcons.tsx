import React, { useId } from 'react';

export interface OrigamiIconProps {
  className?: string;
}

/**
 * Shared SVG <defs> providing soft paper-origami fold shadows and subtle paper sheen gradients.
 */
const OrigamiDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={`${id}-fold`} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.18" />
    </filter>
    <linearGradient id={`${id}-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
      <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
    </linearGradient>
  </defs>
);

const PAPER_FILTER_STYLE: React.CSSProperties = {
  filter: 'drop-shadow(0 2px 3px rgba(15, 23, 42, 0.16)) drop-shadow(0 1px 1px rgba(15, 23, 42, 0.1))',
};

/**
 * 1. CORE NAVIGATION & HABIT ORIGAMI ICONS
 */

export const OrigamiMoodProfileIcon: React.FC<OrigamiIconProps & { gender?: 'boy' | 'girl' }> = ({
  className = 'w-7 h-7',
  gender = 'boy',
}) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      {/* Layered Paper Collar / Shoulder Folds */}
      <path d="M10 36 L24 28 L16 42 Z" fill="#F43F5E" filter={`url(#${uid}-fold)`} />
      <path d="M38 36 L24 28 L32 42 Z" fill="#E11D48" filter={`url(#${uid}-fold)`} />
      <path d="M16 42 L24 28 L32 42 Z" fill="#FB7185" />

      {/* Layered Origami Face Left & Right Planes */}
      <path d="M24 10 L11 20 L15 34 L24 37 Z" fill="#FFE4E6" filter={`url(#${uid}-fold)`} />
      <path d="M24 10 L37 20 L33 34 L24 37 Z" fill="#FECDD3" />

      {/* Soft Cheek Fold Facets */}
      <path d="M11 20 L18 26 L15 34 Z" fill="#FDA4AF" opacity="0.8" />
      <path d="M37 20 L30 26 L33 34 Z" fill="#FB7185" opacity="0.7" />

      {/* Origami Paper Hat / Crown Hair */}
      {gender === 'girl' ? (
        <g filter={`url(#${uid}-fold)`}>
          <path d="M24 5 L10 19 L24 16 Z" fill="#EC4899" />
          <path d="M24 5 L38 19 L24 16 Z" fill="#DB2777" />
          <path d="M8 14 L15 12 L12 21 Z" fill="#F472B6" />
          <path d="M40 14 L33 12 L36 21 Z" fill="#BE185D" />
          <path d="M24 7 L21 12 L24 15 L27 12 Z" fill="#FDE047" />
        </g>
      ) : (
        <g filter={`url(#${uid}-fold)`}>
          <path d="M24 5 L11 18 L24 15 Z" fill="#F59E0B" />
          <path d="M24 5 L37 18 L24 15 Z" fill="#D97706" />
          <path d="M11 18 L18 10 L24 15 Z" fill="#FBBF24" />
          <path d="M37 18 L30 10 L24 15 Z" fill="#B45309" />
        </g>
      )}

      {/* Friendly Eyes & Folded Smile */}
      <circle cx="19" cy="24" r="1.8" fill="#1E293B" />
      <circle cx="29" cy="24" r="1.8" fill="#1E293B" />
      <path d="M20 28.5 L24 32 L28 28.5 L24 30 Z" fill="#BE123C" />

      {/* Paper Crease Highlight Lines */}
      <path d="M24 5 L24 37" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1" />
      <path d="M11 20 L24 26 L37 20" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
    </svg>
  );
};

export const OrigamiFruitBasketIcon: React.FC<OrigamiIconProps> = ({ className = 'w-7 h-7' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      {/* Origami Leaf */}
      <path d="M24 7 L31 9 L26 15 Z" fill="#22C55E" />
      <path d="M24 7 L26 15 L21 13 Z" fill="#16A34A" />

      {/* Origami Apple & Banana Facets */}
      <path d="M18 14 L11 21 L15 29 L23 28 L23 16 Z" fill="#FB7185" filter={`url(#${uid}-fold)`} />
      <path d="M23 16 L29 15 L31 23 L23 28 Z" fill="#E11D48" />
      <path d="M28 13 L38 16 L36 27 L26 26 Z" fill="#FACC15" filter={`url(#${uid}-fold)`} />
      <path d="M38 16 L40 24 L33 27 L36 27 Z" fill="#EAB308" />

      {/* Origami Basket Rim */}
      <path d="M7 26 L24 26 L24 31 L9 31 Z" fill="#FBBF24" filter={`url(#${uid}-fold)`} />
      <path d="M24 26 L41 26 L39 31 L24 31 Z" fill="#F59E0B" filter={`url(#${uid}-fold)`} />

      {/* Origami Basket Woven Geometric Facets */}
      <path d="M9 31 L24 31 L18 42 L13 42 Z" fill="#F59E0B" />
      <path d="M24 31 L18 42 L24 42 Z" fill="#D97706" />
      <path d="M24 31 L30 42 L24 42 Z" fill="#B45309" />
      <path d="M24 31 L39 31 L35 42 L30 42 Z" fill="#D97706" />

      {/* Paper Crease Highlights */}
      <path d="M7 26 L41 26" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
      <path d="M24 26 L24 42" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.9" />
      <path d="M18 42 L24 31 L30 42" stroke="#FEF3C7" strokeOpacity="0.55" strokeWidth="0.85" />
    </svg>
  );
};

export const OrigamiHeartIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      {/* Top Left & Right Origami Ear Folds */}
      <path d="M16 9 L8 17 L16 21 L24 15 Z" fill="#FDA4AF" filter={`url(#${uid}-fold)`} />
      <path d="M32 9 L24 15 L32 21 L40 17 Z" fill="#F43F5E" filter={`url(#${uid}-fold)`} />

      {/* Center Faceted Planes */}
      <path d="M8 17 L16 21 L24 25 L12 28 Z" fill="#FB7185" />
      <path d="M16 21 L24 15 L24 25 Z" fill="#F43F5E" />
      <path d="M24 15 L32 21 L24 25 Z" fill="#E11D48" />
      <path d="M40 17 L36 28 L24 25 L32 21 Z" fill="#BE123C" />

      {/* Lower Pointed Tip Facets */}
      <path d="M12 28 L24 25 L24 41 Z" fill="#E11D48" filter={`url(#${uid}-fold)`} />
      <path d="M36 28 L24 25 L24 41 Z" fill="#9F1239" />

      {/* Crease Lines */}
      <path d="M24 15 L24 41" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.95" />
      <path d="M8 17 L24 25 L40 17" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.85" />
    </svg>
  );
};

export const OrigamiHomeIcon: React.FC<OrigamiIconProps> = ({ className = 'w-5 h-5' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      {/* Folded Paper Roof */}
      <path d="M24 6 L6 23 L24 21 Z" fill="#FBBF24" filter={`url(#${uid}-fold)`} />
      <path d="M24 6 L42 23 L24 21 Z" fill="#D97706" filter={`url(#${uid}-fold)`} />
      {/* Folded House Walls */}
      <path d="M11 21 L24 21 L24 41 L11 41 Z" fill="#FEF3C7" />
      <path d="M24 21 L37 21 L37 41 L24 41 Z" fill="#FDE68A" />
      {/* Origami Door */}
      <path d="M20 29 L28 29 L28 41 L20 41 Z" fill="#0284C7" />
      <path d="M20 29 L28 29 L24 35 Z" fill="#38BDF8" />
      <path d="M24 6 L24 41" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiBackArrowIcon: React.FC<OrigamiIconProps> = ({ className = 'w-5 h-5' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M7 24 L25 9 L21 24 Z" fill="#FEF08A" filter={`url(#${uid}-fold)`} />
      <path d="M7 24 L25 39 L21 24 Z" fill="#F59E0B" filter={`url(#${uid}-fold)`} />
      <path d="M21 18 L41 20 L38 24 L21 24 Z" fill="#FACC15" />
      <path d="M21 24 L38 24 L41 28 L21 30 Z" fill="#D97706" />
      <path d="M7 24 L38 24" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiChevronRightIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M16 8 L36 24 L23 24 L12 14 Z" fill="#FBBF24" filter={`url(#${uid}-fold)`} />
      <path d="M16 40 L36 24 L23 24 L12 34 Z" fill="#D97706" />
      <path d="M23 24 L36 24" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
};

export const OrigamiChevronDownIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M8 16 L24 36 L24 23 L14 12 Z" fill="#FDE047" filter={`url(#${uid}-fold)`} />
      <path d="M40 16 L24 36 L24 23 L34 12 Z" fill="#EAB308" />
      <path d="M24 23 L24 36" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
};

export const OrigamiFlameIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M24 4 L11 25 L20 42 L24 36 Z" fill="#FB923C" filter={`url(#${uid}-fold)`} />
      <path d="M24 4 L37 25 L28 42 L24 36 Z" fill="#EA580C" />
      <path d="M24 16 L16 30 L24 42 L32 30 Z" fill="#FACC15" filter={`url(#${uid}-fold)`} />
      <path d="M24 16 L32 30 L24 42 Z" fill="#F59E0B" />
      <path d="M24 4 L24 42" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiCheckIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M8 25 L14 19 L22 28 L20 36 Z" fill="#4ADE80" filter={`url(#${uid}-fold)`} />
      <path d="M22 28 L39 11 L43 16 L20 36 Z" fill="#16A34A" filter={`url(#${uid}-fold)`} />
      <path d="M20 36 L22 28" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
};

export const OrigamiVolumeIcon: React.FC<OrigamiIconProps & { muted?: boolean }> = ({
  className = 'w-4 h-4',
  muted = false,
}) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      {/* Origami Speaker Cone */}
      <path d="M8 18 L18 18 L28 9 L28 24 L8 24 Z" fill="#FDE047" filter={`url(#${uid}-fold)`} />
      <path d="M8 24 L28 24 L28 39 L18 30 L8 30 Z" fill="#EAB308" />
      {!muted ? (
        <>
          <path d="M33 15 L39 20 L33 24 Z" fill="#38BDF8" />
          <path d="M33 33 L39 28 L33 24 Z" fill="#0284C7" />
          <path d="M36 9 L44 24 L36 39 L39 24 Z" fill="#A3E635" />
        </>
      ) : (
        <>
          <path d="M33 17 L43 27 L40 30 L30 20 Z" fill="#F43F5E" />
          <path d="M43 17 L33 27 L36 30 L46 20 Z" fill="#E11D48" />
        </>
      )}
      <path d="M8 24 L28 24" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiCompassIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M24 4 L31 24 L24 24 Z" fill="#F43F5E" filter={`url(#${uid}-fold)`} />
      <path d="M24 4 L17 24 L24 24 Z" fill="#FDA4AF" />
      <path d="M24 44 L17 24 L24 24 Z" fill="#38BDF8" />
      <path d="M24 44 L31 24 L24 24 Z" fill="#0284C7" filter={`url(#${uid}-fold)`} />
      <circle cx="24" cy="24" r="3" fill="#FEF08A" />
    </svg>
  );
};

/**
 * 2. DRAWING STUDIO ('MENGGAMBAR') & ACTION ORIGAMI ICONS
 */

export const OrigamiPencilIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      {/* Eraser Top Facets */}
      <path d="M31 7 L36 12 L32 16 L27 11 Z" fill="#FDA4AF" filter={`url(#${uid}-fold)`} />
      <path d="M36 12 L41 17 L37 21 L32 16 Z" fill="#F43F5E" />
      {/* Pencil Body Left & Right Folded Facets */}
      <path d="M27 11 L32 16 L18 30 L13 25 Z" fill="#FDE047" filter={`url(#${uid}-fold)`} />
      <path d="M32 16 L37 21 L23 35 L18 30 Z" fill="#EAB308" />
      {/* Wood Cone Fold */}
      <path d="M13 25 L18 30 L11 37 Z" fill="#FED7AA" />
      <path d="M18 30 L23 35 L11 37 Z" fill="#FDBA74" />
      {/* Lead Tip */}
      <path d="M11 37 L15 33 L13 31 Z" fill="#1E293B" />
      {/* Crease Highlight */}
      <path d="M32 16 L18 30" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiCrayonIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      <path d="M24 6 L17 16 L24 16 Z" fill="#FB923C" filter={`url(#${uid}-fold)`} />
      <path d="M24 6 L31 16 L24 16 Z" fill="#EA580C" />
      <path d="M17 16 L24 16 L24 36 L17 36 Z" fill="#F97316" filter={`url(#${uid}-fold)`} />
      <path d="M24 16 L31 16 L31 36 L24 36 Z" fill="#C2410C" />
      <path d="M17 21 L24 24 L31 21 L31 29 L24 32 L17 29 Z" fill="#FFEDD5" />
      <path d="M24 24 L31 21 L31 29 L24 32 Z" fill="#FED7AA" />
      <path d="M17 36 L31 36 L29 41 L19 41 Z" fill="#9A3412" />
      <path d="M24 6 L24 41" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.9" />
    </svg>
  );
};

export const OrigamiWatercolorIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      <path d="M18 8 L10 22 L18 30 Z" fill="#7DD3FC" filter={`url(#${uid}-fold)`} />
      <path d="M18 8 L26 22 L18 30 Z" fill="#0284C7" />
      <path d="M28 22 L39 11 L42 14 L32 26 Z" fill="#FBBF24" filter={`url(#${uid}-fold)`} />
      <path d="M24 29 L28 22 L32 26 L26 33 Z" fill="#A855F7" />
      <path d="M18 39 L24 29 L26 33 L29 36 Z" fill="#EC4899" filter={`url(#${uid}-fold)`} />
      <path d="M18 8 L18 30" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="0.9" />
    </svg>
  );
};

export const OrigamiNeonWandIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      <path d="M10 38 L25 23 L28 26 L13 41 Z" fill="#C084FC" filter={`url(#${uid}-fold)`} />
      <path d="M13 41 L28 26 L30 28 L15 43 Z" fill="#7E22CE" />
      <path d="M29 6 L25 17 L29 21 Z" fill="#FEF08A" filter={`url(#${uid}-fold)`} />
      <path d="M29 6 L33 17 L29 21 Z" fill="#FACC15" />
      <path d="M18 17 L29 13 L29 21 Z" fill="#FDE047" />
      <path d="M40 17 L29 13 L29 21 Z" fill="#EAB308" />
      <path d="M29 28 L25 19 L29 17 Z" fill="#F59E0B" />
      <path d="M29 28 L33 19 L29 17 Z" fill="#D97706" />
      <path d="M29 6 L29 28" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="0.9" />
    </svg>
  );
};

export const OrigamiEraserIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      <path d="M22 10 L38 18 L28 28 L12 20 Z" fill="#FDA4AF" filter={`url(#${uid}-fold)`} />
      <path d="M38 18 L38 26 L28 36 L28 28 Z" fill="#E11D48" />
      <path d="M12 20 L28 28 L21 35 L8 27 Z" fill="#38BDF8" filter={`url(#${uid}-fold)`} />
      <path d="M8 27 L21 35 L21 41 L8 33 Z" fill="#0284C7" />
      <path d="M21 35 L28 28 L28 36 L21 41 Z" fill="#0369A1" />
      <path d="M12 20 L28 28" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiBucketIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      <path d="M20 10 L36 18 L26 35 L12 25 Z" fill="#A3E635" filter={`url(#${uid}-fold)`} />
      <path d="M20 10 L28 14 L19 30 L12 25 Z" fill="#BEF264" />
      <path d="M28 14 L36 18 L26 35 L19 30 Z" fill="#65A30D" />
      <path d="M12 25 L6 34 L14 41 L18 31 Z" fill="#38BDF8" filter={`url(#${uid}-fold)`} />
      <path d="M12 25 L18 31 L14 41 Z" fill="#0284C7" />
      <path d="M20 10 L36 18" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.2" />
    </svg>
  );
};

export const OrigamiUndoIcon: React.FC<OrigamiIconProps> = ({ className = 'w-5 h-5' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M8 22 L22 10 L22 18 Z" fill="#FDE047" filter={`url(#${uid}-fold)`} />
      <path d="M8 22 L22 34 L22 26 Z" fill="#EAB308" />
      <path d="M22 18 L36 18 L40 26 L22 26 Z" fill="#FACC15" filter={`url(#${uid}-fold)`} />
      <path d="M36 18 L40 26 L34 36 L28 26 Z" fill="#CA8A04" />
      <path d="M8 22 L36 22" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiGridIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M8 8 L24 8 L8 24 Z" fill="#38BDF8" />
      <path d="M24 8 L24 24 L8 24 Z" fill="#0284C7" />
      <path d="M24 8 L40 8 L24 24 Z" fill="#A3E635" />
      <path d="M40 8 L40 24 L24 24 Z" fill="#65A30D" />
      <path d="M8 24 L24 24 L8 40 Z" fill="#FACC15" />
      <path d="M24 24 L24 40 L8 40 Z" fill="#CA8A04" />
      <path d="M24 24 L40 24 L24 40 Z" fill="#FB7185" />
      <path d="M40 24 L40 40 L24 40 Z" fill="#E11D48" />
      <rect x="8" y="8" width="32" height="32" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1.5" />
    </svg>
  );
};

export const OrigamiTrashIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M10 14 L24 10 L38 14 L24 17 Z" fill="#FDA4AF" filter={`url(#${uid}-fold)`} />
      <path d="M13 17 L24 17 L24 40 L16 40 Z" fill="#FB7185" />
      <path d="M24 17 L35 17 L32 40 L24 40 Z" fill="#E11D48" />
      <path d="M13 17 L24 28 L16 40 Z" fill="#F43F5E" />
      <path d="M24 10 L24 40" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiSparkleStickerIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M24 4 L29 19 L24 24 Z" fill="#FEF08A" filter={`url(#${uid}-fold)`} />
      <path d="M24 4 L19 19 L24 24 Z" fill="#FACC15" />
      <path d="M44 24 L29 29 L24 24 Z" fill="#38BDF8" filter={`url(#${uid}-fold)`} />
      <path d="M44 24 L29 19 L24 24 Z" fill="#0284C7" />
      <path d="M24 44 L19 29 L24 24 Z" fill="#FB7185" filter={`url(#${uid}-fold)`} />
      <path d="M24 44 L29 29 L24 24 Z" fill="#E11D48" />
      <path d="M4 24 L19 19 L24 24 Z" fill="#A3E635" filter={`url(#${uid}-fold)`} />
      <path d="M4 24 L19 29 L24 24 Z" fill="#65A30D" />
    </svg>
  );
};

export const OrigamiAwardStarIcon: React.FC<OrigamiIconProps> = ({ className = 'w-5 h-5' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M24 4 L29 17 L24 24 Z" fill="#FEF08A" filter={`url(#${uid}-fold)`} />
      <path d="M24 4 L19 17 L24 24 Z" fill="#FACC15" />
      <path d="M43 18 L31 27 L24 24 L29 17 Z" fill="#F59E0B" filter={`url(#${uid}-fold)`} />
      <path d="M5 18 L19 17 L24 24 L17 27 Z" fill="#FDE047" />
      <path d="M36 41 L24 33 L24 24 L31 27 Z" fill="#D97706" filter={`url(#${uid}-fold)`} />
      <path d="M12 41 L17 27 L24 24 L24 33 Z" fill="#EAB308" />
      <path d="M24 4 L24 33" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiCloseIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M12 8 L24 20 L20 24 L8 12 Z" fill="#FDA4AF" filter={`url(#${uid}-fold)`} />
      <path d="M36 8 L40 12 L28 24 L24 20 Z" fill="#FB7185" />
      <path d="M20 24 L24 28 L12 40 L8 36 Z" fill="#F43F5E" />
      <path d="M28 24 L40 36 L36 40 L24 28 Z" fill="#E11D48" filter={`url(#${uid}-fold)`} />
    </svg>
  );
};

export const OrigamiCloudSaveIcon: React.FC<OrigamiIconProps> = ({ className = 'w-4 h-4' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      <path d="M16 18 L26 12 L34 18 L24 26 Z" fill="#BAE6FD" filter={`url(#${uid}-fold)`} />
      <path d="M8 26 L16 18 L24 26 L20 34 L8 34 Z" fill="#7DD3FC" />
      <path d="M24 26 L34 18 L42 25 L38 34 L20 34 Z" fill="#38BDF8" />
      <path d="M26 12 L20 34" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1" />
    </svg>
  );
};

export const OrigamiPlayIcon: React.FC<OrigamiIconProps> = ({ className = 'w-5 h-5' }) => {
  const uid = useId();
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
      <OrigamiDefs id={uid} />
      {/* Layered Origami Paper Plane / Play Triangle */}
      <path d="M10 8 L40 24 L22 26 Z" fill="#FEF08A" filter={`url(#${uid}-fold)`} />
      <path d="M10 40 L40 24 L22 26 Z" fill="#FACC15" filter={`url(#${uid}-fold)`} />
      <path d="M10 8 L22 26 L15 24 Z" fill="#F59E0B" />
      <path d="M15 24 L40 24" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.2" />
    </svg>
  );
};

export const OrigamiCraneBadgeIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      {/* Back Wing */}
      <path d="M22 22 L14 6 L30 18 Z" fill="#F472B6" filter={`url(#${uid}-fold)`} />
      {/* Neck & Head */}
      <path d="M15 26 L8 14 L12 12 L21 22 Z" fill="#FDE047" filter={`url(#${uid}-fold)`} />
      <path d="M8 14 L4 17 L12 15 Z" fill="#F59E0B" />
      {/* Central Body */}
      <path d="M15 26 L26 18 L33 27 L22 32 Z" fill="#38BDF8" />
      {/* Front Wing */}
      <path d="M21 23 L38 8 L31 28 Z" fill="#A3E635" filter={`url(#${uid}-fold)`} />
      {/* Tail */}
      <path d="M31 28 L44 18 L36 32 Z" fill="#FB923C" />
      <path d="M15 26 L38 8" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="0.9" />
    </svg>
  );
};

export const OrigamiChatMicIcon: React.FC<OrigamiIconProps> = ({ className = 'w-6 h-6' }) => {
  const uid = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={PAPER_FILTER_STYLE}
    >
      <OrigamiDefs id={uid} />
      {/* 3D Origami Speech Bubble Backdrop (Right) */}
      <path d="M24 7 L43 11 L40 27 L31 28 L27 33 L26 27 L22 25 Z" fill="#818CF8" filter={`url(#${uid}-fold)`} />
      <path d="M24 7 L34 9 L31 28 L22 25 Z" fill="#A5B4FC" />
      {/* Speech Bubble Dots */}
      <circle cx="30" cy="18" r="1.6" fill="#FFFFFF" />
      <circle cx="35" cy="18" r="1.6" fill="#FEF08A" />

      {/* 3D Origami Microphone Capsule (Left-Center) */}
      <path d="M18 10 L11 15 L11 26 L18 30 Z" fill="#FDE047" filter={`url(#${uid}-fold)`} />
      <path d="M18 10 L25 15 L25 26 L18 30 Z" fill="#F59E0B" filter={`url(#${uid}-fold)`} />
      <path d="M11 20 L25 20" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.2" />

      {/* Microphone Cradle & Stand */}
      <path d="M8 24 L11 24 L13 32 L18 34 L18 37 L10 34 Z" fill="#38BDF8" />
      <path d="M28 24 L25 24 L23 32 L18 34 L18 37 L26 34 Z" fill="#0284C7" />
      <path d="M16 36 L20 36 L21 42 L15 42 Z" fill="#FB7185" />
      <path d="M11 41 L25 41 L23 44 L13 44 Z" fill="#E11D48" filter={`url(#${uid}-fold)`} />
      <path d="M18 10 L18 30" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="1" />
    </svg>
  );
};

export type OrigamiStickerKey =
  | 'star'
  | 'rainbow'
  | 'sun'
  | 'butterfly'
  | 'boat'
  | 'medal'
  | 'rocket'
  | 'tree';

export const ORIGAMI_STICKERS: { key: OrigamiStickerKey; label: string }[] = [
  { key: 'star', label: 'Bintang Origami' },
  { key: 'rainbow', label: 'Pelangi Lipat' },
  { key: 'sun', label: 'Mentari Kertas' },
  { key: 'butterfly', label: 'Kupu-Kupu Lipat' },
  { key: 'boat', label: 'Perahu Kertas' },
  { key: 'medal', label: 'Mahkota Juara' },
  { key: 'rocket', label: 'Roket Kertas' },
  { key: 'tree', label: 'Pohon Cemara' },
];

export const OrigamiStickerIcon: React.FC<OrigamiIconProps & { type: OrigamiStickerKey }> = ({
  type,
  className = 'w-7 h-7',
}) => {
  switch (type) {
    case 'star':
      return <OrigamiAwardStarIcon className={className} />;
    case 'rainbow':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M6 34 L16 14 L32 14 L42 34 L35 34 L28 20 L20 20 L13 34 Z" fill="#F43F5E" />
          <path d="M11 34 L19 18 L29 18 L37 34 L31 34 L26 24 L22 24 L17 34 Z" fill="#FACC15" />
          <path d="M16 34 L22 23 L26 23 L32 34 Z" fill="#38BDF8" />
          <path d="M24 14 L24 34" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1" />
        </svg>
      );
    case 'sun':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M24 4 L29 13 L19 13 Z" fill="#F97316" />
          <path d="M24 44 L29 35 L19 35 Z" fill="#EA580C" />
          <path d="M4 24 L13 19 L13 29 Z" fill="#FB923C" />
          <path d="M44 24 L35 19 L35 29 Z" fill="#F97316" />
          <path d="M24 11 L37 24 L24 37 L11 24 Z" fill="#FACC15" />
          <path d="M24 11 L37 24 L24 37 Z" fill="#EAB308" />
        </svg>
      );
    case 'butterfly':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M24 24 L7 9 L11 27 Z" fill="#EC4899" />
          <path d="M24 24 L41 9 L37 27 Z" fill="#DB2777" />
          <path d="M24 24 L11 27 L15 40 Z" fill="#F472B6" />
          <path d="M24 24 L37 27 L33 40 Z" fill="#BE185D" />
          <path d="M24 13 L26 24 L24 37 L22 24 Z" fill="#FEF08A" />
        </svg>
      );
    case 'boat':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M24 9 L15 28 L24 28 Z" fill="#BAE6FD" />
          <path d="M24 9 L33 28 L24 28 Z" fill="#38BDF8" />
          <path d="M6 26 L24 28 L13 38 Z" fill="#0284C7" />
          <path d="M42 26 L24 28 L35 38 Z" fill="#0369A1" />
          <path d="M13 38 L24 28 L35 38 Z" fill="#0EA5E9" />
        </svg>
      );
    case 'medal':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M8 34 L12 14 L24 25 Z" fill="#FDE047" />
          <path d="M40 34 L36 14 L24 25 Z" fill="#EAB308" />
          <path d="M24 10 L15 34 L33 34 Z" fill="#FACC15" />
          <path d="M24 10 L33 34 L24 34 Z" fill="#F59E0B" />
        </svg>
      );
    case 'rocket':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M24 6 L16 18 L24 18 Z" fill="#F43F5E" />
          <path d="M24 6 L32 18 L24 18 Z" fill="#E11D48" />
          <path d="M16 18 L24 18 L24 34 L16 34 Z" fill="#E2E8F0" />
          <path d="M24 18 L32 18 L32 34 L24 34 Z" fill="#CBD5E1" />
          <path d="M16 26 L9 36 L16 34 Z" fill="#38BDF8" />
          <path d="M32 26 L39 36 L32 34 Z" fill="#0284C7" />
          <path d="M20 34 L24 43 L28 34 Z" fill="#F97316" />
        </svg>
      );
    case 'tree':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M24 6 L13 20 L24 20 Z" fill="#4ADE80" />
          <path d="M24 6 L35 20 L24 20 Z" fill="#16A34A" />
          <path d="M24 15 L10 32 L24 32 Z" fill="#22C55E" />
          <path d="M24 15 L38 32 L24 32 Z" fill="#15803D" />
          <path d="M20 32 L28 32 L27 42 L21 42 Z" fill="#92400E" />
        </svg>
      );
  }
};

export const OrigamiSketchIcon: React.FC<
  OrigamiIconProps & { sketch: 'rumah' | 'burung' | 'mobil' | 'ayam' }
> = ({ sketch, className = 'w-7 h-7' }) => {
  switch (sketch) {
    case 'rumah':
      return <OrigamiHomeIcon className={className} />;
    case 'burung':
      return <OrigamiCraneBadgeIcon className={className} />;
    case 'mobil':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M15 15 L26 15 L26 24 L10 24 Z" fill="#38BDF8" />
          <path d="M26 15 L34 15 L39 24 L26 24 Z" fill="#0284C7" />
          <path d="M6 24 L24 24 L24 34 L8 34 Z" fill="#A3E635" />
          <path d="M24 24 L42 24 L40 34 L24 34 Z" fill="#65A30D" />
          <path d="M15 30 L20 35 L15 40 L10 35 Z" fill="#1E293B" />
          <path d="M33 30 L38 35 L33 40 L28 35 Z" fill="#1E293B" />
        </svg>
      );
    case 'ayam':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={PAPER_FILTER_STYLE}>
          <path d="M22 9 L14 19 L26 19 Z" fill="#FEF08A" />
          <path d="M22 9 L30 19 L26 19 Z" fill="#FACC15" />
          <path d="M30 14 L38 17 L30 19 Z" fill="#F97316" />
          <path d="M14 19 L26 19 L20 36 L10 29 Z" fill="#FACC15" />
          <path d="M26 19 L36 28 L28 36 L20 36 Z" fill="#EAB308" />
          <path d="M18 22 L28 25 L22 32 Z" fill="#F59E0B" />
          <circle cx="25" cy="15" r="1.5" fill="#1E293B" />
        </svg>
      );
  }
};
