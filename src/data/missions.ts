export interface MissionQuestion {
  id: string;
  category: string;
  fase: 'A' | 'B' | 'C';
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SAMPLE_MISSIONS: Record<'A' | 'B' | 'C', MissionQuestion[]> = {
  A: [
    {
      id: 'misi-a-1',
      category: 'Membaca & Suku Kata',
      fase: 'A',
      title: 'Membaca Suku Kata Pintar',
      question: 'Hewan khas Indonesia yang gagah ini punya nama berawalan "KO". Manakah susunan suku kata yang tepat?',
      options: ['KO - MO - DO', 'KU - DA - LA', 'KO - DOK - RA'],
      correctIndex: 0,
      explanation: 'Hebat! Komodo adalah kadal purba terbesar yang hidup di Nusa Tenggara Timur!',
    },
    {
      id: 'misi-a-2',
      category: 'Hitung Kelereng Budi',
      fase: 'A',
      title: 'Matematika Berhitung Ceria',
      question: 'Budi punya 3 kelereng biru, lalu Siti memberinya 2 kelereng hijau. Berapa kelereng Budi sekarang?',
      options: ['4 kelereng', '5 kelereng', '6 kelereng'],
      correctIndex: 1,
      explanation: 'Benar sekali! 3 + 2 = 5 kelereng berkilau!',
    },
    {
      id: 'misi-a-3',
      category: 'IPAS Alam Sekitar',
      fase: 'A',
      title: 'Kenali Hewan di Sekitar',
      question: 'Hewan yang bisa terbang di taman bunga dan memiliki sayap warna-warni indah adalah...',
      options: ['Ikan Emas', 'Kupu-Kupu 🦋', 'Kura-Kura'],
      correctIndex: 1,
      explanation: 'Pintar! Kupu-kupu menghisap nektar bunga dan menjaga kelestarian alam.',
    },
  ],
  B: [
    {
      id: 'misi-b-1',
      category: 'Matematika Pecahan & Kali',
      fase: 'B',
      title: 'Teka-Teki Belanja Budi',
      question: 'Jika 1 keranjang berisi 4 buah apel segar, berapa buah apel di dalam 3 keranjang?',
      options: ['10 apel', '12 apel', '15 apel'],
      correctIndex: 1,
      explanation: 'Tepat! 4 × 3 = 12 buah apel segar untuk Budi!',
    },
    {
      id: 'misi-b-2',
      category: 'Sains Flora & Fauna',
      fase: 'B',
      title: 'Adaptasi Tumbuhan',
      question: 'Tumbuhan kaktus menyimpan cadangan air di bagian tubuhnya yaitu...',
      options: ['Batang berdaging', 'Bunga', 'Ujung duri'],
      correctIndex: 0,
      explanation: 'Tepat! Batang kaktus tebal untuk menyimpan air di lingkungan kering.',
    },
    {
      id: 'misi-b-3',
      category: 'Budaya Nusantara',
      fase: 'B',
      title: 'Alat Musik Tradisional',
      question: 'Alat musik bambu yang dimainkan dengan cara digoyangkan dari Jawa Barat adalah...',
      options: ['Gamelan', 'Angklung', 'Sasando'],
      correctIndex: 1,
      explanation: 'Luar biasa! Angklung adalah warisan budaya dunia dari Indonesia!',
    },
  ],
  C: [
    {
      id: 'misi-c-1',
      category: 'IPAS Siklus Air & Energi',
      fase: 'C',
      title: 'Siklus Air Hujan',
      question: 'Proses penguapan air laut dan sungai menjadi uap air akibat panas matahari disebut...',
      options: ['Kondensasi', 'Evaporasi', 'Presipitasi'],
      correctIndex: 1,
      explanation: 'Tepat sekali! Evaporasi adalah tahap penguapan air dalam siklus hidrologi.',
    },
    {
      id: 'misi-c-2',
      category: 'Logika & Pecahan',
      fase: 'C',
      title: 'Tantangan Pecahan Pasar',
      question: 'Ibu memotong satu loyang kue lapis menjadi 8 potong sama besar. Jika Budi makan 2 potong, berapa bagian yang dimakan?',
      options: ['1/4 bagian', '1/2 bagian', '3/8 bagian'],
      correctIndex: 0,
      explanation: 'Keren! 2/8 disederhanakan menjadi 1/4 bagian kue!',
    },
    {
      id: 'misi-c-3',
      category: 'Sejarah & Pengetahuan',
      fase: 'C',
      title: 'Pahlawan & Kemerdekaan',
      question: 'Teks Proklamasi Kemerdekaan Indonesia diketik rapi oleh tokoh pemuda bernama...',
      options: ['Sayuti Melik', 'Sukarni', 'Moh. Hatta'],
      correctIndex: 0,
      explanation: 'Hebat! Sayuti Melik adalah pengetik naskah proklamasi yang bersejarah.',
    },
  ],
};
