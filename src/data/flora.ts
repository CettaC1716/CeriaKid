import { getFloraIllustration } from '../utils/natureIllustrations';

export interface FloraCardMeta {
  badgeBg: string;
  badgeBorder: string;
  emoji: string;
  tagText: string;
  subText: string;
}

export interface FloraItem {
  key: string;
  name: string;
  latin: string;
  image: string;
  badge: string;
  habitat: string;
  sun: string;
  water: string;
  benefit: string;
  taleTitle: string;
  taleSubtitle: string;
  taleSummary: string;
  originTitle: string;
  originFact: string;
  pinX: number;
  pinY: number;
  pinLabel: string;
  cardMeta: FloraCardMeta;
}

export const FLORA_REGISTRY: Record<string, FloraItem> = {
  mawar: {
    key: 'mawar',
    name: 'Mawar Merah',
    latin: 'Rosa rubiginosa',
    image: getFloraIllustration('mawar'),
    badge: '🌹 MAWAR MERAH',
    habitat: 'TAMAN PEKARANGAN RUMAH',
    sun: 'Suka berjemur 6 jam agar mekar ceria!',
    water: 'Cukup 1 kali sehari di pagi hari!',
    benefit: 'Aromanya harum disukai lebah madu!',
    taleTitle: 'Dongeng Putri Kelopak Mawar & Duri Setia',
    taleSubtitle: 'Kisah Harum Melindungi Sahabat Kebun',
    taleSummary:
      'Duri di batang mawar adalah pelindung lembut agar tangkai dan bunganya yang wangi tidak mudah dirusak hewan besar saat mekar!',
    originTitle: 'Asal Usul Bunga Mawar',
    originFact:
      'Mawar telah dibudidayakan lebih dari 5.000 tahun silam dari kawasan Asia Barat dan Persia kuno!',
    pinX: 470,
    pinY: 140,
    pinLabel: 'Persia & Asia Barat',
    cardMeta: {
      badgeBg: '#e11d48',
      badgeBorder: 'border-rose-300',
      emoji: '🌹',
      tagText: 'Taman Rumah',
      subText: 'Harum & Berduri',
    },
  },
  matahari: {
    key: 'matahari',
    name: 'Bunga Matahari',
    latin: 'Helianthus annuus',
    image: getFloraIllustration('matahari'),
    badge: '🌻 BUNGA MATAHARI',
    habitat: 'FLORA KEBUN RUMAH',
    sun: 'Bunga selalu mengikuti arah matahari pagi hingga sore!',
    water: 'Siram 1-2 hari sekali di tanah gembur yang hangat.',
    benefit: 'Biji bergizi renyah & nektar manis penarik lebah madu.',
    taleTitle: 'Petualangan Si Biji Emas',
    taleSubtitle: 'Kisah Si Bunga Pengikut Mentari',
    taleSummary:
      'Bunga matahari bukan cuma satu bunga lho! Tengahnya memiliki ribuan bunga kecil mungil yang bertumbuh jadi biji kuaci renyah.',
    originTitle: 'Asal Usul Bunga Matahari',
    originFact:
      'Bunga Matahari berasal dari benua Amerika dan dibawa berkeliling dunia oleh para penjelajah botani berkat keindahannya!',
    pinX: 180,
    pinY: 150,
    pinLabel: 'Amerika Utara',
    cardMeta: {
      badgeBg: '#f59e0b',
      badgeBorder: 'border-amber-300',
      emoji: '🌻',
      tagText: 'Taman Kebun',
      subText: 'Heliotropik Ceria',
    },
  },
  aloe: {
    key: 'aloe',
    name: 'Lidah Buaya',
    latin: 'Aloe vera',
    image: getFloraIllustration('aloe'),
    badge: '🪴 LIDAH BUAYA',
    habitat: 'POT SUKULEN RUMAH',
    sun: 'Cukup sinar terang di dekat jendela rumah.',
    water: 'Hemat air, siram saat tanah kering 1-2 minggu sekali.',
    benefit: 'Gel dingin penyejuk kulit & pembersih udara alami.',
    taleTitle: 'Kisah Si Gel Dingin Penyembuh Luka',
    taleSubtitle: 'Sahabat P3K Alami Dalam Pot Rumah',
    taleSummary:
      'Di dalam daun tebalnya, tersimpan cadangan air seperti spons ajaib yang siap menyejukkan kulit kita!',
    originTitle: 'Asal Usul Lidah Buaya',
    originFact:
      'Berasal dari Jazirah Arab yang kering, tanaman ini jadi simbol kesehatan sejak zaman Mesir Kuno!',
    pinX: 440,
    pinY: 180,
    pinLabel: 'Jazirah Arab',
    cardMeta: {
      badgeBg: '#059669',
      badgeBorder: 'border-emerald-300',
      emoji: '🪴',
      tagText: 'Pot Rumah',
      subText: 'Sukulen Obat Sejuk',
    },
  },
  lavender: {
    key: 'lavender',
    name: 'Bunga Lavender',
    latin: 'Lavandula angustifolia',
    image: getFloraIllustration('lavender'),
    badge: '🪻 BUNGA LAVENDER',
    habitat: 'KEBUN HERBAL AROMATIK',
    sun: 'Suka sinar matahari terik & udara kering berangin.',
    water: 'Siram sedang, jangan biarkan tanah terlalu becek.',
    benefit: 'Aroma wangi penenang tidur & pengusir nyamuk alami.',
    taleTitle: 'Lagu Pengantar Tidur di Lembah Ungu',
    taleSubtitle: 'Kisah Bunga Ajaib yang Menjaga Mimpi Indah',
    taleSummary:
      'Aroma bunganya yang manis membuat kita merasa tenang, nyaman, dan nyamuk pun tidak berani mendekat.',
    originTitle: 'Asal Usul Lavender',
    originFact:
      'Tumbuh liar di perbukitan Mediterania selatan Eropa dan pesisir Laut Tengah!',
    pinX: 410,
    pinY: 130,
    pinLabel: 'Laut Mediterania',
    cardMeta: {
      badgeBg: '#7c3aed',
      badgeBorder: 'border-purple-300',
      emoji: '🪻',
      tagText: 'Anti-Nyamuk',
      subText: 'Aromatik Menenangkan',
    },
  },
  teratai: {
    key: 'teratai',
    name: 'Teratai Raksasa',
    latin: 'Victoria amazonica',
    image: getFloraIllustration('teratai'),
    badge: '🪷 TERATAI RAKSASA',
    habitat: 'KOLAM AIR TENANG',
    sun: 'Suka mengapung di permukaan air kolam yang hangat.',
    water: 'Hidup di air tenang dengan lumpur subur di dasar kolam.',
    benefit: 'Rumah perlindungan ikan kecil & piring terapung kokoh.',
    taleTitle: 'Misteri Piring Terapung di Sungai Amazon',
    taleSubtitle: 'Kisah Daun Raksasa Berbunga Mekar Malam',
    taleSummary:
      'Daunnya yang lebar memiliki urat berduri di bagian bawah dan tepian tegak yang membuatnya mengapung gagah.',
    originTitle: 'Asal Usul Teratai Raksasa Amazon',
    originFact:
      'Berasal dari perairan rawa tenang Sungai Amazon di pedalaman hutan tropis Amerika Selatan!',
    pinX: 230,
    pinY: 280,
    pinLabel: 'Sungai Amazon',
    cardMeta: {
      badgeBg: '#0d9488',
      badgeBorder: 'border-teal-300',
      emoji: '🪷',
      tagText: 'Air Tenang',
      subText: 'Piring Air Mengapung',
    },
  },
  rafflesia: {
    key: 'rafflesia',
    name: 'Rafflesia Arnoldii',
    latin: 'Rafflesia arnoldii',
    image: getFloraIllustration('rafflesia'),
    badge: '🌺 RAFFLESIA ARNOLDII',
    habitat: 'HUTAN HUJAN TROPIS',
    sun: 'Tumbuh rindang di dasar hutan tropis yang lembap.',
    water: 'Membutuhkan kelembapan udara & tanah humus hutan.',
    benefit: 'Bunga raksasa langka kebanggaan alam Nusantara.',
    taleTitle: 'Kisah Raksasa Merah Pengheboh Hutan',
    taleSubtitle: 'Bunga Tanpa Daun Bintang Nusantara',
    taleSummary:
      'Rafflesia adalah bunga terbesar di dunia yang mekar unik tanpa daun dan tanpa batang!',
    originTitle: 'Asal Usul Rafflesia',
    originFact:
      'Pertama kali ditemukan di pedalaman hutan Bengkulu, Sumatera, Indonesia!',
    pinX: 630,
    pinY: 290,
    pinLabel: 'Sumatera, Indonesia',
    cardMeta: {
      badgeBg: '#dc2626',
      badgeBorder: 'border-red-400',
      emoji: '🌺',
      tagText: 'Hutan Hujan',
      subText: 'Patma Raksasa Langka',
    },
  },
  nepenthes: {
    key: 'nepenthes',
    name: 'Kantong Semar',
    latin: 'Nepenthes',
    image: getFloraIllustration('nepenthes'),
    badge: '🫙 KANTONG SEMAR',
    habitat: 'KARNIVORA TROPIS',
    sun: 'Suka tempat terang berudara basah & lembap.',
    water: 'Suka air hujan murni di tanah gambut hutan.',
    benefit: 'Piala penangkap serangga alami pengendali hama.',
    taleTitle: 'Piala Nektar Ajaib Penjaga Hutan',
    taleSubtitle: 'Kisah Kantong Perangkap Serangga',
    taleSummary:
      'Kantongnya yang licin memiliki nektar manis yang menarik serangga sebagai makanan utamanya!',
    originTitle: 'Asal Usul Kantong Semar',
    originFact:
      'Banyak ditemukan di hutan gambut pedalaman Kalimantan dan Sumatera!',
    pinX: 640,
    pinY: 280,
    pinLabel: 'Kalimantan, Indonesia',
    cardMeta: {
      badgeBg: '#ea580c',
      badgeBorder: 'border-orange-400',
      emoji: '🫙',
      tagText: 'Karnivora Tropis',
      subText: 'Piala Nektar Alami',
    },
  },
  baobab: {
    key: 'baobab',
    name: 'Pohon Baobab',
    latin: 'Adansonia',
    image: getFloraIllustration('baobab'),
    badge: '🌳 POHON BAOBAB',
    habitat: 'SAVANA EKSOTIS',
    sun: 'Suka terik matahari padang savana yang hangat.',
    water: 'Menyimpan ribuan liter air di batang raksasanya.',
    benefit: 'Pohon kehidupan penyedia air & peneduh hewan.',
    taleTitle: 'Pohon Botol Raksasa Kehidupan',
    taleSubtitle: 'Kisah Penyelamat Gurun dan Savana',
    taleSummary:
      'Batangnya yang membengkak tebal berfungsi seperti tangki air raksasa penahan kemarau!',
    originTitle: 'Asal Usul Baobab',
    originFact:
      'Berasal dari pulau eksotis Madagaskar dan padang savana benua Afrika!',
    pinX: 420,
    pinY: 340,
    pinLabel: 'Madagaskar',
    cardMeta: {
      badgeBg: '#b45309',
      badgeBorder: 'border-amber-500',
      emoji: '🌳',
      tagText: 'Savana Eksotis',
      subText: 'Pohon Botol Kehidupan',
    },
  },
  titan: {
    key: 'titan',
    name: 'Titan Arum',
    latin: 'Amorphophallus titanum',
    image: getFloraIllustration('titan'),
    badge: '🕯️ TITAN ARUM',
    habitat: 'FLORA LANGKA',
    sun: 'Tumbuh di lembah hutan tropis yang rindang.',
    water: 'Menyukai tanah humus hutan yang subur & basah.',
    benefit: 'Bunga tertinggi megah kebanggaan alam Indonesia.',
    taleTitle: 'Kisah Bunga Lilin Raksasa Tropis',
    taleSubtitle: 'Keajaiban Bunga Tertinggi di Bumi',
    taleSummary:
      'Bunga ini bisa tumbuh tinggi mencapai 3 meter melebihi tinggi manusia dewasa!',
    originTitle: 'Asal Usul Titan Arum',
    originFact:
      'Endemik asli dari hutan hujan tropis bukit barisan Sumatera!',
    pinX: 620,
    pinY: 295,
    pinLabel: 'Sumatera Utara',
    cardMeta: {
      badgeBg: '#a21caf',
      badgeBorder: 'border-fuchsia-400',
      emoji: '🕯️',
      tagText: 'Flora Langka',
      subText: 'Bunga Bangkai Tertinggi',
    },
  },
  venus: {
    key: 'venus',
    name: 'Venus Flytrap',
    latin: 'Dionaea muscipula',
    image: getFloraIllustration('venus'),
    badge: '🪴 VENUS FLYTRAP',
    habitat: 'KARNIVORA UNIK',
    sun: 'Suka cahaya terang di tanah rawa basah.',
    water: 'Membutuhkan air murni bebas mineral berlebih.',
    benefit: 'Perangkap rahang kilat pengendali lalat & laron.',
    taleTitle: 'Kisah Rahang Perangkap Kilat',
    taleSubtitle: 'Bunga Lincah Pemikat Lalat',
    taleSummary:
      'Daunnya memiliki rambut halus pemicu yang akan mengatup dalam 0.1 detik saat disentuh serangga!',
    originTitle: 'Asal Usul Venus Flytrap',
    originFact:
      'Berasal dari kawasan lahan basah pantai Karolina di Amerika Serikat!',
    pinX: 190,
    pinY: 160,
    pinLabel: 'Karolina, Amerika',
    cardMeta: {
      badgeBg: '#15803d',
      badgeBorder: 'border-emerald-400',
      emoji: '🪴',
      tagText: 'Karnivora Unik',
      subText: 'Perangkap Rahang Kilat',
    },
  },
  anggrek: {
    key: 'anggrek',
    name: 'Anggrek Bulan',
    latin: 'Phalaenopsis amabilis',
    image: getFloraIllustration('anggrek'),
    badge: '🌸 ANGGREK BULAN',
    habitat: 'PUSPA PESONA NUSANTARA',
    sun: 'Suka cahaya teduh di bawah naungan pohon rindang.',
    water: 'Cukup semprot embun pagi pada akar udaranya.',
    benefit: 'Bunga Puspa Pesona kebanggaan Indonesia yang anggun.',
    taleTitle: 'Kisah Kelopak Putih Sang Puspa Pesona',
    taleSubtitle: 'Keanggunan Anggrek Bulan di Dahan Hutan',
    taleSummary:
      'Kelopaknya yang putih bersih tampak bersinar lembut seperti bulan purnama yang mekar selama berbulan-bulan!',
    originTitle: 'Asal Usul Anggrek Bulan',
    originFact:
      'Tumbuh alami di hutan tropis kepulauan Nusantara dan dinobatkan sebagai Puspa Pesona Indonesia!',
    pinX: 655,
    pinY: 285,
    pinLabel: 'Kepulauan Nusantara',
    cardMeta: {
      badgeBg: '#db2777',
      badgeBorder: 'border-pink-300',
      emoji: '🌸',
      tagText: 'Puspa Pesona',
      subText: 'Anggun & Tahan Lama',
    },
  },
  sakura: {
    key: 'sakura',
    name: 'Bunga Sakura',
    latin: 'Prunus serrulata',
    image: getFloraIllustration('sakura'),
    badge: '🌸 BUNGA SAKURA',
    habitat: 'TAMAN MUSIM SEMI',
    sun: 'Mekar serentak menyambut hangatnya matahari musim semi!',
    water: 'Menyukai tanah lembap sejuk di lereng perbukitan.',
    benefit: 'Simbol keindahan musim semi & persahabatan ceria.',
    taleTitle: 'Hujan Kelopak Merah Muda di Musim Semi',
    taleSubtitle: 'Kisah Pohon Sakura yang Mekar Bersama',
    taleSummary:
      'Saat angin musim semi berembus lembut, kelopak merah muda sakura beterbangan indah bak salju merah muda!',
    originTitle: 'Asal Usul Bunga Sakura',
    originFact:
      'Berasal dari kawasan Asia Timur khususnya Jepang yang terkenal dengan tradisi melihat bunga mekar (Hanami)!',
    pinX: 705,
    pinY: 145,
    pinLabel: 'Jepang, Asia Timur',
    cardMeta: {
      badgeBg: '#ec4899',
      badgeBorder: 'border-pink-300',
      emoji: '🌸',
      tagText: 'Musim Semi',
      subText: 'Kelopak Merah Muda',
    },
  },
};
