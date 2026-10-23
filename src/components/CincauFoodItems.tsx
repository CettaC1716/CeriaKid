import React from 'react';

interface FoodItemSvgProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * 1 Botol Madu Hutan
 * Botol madu keemasan berkilau dengan madu mengalir manis, tutup kayu berpita, dan lebah kecil ceria.
 */
export const HoneyBottleItem: React.FC<FoodItemSvgProps> = ({ className = 'w-16 h-16', ...props }) => {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Warm golden honey gradient */}
        <linearGradient id="honeyJarGlass" x1="16" y1="20" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#FEF3C7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="honeyLiquid" x1="18" y1="30" x2="54" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="honeyWoodCap" x1="22" y1="12" x2="50" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="honeyDripGrad" x1="40" y1="32" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <filter id="honeyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#F59E0B" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Drop shadow base */}
      <ellipse cx="36" cy="65" rx="20" ry="4" fill="#78350F" fillOpacity="0.12" />

      {/* Main Glass Jar Body */}
      <path
        d="M20 27C20 23.6863 22.6863 21 26 21H46C49.3137 21 52 23.6863 52 27V52C52 58.0751 47.0751 63 41 63H31C24.9249 63 20 58.0751 20 52V27Z"
        fill="url(#honeyJarGlass)"
        stroke="#F59E0B"
        strokeWidth="1.8"
      />

      {/* Honey Liquid Fill */}
      <path
        d="M21.5 35C24.5 33.5 28.5 36 33.5 34.5C38.5 33 43 35.5 50.5 34V52C50.5 57.2467 46.2467 61.5 41 61.5H31C25.7533 61.5 21.5 57.2467 21.5 52V35Z"
        fill="url(#honeyLiquid)"
        filter="url(#honeyGlow)"
      />

      {/* Glass Highlight Sheen */}
      <path
        d="M24 28V52C24 54.5 25.5 57 28 58"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Honey Jar Label / Honeycomb Badge */}
      <g transform="translate(36, 47)">
        <polygon
          points="0,-8 7,-4 7,4 0,8 -7,4 -7,-4"
          fill="#FFFBEB"
          stroke="#D97706"
          strokeWidth="1.2"
        />
        {/* Mini Bee illustration */}
        <ellipse cx="0" cy="0" rx="3.5" ry="2.5" fill="#FBBF24" />
        <ellipse cx="-1.5" cy="-2.5" rx="2" ry="1.2" fill="#E0F2FE" fillOpacity="0.9" />
        <line x1="-1" y1="-2.5" x2="-1" y2="2.5" stroke="#78350F" strokeWidth="0.8" />
        <line x1="1" y1="-2.5" x2="1" y2="2.5" stroke="#78350F" strokeWidth="0.8" />
      </g>

      {/* Jar Neck Ring */}
      <rect x="23" y="19" width="26" height="4" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />

      {/* Wooden Cap / Cork with Ribbon */}
      <path
        d="M24 13C24 11.8954 24.8954 11 26 11H46C47.1046 11 48 11.8954 48 13V19H24V13Z"
        fill="url(#honeyWoodCap)"
        stroke="#78350F"
        strokeWidth="1.2"
      />
      {/* Red/Orange twine ribbon around neck */}
      <rect x="22" y="18" width="28" height="2.5" rx="1.2" fill="#DC2626" />
      <circle cx="36" cy="19.2" r="2.2" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />

      {/* Honey Drip Spoon / Dipper Droplet */}
      <path
        d="M48 24C49 27 54 31 54 36C54 39.3137 51.3137 42 48 42C46.5 42 45 41 44.5 39"
        stroke="url(#honeyDripGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="46" r="2.5" fill="#F59E0B" />

      {/* Twinkle Sparkles */}
      <path d="M16 22L17.5 19L19 22L22 23.5L19 25L17.5 28L16 25L13 23.5L16 22Z" fill="#FDE047" />
      <circle cx="56" cy="18" r="1.5" fill="#FBBF24" />
    </svg>
  );
};

/**
 * 1 Apel Merah
 * Apel merah ranum dengan kilau cahaya, daun hijau segar, dan tangkai kayu kecil.
 */
export const RedAppleItem: React.FC<FoodItemSvgProps> = ({ className = 'w-16 h-16', ...props }) => {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="appleBody" cx="30" cy="30" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="45%" stopColor="#EF4444" />
          <stop offset="85%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>

        <linearGradient id="appleLeaf" x1="38" y1="8" x2="52" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        <linearGradient id="appleStem" x1="35" y1="10" x2="38" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <filter id="appleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#DC2626" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="36" cy="65" rx="19" ry="4" fill="#991B1B" fillOpacity="0.14" />

      {/* Apple Body Shape */}
      <path
        d="M36 24C33 20 24 20 19 25C13 31 13 46 21 56C26 62 31 63 36 59C41 63 46 62 51 56C59 46 59 31 53 25C48 20 39 20 36 24Z"
        fill="url(#appleBody)"
        stroke="#991B1B"
        strokeWidth="1.6"
        filter="url(#appleGlow)"
      />

      {/* Stem */}
      <path
        d="M36 24C36.5 19 38 15 41 11"
        stroke="url(#appleStem)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Leaf */}
      <path
        d="M38 18C44 14 54 15 54 21C54 26 44 24 38 18Z"
        fill="url(#appleLeaf)"
        stroke="#166534"
        strokeWidth="1.2"
      />
      <path d="M40 18.5C45 18 49 19 51 20" stroke="#DCFCE7" strokeWidth="1" strokeLinecap="round" />

      {/* Glossy Curved Highlight */}
      <path
        d="M22 28C20 33 20 42 24 49"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <ellipse cx="26" cy="27" rx="3.5" ry="2" transform="rotate(-30 26 27)" fill="#FFFFFF" fillOpacity="0.8" />

      {/* Cheerful Sparkle */}
      <path d="M54 36L55.5 33L57 36L60 37.5L57 39L55.5 42L54 39L51 37.5L54 36Z" fill="#FDE047" />
    </svg>
  );
};

/**
 * 1 Potong Semangka
 * Potongan semangka merah segar berbiji hitam imut, daging buah berair, dan kulit hijau bergaris.
 */
export const WatermelonSliceItem: React.FC<FoodItemSvgProps> = ({ className = 'w-16 h-16', ...props }) => {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="watermelonPulp" cx="36" cy="22" r="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="35%" stopColor="#F43F5E" />
          <stop offset="80%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#BE123C" />
        </radialGradient>

        <linearGradient id="watermelonRind" x1="12" y1="58" x2="60" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="20%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#16A34A" />
          <stop offset="80%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        <filter id="watermelonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#E11D48" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="36" cy="65" rx="22" ry="4" fill="#047857" fillOpacity="0.14" />

      {/* Outer Green Rind */}
      <path
        d="M12 50C19 60 53 60 60 50C52 64 20 64 12 50Z"
        fill="url(#watermelonRind)"
        stroke="#14532D"
        strokeWidth="1.4"
      />

      {/* White/Pale Green Inner Rind */}
      <path
        d="M13.5 49C20 57 52 57 58.5 49C56 53 16 53 13.5 49Z"
        fill="#ECFDF5"
      />

      {/* Juicy Red Triangular Flesh */}
      <path
        d="M36 14L15 48C22 55 50 55 57 48L36 14Z"
        fill="url(#watermelonPulp)"
        stroke="#BE123C"
        strokeWidth="1.4"
        filter="url(#watermelonGlow)"
      />

      {/* Glossy highlight line */}
      <path
        d="M34 18L19 45"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />

      {/* Cute Watermelon Seeds */}
      <g fill="#18181B">
        {/* Seed 1 */}
        <ellipse cx="36" cy="27" rx="1.6" ry="2.6" transform="rotate(-10 36 27)" />
        {/* Seed 2 */}
        <ellipse cx="28" cy="36" rx="1.5" ry="2.4" transform="rotate(-25 28 36)" />
        {/* Seed 3 */}
        <ellipse cx="44" cy="36" rx="1.5" ry="2.4" transform="rotate(25 44 36)" />
        {/* Seed 4 */}
        <ellipse cx="33" cy="44" rx="1.6" ry="2.5" transform="rotate(-15 33 44)" />
        {/* Seed 5 */}
        <ellipse cx="40" cy="44" rx="1.6" ry="2.5" transform="rotate(15 40 44)" />
      </g>

      {/* Little Water droplet */}
      <ellipse cx="48" cy="26" rx="1.8" ry="2.4" fill="#FFFFFF" fillOpacity="0.75" />

      {/* Sparkle */}
      <path d="M22 23L23 21L24 23L26 24L24 25L23 27L22 25L20 24L22 23Z" fill="#FDE047" />
    </svg>
  );
};
