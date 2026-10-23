export type BiomeKey =
  | 'rumah_budi'
  | 'pantai'
  | 'sawah'
  | 'hutan'
  | 'gunung'
  | 'canyon'
  | 'lembah'
  | 'danau'
  | 'karya';

export interface BiomeInfo {
  key: BiomeKey;
  level: number;
  requiredStars: number;
  title: string;
  pinLabel: string;
  badge: string;
  desc: string;
  sneakPeekTeaser: string;
  unlockRequirementLabel: string;
  progress: string;
  ratio: string;
  reward: string;
  color: string;
  secondaryColor: string;
  badgeBg: string;
  badgeBorder: string;
  cardBorderGlow: string;
  buttonGradient: string;
  ctaText: string;
  nextLevel: string;
  pinStyle: { top: string; left: string };
  icon: string;
  bannerImage: string;
  bannerPosition?: string;
}

export const ISLAND_VIDEO_SRC =
  '/assets/aistudio/Generated_Video_October_22__2026_-_10_57PM_c8c83c5e.mp4';
export const ISLAND_LOADING_POSTER_IMAGE =
  '/assets/aistudio/pulau_ceriakids_loading_poster.webp';
export const ISLAND_POSTER_IMAGE = '/assets/aistudio/pulau_ceriakids_poster.webp';
export const ISLAND_STABLE_START_SEC = 5.2;
export const ISLAND_LOOP_FPS = 24;
export const ISLAND_OVERLAP_FRAMES = 20;

// Ordered starting with Level 0 (Rumah Budi on Hilltop) to Level 8 (Volcano Summit)
export const LEVEL_SEQUENCE: BiomeKey[] = [
  'rumah_budi',
  'pantai',
  'sawah',
  'hutan',
  'karya',
  'danau',
  'lembah',
  'canyon',
  'gunung',
];

export const BIOMES_DATA: Record<BiomeKey, BiomeInfo> = {
  rumah_budi: {
    key: 'rumah_budi',
    level: 0,
    requiredStars: 0,
    title: 'Rumah Ramah Budi',
    pinLabel: 'Rumah Budi',
    badge: 'MARKAS UTAMA • RUMAH BUDI',
    desc: 'Pondok ceria Budi di atas bukit hijau! Tempat Budi beristirahat, membaca dongeng nusantara, dan menyambut seluruh petualang cilik CeriaKids.',
    sneakPeekTeaser: 'Rumah mungil beratap merah milik Budi dengan jendela hangat dan pemandangan spektakuler seluruh Pulau CeriaKids!',
    unlockRequirementLabel: 'Terbuka sejak awal petualangan',
    progress: '100%',
    ratio: 'Pondok Hangat',
    reward: '+50 XP & Bintang Sahabat',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.35)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Masuk Rumah Budi',
    nextLevel: 'Lanjut Petualangan ke Dermaga Literasi ➔',
    pinStyle: { top: '52.5%', left: '30.5%' },
    icon: 'cottage',
    bannerImage: '/assets/aistudio/Generated_Image_October_23__2026_-_2_44AM_a92f59f9.jpg',
    bannerPosition: 'center 48%',
  },
  pantai: {
    key: 'pantai',
    level: 1,
    requiredStars: 0,
    title: 'Dermaga Literasi Indonesia',
    pinLabel: 'Dermaga Literasi',
    badge: 'LEVEL 1 • PESISIR & BAHASA',
    desc: 'Rangkai kalimat cerita pesisir, pecahkan rima pantun nusantara, dan temukan pesan moral dongeng bersama Budi!',
    sneakPeekTeaser: 'Kapal layar pertama berlabuh di sini! Ada peti harta karun berisi dongeng nusantara dan pantun jenaka.',
    unlockRequirementLabel: 'Terbuka sejak awal petualangan',
    progress: '65%',
    ratio: '5/8 Bab',
    reward: '+60 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Mainkan Misi Literasi',
    nextLevel: 'Lanjut ke Lv.2 Lembah Subak ➔',
    pinStyle: { top: '64%', left: '28.5%' },
    icon: 'sailing',
    bannerImage: '/assets/aistudio/pulau_ceriakids_poster.webp',
    bannerPosition: '28% 68%',
  },
  sawah: {
    key: 'sawah',
    level: 2,
    requiredStars: 0,
    title: 'Lembah Subak Pintar',
    pinLabel: 'Lembah Subak',
    badge: 'LEVEL 2 • TERASERING & EKOLOGI',
    desc: 'Pelajari sistem irigasi Subak Bali, perjalanan benih padi menjadi nasi, dan sahabat pembasmi hama alami!',
    sneakPeekTeaser: 'Intip segarnya air terjun menuju sawah bertingkat tempat burung hantu dan bebek menjaga tanaman padi!',
    unlockRequirementLabel: 'Selesaikan Level 1 untuk membuka',
    progress: '40%',
    ratio: '3/8 Bab',
    reward: '+65 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Mulai Misi Subak Pintar',
    nextLevel: 'Lanjut ke Lv.3 Rimba Cilik ➔',
    pinStyle: { top: '40%', left: '31%' },
    icon: 'grass',
    bannerImage: '/assets/aistudio/Gemini_Generated_Image_iujeuuiujeuuiuje__1__e36bd8b8.jpeg',
    bannerPosition: 'center 62%',
  },
  hutan: {
    key: 'hutan',
    level: 3,
    requiredStars: 0,
    title: 'Petualangan Rimba Cilik',
    pinLabel: 'Rimba Cilik',
    badge: 'LEVEL 3 • BIOMA IPAS RIMBA',
    desc: 'Kenali satwa langka Orangutan, susun rantai makanan rimba tropis, dan jaga kelestarian hutan bersama Budi!',
    sneakPeekTeaser: 'Di balik pepohonan zamrud ini, Orangutan dan Harimau Sumatera menunggumu bermain tebak suara satwa!',
    unlockRequirementLabel: 'Selesaikan Level 2 untuk membuka',
    progress: '50%',
    ratio: '4/8 Bab',
    reward: '+60 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Mulai Petualangan Rimba',
    nextLevel: 'Lanjut ke Lv.4 Markas Kreatif ➔',
    pinStyle: { top: '70.8%', left: '46.5%' },
    icon: 'forest',
    bannerImage: '/assets/aistudio/pulau_ceriakids_poster.webp',
    bannerPosition: '46% 72%',
  },
  karya: {
    key: 'karya',
    level: 4,
    requiredStars: 0,
    title: 'Markas Kreatif P5',
    pinLabel: 'Markas Kreatif P5',
    badge: 'LEVEL 4 • PROJEK P5 & SENI',
    desc: 'Sulap botol bekas jadi karya seni, eksperimen campuran warna primer, dan melukis di Buku Sketsa 3D Origami!',
    sneakPeekTeaser: 'Studio lukis tepi pantai dengan kanvas 3D, stiker sahabat CeriaKids, dan eksperimen warna pelangi!',
    unlockRequirementLabel: 'Selesaikan Level 3 untuk membuka',
    progress: '50%',
    ratio: '4/8 Bab',
    reward: '+80 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Buka Markas Kreatif P5',
    nextLevel: 'Lanjut ke Lv.5 Cakap Bahasa ➔',
    pinStyle: { top: '85%', left: '58%' },
    icon: 'palette',
    bannerImage: '/assets/aistudio/budi_house_transition_poster_2s.jpg',
    bannerPosition: 'center 50%',
  },
  danau: {
    key: 'danau',
    level: 5,
    requiredStars: 0,
    title: 'Pulau Cakap Bahasa',
    pinLabel: 'Cakap Bahasa',
    badge: 'LEVEL 5 • ENGLISH KIDS',
    desc: 'Bermain Listen & Tap kosakata satwa, warna, dan percakapan sopan Bahasa Inggris langsung bersama suara Budi!',
    sneakPeekTeaser: 'Laguna biru jernih tempat kita berlatih kosakata Bahasa Inggris seru lewat lagu dan tebak gambar!',
    unlockRequirementLabel: 'Selesaikan Level 4 untuk membuka',
    progress: '25%',
    ratio: '2/8 Bab',
    reward: '+65 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Play English Adventure',
    nextLevel: 'Lanjut ke Lv.6 Taman Kebajikan ➔',
    pinStyle: { top: '70%', left: '60%' },
    icon: 'water',
    bannerImage: '/assets/aistudio/pulau_ceriakids_poster.webp',
    bannerPosition: '60% 70%',
  },
  lembah: {
    key: 'lembah',
    level: 6,
    requiredStars: 12,
    title: 'Taman Budi Kebajikan',
    pinLabel: 'Taman Kebajikan',
    badge: 'LEVEL 6 • KARAKTER & AKHLAK',
    desc: 'Tumbuhkan pohon kebaikan dengan mempraktikkan Tiga Kata Ajaib (Tolong, Maaf, Terima Kasih) dan sikap jujur!',
    sneakPeekTeaser: 'Bocoran Level 6: Di taman bunga sakura & koral hangat ini, setiap sikap baikmu akan memekarkan pohon kristal!',
    unlockRequirementLabel: '🔒 Selesaikan Level 5 (Butuh ★ 12 Bintang)',
    progress: '30%',
    ratio: '2/8 Bab',
    reward: '+75 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Masuk Taman Kebajikan',
    nextLevel: 'Lanjut ke Lv.7 Menara Hitung ➔',
    pinStyle: { top: '75.8%', left: '74%' },
    icon: 'favorite',
    bannerImage: '/assets/aistudio/Gemini_Generated_Image_iujeuuiujeuuiuje__1__e36bd8b8.jpeg',
    bannerPosition: '70% 55%',
  },
  canyon: {
    key: 'canyon',
    level: 7,
    requiredStars: 16,
    title: 'Menara Hitung Ajaib',
    pinLabel: 'Menara Hitung',
    badge: 'LEVEL 7 • LOGIKA & MATEMATIKA',
    desc: 'Taklukkan tantangan pecahan pizza, tangga bilangan loncat 5, dan bangun ruang 3D di Menara Hitung Ajaib!',
    sneakPeekTeaser: 'Bocoran Level 7: Tebing terakota tempat jembatan gantung terbuka saat kamu berhasil memecahkan teka-teki angka!',
    unlockRequirementLabel: '🔒 Selesaikan Level 6 (Butuh ★ 16 Bintang)',
    progress: '25%',
    ratio: '2/8 Bab',
    reward: '+85 XP',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.32)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Masuk Menara Hitung',
    nextLevel: 'Menuju Lv.8 Puncak Pancasila ➔',
    pinStyle: { top: '46.6%', left: '72%' },
    icon: 'landscape',
    bannerImage: '/assets/aistudio/pulau_ceriakids_poster.webp',
    bannerPosition: '72% 46%',
  },
  gunung: {
    key: 'gunung',
    level: 8,
    requiredStars: 20,
    title: 'Puncak Bintang Pancasila',
    pinLabel: 'Puncak Pancasila',
    badge: 'LEVEL 8 PUNCAK • GARUDA PANCASILA',
    desc: 'Petualangan tertinggi mengenal simbol sila Garuda Pancasila, Bhinneka Tunggal Ika, musyawarah, dan gotong royong!',
    sneakPeekTeaser: 'Bocoran Level Puncak: Kumpulkan bintang untuk mendaki puncak emas dan meraih Mahkota Penjelajah CeriaKids!',
    unlockRequirementLabel: '🔒 Level Puncak! Butuh ★ 20 Bintang',
    progress: '75%',
    ratio: '6/8 Bab',
    reward: '+100 XP & Mahkota',
    color: '#FFE082',
    secondaryColor: '#FFB74D',
    badgeBg: 'rgba(255, 183, 77, 0.18)',
    badgeBorder: 'rgba(141, 110, 99, 0.45)',
    cardBorderGlow: 'rgba(255, 183, 77, 0.35)',
    buttonGradient: 'linear-gradient(90deg, #FFB74D 0%, #F57C00 100%)',
    ctaText: 'Taklukkan Puncak Pancasila',
    nextLevel: 'Penjelajah Utama CeriaKids 🏆',
    pinStyle: { top: '33.3%', left: '51.5%' },
    icon: 'volcano',
    bannerImage: '/assets/aistudio/pulau_ceriakids_poster.webp',
    bannerPosition: '51% 33%',
  },
};
