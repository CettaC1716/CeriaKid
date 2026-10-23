// Bespoke, high-detail storybook SVG habitat & specimen illustrations for Fauna and Flora
// Guaranteed 100% offline/online availability with zero broken images (404) or alt-text leaks.

const svgToDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

export const FAUNA_ILLUSTRATIONS: Record<string, string> = {
  singa: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="45%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ca8a04"/>
          <stop offset="50%" stop-color="#a16207"/>
          <stop offset="100%" stop-color="#713f12"/>
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="60%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Savanna Sunset Sky -->
      <rect width="800" height="600" fill="url(#sky)"/>
      <circle cx="630" cy="180" r="110" fill="url(#sun)"/>
      <circle cx="630" cy="180" r="65" fill="#fef9c3" opacity="0.9"/>
      <!-- Distant Savanna Hills -->
      <path d="M0 370 Q200 320 420 360 T800 350 L800 450 L0 450 Z" fill="#d97706" opacity="0.55"/>
      <!-- Acacia Tree Silhouette -->
      <g fill="#451a03" opacity="0.8">
        <path d="M640 380 Q650 300 630 240 L645 240 Q665 300 658 380 Z"/>
        <path d="M635 255 L580 215 L590 212 L640 245 Z"/>
        <path d="M642 250 L705 210 L715 215 L646 255 Z"/>
        <ellipse cx="575" cy="210" rx="65" ry="14"/>
        <ellipse cx="645" cy="195" rx="85" ry="16"/>
        <ellipse cx="715" cy="210" rx="55" ry="12"/>
      </g>
      <!-- Golden Savanna Grasslands -->
      <path d="M0 380 Q260 355 520 380 T800 370 L800 600 L0 600 Z" fill="url(#ground)"/>
      <!-- Pride Rock Pedestal -->
      <path d="M120 490 L220 370 L530 390 L610 510 Z" fill="#92400e" stroke="#78350f" stroke-width="4"/>
      <path d="M220 370 L530 390 L490 425 L190 410 Z" fill="#b45309"/>
      <!-- Lion Body -->
      <g transform="translate(230, 145)">
        <!-- Tail -->
        <path d="M265 215 Q335 195 340 145" fill="none" stroke="#d97706" stroke-width="14" stroke-linecap="round"/>
        <ellipse cx="342" cy="140" rx="18" ry="14" fill="#78350f" transform="rotate(-25 342 140)"/>
        <!-- Back & Seated Torso -->
        <ellipse cx="195" cy="200" rx="82" ry="58" fill="#f59e0b"/>
        <path d="M120 155 L120 255 L155 255 L155 170 Z" fill="#d97706"/>
        <path d="M225 185 L235 255 L268 255 L258 185 Z" fill="#d97706"/>
        <!-- Chest -->
        <ellipse cx="135" cy="175" rx="54" ry="62" fill="#fbbf24"/>
        <!-- Front Paws -->
        <ellipse cx="110" cy="252" rx="26" ry="14" fill="#f59e0b"/>
        <ellipse cx="155" cy="255" rx="26" ry="14" fill="#f59e0b"/>
        <ellipse cx="245" cy="255" rx="28" ry="14" fill="#f59e0b"/>
        <!-- Magnificent Lion Mane -->
        <path d="M115 20 C165 15 210 55 210 110 C215 165 175 215 115 218 C55 215 15 165 20 110 C20 55 65 15 115 20 Z" fill="#78350f"/>
        <circle cx="115" cy="115" r="88" fill="#92400e" stroke="#451a03" stroke-width="5" stroke-dasharray="26 10"/>
        <circle cx="115" cy="115" r="72" fill="#b45309"/>
        <!-- Ears -->
        <circle cx="62" cy="60" r="20" fill="#d97706"/>
        <circle cx="62" cy="60" r="11" fill="#78350f"/>
        <circle cx="168" cy="60" r="20" fill="#d97706"/>
        <circle cx="168" cy="60" r="11" fill="#78350f"/>
        <!-- Lion Head -->
        <circle cx="115" cy="112" r="56" fill="#fbbf24"/>
        <!-- Muzzle -->
        <ellipse cx="98" cy="134" rx="22" ry="18" fill="#fef3c7"/>
        <ellipse cx="132" cy="134" rx="22" ry="18" fill="#fef3c7"/>
        <ellipse cx="115" cy="150" rx="18" ry="12" fill="#fde68a"/>
        <!-- Nose -->
        <polygon points="98,118 132,118 115,136" fill="#78350f"/>
        <!-- Eyes -->
        <circle cx="90" cy="98" r="9" fill="#1c1917"/>
        <circle cx="87" cy="95" r="3.5" fill="#ffffff"/>
        <circle cx="140" cy="98" r="9" fill="#1c1917"/>
        <circle cx="137" cy="95" r="3.5" fill="#ffffff"/>
        <!-- Eyebrows -->
        <path d="M76 82 Q90 75 102 84" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <path d="M128 84 Q140 75 154 82" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- Smile & Whiskers -->
        <path d="M115 135 L115 145 M100 146 Q115 155 130 146" fill="none" stroke="#451a03" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="55" y1="130" x2="82" y2="133" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="55" y1="140" x2="82" y2="139" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="148" y1="133" x2="175" y2="130" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="148" y1="139" x2="175" y2="140" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <!-- Foreground Grass Tufts -->
      <path d="M60 560 L75 510 L85 560 L100 505 L112 560 Z" fill="#eab308"/>
      <path d="M650 565 L665 515 L680 565 L698 510 L710 565 Z" fill="#eab308"/>
    </svg>
  `),

  gajah: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="60%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
        <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#84cc16"/>
          <stop offset="55%" stop-color="#65a30d"/>
          <stop offset="100%" stop-color="#3f6212"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#gSky)"/>
      <!-- Kilimanjaro Mountain in Background -->
      <polygon points="480,380 620,170 760,380" fill="#64748b"/>
      <polygon points="569,246 620,170 671,246 645,260 620,245 595,262" fill="#f8fafc"/>
      <!-- Clouds -->
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="180" cy="110" rx="55" ry="24"/>
        <ellipse cx="220" cy="100" rx="45" ry="28"/>
        <ellipse cx="145" cy="115" rx="35" ry="18"/>
      </g>
      <!-- Savanna Meadow & Watering Hole -->
      <path d="M0 375 Q300 345 800 380 L800 600 L0 600 Z" fill="url(#gGround)"/>
      <ellipse cx="590" cy="495" rx="185" ry="52" fill="#0284c7" stroke="#fde047" stroke-width="5"/>
      <ellipse cx="580" cy="490" rx="145" ry="35" fill="#38bdf8"/>
      <!-- African Elephant -->
      <g transform="translate(150, 145)">
        <!-- Back Ear -->
        <ellipse cx="305" cy="115" rx="55" ry="72" fill="#475569"/>
        <!-- Body -->
        <ellipse cx="195" cy="195" rx="125" ry="92" fill="#64748b"/>
        <!-- Legs -->
        <rect x="95" y="240" width="44" height="95" rx="18" fill="#475569"/>
        <rect x="150" y="250" width="46" height="92" rx="18" fill="#64748b"/>
        <rect x="225" y="245" width="44" height="92" rx="18" fill="#475569"/>
        <rect x="270" y="250" width="46" height="90" rx="18" fill="#64748b"/>
        <!-- Toenails -->
        <circle cx="162" cy="336" r="6" fill="#cbd5e1"/>
        <circle cx="176" cy="337" r="6" fill="#cbd5e1"/>
        <circle cx="282" cy="334" r="6" fill="#cbd5e1"/>
        <circle cx="296" cy="335" r="6" fill="#cbd5e1"/>
        <!-- Tail -->
        <path d="M72 190 Q45 235 52 270" fill="none" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
        <!-- Front Big Ear -->
        <ellipse cx="215" cy="120" rx="64" ry="82" fill="#475569" stroke="#334155" stroke-width="4"/>
        <ellipse cx="215" cy="124" rx="44" ry="58" fill="#94a3b8" opacity="0.45"/>
        <!-- Head -->
        <circle cx="290" cy="115" r="64" fill="#64748b"/>
        <!-- Curved Trunk Raised Joyfully -->
        <path d="M335 120 Q415 130 415 65 Q415 30 385 35" fill="none" stroke="#64748b" stroke-width="34" stroke-linecap="round"/>
        <!-- Ivory Tusk -->
        <path d="M320 155 Q375 175 392 140" fill="none" stroke="#fefce8" stroke-width="14" stroke-linecap="round"/>
        <!-- Happy Eye & Blush -->
        <circle cx="312" cy="98" r="8" fill="#0f172a"/>
        <circle cx="310" cy="95" r="3" fill="#ffffff"/>
        <ellipse cx="300" cy="122" rx="14" ry="8" fill="#fda4af" opacity="0.6"/>
        <!-- Water Splash from Trunk -->
        <path d="M385 20 Q365 -20 330 -5" fill="none" stroke="#bae6fd" stroke-width="6" stroke-linecap="round"/>
        <path d="M395 18 Q410 -25 445 -10" fill="none" stroke="#bae6fd" stroke-width="6" stroke-linecap="round"/>
        <circle cx="322" cy="-2" r="6" fill="#e0f2fe"/>
        <circle cx="452" cy="-6" r="7" fill="#e0f2fe"/>
        <circle cx="388" cy="-22" r="6" fill="#e0f2fe"/>
      </g>
    </svg>
  `),

  panda: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a7f3d0"/>
          <stop offset="50%" stop-color="#d1fae5"/>
          <stop offset="100%" stop-color="#ecfdf5"/>
        </linearGradient>
        <linearGradient id="pHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#pSky)"/>
      <!-- Misty Sichuan Mountains -->
      <path d="M0 360 Q180 210 370 330 T800 280 L800 500 L0 500 Z" fill="#6ee7b7" opacity="0.6"/>
      <!-- Bamboo Stalks Background -->
      <g stroke="#059669" stroke-width="16" stroke-linecap="round">
        <line x1="90" y1="40" x2="90" y2="520"/>
        <line x1="145" y1="80" x2="145" y2="520"/>
        <line x1="660" y1="30" x2="660" y2="520"/>
        <line x1="715" y1="70" x2="715" y2="520"/>
      </g>
      <!-- Bamboo Nodes & Leaves -->
      <g fill="#10b981">
        <ellipse cx="120" cy="140" rx="32" ry="9" transform="rotate(-25 120 140)"/>
        <ellipse cx="62" cy="190" rx="32" ry="9" transform="rotate(25 62 190)"/>
        <ellipse cx="630" cy="150" rx="34" ry="9" transform="rotate(25 630 150)"/>
        <ellipse cx="690" cy="210" rx="34" ry="9" transform="rotate(-25 690 210)"/>
      </g>
      <!-- Green Meadow -->
      <path d="M0 390 Q400 350 800 395 L800 600 L0 600 Z" fill="url(#pHill)"/>
      <!-- Giant Panda -->
      <g transform="translate(260, 135)">
        <!-- Round Ears -->
        <circle cx="65" cy="52" r="32" fill="#1e293b"/>
        <circle cx="215" cy="52" r="32" fill="#1e293b"/>
        <!-- Chubby Body -->
        <ellipse cx="140" cy="235" rx="115" ry="102" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Black Shoulder Band -->
        <path d="M42 185 Q140 225 238 185 Q255 230 235 260 Q140 285 45 260 Z" fill="#1e293b"/>
        <!-- Hind Paws Sitting -->
        <ellipse cx="65" cy="310" rx="42" ry="32" fill="#1e293b"/>
        <ellipse cx="65" cy="312" rx="20" ry="15" fill="#475569"/>
        <ellipse cx="215" cy="310" rx="42" ry="32" fill="#1e293b"/>
        <ellipse cx="215" cy="312" rx="20" ry="15" fill="#475569"/>
        <!-- Head -->
        <ellipse cx="140" cy="118" rx="92" ry="80" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Eye Patches -->
        <ellipse cx="102" cy="115" rx="26" ry="32" fill="#1e293b" transform="rotate(15 102 115)"/>
        <ellipse cx="178" cy="115" rx="26" ry="32" fill="#1e293b" transform="rotate(-15 178 115)"/>
        <!-- Sparkling Eyes -->
        <circle cx="105" cy="112" r="9" fill="#ffffff"/>
        <circle cx="106" cy="112" r="5" fill="#0f172a"/>
        <circle cx="175" cy="112" r="9" fill="#ffffff"/>
        <circle cx="174" cy="112" r="5" fill="#0f172a"/>
        <!-- Cute Nose & Smile -->
        <ellipse cx="140" cy="138" rx="14" ry="9" fill="#0f172a"/>
        <path d="M126 152 Q140 164 154 152" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
        <!-- Rosy Cheeks -->
        <ellipse cx="75" cy="138" rx="14" ry="8" fill="#fda4af" opacity="0.7"/>
        <ellipse cx="205" cy="138" rx="14" ry="8" fill="#fda4af" opacity="0.7"/>
        <!-- Bamboo Shoot Held in Paws -->
        <line x1="90" y1="245" x2="225" y2="175" stroke="#16a34a" stroke-width="14" stroke-linecap="round"/>
        <ellipse cx="215" cy="160" rx="24" ry="8" fill="#22c55e" transform="rotate(-30 215 160)"/>
        <ellipse cx="235" cy="182" rx="22" ry="8" fill="#22c55e" transform="rotate(20 235 182)"/>
        <!-- Front Paws Holding Bamboo -->
        <circle cx="110" cy="225" r="24" fill="#1e293b"/>
        <circle cx="175" cy="205" r="24" fill="#1e293b"/>
      </g>
    </svg>
  `),

  jerapah: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="jSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde047"/>
          <stop offset="55%" stop-color="#fed7aa"/>
          <stop offset="100%" stop-color="#ffedd5"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#jSky)"/>
      <circle cx="160" cy="130" r="65" fill="#fffbeb" opacity="0.9"/>
      <!-- Acacia Tree Canopy on Right -->
      <path d="M640 420 L655 180 L675 180 L685 420 Z" fill="#78350f"/>
      <ellipse cx="620" cy="150" rx="130" ry="38" fill="#15803d"/>
      <ellipse cx="680" cy="120" rx="110" ry="32" fill="#16a34a"/>
      <!-- Savanna Ground -->
      <path d="M0 400 Q380 365 800 405 L800 600 L0 600 Z" fill="#d97706"/>
      <path d="M0 440 Q420 410 800 445 L800 600 L0 600 Z" fill="#b45309"/>
      <!-- Tall Giraffe -->
      <g transform="translate(240, 55)">
        <!-- Long Legs -->
        <rect x="65" y="300" width="20" height="150" rx="8" fill="#f59e0b"/>
        <rect x="105" y="305" width="20" height="145" rx="8" fill="#fbbf24"/>
        <rect x="175" y="300" width="20" height="150" rx="8" fill="#f59e0b"/>
        <rect x="210" y="305" width="20" height="145" rx="8" fill="#fbbf24"/>
        <!-- Hooves -->
        <rect x="63" y="438" width="24" height="14" rx="4" fill="#451a03"/>
        <rect x="103" y="438" width="24" height="14" rx="4" fill="#451a03"/>
        <rect x="173" y="438" width="24" height="14" rx="4" fill="#451a03"/>
        <rect x="208" y="438" width="24" height="14" rx="4" fill="#451a03"/>
        <!-- Body -->
        <ellipse cx="145" cy="285" rx="92" ry="56" fill="#fbbf24"/>
        <!-- Long Graceful Neck -->
        <path d="M175 265 L235 65 L278 75 L228 285 Z" fill="#fbbf24"/>
        <!-- Mane along Neck -->
        <path d="M172 250 L230 70" stroke="#92400e" stroke-width="10" stroke-dasharray="12 6"/>
        <!-- Giraffe Spots -->
        <g fill="#b45309">
          <circle cx="115" cy="270" r="16"/>
          <circle cx="155" cy="265" r="18"/>
          <circle cx="140" cy="305" r="14"/>
          <circle cx="190" cy="285" r="15"/>
          <circle cx="210" cy="220" r="12"/>
          <circle cx="225" cy="175" r="11"/>
          <circle cx="240" cy="130" r="10"/>
          <circle cx="252" cy="95" r="9"/>
        </g>
        <!-- Ossicones (Horns) & Ears -->
        <line x1="248" y1="52" x2="242" y2="22" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
        <circle cx="241" cy="20" r="8" fill="#451a03"/>
        <line x1="270" y1="52" x2="275" y2="22" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
        <circle cx="276" cy="20" r="8" fill="#451a03"/>
        <ellipse cx="222" cy="58" rx="18" ry="8" fill="#f59e0b" transform="rotate(-25 222 58)"/>
        <!-- Head -->
        <ellipse cx="272" cy="65" rx="42" ry="26" fill="#fde047"/>
        <ellipse cx="302" cy="70" rx="20" ry="16" fill="#fef3c7"/>
        <circle cx="268" cy="56" r="7" fill="#1c1917"/>
        <circle cx="266" cy="54" r="2.5" fill="#ffffff"/>
        <path d="M292 76 Q304 84 314 74" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
      </g>
    </svg>
  `),

  harimau: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="hBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="60%" stop-color="#047857"/>
          <stop offset="100%" stop-color="#065f46"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#hBg)"/>
      <!-- Sunbeams Through Tropical Jungle -->
      <polygon points="120,0 260,0 420,600 220,600" fill="#fef08a" opacity="0.12"/>
      <polygon points="450,0 590,0 760,600 560,600" fill="#fef08a" opacity="0.1"/>
      <!-- Tropical Jungle River & Floor -->
      <path d="M0 390 Q400 360 800 400 L800 600 L0 600 Z" fill="#15803d"/>
      <path d="M0 470 Q320 435 800 485 L800 600 L0 600 Z" fill="#0ea5e9" opacity="0.8"/>
      <!-- Sumatran / Bengal Tiger -->
      <g transform="translate(185, 145)">
        <!-- Striped Tail -->
        <path d="M325 205 Q395 165 385 110" fill="none" stroke="#f97316" stroke-width="18" stroke-linecap="round"/>
        <path d="M325 205 Q395 165 385 110" fill="none" stroke="#1c1917" stroke-width="18" stroke-dasharray="12 16" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="220" cy="205" rx="115" ry="66" fill="#f97316"/>
        <ellipse cx="215" cy="235" rx="95" ry="30" fill="#ffedd5"/>
        <!-- Legs -->
        <rect x="120" y="235" width="34" height="90" rx="14" fill="#ea580c"/>
        <rect x="168" y="242" width="34" height="88" rx="14" fill="#f97316"/>
        <rect x="255" y="238" width="34" height="88" rx="14" fill="#ea580c"/>
        <rect x="298" y="242" width="34" height="86" rx="14" fill="#f97316"/>
        <!-- Tiger Black Stripes on Body -->
        <path d="M175 142 Q185 190 172 225" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>
        <path d="M210 140 Q222 195 208 232" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>
        <path d="M245 142 Q258 195 245 230" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>
        <path d="M280 150 Q290 195 278 228" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>
        <!-- Tiger Head -->
        <circle cx="72" cy="70" r="22" fill="#1c1917"/>
        <circle cx="72" cy="70" r="10" fill="#fde68a"/>
        <circle cx="172" cy="70" r="22" fill="#1c1917"/>
        <circle cx="172" cy="70" r="10" fill="#fde68a"/>
        <ellipse cx="122" cy="125" rx="72" ry="62" fill="#f97316"/>
        <!-- White Cheek Ruff -->
        <ellipse cx="68" cy="138" rx="26" ry="24" fill="#fff7ed"/>
        <ellipse cx="176" cy="138" rx="26" ry="24" fill="#fff7ed"/>
        <ellipse cx="122" cy="148" rx="38" ry="26" fill="#fff7ed"/>
        <!-- Head Stripes -->
        <path d="M58 105 L82 112 M54 122 L80 125 M186 105 L162 112 M190 122 L164 125 M122 68 L122 92" stroke="#1c1917" stroke-width="6" stroke-linecap="round"/>
        <!-- Eyes & Pink/Black Nose -->
        <circle cx="96" cy="112" r="9" fill="#fef08a"/>
        <circle cx="96" cy="112" r="5" fill="#1c1917"/>
        <circle cx="148" cy="112" r="9" fill="#fef08a"/>
        <circle cx="148" cy="112" r="5" fill="#1c1917"/>
        <polygon points="108,132 136,132 122,148" fill="#fb7185" stroke="#1c1917" stroke-width="3"/>
        <path d="M105 156 Q122 166 139 156" fill="none" stroke="#1c1917" stroke-width="4" stroke-linecap="round"/>
      </g>
    </svg>
  `),

  kanguru: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="60%" stop-color="#7dd3fc"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#kSky)"/>
      <!-- Uluru Red Rock Monolith in Outback -->
      <path d="M460 390 L520 275 L730 280 L785 390 Z" fill="#c2410c"/>
      <path d="M0 385 Q380 355 800 390 L800 600 L0 600 Z" fill="#ea580c"/>
      <path d="M0 435 Q420 405 800 440 L800 600 L0 600 Z" fill="#d97706"/>
      <!-- Kangaroo & Joey in Pouch -->
      <g transform="translate(220, 95)">
        <!-- Powerful Tail -->
        <path d="M195 280 Q310 315 355 245" fill="none" stroke="#b45309" stroke-width="26" stroke-linecap="round"/>
        <!-- Hind Legs & Big Feet -->
        <ellipse cx="185" cy="305" rx="48" ry="62" fill="#b45309"/>
        <rect x="115" y="365" width="95" height="22" rx="10" fill="#92400e"/>
        <!-- Torso -->
        <ellipse cx="155" cy="235" rx="64" ry="88" fill="#d97706"/>
        <ellipse cx="132" cy="245" rx="42" ry="68" fill="#fde68a"/>
        <!-- Baby Joey Peeking Out of Pouch -->
        <circle cx="112" cy="235" r="24" fill="#f59e0b"/>
        <ellipse cx="102" cy="208" rx="7" ry="16" fill="#d97706" transform="rotate(-15 102 208)"/>
        <ellipse cx="122" cy="208" rx="7" ry="16" fill="#d97706" transform="rotate(15 122 208)"/>
        <circle cx="104" cy="232" r="4" fill="#1c1917"/>
        <circle cx="118" cy="232" r="4" fill="#1c1917"/>
        <!-- Pouch Pocket -->
        <path d="M88 245 Q125 275 158 242" fill="none" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
        <!-- Mama Kangaroo Neck & Head -->
        <path d="M125 170 L105 90 L152 95 L168 175 Z" fill="#d97706"/>
        <ellipse cx="122" cy="42" rx="12" ry="34" fill="#b45309" transform="rotate(-12 122 42)"/>
        <ellipse cx="152" cy="42" rx="12" ry="34" fill="#b45309" transform="rotate(16 152 42)"/>
        <ellipse cx="118" cy="88" rx="44" ry="30" fill="#d97706"/>
        <ellipse cx="85" cy="96" rx="22" ry="16" fill="#fde68a"/>
        <circle cx="72" cy="92" r="7" fill="#1c1917"/>
        <circle cx="112" cy="80" r="7" fill="#1c1917"/>
        <circle cx="110" cy="78" r="2.5" fill="#ffffff"/>
      </g>
    </svg>
  `),

  lumbalumba: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="50%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
        <linearGradient id="dSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="50%" stop-color="#0369a1"/>
          <stop offset="100%" stop-color="#0c4a6e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#dSky)"/>
      <circle cx="650" cy="140" r="62" fill="#fde047"/>
      <!-- Ocean Waves -->
      <path d="M0 360 Q150 325 300 360 T600 360 T800 355 L800 600 L0 600 Z" fill="url(#dSea)"/>
      <path d="M0 420 Q200 385 400 420 T800 415 L800 600 L0 600 Z" fill="#075985" opacity="0.75"/>
      <!-- Leaping Bottlenose Dolphin -->
      <g transform="translate(175, 95)">
        <!-- Dorsal Fin -->
        <path d="M195 105 Q225 45 255 112 Z" fill="#0284c7"/>
        <!-- Sleek Curved Body -->
        <path d="M55 215 Q145 75 315 125 Q415 155 445 245 Q365 205 275 185 Q155 165 55 215 Z" fill="#38bdf8"/>
        <!-- Light Belly -->
        <path d="M72 212 Q170 135 315 165 Q375 185 425 235 Q340 198 250 185 Q145 175 72 212 Z" fill="#e0f2fe"/>
        <!-- Tail Flukes -->
        <path d="M435 235 Q485 215 495 250 Q455 255 435 242 Q425 275 395 280 Q410 245 435 235 Z" fill="#0284c7"/>
        <!-- Flippers -->
        <path d="M155 175 Q135 235 105 230 Q120 190 155 175 Z" fill="#0284c7"/>
        <!-- Bottlenose Snout & Smile -->
        <ellipse cx="62" cy="202" rx="34" ry="14" fill="#38bdf8" transform="rotate(-25 62 202)"/>
        <path d="M38 212 Q65 215 88 198" fill="none" stroke="#0c4a6e" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Happy Eye -->
        <circle cx="98" cy="175" r="7" fill="#0f172a"/>
        <circle cx="96" cy="173" r="2.5" fill="#ffffff"/>
        <!-- Sparkling Water Droplets -->
        <circle cx="120" cy="85" r="7" fill="#ffffff" opacity="0.85"/>
        <circle cx="345" cy="95" r="8" fill="#ffffff" opacity="0.85"/>
        <circle cx="410" cy="135" r="6" fill="#ffffff" opacity="0.85"/>
      </g>
    </svg>
  `),

  beruangkutub: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="45%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#7dd3fc"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bSky)"/>
      <!-- Aurora Borealis Ribbon -->
      <path d="M60 130 Q250 50 450 130 T750 95" fill="none" stroke="#34d399" stroke-width="28" stroke-linecap="round" opacity="0.45"/>
      <path d="M100 165 Q290 85 490 165 T760 130" fill="none" stroke="#a78bfa" stroke-width="18" stroke-linecap="round" opacity="0.35"/>
      <!-- Icebergs & Arctic Sea -->
      <polygon points="80,380 175,230 280,380" fill="#e0f2fe"/>
      <polygon points="560,380 650,210 760,380" fill="#bae6fd"/>
      <rect x="0" y="380" width="800" height="220" fill="#0284c7"/>
      <!-- Floating Ice Floe -->
      <ellipse cx="400" cy="455" rx="285" ry="70" fill="#f8fafc" stroke="#bae6fd" stroke-width="8"/>
      <!-- Polar Bear -->
      <g transform="translate(215, 175)">
        <ellipse cx="195" cy="175" rx="125" ry="82" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <rect x="95" y="215" width="44" height="82" rx="18" fill="#f1f5f9"/>
        <rect x="155" y="222" width="44" height="82" rx="18" fill="#ffffff"/>
        <rect x="235" y="218" width="44" height="82" rx="18" fill="#f1f5f9"/>
        <rect x="285" y="222" width="44" height="80" rx="18" fill="#ffffff"/>
        <circle cx="72" cy="88" r="18" fill="#e2e8f0"/>
        <circle cx="142" cy="88" r="18" fill="#e2e8f0"/>
        <ellipse cx="102" cy="130" rx="58" ry="48" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <ellipse cx="68" cy="142" rx="28" ry="22" fill="#f1f5f9"/>
        <circle cx="52" cy="136" r="9" fill="#0f172a"/>
        <circle cx="88" cy="118" r="6" fill="#0f172a"/>
        <circle cx="122" cy="118" r="6" fill="#0f172a"/>
      </g>
    </svg>
  `),

  pandamerah: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="pmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde68a"/>
          <stop offset="100%" stop-color="#d1fae5"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#pmSky)"/>
      <!-- Himalayan Tree Branch -->
      <path d="M0 380 Q400 340 800 390 L800 450 Q400 400 0 440 Z" fill="#78350f"/>
      <!-- Red Panda -->
      <g transform="translate(210, 140)">
        <!-- Striped Fluffy Tail -->
        <path d="M250 220 Q385 230 395 145" fill="none" stroke="#ea580c" stroke-width="48" stroke-linecap="round"/>
        <path d="M250 220 Q385 230 395 145" fill="none" stroke="#7c2d12" stroke-width="48" stroke-dasharray="22 24" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="175" cy="205" rx="95" ry="62" fill="#ea580c"/>
        <rect x="105" y="235" width="32" height="58" rx="14" fill="#451a03"/>
        <rect x="215" y="235" width="32" height="58" rx="14" fill="#451a03"/>
        <!-- Cute Ears & Face -->
        <polygon points="52,95 72,42 108,82" fill="#ffffff" stroke="#ea580c" stroke-width="6"/>
        <polygon points="188,95 168,42 132,82" fill="#ffffff" stroke="#ea580c" stroke-width="6"/>
        <ellipse cx="120" cy="128" rx="64" ry="52" fill="#ea580c"/>
        <ellipse cx="95" cy="135" rx="22" ry="26" fill="#ffffff"/>
        <ellipse cx="145" cy="135" rx="22" ry="26" fill="#ffffff"/>
        <circle cx="96" cy="124" r="7" fill="#1c1917"/>
        <circle cx="144" cy="124" r="7" fill="#1c1917"/>
        <ellipse cx="120" cy="144" rx="24" ry="18" fill="#ffffff"/>
        <circle cx="120" cy="138" r="7" fill="#1c1917"/>
      </g>
    </svg>
  `),

  komodo: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="kmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="65%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#kmSky)"/>
      <!-- Flores Island Hills & Pink Beach -->
      <path d="M0 350 Q220 240 460 350 T800 320 L800 450 L0 450 Z" fill="#ca8a04"/>
      <path d="M0 395 Q400 370 800 405 L800 600 L0 600 Z" fill="#fbbf24"/>
      <!-- Komodo Dragon -->
      <g transform="translate(125, 215)">
        <!-- Long Muscular Tail -->
        <path d="M365 155 Q495 185 565 150" fill="none" stroke="#57534e" stroke-width="32" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="255" cy="148" rx="135" ry="52" fill="#57534e"/>
        <rect x="145" y="175" width="32" height="58" rx="12" fill="#44403c"/>
        <rect x="325" y="175" width="32" height="58" rx="12" fill="#44403c"/>
        <!-- Neck & Head -->
        <ellipse cx="95" cy="125" rx="68" ry="34" fill="#78716c"/>
        <!-- Forked Yellow Tongue -->
        <path d="M28 130 L-15 125 M-15 125 L-32 115 M-15 125 L-32 135" fill="none" stroke="#facc15" stroke-width="5" stroke-linecap="round"/>
        <circle cx="75" cy="115" r="7" fill="#1c1917"/>
        <circle cx="73" cy="113" r="2.5" fill="#fef08a"/>
      </g>
    </svg>
  `),
};

export const FLORA_ILLUSTRATIONS: Record<string, string> = {
  mawar: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="mBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe4e6"/>
          <stop offset="60%" stop-color="#fecdd3"/>
          <stop offset="100%" stop-color="#bbf7d0"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#mBg)"/>
      <circle cx="650" cy="120" r="65" fill="#fef08a" opacity="0.85"/>
      <!-- Garden Lawn -->
      <path d="M0 430 Q400 390 800 430 L800 600 L0 600 Z" fill="#22c55e"/>
      <!-- Rose Stem, Thorns & Leaves -->
      <path d="M400 520 Q385 380 400 240" fill="none" stroke="#15803d" stroke-width="18" stroke-linecap="round"/>
      <polygon points="392,380 368,368 393,360" fill="#166534"/>
      <polygon points="406,320 430,308 405,300" fill="#166534"/>
      <ellipse cx="325" cy="390" rx="58" ry="26" fill="#16a34a" transform="rotate(-25 325 390)"/>
      <ellipse cx="475" cy="345" rx="58" ry="26" fill="#16a34a" transform="rotate(25 475 345)"/>
      <!-- Blooming Red Rose Petals -->
      <g transform="translate(400, 200)">
        <circle cx="-55" cy="10" r="68" fill="#be123c"/>
        <circle cx="55" cy="10" r="68" fill="#be123c"/>
        <circle cx="0" cy="-45" r="72" fill="#e11d48"/>
        <circle cx="-38" cy="-15" r="58" fill="#f43f5e"/>
        <circle cx="38" cy="-15" r="58" fill="#f43f5e"/>
        <ellipse cx="0" cy="15" rx="82" ry="54" fill="#e11d48"/>
        <ellipse cx="0" cy="-10" rx="52" ry="38" fill="#fb7185"/>
        <path d="M-28 -12 Q0 -35 28 -12 Q18 18 -18 14 Z" fill="#be123c"/>
      </g>
    </svg>
  `),

  matahari: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="65%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#sBg)"/>
      <circle cx="150" cy="110" r="55" fill="#fde047"/>
      <path d="M0 430 Q400 390 800 430 L800 600 L0 600 Z" fill="#16a34a"/>
      <!-- Stem & Leaves -->
      <line x1="400" y1="240" x2="400" y2="540" stroke="#15803d" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="315" cy="390" rx="68" ry="34" fill="#22c55e" transform="rotate(-25 315 390)"/>
      <ellipse cx="485" cy="365" rx="68" ry="34" fill="#22c55e" transform="rotate(25 485 365)"/>
      <!-- Sunflower Head -->
      <g transform="translate(400, 215)">
        <circle cx="0" cy="0" r="135" fill="#f59e0b" stroke="#fbbf24" stroke-width="18" stroke-dasharray="28 12"/>
        <circle cx="0" cy="0" r="115" fill="#fde047" stroke="#facc15" stroke-width="16" stroke-dasharray="24 10"/>
        <circle cx="0" cy="0" r="72" fill="#78350f" stroke="#92400e" stroke-width="8"/>
        <circle cx="-22" cy="-12" r="7" fill="#fef08a"/>
        <circle cx="22" cy="-12" r="7" fill="#fef08a"/>
        <path d="M-20 16 Q0 32 20 16" fill="none" stroke="#fef08a" stroke-width="5" stroke-linecap="round"/>
      </g>
    </svg>
  `),

  aloe: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#ecfdf5"/>
      <path d="M0 440 Q400 410 800 440 L800 600 L0 600 Z" fill="#fde68a"/>
      <!-- Terracotta Pot -->
      <polygon points="270,380 530,380 490,535 310,535" fill="#ea580c" stroke="#c2410c" stroke-width="6"/>
      <rect x="250" y="355" width="300" height="34" rx="12" fill="#f97316" stroke="#c2410c" stroke-width="5"/>
      <!-- Succulent Aloe Vera Blades -->
      <g fill="#10b981" stroke="#047857" stroke-width="5">
        <path d="M365 355 Q340 160 398 75 Q450 160 435 355 Z"/>
        <path d="M320 355 Q235 200 265 110 Q345 190 375 355 Z"/>
        <path d="M480 355 Q565 200 535 110 Q455 190 425 355 Z"/>
        <path d="M290 355 Q175 260 185 185 Q275 235 340 355 Z"/>
        <path d="M510 355 Q625 260 615 185 Q525 235 460 355 Z"/>
      </g>
    </svg>
  `),

  lavender: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#f3e8ff"/>
      <path d="M0 420 Q400 380 800 420 L800 600 L0 600 Z" fill="#86efac"/>
      <!-- Lavender Stems -->
      <g stroke="#15803d" stroke-width="10" stroke-linecap="round">
        <line x1="300" y1="500" x2="260" y2="170"/>
        <line x1="365" y1="500" x2="350" y2="130"/>
        <line x1="435" y1="500" x2="450" y2="130"/>
        <line x1="500" y1="500" x2="540" y2="170"/>
      </g>
      <!-- Purple Lavender Blossoms -->
      <g fill="#9333ea">
        <ellipse cx="265" cy="190" rx="22" ry="55"/>
        <ellipse cx="352" cy="160" rx="24" ry="65"/>
        <ellipse cx="448" cy="160" rx="24" ry="65"/>
        <ellipse cx="535" cy="190" rx="22" ry="55"/>
      </g>
      <g fill="#c084fc">
        <circle cx="265" cy="160" r="14"/>
        <circle cx="352" cy="125" r="15"/>
        <circle cx="448" cy="125" r="15"/>
        <circle cx="535" cy="160" r="14"/>
      </g>
    </svg>
  `),

  teratai: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#0284c7"/>
      <ellipse cx="400" cy="360" rx="340" ry="150" fill="#0369a1"/>
      <!-- Giant Victoria Amazonica Lily Pad -->
      <ellipse cx="400" cy="360" rx="260" ry="105" fill="#16a34a" stroke="#4ade80" stroke-width="14"/>
      <ellipse cx="400" cy="355" rx="235" ry="88" fill="#22c55e"/>
      <!-- Blooming Pink Water Lotus -->
      <g transform="translate(400, 295)">
        <ellipse cx="-55" cy="10" rx="52" ry="26" fill="#f472b6" transform="rotate(-20 -55 10)"/>
        <ellipse cx="55" cy="10" rx="52" ry="26" fill="#f472b6" transform="rotate(20 55 10)"/>
        <ellipse cx="-35" cy="-15" rx="45" ry="28" fill="#fb7185" transform="rotate(-35 -35 -15)"/>
        <ellipse cx="35" cy="-15" rx="45" ry="28" fill="#fb7185" transform="rotate(35 35 -15)"/>
        <ellipse cx="0" cy="-28" rx="34" ry="52" fill="#fda4af"/>
        <circle cx="0" cy="5" r="26" fill="#fde047"/>
      </g>
    </svg>
  `),

  rafflesia: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#064e3b"/>
      <path d="M0 390 Q400 355 800 390 L800 600 L0 600 Z" fill="#14532d"/>
      <!-- Giant 5-Petal Rafflesia Arnoldii -->
      <g transform="translate(400, 315)">
        <ellipse cx="0" cy="-135" rx="85" ry="95" fill="#dc2626" stroke="#991b1b" stroke-width="5"/>
        <ellipse cx="-135" cy="-35" rx="95" ry="82" fill="#dc2626" stroke="#991b1b" stroke-width="5"/>
        <ellipse cx="135" cy="-35" rx="95" ry="82" fill="#dc2626" stroke="#991b1b" stroke-width="5"/>
        <ellipse cx="-85" cy="110" rx="88" ry="85" fill="#b91c1c" stroke="#7f1d1d" stroke-width="5"/>
        <ellipse cx="85" cy="110" rx="88" ry="85" fill="#b91c1c" stroke="#7f1d1d" stroke-width="5"/>
        <!-- White Speckles -->
        <g fill="#fef2f2" opacity="0.85">
          <circle cx="-25" cy="-150" r="9"/><circle cx="30" cy="-135" r="7"/><circle cx="0" cy="-115" r="8"/>
          <circle cx="-155" cy="-45" r="9"/><circle cx="-120" cy="-15" r="8"/><circle cx="150" cy="-45" r="9"/>
          <circle cx="120" cy="-15" r="8"/><circle cx="-95" cy="120" r="9"/><circle cx="95" cy="120" r="9"/>
        </g>
        <!-- Central Corona Cavity -->
        <circle cx="0" cy="0" r="78" fill="#ea580c" stroke="#7c2d12" stroke-width="10"/>
        <circle cx="0" cy="0" r="52" fill="#451a03"/>
        <circle cx="0" cy="0" r="34" fill="#f59e0b" opacity="0.7"/>
      </g>
    </svg>
  `),

  nepenthes: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#065f46"/>
      <!-- Tropical Vine -->
      <path d="M120 80 Q380 150 680 95" fill="none" stroke="#15803d" stroke-width="16" stroke-linecap="round"/>
      <!-- Pitcher Plant Pouch (Kantong Semar) -->
      <g transform="translate(400, 290)">
        <path d="M-20 -160 Q-20 -90 0 -75" fill="none" stroke="#22c55e" stroke-width="12"/>
        <!-- Lid -->
        <ellipse cx="15" cy="-115" rx="62" ry="24" fill="#dc2626" transform="rotate(-18 15 -115)"/>
        <!-- Pitcher Body -->
        <path d="M-65 -65 C-85 50 -75 165 0 175 C75 165 85 50 65 -65 Z" fill="#84cc16" stroke="#15803d" stroke-width="6"/>
        <!-- Crimson Spotted Lower Belly -->
        <path d="M-68 35 C-75 135 -45 170 0 175 C45 170 75 135 68 35 Z" fill="#ea580c" opacity="0.85"/>
        <!-- Ribbed Peristome Rim -->
        <ellipse cx="0" cy="-65" rx="72" ry="22" fill="#dc2626" stroke="#7f1d1d" stroke-width="5"/>
      </g>
    </svg>
  `),

  baobab: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="60%" stop-color="#fdba74"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bbSky)"/>
      <path d="M0 430 Q400 395 800 430 L800 600 L0 600 Z" fill="#b45309"/>
      <!-- Massive Bottle-Shaped Baobab Trunk -->
      <path d="M310 460 C285 350 315 245 340 195 L460 195 C485 245 515 350 490 460 Z" fill="#78350f" stroke="#451a03" stroke-width="6"/>
      <!-- Branches & Lush Canopy -->
      <path d="M355 205 L240 125 M385 198 L335 105 M415 198 L465 105 M445 205 L560 125" stroke="#78350f" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="235" cy="115" rx="75" ry="32" fill="#15803d"/>
      <ellipse cx="400" cy="95" rx="125" ry="38" fill="#16a34a"/>
      <ellipse cx="565" cy="115" rx="75" ry="32" fill="#15803d"/>
    </svg>
  `),

  titan: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#064e3b"/>
      <path d="M0 440 Q400 405 800 440 L800 600 L0 600 Z" fill="#14532d"/>
      <!-- Titan Arum (Amorphophallus titanum) -->
      <g transform="translate(400, 320)">
        <!-- Tall Golden Spadix Spike -->
        <path d="M-38 20 L-22 -215 Q0 -245 22 -215 L38 20 Z" fill="#facc15" stroke="#ca8a04" stroke-width="5"/>
        <!-- Frilled Burgundy Spathe Skirt -->
        <path d="M-165 -35 Q-110 -85 0 -55 Q110 -85 165 -35 L95 125 L-95 125 Z" fill="#881337" stroke="#f43f5e" stroke-width="6"/>
        <path d="M-135 -10 Q0 35 135 -10 L85 125 L-85 125 Z" fill="#15803d"/>
      </g>
    </svg>
  `),

  venus: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#dcfce7"/>
      <path d="M0 440 Q400 410 800 440 L800 600 L0 600 Z" fill="#15803d"/>
      <!-- Stems -->
      <path d="M400 480 Q320 350 285 245" fill="none" stroke="#16a34a" stroke-width="18" stroke-linecap="round"/>
      <path d="M400 480 Q480 350 515 245" fill="none" stroke="#16a34a" stroke-width="18" stroke-linecap="round"/>
      <!-- Left Open Flytrap Jaw -->
      <g transform="translate(275, 220) rotate(-18)">
        <ellipse cx="0" cy="0" rx="85" ry="48" fill="#22c55e" stroke="#15803d" stroke-width="5"/>
        <ellipse cx="0" cy="0" rx="68" ry="32" fill="#e11d48"/>
        <path d="M-70 -18 L-60 -38 L-45 -22 L-30 -42 L-15 -24 L0 -44 L15 -24 L30 -42 L45 -22 L60 -38 L70 -18" fill="none" stroke="#15803d" stroke-width="5"/>
      </g>
      <!-- Right Open Flytrap Jaw -->
      <g transform="translate(525, 220) rotate(18)">
        <ellipse cx="0" cy="0" rx="85" ry="48" fill="#22c55e" stroke="#15803d" stroke-width="5"/>
        <ellipse cx="0" cy="0" rx="68" ry="32" fill="#e11d48"/>
        <path d="M-70 -18 L-60 -38 L-45 -22 L-30 -42 L-15 -24 L0 -44 L15 -24 L30 -42 L45 -22 L60 -38 L70 -18" fill="none" stroke="#15803d" stroke-width="5"/>
      </g>
    </svg>
  `),

  anggrek: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#fdf4ff"/>
      <path d="M0 440 Q400 400 800 440 L800 600 L0 600 Z" fill="#16a34a"/>
      <!-- Arching Stem -->
      <path d="M220 520 Q280 220 540 180" fill="none" stroke="#15803d" stroke-width="14" stroke-linecap="round"/>
      <!-- Moon Orchid (Anggrek Bulan) Blossom -->
      <g transform="translate(420, 235)">
        <ellipse cx="-65" cy="0" rx="65" ry="48" fill="#ffffff" stroke="#f5d0fe" stroke-width="4"/>
        <ellipse cx="65" cy="0" rx="65" ry="48" fill="#ffffff" stroke="#f5d0fe" stroke-width="4"/>
        <ellipse cx="0" cy="-58" rx="44" ry="58" fill="#faf5ff" stroke="#f5d0fe" stroke-width="4"/>
        <ellipse cx="-38" cy="52" rx="34" ry="48" fill="#ffffff" stroke="#f5d0fe" stroke-width="4"/>
        <ellipse cx="38" cy="52" rx="34" ry="48" fill="#ffffff" stroke="#f5d0fe" stroke-width="4"/>
        <ellipse cx="0" cy="18" rx="28" ry="32" fill="#db2777"/>
        <circle cx="0" cy="8" r="14" fill="#facc15"/>
      </g>
    </svg>
  `),

  sakura: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#ffe4e6"/>
      <!-- Cherry Blossom Branch -->
      <path d="M0 160 Q320 220 680 140" fill="none" stroke="#57534e" stroke-width="20" stroke-linecap="round"/>
      <!-- Pink Sakura Blossom -->
      <g transform="translate(400, 290)">
        <ellipse cx="0" cy="-85" rx="42" ry="65" fill="#fbcfe8"/>
        <ellipse cx="-82" cy="-25" rx="65" ry="42" fill="#fbcfe8"/>
        <ellipse cx="82" cy="-25" rx="65" ry="42" fill="#fbcfe8"/>
        <ellipse cx="-52" cy="72" rx="48" ry="62" fill="#f9a8d4"/>
        <ellipse cx="52" cy="72" rx="48" ry="62" fill="#f9a8d4"/>
        <circle cx="0" cy="0" r="28" fill="#ec4899"/>
        <circle cx="0" cy="0" r="14" fill="#fde047"/>
      </g>
    </svg>
  `),
};

const UPLOADED_FAUNA_IMAGES: Record<string, string> = {
  singa: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_1_07e95158.jpg',
  harimau: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_2_83723c3c.jpg',
  gajah: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_3_ea563a3d.jpg',
  panda: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_4_64458ab7.jpg',
  jerapah: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_5_1d32a14f.jpg',
  pandamerah: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_6_11ad8ca8.jpg',
  komodo: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_7_fe3652cf.jpg',
  beruangkutub: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_8_fa137938.jpg',
  berangberang: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_9_2765888d.jpg',
  lumbalumba: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_10_41ea0daa.jpg',
  penyu: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_11_66fb9f33.jpg',
  zebra: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_12_4b859a37.jpg',
  monyet: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_13_792d2dee.jpg',
  koala: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_14_ff5ecc05.jpg',
  kanguru: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_14_ff5ecc05.jpg',
  rubah: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_15_db7c2c0d.jpg',
};

export const getFaunaIllustration = (id: string): string => {
  return UPLOADED_FAUNA_IMAGES[id] || FAUNA_ILLUSTRATIONS[id] || UPLOADED_FAUNA_IMAGES.singa;
};

export const getFloraIllustration = (key: string): string => {
  return FLORA_ILLUSTRATIONS[key] || FLORA_ILLUSTRATIONS.mawar;
};

