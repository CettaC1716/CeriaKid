export interface AnimalTag {
  label: string;
  icon: string;
  class: string;
  fact: string;
}

export interface QuickFact {
  icon: string;
  title: string;
  text: string;
  border: string;
  bg: string;
}

export interface AnimalStory {
  title: string;
  caption: string;
  text: string;
}

export interface AnimalData {
  id: string;
  name: string;
  latin: string;
  breadcrumb: string;
  emoji: string;
  img: string;
  soundBtnText: string;
  storyBtnText: string;
  toastMsg: string;
  bannerFact: string;
  isLocked?: boolean;
  habitat?: string;
  tags: AnimalTag[];
  quickFacts: QuickFact[];
  story: AnimalStory;
}

export interface MapPoint {
  x: number;
  y: number;
  label: string;
  desc: string;
}

export interface MapRegion {
  regionName: string;
  ocean: string;
  biome: string;
  pathD: string;
  points: MapPoint[];
}

export const ANIMAL_DATA: Record<string, AnimalData> = {
  singa: {
    id: 'singa',
    name: "Singa Afrika",
    latin: "Panthera leo",
    breadcrumb: "Singa",
    emoji: "🦁",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_1_07e95158.jpg',
    soundBtnText: "Dengar Auman Asli 🦁",
    storyBtnText: "Putar Dongeng Suara Rimba 📖",
    toastMsg: "🦁 Singa Afrika terpilih! Sang Raja Savana yang gagah perkasa.",
    bannerFact: "🦁 Auman singa jantan bisa terdengar menggelegar hingga sejauh 8 kilometer!",
    tags: [
      { label: "Raja Savana Afrika", icon: "sparkles", class: "bg-amber-100/20 text-amber-500 border-amber-300/30", fact: "Raja Savana = Pemimpin gagah dan pelindung kawanan di sabana rumput Afrika! 👑" },
      { label: "Mamalia Savana", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Mamalia = Hewan berdarah panas yang menyusui anak-anaknya yang lucu! 🐾" },
      { label: "Karnivora", icon: "sound", class: "bg-orange-900/30 text-orange-200 border-orange-500/30", fact: "Karnivora = Hewan hebat pemakan daging segar bernutrisi tinggi! 🥩" },
      { label: "Edisi Penjelajah Satwa", icon: "stars", class: "bg-sky-900/30 text-sky-200 border-sky-500/30", fact: "Edisi Penjelajah = Seri panduan edukasi interaktif khusus adik-adik pintar! 🧭" }
    ],
    quickFacts: [
      { icon: "🥩", title: "Makanan", text: 'Daging segar bersama kawanan (<strong class="text-[#ffc880] font-bold">Pride</strong>).', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "💤", title: "Kebiasaan", text: 'Tidur santai hingga <strong class="text-[#ffc880] font-bold">20 jam</strong> setiap hari!', border: "border-orange-500/25", bg: "bg-orange-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Padang savana & padang rumput terbuka <strong class="text-[#69bdff] font-bold">Afrika</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Kisah Leo Si Singa Pemberani",
      caption: "Leo & Matahari Savana 🌅",
      text: "Di sebuah padang savana yang sangat luas di benua Afrika, hiduplah seekor anak singa pemberani bernama Leo. Setiap pagi, Leo belajar mengaum dengan gagah bersama ayahnya sang Raja Rimba untuk menjaga kedamaian padang rumput."
    }
  },
  gajah: {
    id: 'gajah',
    name: "Gajah Afrika",
    latin: "Loxodonta",
    breadcrumb: "Gajah",
    emoji: "🐘",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_3_ea563a3d.jpg',
    soundBtnText: "Dengar Lengking Belalai 🐘",
    storyBtnText: "Putar Kisah Si Belalai Panjang 📖",
    toastMsg: "🐘 Gajah Afrika terpilih! Raksasa ramah berhati lembut dengan daya ingat luar biasa.",
    bannerFact: "🐘 Gajah menyapa kawanannya dengan lengkingan terompet belalai dan getaran tanah!",
    tags: [
      { label: "Raksasa Ramah", icon: "stars", class: "bg-sky-100/20 text-sky-500 border-sky-300/30", fact: "Raksasa Ramah = Hewan darat terbesar di bumi yang memiliki hati penuh kasih! 🐘" },
      { label: "Mamalia Savana", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Gajah menyayangi bayinya dan hidup berkeluarga rukun dipimpin gajah tertua! 🐾" },
      { label: "Herbivora", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Herbivora = Pemakan tumbuhan, daun rindang, dan buah lezat dari pohon! 🌿" },
      { label: "Pintar & Penyayang", icon: "check", class: "bg-amber-900/30 text-amber-200 border-amber-500/30", fact: "Gajah memiliki ingatan super tajam dan tak pernah melupakan jalur sumber air! 🧠" }
    ],
    quickFacts: [
      { icon: "🌿", title: "Makanan", text: 'Rumput, dahan pohon manis & <strong class="text-[#ffc880] font-bold">buah segar</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "💧", title: "Kebiasaan", text: 'Suka <strong class="text-[#69bdff] font-bold">mandi semprot air</strong> bersama kawanan sejuk!', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Savana terbuka & hutan rimba hijau <strong class="text-[#ffc880] font-bold">Afrika</strong>.', border: "border-amber-500/25", bg: "bg-amber-500/20" }
    ],
    story: {
      title: "Kisah Tembo & Air Terjun Pelangi",
      caption: "Tembo & Percikan Air Segar 💦",
      text: "Tembo adalah anak gajah Afrika yang ceria dengan belalai yang sangat lincah. Suatu hari, Tembo memimpin seluruh kawanannya menemukan mata air jernih dan menyemprotkan air sejuk membuat pelangi indah di langit savana."
    }
  },
  panda: {
    id: 'panda',
    name: "Panda Raksasa",
    latin: "Ailuropoda melanoleuca",
    breadcrumb: "Panda",
    emoji: "🐼",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_4_64458ab7.jpg',
    soundBtnText: "Dengar Kunyah Bambu 🐼",
    storyBtnText: "Putar Dongeng Petualangan Panda 📖",
    toastMsg: "🐼 Panda Raksasa terpilih! Si beruang lucu pecinta rebung dan pelukan hangat.",
    bannerFact: "🐼 Panda bisa mengunyah bambu renyah selama 12 jam sehari tanpa rasa bosan!",
    tags: [
      { label: "Beruang Bambu Damai", icon: "check", class: "bg-emerald-100/20 text-emerald-500 border-emerald-300/30", fact: "Beruang Bambu = Sahabat pecinta kedamaian yang berbulu tebal hitam putih! 🎋" },
      { label: "Mamalia Pegunungan", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Hidup di pegunungan berkabut yang sejuk dan tenang di Asia timur! 🏔️" },
      { label: "Herbivora", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Makanan utamanya hampir seluruhnya adalah batang dan daun bambu renyah! 🎍" },
      { label: "Suka Bermain", icon: "stars", class: "bg-sky-900/30 text-sky-200 border-sky-500/30", fact: "Panda suka berguling di rumput lereng bukit seperti bola berbulu lucu! ⚽" }
    ],
    quickFacts: [
      { icon: "🎋", title: "Makanan", text: 'Batang & daun bambu segar <strong class="text-[#ffc880] font-bold">12 kg per hari</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "💤", title: "Kebiasaan", text: 'Suka <strong class="text-[#ffc880] font-bold">memanjat pohon</strong> & tidur di dahan rindang.', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Hutan bambu pegunungan berkabut <strong class="text-[#69bdff] font-bold">Sichuan</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Bao Bao Si Panda Pemanjat Bambu",
      caption: "Bao Bao & Hutan Bambu Hijau 🎋",
      text: "Di tengah kabut sejuk pegunungan hijau, Bao Bao anak panda mungil senang melompat ke dahan bambu tinggi. Bersama ibunya, ia menikmati rebung renyah terlezat sambil bersenandung riang di bawah pohon cemara."
    }
  },
  jerapah: {
    id: 'jerapah',
    name: "Jerapah Savana",
    latin: "Giraffa camelopardalis",
    breadcrumb: "Jerapah",
    emoji: "🦒",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_5_1d32a14f.jpg',
    soundBtnText: "Dengar Dengung Lembut 🦒",
    storyBtnText: "Putar Kisah Menatap Bintang 📖",
    toastMsg: "🦒 Jerapah Savana terpilih! Penjaga langit rimba yang tinggi semampai dan anggun.",
    bannerFact: "🦒 Leher jerapah bisa mencapai 2 meter panjangnya untuk menjangkau pucuk daun akasia!",
    tags: [
      { label: "Penjaga Langit Rimba", icon: "stars", class: "bg-amber-100/20 text-amber-500 border-amber-300/30", fact: "Dengan lehernya yang tinggi, jerapah bisa melihat pemandangan savana dari kejauhan! 🦒" },
      { label: "Mamalia Tertinggi", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Hewan darat paling menjulang di seluruh dunia dengan corak totol indah! 🌟" },
      { label: "Herbivora", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Lidah ungunya yang panjang bisa mengambil daun berduri tanpa terluka! 🍃" },
      { label: "Leher Panjang", icon: "check", class: "bg-sky-900/30 text-sky-200 border-sky-500/30", fact: "Meskipun lehernya sangat panjang, jumlah ruas tulangnya sama dengan leher manusia! 🦴" }
    ],
    quickFacts: [
      { icon: "🍃", title: "Makanan", text: 'Pucuk manis <strong class="text-[#ffc880] font-bold">daun akasia</strong> di dahan teratas.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "👁️", title: "Kebiasaan", text: 'Tidur sambil <strong class="text-[#ffc880] font-bold">berdiri tegak</strong> hanya sebentar saja!', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Padang savana terbuka luas di <strong class="text-[#69bdff] font-bold">Afrika</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Gigi Jerapah yang Menatap Bintang",
      caption: "Gigi Menatap Langit Malam 🌟",
      text: "Gigi si jerapah cilik memiliki leher yang anggun. Setiap senja tiba, Gigi suka mengangkat kepalanya tinggi ke atas awan emas untuk menyapa bintang pertama yang bersinar terang di cakrawala Afrika."
    }
  },
  harimau: {
    id: 'harimau',
    name: "Harimau Belang",
    latin: "Panthera tigris",
    breadcrumb: "Harimau",
    emoji: "🐅",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_2_83723c3c.jpg',
    soundBtnText: "Dengar Geraman Rimba 🐅",
    storyBtnText: "Putar Kisah Jejak Emas di Hutan 📖",
    toastMsg: "🐅 Harimau Belang terpilih! Kucing terbesar rimba dengan loreng emas mempesona.",
    bannerFact: "🐅 Pola garis loreng harimau unik seperti sidik jari manusia, tidak ada yang kembar!",
    tags: [
      { label: "Pemburu Belang Hebat", icon: "stars", class: "bg-orange-100/20 text-orange-500 border-orange-300/30", fact: "Loreng harimau membantunya berkamuflase sempurna di antara bayang dedaunan! 🌿" },
      { label: "Kucing Terbesar", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Spesies kucing terkuat dan paling gagah di hutan belantara dunia! 🐾" },
      { label: "Karnivora", icon: "sound", class: "bg-orange-900/30 text-orange-200 border-orange-500/30", fact: "Memiliki cakar yang kokoh dan langkah kaki yang sangat senyap saat melangkah! 🥩" },
      { label: "Pemberani", icon: "shield", class: "bg-sky-900/30 text-sky-200 border-sky-500/30", fact: "Berani dan sangat suka berenang di sungai yang jernih saat siang hari! 🏊" }
    ],
    quickFacts: [
      { icon: "🥩", title: "Makanan", text: 'Berburu di <strong class="text-[#ffc880] font-bold">malam hari</strong> yang sejuk dan sunyi.', border: "border-orange-500/25", bg: "bg-orange-500/20" },
      { icon: "🏊", title: "Kebiasaan", text: 'Senang <strong class="text-[#69bdff] font-bold">berenang & bermain air</strong> di sungai dingin!', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Hutan hujan tropis & sabana lebat <strong class="text-[#ffc880] font-bold">Asia</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" }
    ],
    story: {
      title: "Raja Harimau dan Sungai Berkilau",
      caption: "Raja Harimau di Sungai Hutan 🌊",
      text: "Di tengah rimbunnya pohon hutan hujan yang rimbun, Raja si anak harimau berlari gesit. Berbeda dengan kucing biasa, Raja sangat suka melompat ke danau air tawar dan bermain cipratan air bersama sahabat burung enggang."
    }
  },
  kanguru: {
    id: 'koala',
    name: "Koala Australia",
    latin: "Phascolarctos cinereus",
    breadcrumb: "Koala",
    emoji: "🐨",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_14_ff5ecc05.jpg',
    soundBtnText: "Dengar Suara Koala",
    storyBtnText: "Putar Dongeng",
    toastMsg: "Koala Australia terpilih! Pemanjat pohon eukaliptus yang menggemaskan.",
    bannerFact: "Koala menghabiskan hingga 18 jam sehari beristirahat dengan nyaman di dahan pohon eukaliptus!",
    tags: [
      { label: "Sahabat Eukaliptus", icon: "stars", class: "bg-amber-100/20 text-amber-500 border-amber-300/30", fact: "Koala sangat menyukai daun eukaliptus segar di hutan Australia!" },
      { label: "Hewan Berkantung", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Marsupialia istimewa yang menggendong bayinya dengan hangat!" },
      { label: "Herbivora", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Makan pucuk daun eukaliptus yang kaya air sehingga jarang minum!" }
    ],
    quickFacts: [
      { icon: "🍃", title: "Makanan", text: 'Pucuk daun <strong class="text-[#ffc880] font-bold">eukaliptus</strong> segar.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "💤", title: "Kebiasaan", text: 'Tidur nyaman di <strong class="text-[#ffc880] font-bold">dahan pohon</strong> hingga 18 jam!', border: "border-orange-500/25", bg: "bg-orange-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Hutan eukaliptus pesisir timur <strong class="text-[#69bdff] font-bold">Australia</strong>.', border: "border-amber-500/25", bg: "bg-amber-500/20" }
    ],
    story: {
      title: "Koko Si Koala Pohon Eukaliptus",
      caption: "Koko di Dahan Eukaliptus",
      text: "Di puncak pohon eukaliptus yang sejuk di Australia, Koko si anak koala memeluk dahan kayu sambil menikmati pucuk daun harum bersama bundanya di bawah sinar matahari pagi."
    }
  },
  lumbalumba: {
    id: 'lumbalumba',
    name: "Lumba-lumba Samudra",
    latin: "Delphinidae",
    breadcrumb: "Lumba-lumba",
    emoji: "🐬",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_10_41ea0daa.jpg',
    soundBtnText: "Dengar Siulan Ceria 🐬",
    storyBtnText: "Putar Kisah Menari di Ombak 📖",
    toastMsg: "🐬 Lumba-lumba Samudra terpilih! Sahabat cerdas laut yang gemar melompat gembira.",
    bannerFact: "🐬 Lumba-lumba saling memanggil dengan siulan khas seperti nama panggilan unik!",
    tags: [
      { label: "Sahabat Cerdas Laut", icon: "stars", class: "bg-sky-100/20 text-sky-500 border-sky-300/30", fact: "Memiliki kepintaran tinggi dan rasa ingin tahu yang besar terhadap petualangan! 🐬" },
      { label: "Mamalia Laut", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Bernapas memakai lubang sembur di atas kepalanya saat naik ke permukaan! 💨" },
      { label: "Karnivora Ikan", icon: "sound", class: "bg-sky-900/30 text-sky-200 border-sky-500/30", fact: "Suka berburu ikan kecil bersama kawanannya dengan formasi kompak! 🐟" },
      { label: "Lincah & Ramah", icon: "stars", class: "bg-amber-900/30 text-amber-200 border-amber-500/30", fact: "Sering melompat salto gembira di sebelah kapal pelaut yang melintas! ⛵" }
    ],
    quickFacts: [
      { icon: "🐟", title: "Makanan", text: 'Ikan-ikan kecil lincah & <strong class="text-[#69bdff] font-bold">cumi-cumi segar</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🌊", title: "Kebiasaan", text: 'Suka <strong class="text-[#ffc880] font-bold">melompat salto</strong> di permukaan ombak laut!', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Samudra biru hangat & <strong class="text-[#ffc880] font-bold">terumbu karang</strong> tropis.', border: "border-sky-700/25", bg: "bg-sky-700/20" }
    ],
    story: {
      title: "Lili Lumba-lumba Menari di Ombak",
      caption: "Lili & Ombak Samudra Biru 🌊",
      text: "Di birunya samudra tropis yang jernih, Lili si lumba-lumba mungil berenang cepat bersama keluarganya. Setiap kali ombak besar bergulung, Lili meluncur tinggi ke udara berputar anggun menyapa burung camar."
    }
  },
  beruangkutub: {
    id: 'beruangkutub',
    name: "Beruang Kutub",
    latin: "Ursus maritimus",
    breadcrumb: "Beruang Kutub",
    emoji: "🐻‍❄️",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_8_fa137938.jpg',
    soundBtnText: "Dengar Langkah Es 🐻‍❄️",
    storyBtnText: "Putar Kisah Raja Es Arktik 📖",
    toastMsg: "🐻‍❄️ Beruang Kutub terpilih! Penjelajah salju Arktik berbulu tebal hangat.",
    bannerFact: "🐻‍❄️ Beruang kutub bisa berenang tanpa henti sejauh puluhan kilometer di lautan Arktik!",
    isLocked: false,
    habitat: "Kutub Arktik",
    tags: [
      { label: "Penjelajah Es Arktik", icon: "sparkles", class: "bg-sky-100/20 text-sky-300 border-sky-300/30", fact: "Bulu putih tebalnya menjaga tubuh tetap hangat di tengah salju kutub utara! ❄️" },
      { label: "Perenang Ulung", icon: "book", class: "bg-stone-800/40 text-stone-200 border-white/10", fact: "Telapak kakinya yang lebar membantu berenang lincah di air dingin! 🌊" },
      { label: "Mamalia Kutub", icon: "shield", class: "bg-amber-900/30 text-amber-200 border-amber-500/30", fact: "Memiliki indra penciuman yang sangat tajam di hamparan salju! 🐻‍❄️" }
    ],
    quickFacts: [
      { icon: "🐟", title: "Makanan", text: 'Ikan laut Arktik & penghuni <strong class="text-[#69bdff] font-bold">pesisir es</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🏊", title: "Kebiasaan", text: 'Jago <strong class="text-[#ffc880] font-bold">berenang jauh</strong> di antara bongkahan es!', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "❄️", title: "Habitat Asli", text: 'Hamparan es abadi di <strong class="text-[#69bdff] font-bold">Lingkar Arktik Utara</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Kori Si Beruang Kutub & Cahaya Aurora",
      caption: "Kori di Bawah Langit Aurora ❄️",
      text: "Di hamparan salju putih Kutub Utara, Kori si beruang kutub kecil senang meluncur di atas bukit es. Saat malam tiba, Kori menatap cahaya Aurora hijau dan ungu yang menari indah di langit Arktik."
    }
  },
  pandamerah: {
    id: 'pandamerah',
    name: "Panda Merah",
    latin: "Ailurus fulgens",
    breadcrumb: "Panda Merah",
    emoji: "🦊",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_6_11ad8ca8.jpg',
    soundBtnText: "Dengar Suara Gunung 🦊",
    storyBtnText: "Putar Kisah Si Bulu Jingga 📖",
    toastMsg: "🦊 Panda Merah terpilih! Pemanjat pohon lincah berekor belang dari Himalaya.",
    bannerFact: "🦊 Panda merah menggunakan ekor tebalnya sebagai selimut hangat saat tidur di dahan!",
    isLocked: false,
    habitat: "Pegunungan Himalaya",
    tags: [
      { label: "Akrobat Pohon", icon: "stars", class: "bg-orange-100/20 text-orange-300 border-orange-300/30", fact: "Sangat tangkas memanjat dahan pohon tinggi di hutan pegunungan! 🌲" },
      { label: "Ekor Selimut", icon: "home", class: "bg-amber-900/30 text-amber-200 border-amber-500/30", fact: "Ekor belangnya yang lebat dipakai membungkus tubuh saat cuaca dingin! 🧣" },
      { label: "Pecinta Daun Muda", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Suka makan pucuk daun bambu muda, buah beri, dan apel hutan! 🍎" }
    ],
    quickFacts: [
      { icon: "🎋", title: "Makanan", text: 'Pucuk daun bambu & <strong class="text-[#ffc880] font-bold">buah beri manis</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "🧣", title: "Kebiasaan", text: 'Melingkarkan <strong class="text-[#ffc880] font-bold">ekor lebat</strong> bak bantal hangat!', border: "border-orange-500/25", bg: "bg-orange-500/20" },
      { icon: "🏔️", title: "Habitat Asli", text: 'Hutan pegunungan sejuk <strong class="text-[#69bdff] font-bold">Himalaya</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Momo Si Panda Merah Berekor Belang",
      caption: "Momo di Dahan Pohon Cemara 🌲",
      text: "Momo memiliki bulu berwarna merah kecokelatan yang sangat lembut dan ekor belang yang panjang. Setiap sore, Momo melompat dari satu dahan ke dahan lain mencari buah beri manis bersama sahabat burung gunung."
    }
  },
  komodo: {
    id: 'komodo',
    name: "Naga Komodo",
    latin: "Varanus komodoensis",
    breadcrumb: "Komodo",
    emoji: "🦎",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_7_fe3652cf.jpg',
    soundBtnText: "Dengar Desis Naga 🦎",
    storyBtnText: "Putar Kisah Kadal Raksasa Purba 📖",
    toastMsg: "🦎 Naga Komodo terpilih! Satwa purba kebanggaan Indonesia dari Kepulauan NTT.",
    bannerFact: "🦎 Komodo adalah kadal terbesar di dunia yang hanya hidup alami di Indonesia!",
    isLocked: false,
    habitat: "Pulau Komodo & Flores NTT",
    tags: [
      { label: "Kebanggaan Indonesia", icon: "sparkles", class: "bg-amber-100/20 text-amber-400 border-amber-300/30", fact: "Satwa endemik asli Nusantara yang dilindungi di Taman Nasional Komodo! 🇮🇩" },
      { label: "Reptil Terbesar", icon: "shield", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Kadal purba raksasa dengan kulit bersisik kuat seperti baju zirah! 🦎" },
      { label: "Penciuman Tajam", icon: "check", class: "bg-sky-900/30 text-sky-200 border-sky-500/30", fact: "Menggunakan lidah bercabang untuk mencium aroma dari jarak jauh! 🧭" }
    ],
    quickFacts: [
      { icon: "☀️", title: "Kebiasaan", text: 'Suka <strong class="text-[#ffc880] font-bold">berjemur matahari pagi</strong> di bukit sabana.', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🏊", title: "Keahlian", text: 'Bisa <strong class="text-[#69bdff] font-bold">berenang menyeberang</strong> antar pulau dekat!', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🇮🇩", title: "Habitat Asli", text: 'Pulau Komodo, Rinca & Flores <strong class="text-[#ffc880] font-bold">Nusa Tenggara</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" }
    ],
    story: {
      title: "Kodo Sang Penjaga Pulau Sabana NTT",
      caption: "Kodo & Bukit Sabana Flores 🏝️",
      text: "Di Pulau Komodo yang dikelilingi laut biru dan pantai pasir merah muda, hiduplah Kodo sang kadal raksasa ramah. Setiap pagi Kodo naik ke puncak bukit sabana untuk berjemur menikmati hangatnya mentari Nusantara."
    }
  },
  zebra: {
    id: 'zebra',
    name: "Zebra Savana",
    latin: "Equus quagga",
    breadcrumb: "Zebra",
    emoji: "🦓",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_12_4b859a37.jpg',
    soundBtnText: "Dengar Ringkikan Zebra",
    storyBtnText: "Putar Dongeng",
    toastMsg: "Zebra Savana terpilih! Kuda belang hitam putih yang berlari lincah di padang rumput.",
    bannerFact: "Setiap zebra memiliki pola garis hitam putih yang unik dan berbeda satu sama lain!",
    isLocked: false,
    habitat: "Savana Afrika",
    tags: [
      { label: "Belang Hitam Putih", icon: "sparkles", class: "bg-amber-100/20 text-amber-400 border-amber-300/30", fact: "Garis hitam putihnya mengecoh pandangan pemangsa di padang savana!" },
      { label: "Pelari Tangguh", icon: "check", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Selalu hidup berdampingan dengan kawanan jerapah dan rusa savana!" }
    ],
    quickFacts: [
      { icon: "🌾", title: "Makanan", text: 'Rumput savana segar & <strong class="text-[#ffc880] font-bold">tunas daun muda</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "🦓", title: "Kebiasaan", text: 'Berlari kompak dalam <strong class="text-[#ffc880] font-bold">kawanan besar</strong> yang rukun!', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🌍", title: "Habitat Asli", text: 'Padang rumput savana luas <strong class="text-[#69bdff] font-bold">Afrika Timur</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Ziko Si Zebra Belang yang Lincah",
      caption: "Ziko di Padang Rumput Afrika",
      text: "Ziko adalah anak zebra ceria yang bangga dengan baju belang hitam putihnya. Setiap pagi, Ziko berlari gembira melintasi padang rumput savana sambil bermain kejar-kejaran bersama sahabat jerapah."
    }
  },
  monyet: {
    id: 'monyet',
    name: "Monyet Rimba",
    latin: "Macaca fascicularis",
    breadcrumb: "Monyet",
    emoji: "🐒",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_13_792d2dee.jpg',
    soundBtnText: "Dengar Suara Monyet",
    storyBtnText: "Putar Dongeng",
    toastMsg: "Monyet Rimba terpilih! Penjelajah dahan hutan tropis yang cerdas dan lincah.",
    bannerFact: "Monyet menggunakan ekor panjangnya untuk menjaga keseimbangan saat melompat di dahan pohon!",
    isLocked: false,
    habitat: "Hutan Hujan Tropis",
    tags: [
      { label: "Pemanjat Lincah", icon: "stars", class: "bg-amber-100/20 text-amber-400 border-amber-300/30", fact: "Berayun dengan cekatan dari satu dahan pohon ke pohon lainnya!" },
      { label: "Pecinta Buah", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Sangat suka buah pisang manis dan membantu menyebarkan biji pohon hutan!" }
    ],
    quickFacts: [
      { icon: "🍌", title: "Makanan", text: 'Buah <strong class="text-[#ffc880] font-bold">pisang manis</strong>, biji-bijian & pucuk daun.', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🌳", title: "Kebiasaan", text: 'Tangkas <strong class="text-[#ffc880] font-bold">berayun di dahan</strong> pohon rimbun!', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "🌴", title: "Habitat Asli", text: 'Hutan hujan tropis hijau di <strong class="text-[#69bdff] font-bold">Asia Tenggara</strong>.', border: "border-sky-500/25", bg: "bg-sky-500/20" }
    ],
    story: {
      title: "Miko Si Monyet Ceria dan Pisang Emas",
      caption: "Miko di Kanopi Hutan Tropis",
      text: "Di atas dahan pohon hutan tropis yang teduh, Miko si monyet kecil gemar berbagi buah pisang manis dengan teman-temannya. Setelah kenyang, Miko berayun lincah di akar gantung sambil tertawa riang."
    }
  },
  penyu: {
    id: 'penyu',
    name: "Penyu Hijau",
    latin: "Chelonia mydas",
    breadcrumb: "Penyu",
    emoji: "🐢",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_11_66fb9f33.jpg',
    soundBtnText: "Dengar Suara Laut",
    storyBtnText: "Putar Dongeng",
    toastMsg: "Penyu Hijau terpilih! Penjelajah samudra purba yang anggun di terumbu karang.",
    bannerFact: "Penyu laut dapat mengarungi samudra ribuan kilometer dan kembali ke pantai tempat ia menetas!",
    isLocked: false,
    habitat: "Terumbu Karang Tropis",
    tags: [
      { label: "Penjelajah Samudra", icon: "sparkles", class: "bg-sky-100/20 text-sky-300 border-sky-300/30", fact: "Sirip depannya yang lebar bekerja seperti sayap untuk melayang di dalam laut!" },
      { label: "Penjaga Lamun", icon: "leaf", class: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30", fact: "Menjaga kesehatan padang rumput laut dan terumbu karang Nusantara!" }
    ],
    quickFacts: [
      { icon: "🌿", title: "Makanan", text: 'Rumput laut segar (<strong class="text-[#ffc880] font-bold">lamun</strong>) & alga hijau.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" },
      { icon: "🌊", title: "Kebiasaan", text: 'Berenang tenang melintasi <strong class="text-[#69bdff] font-bold">terumbu karang</strong>!', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🏝️", title: "Habitat Asli", text: 'Laut tropis hangat & pesisir <strong class="text-[#ffc880] font-bold">Nusantara</strong>.', border: "border-amber-500/25", bg: "bg-amber-500/20" }
    ],
    story: {
      title: "Tuka Si Penyu Penjaga Terumbu Karang",
      caption: "Tuka di Taman Bawah Laut",
      text: "Tuka si penyu kecil memiliki tempurung bercorak indah. Setiap hari, Tuka berenang anggun di antara terumbu karang warna-warni sambil menyapa ikan badut dan bintang laut yang ramah."
    }
  },
  berangberang: {
    id: 'berangberang',
    name: "Berang-berang Laut",
    latin: "Enhydra lutris",
    breadcrumb: "Berang-berang",
    emoji: "🦦",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_9_2765888d.jpg',
    soundBtnText: "Dengar Cicit Ceria",
    storyBtnText: "Putar Dongeng",
    toastMsg: "Berang-berang Laut terpilih! Perenang menggemaskan yang suka mengapung santai.",
    bannerFact: "Berang-berang laut suka berpegangan tangan saat tidur mengapung agar tidak terpisah oleh arus!",
    isLocked: false,
    habitat: "Pesisir Laut & Hutan Kelp",
    tags: [
      { label: "Perenang Mengapung", icon: "stars", class: "bg-sky-100/20 text-sky-300 border-sky-300/30", fact: "Ahli mengapung telentang di permukaan air yang tenang!" },
      { label: "Bulu Super Lebat", icon: "shield", class: "bg-amber-900/30 text-amber-200 border-amber-500/30", fact: "Memiliki bulu paling tebal untuk menjaga tubuh tetap hangat di air!" }
    ],
    quickFacts: [
      { icon: "🐚", title: "Makanan", text: 'Kerang laut, kepiting kecil & <strong class="text-[#ffc880] font-bold">bintang laut</strong>.', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🤝", title: "Kebiasaan", text: 'Tidur <strong class="text-[#69bdff] font-bold">mengapung telentang</strong> sambil berpegangan!', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🌊", title: "Habitat Asli", text: 'Hutan rumput laut raksasa di <strong class="text-[#ffc880] font-bold">Pasifik Utara</strong>.', border: "border-emerald-500/25", bg: "bg-emerald-500/20" }
    ],
    story: {
      title: "Oti Si Berang-berang yang Suka Mengapung",
      caption: "Oti di Teluk Biru yang Tenang",
      text: "Oti si berang-berang mungil sangat pandai berenang telentang di teluk biru. Sambil berjemur hangat di permukaan air, Oti menyimpan batu kesayangannya untuk membuka kerang bersama sahabatnya."
    }
  },
  rubah: {
    id: 'rubah',
    name: "Rubah Gurun",
    latin: "Vulpes zerda",
    breadcrumb: "Rubah Gurun",
    emoji: "🦊",
    img: '/assets/aistudio/Generated_Image_October_24__2026_-_1_47AM_15_db7c2c0d.jpg',
    soundBtnText: "Dengar Suara Rubah",
    storyBtnText: "Putar Dongeng",
    toastMsg: "Rubah Gurun terpilih! Si mungil bertelinga lebar penjelajah bukit pasir.",
    bannerFact: "Telinga lebar rubah gurun membantunya mendengar suara langkah kecil di bawah pasir dan menyejukkan tubuh!",
    isLocked: false,
    habitat: "Gurun Pasir Sahara",
    tags: [
      { label: "Telinga Radar", icon: "sparkles", class: "bg-amber-100/20 text-amber-400 border-amber-300/30", fact: "Telinga besarnya menjaga tubuh tetap sejuk di bawah terik matahari gurun!" },
      { label: "Penjelajah Pasir", icon: "check", class: "bg-orange-900/30 text-orange-200 border-orange-500/30", fact: "Telapak kakinya berbulu lembut agar nyaman berjalan di atas pasir hangat!" }
    ],
    quickFacts: [
      { icon: "🍒", title: "Makanan", text: 'Buah beri gurun, umbi akar & <strong class="text-[#ffc880] font-bold">serangga kecil</strong>.', border: "border-amber-500/25", bg: "bg-amber-500/20" },
      { icon: "🌙", title: "Kebiasaan", text: 'Aktif bermain saat <strong class="text-[#69bdff] font-bold">sore & malam</strong> yang sejuk!', border: "border-sky-500/25", bg: "bg-sky-500/20" },
      { icon: "🏜️", title: "Habitat Asli", text: 'Bukit pasir keemasan di <strong class="text-[#ffc880] font-bold">Gurun Sahara</strong>.', border: "border-orange-500/25", bg: "bg-orange-500/20" }
    ],
    story: {
      title: "Fini Si Rubah Gurun Bertelinga Lebar",
      caption: "Fini di Oasis Padang Pasir",
      text: "Di bukit pasir keemasan dekat oasis yang sejuk, Fini si rubah gurun mungil menggerakkan telinga lebarnya yang lucu. Saat senja tiba, Fini melompat lincah mencari buah manis di sekitar pohon palem."
    }
  }
};

export const MAP_REGISTRY: Record<string, MapRegion> = {
  singa: {
    regionName: 'AFRIKA',
    ocean: 'Samudra Atlantik & Hindia',
    biome: 'Savana Terbuka & Rerumputan Afrika',
    pathD: 'M 180 70 C 220 50, 310 60, 340 90 C 370 120, 390 140, 380 180 C 370 200, 395 210, 420 230 C 400 250, 380 260, 350 260 C 340 280, 350 310, 330 350 C 310 390, 270 430, 250 450 C 240 440, 230 400, 210 370 C 190 340, 180 300, 180 260 C 160 250, 140 230, 120 220 C 110 200, 100 170, 130 140 C 150 120, 170 110, 180 70 Z',
    points: [
      { x: 355, y: 275, label: 'Serengeti (Tanzania)', desc: 'Padang sabana luas tempat kawanan singa berburu zebra dan wildebeest!' },
      { x: 368, y: 250, label: 'Masai Mara (Kenya)', desc: 'Habitat savana legendaris tempat singa merajai padang rumput!' },
      { x: 310, y: 465, label: 'TN Kruger (Afsel)', desc: 'Kawasan konservasi alam megah dengan populasi singa terbesar!' },
      { x: 272, y: 410, label: 'Delta Okavango (Botswana)', desc: 'Oase perairan rawa savana tempat singa berenang dan berburu!' }
    ]
  },
  gajah: {
    regionName: 'AFRIKA TIMUR & SELATAN',
    ocean: 'Pesisir Samudra Hindia Afrika',
    biome: 'Sabana Rindang & Hutan Belantara Akasia',
    pathD: 'M 180 70 C 220 50, 310 60, 340 90 C 370 120, 390 140, 380 180 C 370 200, 395 210, 420 230 C 400 250, 380 260, 350 260 C 340 280, 350 310, 330 350 C 310 390, 270 430, 250 450 C 240 440, 230 400, 210 370 C 190 340, 180 300, 180 260 C 160 250, 140 230, 120 220 C 110 200, 100 170, 130 140 C 150 120, 170 110, 180 70 Z',
    points: [
      { x: 360, y: 265, label: 'TN Amboseli (Kenya)', desc: 'Pemandangan spektakuler kawanan gajah di bawah Gunung Kilimanjaro!' },
      { x: 280, y: 395, label: 'TN Chobe (Botswana)', desc: 'Konsentrasi kawanan gajah Afrika terpadat di dunia!' },
      { x: 300, y: 475, label: 'TN Addo Elephant', desc: 'Cagar alam perlindungan satwa gajah tertua di Afrika Selatan.' }
    ]
  },
  panda: {
    regionName: 'TIONGKOK / ASIA',
    ocean: 'Lautan Pasifik Timur Asia',
    biome: 'Hutan Bambu Lembap Pegunungan Sichuan',
    pathD: 'M 120 180 C 160 120, 260 110, 350 120 C 420 130, 440 180, 430 240 C 410 300, 380 350, 320 380 C 250 400, 190 360, 140 320 C 100 280, 90 220, 120 180 Z',
    points: [
      { x: 270, y: 240, label: 'Pegunungan Qinling (Shaanxi)', desc: 'Habitat alami panda liar di lembah hutan bambu pegunungan dingin!' },
      { x: 230, y: 270, label: 'Cagar Wolong (Sichuan)', desc: 'Pusat suaka bambu terbesar tempat panda makan rebung manis!' },
      { x: 290, y: 290, label: 'Pegunungan Minshan', desc: 'Koridor hijau alami tempat tinggal keluarga panda raksasa.' }
    ]
  },
  jerapah: {
    regionName: 'AFRIKA TIMUR',
    ocean: 'Teluk Aden & Lembah Rift',
    biome: 'Savana Pohon Akasia & Belukar Tinggi Afrika',
    pathD: 'M 180 70 C 220 50, 310 60, 340 90 C 370 120, 390 140, 380 180 C 370 200, 395 210, 420 230 C 400 250, 380 260, 350 260 C 340 280, 350 310, 330 350 C 310 390, 270 430, 250 450 C 240 440, 230 400, 210 370 C 190 340, 180 300, 180 260 C 160 250, 140 230, 120 220 C 110 200, 100 170, 130 140 C 150 120, 170 110, 180 70 Z',
    points: [
      { x: 365, y: 230, label: 'Samburu Reserve (Kenya)', desc: 'Rumah bagi jerapah reticulata berleher tinggi dan bercorak jala unik!' },
      { x: 350, y: 285, label: 'Kawah Ngorongoro', desc: 'Kaldera savana hijau tempat jerapah merumput di pucuk akasia.' },
      { x: 260, y: 430, label: 'Gurun Kalahari', desc: 'Jerapah kuat melintasi oasis padang pasir kering.' }
    ]
  },
  harimau: {
    regionName: 'ASIA TROPIS',
    ocean: 'Selat Malaka & Teluk Benggala',
    biome: 'Hutan Hujan Tropis Rimba Lebat & Rawa Bakau',
    pathD: 'M 110 160 C 170 100, 290 90, 380 140 C 410 170, 420 230, 390 280 C 340 330, 300 390, 240 400 C 180 410, 130 360, 120 300 C 90 250, 80 190, 110 160 Z',
    points: [
      { x: 260, y: 220, label: 'TN Sundarbans (Bengal)', desc: 'Hutan bakau rawa tempat harimau berenang lincah mengintai mangsa!' },
      { x: 210, y: 330, label: 'TN Bukit Barisan (Sumatera)', desc: 'Rimba hujan tropis lebat habitat asli harimau loreng terkuat.' },
      { x: 330, y: 270, label: 'TN Ranthambore (India)', desc: 'Bekas istana kuno rimba tempat harimau berpatroli megah.' }
    ]
  },
  kanguru: {
    regionName: 'BENUA AUSTRALIA',
    ocean: 'Samudra Selatan & Pasifik Barat Daya',
    biome: 'Hutan Eukaliptus Pesisir Timur Australia',
    pathD: 'M 160 180 C 220 130, 340 140, 390 190 C 420 240, 410 320, 370 360 C 320 400, 220 410, 160 360 C 120 320, 110 240, 160 180 Z',
    points: [
      { x: 360, y: 240, label: 'Hutan Eukaliptus Queensland', desc: 'Pepohonan eukaliptus rimbun tempat koala bersantai dan memakan pucuk daun!' },
      { x: 340, y: 320, label: 'Pulau Kanguru & Victoria', desc: 'Suaka alam hijau tempat koala hidup damai di dahan pohon tinggi!' }
    ]
  },
  lumbalumba: {
    regionName: 'SAMUDRA TROPIS DUNIA',
    ocean: 'Samudra Tropis & Perairan Karang Dunia',
    biome: 'Terumbu Karang Laut Hangat & Teluk Tropis',
    pathD: 'M 100 240 C 140 170, 260 160, 360 190 C 420 220, 430 300, 380 350 C 300 390, 180 380, 120 330 C 90 300, 80 270, 100 240 Z',
    points: [
      { x: 240, y: 250, label: 'Teluk Kiluan (Indonesia)', desc: 'Pusat tarian ratusan lumba-lumba hidung botol yang ramah melompat!' },
      { x: 320, y: 290, label: 'Batu Karang Bahama (Karibia)', desc: 'Perairan kristal biru tempat lumba-lumba bersiul dan berkejaran!' },
      { x: 170, y: 270, label: 'Kepulauan Hawaii (Pasifik)', desc: 'Teluk tenang tempat lumba-lumba pemintal berakrobat di udara!' }
    ]
  },
  beruangkutub: {
    regionName: 'LINGKAR KUTUB ARKTIK',
    ocean: 'Samudra Arktik Utara',
    biome: 'Padang Es Abadi & Pesisir Salju Utara',
    pathD: 'M 120 150 C 200 100, 340 100, 410 150 C 440 200, 420 280, 360 320 C 280 350, 180 340, 130 290 C 90 240, 90 180, 120 150 Z',
    points: [
      { x: 250, y: 190, label: 'Svalbard (Norwegia)', desc: 'Kepulauan es Arktik tempat beruang kutub menjelajah di bawah cahaya Aurora!' },
      { x: 180, y: 230, label: 'Teluk Hudson (Kanada)', desc: 'Pesisir es tempat keluarga beruang kutub berenang dan mencari ikan!' }
    ]
  },
  pandamerah: {
    regionName: 'PEGUNUNGAN HIMALAYA',
    ocean: 'Lembah Sungai & Puncak Asia Selatan',
    biome: 'Hutan Bambu & Cemara Pegunungan Sejuk',
    pathD: 'M 130 190 C 190 130, 310 130, 380 180 C 420 230, 400 310, 340 350 C 260 380, 170 350, 130 290 C 100 250, 100 220, 130 190 Z',
    points: [
      { x: 260, y: 240, label: 'TN Singalila (Himalaya)', desc: 'Hutan berkabut sejuk tempat panda merah memanjat dahan cemara!' },
      { x: 320, y: 260, label: 'Pegunungan Sichuan', desc: 'Lembah hijau tempat panda merah berbagi hutan bambu dengan panda raksasa!' }
    ]
  },
  komodo: {
    regionName: 'KEPULAUAN NUSA TENGGARA',
    ocean: 'Laut Flores & Selat Sumba Indonesia',
    biome: 'Padang Sabana Tropis & Pantai Pasir Pink NTT',
    pathD: 'M 110 220 C 180 180, 320 180, 410 220 C 440 260, 420 320, 350 350 C 260 370, 160 350, 110 300 C 80 270, 80 240, 110 220 Z',
    points: [
      { x: 250, y: 265, label: 'Pulau Komodo (NTT)', desc: 'Habitat asli kadal raksasa purba Naga Komodo kebanggaan Indonesia!' },
      { x: 295, y: 275, label: 'Pulau Rinca & Padar', desc: 'Perbukitan sabana indah tempat komodo berjemur di pagi hari!' }
    ]
  },
  zebra: {
    regionName: 'SAVANA AFRIKA TIMUR',
    ocean: 'Samudra Hindia & Lembah Rift',
    biome: 'Padang Rumput Savana Terbuka Afrika',
    pathD: 'M 180 70 C 220 50, 310 60, 340 90 C 370 120, 390 140, 380 180 C 370 200, 395 210, 420 230 C 400 250, 380 260, 350 260 C 340 280, 350 310, 330 350 C 310 390, 270 430, 250 450 C 240 440, 230 400, 210 370 C 190 340, 180 300, 180 260 C 160 250, 140 230, 120 220 C 110 200, 100 170, 130 140 C 150 120, 170 110, 180 70 Z',
    points: [
      { x: 355, y: 275, label: 'Ekosistem Serengeti', desc: 'Padang rumput luas tempat ribuan zebra bermigrasi bersama!' },
      { x: 368, y: 250, label: 'Padang Masai Mara', desc: 'Lembah hijau subur tempat kawanan zebra merumput di pagi hari!' }
    ]
  },
  monyet: {
    regionName: 'HUTAN TROPIS NUSANTARA',
    ocean: 'Laut Jawa & Selat Sunda',
    biome: 'Hutan Hujan Tropis Kanopi Rimbun',
    pathD: 'M 110 160 C 170 100, 290 90, 380 140 C 410 170, 420 230, 390 280 C 340 330, 300 390, 240 400 C 180 410, 130 360, 120 300 C 90 250, 80 190, 110 160 Z',
    points: [
      { x: 230, y: 275, label: 'Hutan Tropis Kalimantan', desc: 'Pepohonan tinggi tempat monyet berayun lincah dan mencari buah!' },
      { x: 280, y: 310, label: 'Hutan Rimba Sumatera & Jawa', desc: 'Lembah hijau subur yang kaya akan pohon buah-buahan hutan!' }
    ]
  },
  penyu: {
    regionName: 'LAUT KARANG NUSANTARA',
    ocean: 'Samudra Hindia & Pasifik Tropis',
    biome: 'Terumbu Karang & Padang Lamun Tropis',
    pathD: 'M 100 240 C 140 170, 260 160, 360 190 C 420 220, 430 300, 380 350 C 300 390, 180 380, 120 330 C 90 300, 80 270, 100 240 Z',
    points: [
      { x: 250, y: 260, label: 'Kepulauan Derawan & Raja Ampat', desc: 'Surga terumbu karang tempat penyu hijau berenang dengan damai!' },
      { x: 310, y: 295, label: 'Pantai Sukamade & Pangumbahan', desc: 'Pantai pasir alami tempat penyu kembali untuk menjaga kelestarian!' }
    ]
  },
  berangberang: {
    regionName: 'PESISIR PASIFIK UTARA',
    ocean: 'Samudra Pasifik Utara',
    biome: 'Teluk Tenang & Hutan Rumput Laut Kelp',
    pathD: 'M 120 150 C 200 100, 340 100, 410 150 C 440 200, 420 280, 360 320 C 280 350, 180 340, 130 290 C 90 240, 90 180, 120 150 Z',
    points: [
      { x: 235, y: 225, label: 'Teluk Monterey (Pasifik)', desc: 'Hutan kelp bawah air tempat berang-berang laut mengapung santai!' },
      { x: 295, y: 195, label: 'Pesisir Kepulauan Aleut', desc: 'Perairan sejuk tempat kawanan berang-berang bermain bersama!' }
    ]
  },
  rubah: {
    regionName: 'GURUN SAHARA AFRIKA UTARA',
    ocean: 'Laut Mediterania & Atlantik Utara',
    biome: 'Bukit Pasir Keemasan & Oasis Gurun',
    pathD: 'M 180 70 C 220 50, 310 60, 340 90 C 370 120, 390 140, 380 180 C 370 200, 395 210, 420 230 C 400 250, 380 260, 350 260 C 340 280, 350 310, 330 350 C 310 390, 270 430, 250 450 C 240 440, 230 400, 210 370 C 190 340, 180 300, 180 260 C 160 250, 140 230, 120 220 C 110 200, 100 170, 130 140 C 150 120, 170 110, 180 70 Z',
    points: [
      { x: 230, y: 115, label: 'Gurun Sahara Tengah', desc: 'Hamparan bukit pasir tempat rubah gurun bertelinga lebar tinggal di liang sejuk!' },
      { x: 315, y: 125, label: 'Oasis Lembah Gurun', desc: 'Kawasan kebun kurma dan mata air tempat rubah mencari buah manis saat senja!' }
    ]
  }
};

