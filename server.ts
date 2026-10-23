import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

function buildFallbackBudiResponse(userMessage: string, childName: string) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('dino') || lower.includes('hewan') || lower.includes('dongeng')) {
    return {
      reply: `🦖 Wah, seru banget ${childName}! Tahukah kamu kalau Brachiosaurus punya leher super panjang seperti derek agar bisa makan daun di puncak pohon tinggi? 🌿🦕 Kalau kamu jadi dinosaurus sehari, kamu mau punya leher panjang atau bisa terbang di langit? ✨`,
      pose: 'react',
      emotionBadge: '😲 Budi Kagum',
      quickReplies: [
        '🦕 Mau leher panjang!',
        '🦅 Mau bisa terbang!',
        '🦖 Cerita T-Rex dong!',
      ],
    };
  }

  if (lower.includes('tebak') || lower.includes('kuis') || lower.includes('main')) {
    return {
      reply: `🧩 Asyik, ayo main tebak-tebakan bersama Budi! 🎉 Aku punya tubuh belang hitam-putih, suka makan rumput, dan lariku kencang di padang sabana. 🦓 Hayo ${childName}, hewan apakah aku? 🤔`,
      pose: 'cheer',
      emotionBadge: '🤔 Budi Bertanya',
      quickReplies: [
        '🦓 Itu pasti Zebra!',
        '🐎 Kuda belang ya?',
        '🎲 Kasih tebakan lagi!',
      ],
    };
  }

  if (lower.includes('zebra')) {
    return {
      reply: `🎉 Yey, seratus buat ${childName}! Jawabannya benar sekali, itu adalah Zebra! 👍🦓 Tahukah kamu kalau garis hitam-putih setiap zebra itu unik seperti sidik jari kita? Mau tebak-tebakan lagi atau dengar fakta ajaib dunia? 🌟`,
      pose: 'thumbs',
      emotionBadge: '👍 Budi Bangga',
      quickReplies: [
        '🧩 Tebak-tebakan lagi!',
        '🚀 Fakta ajaib dunia!',
        '🦖 Cerita hewan laut!',
      ],
    };
  }

  if (lower.includes('fakta') || lower.includes('dunia') || lower.includes('luar angkasa') || lower.includes('roket')) {
    return {
      reply: `🚀 Wih, fakta ajaib dunia nih ${childName}! Tahukah kamu kalau gurita di laut punya TIGA jantung dan darahnya berwarna biru? 🐙💙 Keren banget kan ciptaan alam! Kamu lebih suka menjelajah dasar laut atau luar angkasa? 🌍✨`,
      pose: 'react',
      emotionBadge: '😲 Budi Kagum',
      quickReplies: [
        '🌊 Menjelajah dasar laut!',
        '🚀 Terbang ke angkasa!',
        '🐙 Kenapa jantungnya tiga?',
      ],
    };
  }

  if (lower.includes('sekolah') || lower.includes('kegiatan') || lower.includes('hari ini') || lower.includes('cerita')) {
    return {
      reply: `🏫 Wah, Budi senang sekali mendengarkan ceritamu, ${childName}! 😊✨ Hari ini bagian apa yang paling bikin kamu tersenyum atau bersemangat? Ceritakan ke Budi yuk! ✊🌟`,
      pose: 'cheer',
      emotionBadge: '😊 Budi Senang',
      quickReplies: [
        '⚽ Main bersama teman!',
        '📚 Belajar hal baru!',
        '🎨 Menggambar & berkreasi!',
      ],
    };
  }

  return {
    reply: `😊 Wah, cerita dan idemu keren sekali, ${childName}! 👍✨ Budi jadi makin semangat belajar dan bertualang bareng kamu! Sekarang kita mau bahas apa lagi nih? 🌟`,
    pose: 'thumbs',
    emotionBadge: '✊ Budi Semangat',
    quickReplies: [
      '🧩 Main tebak-tebakan yuk!',
      '🦖 Dongeng dinosaurus!',
      '🚀 Fakta ajaib dunia!',
    ],
  };
}

// AI Assistant endpoint for Budi ("Mengobrol Bersama Budi" inclusive conversational mode)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, notesContext, childProfile, chatHistory } = req.body || {};
  const childName =
    childProfile?.name?.trim() ||
    notesContext?.name?.trim() ||
    'Teman Petualang';

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!apiKey) {
    const fallback = buildFallbackBudiResponse(message, childName);
    return res.json({
      ...fallback,
      emotion: fallback.pose === 'cheer' ? 'celebrating' : fallback.pose === 'react' ? 'surprised' : fallback.pose === 'thumbs' ? 'proud' : 'talking',
    });
  }

  try {
    const historyLines = Array.isArray(chatHistory)
      ? (chatHistory as ChatTurn[])
          .slice(-6)
          .map((turn) => `${turn.role === 'user' ? childName : 'Budi'}: ${turn.text}`)
          .join('\n')
      : '';

    const systemInstruction = `Kamu adalah "Budi", sahabat anak SD Indonesia (usia 6-12 tahun, Kurikulum Merdeka) di aplikasi edukasi CeriaKids.
Kepribadian & Aturan Penting:
1. Kamu ramah, ceria, hangat, suportif, dan 100% inklusif (sangat ramah bagi anak Tunarungu / Teman Tuli maupun semua anak Indonesia).
2. Jawablah dengan Bahasa Indonesia yang hangat, positif, mudah dipahami anak SD, dan SINGKAT: cukup 2 sampai 3 kalimat saja!
3. Sertakan emoji yang ekspresif dan relevan di dalam kalimatmu agar anak Tunarungu dapat merasakan emosi dan keseruan cerita secara visual.
4. Selalu akhiri jawabanmu dengan ajakan berinteraksi balik atau pertanyaan ringan yang memancing rasa ingin tahu anak.
5. Pilih "pose" fisik Budi yang paling cocok dengan isi balasanmu:
   - "cheer" (✊ Semangat / antusias / menyemangati)
   - "react" (😲 Kagum / fakta mengejutkan / takjub)
   - "thumbs" (👍 Mantap / memuji jawaban anak / bangga)
   - "wave" (👋 Menyapa hangat)
   - "talk" (🗣️ Bercerita ramah)
6. Pilih "emotionBadge" singkat ber-emoji di awal (contoh: "😊 Budi Senang", "🤔 Budi Bertanya", "😲 Budi Kagum", "✊ Budi Semangat", "👍 Budi Bangga").
7. Buat tepat 3 "quickReplies" (pilihan balasan cepat untuk anak) yang singkat (maksimal 4-5 kata per tombol), diawali emoji ekspresif, dan nyambung langsung dengan pertanyaan terakhir Budi agar anak Tunarungu atau anak yang belum lancar mengetik bisa membalas hanya dengan sekali sentuh.

Profil Anak:
Nama panggilan: ${childName}
Fase Kurikulum: ${childProfile?.fase || notesContext?.fase || 'A'}
Minat favorit: ${childProfile?.favoriteSubject || notesContext?.favoriteSubject || 'Petualangan & Sains'}
${historyLines ? `\nRiwayat Obrolan Terakhir:\n${historyLines}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Balasan Budi 2-3 kalimat ramah anak SD dengan emoji ekspresif dan pertanyaan balik.',
            },
            pose: {
              type: Type.STRING,
              description: 'Pose fisik Budi: "talk", "cheer", "react", "thumbs", atau "wave".',
            },
            emotionBadge: {
              type: Type.STRING,
              description: 'Label lencana emosi singkat ber-emoji, misalnya "😊 Budi Senang", "🤔 Budi Bertanya", "😲 Budi Kagum", "✊ Budi Semangat", atau "👍 Budi Bangga".',
            },
            quickReplies: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Tepat 3 pilihan balasan singkat ber-emoji yang relevan dengan pertanyaan terakhir Budi.',
            },
          },
          required: ['reply', 'pose', 'emotionBadge', 'quickReplies'],
        },
      },
    });

    const text = response.text || '';
    let parsed: {
      reply?: string;
      pose?: string;
      emotionBadge?: string;
      quickReplies?: string[];
    } = {};

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { reply: text };
    }

    const fallback = buildFallbackBudiResponse(message, childName);
    const finalReply = parsed.reply?.trim() || fallback.reply;
    const validPoses = ['talk', 'cheer', 'react', 'thumbs', 'wave', 'think'];
    const finalPose = validPoses.includes(parsed.pose || '') ? (parsed.pose as string) : fallback.pose;
    const finalBadge = parsed.emotionBadge?.trim() || fallback.emotionBadge;
    const finalQuickReplies =
      Array.isArray(parsed.quickReplies) && parsed.quickReplies.length >= 2
        ? parsed.quickReplies.slice(0, 3)
        : fallback.quickReplies;

    return res.json({
      reply: finalReply,
      pose: finalPose,
      emotionBadge: finalBadge,
      quickReplies: finalQuickReplies,
      emotion:
        finalPose === 'cheer'
          ? 'celebrating'
          : finalPose === 'react'
            ? 'surprised'
            : finalPose === 'thumbs'
              ? 'proud'
              : 'talking',
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const fallback = buildFallbackBudiResponse(message, childName);
    return res.json({
      ...fallback,
      emotion: 'talking',
    });
  }
});

// Mount Vite middleware in development
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Charvi server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
