export interface SpokenWordToken {
  word: string;
  rawToken: string;
  index: number;
  charIndex: number;
  syllables: number;
  vowelOpenness: number; // 0.35 (narrow i/u) .. 1.0 (wide open a/o/exclamation)
  wordEmphasis: number; // 0.2 .. 1.0 (stress/energy of the word)
  startMs: number;
  endMs: number;
  pauseAfterMs: number;
}

export interface SpeechCadenceState {
  isSpeaking: boolean;
  isInPunctuationPause: boolean;
  vowelOpenness: number;
  wordEmphasis: number;
  syllableRate: number;
  currentWord: string;
  wordIndex: number;
  totalWords: number;
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  onWordBoundary?: (token: SpokenWordToken) => void;
  onClausePause?: () => void;
}

// Keep a module-level reference so browser GC never collects an active utterance before onend fires
let activeUtteranceRef: SpeechSynthesisUtterance | null = null;
let activeWordTimers: ReturnType<typeof setTimeout>[] = [];

interface ActiveSpeechPlan {
  startedAtMs: number;
  tokens: SpokenWordToken[];
  totalDurationMs: number;
  currentTokenIdx: number;
  inPause: boolean;
}

let activeSpeechPlan: ActiveSpeechPlan | null = null;

function clearActiveSpeechPlan(): void {
  activeWordTimers.forEach((t) => clearTimeout(t));
  activeWordTimers = [];
  activeSpeechPlan = null;
}

/**
 * Analyzes an Indonesian sentence into timed word tokens with vowel openness,
 * syllable count, punctuation pauses, and emphasis so Budi's mouth and body
 * move in sync with the actual words being spoken.
 */
export function buildIndonesianSpeechPlan(text: string, rate = 1.02): {
  tokens: SpokenWordToken[];
  totalDurationMs: number;
} {
  const tokens: SpokenWordToken[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  let cursorMs = 60; // initial breath before first syllable
  const speedScale = 1 / Math.max(0.75, Math.min(1.4, rate));

  while ((match = regex.exec(text)) !== null) {
    const rawToken = match[0];
    const charIndex = match.index;
    const cleanWord = rawToken.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '');
    if (!cleanWord) continue;

    const lower = cleanWord.toLowerCase();
    const vowelGroups = lower.match(/[aiueo]+/g);
    const syllables = Math.max(1, vowelGroups ? vowelGroups.length : 1);

    // Calculate vowel openness: 'a' and 'o' open the jaw widest, 'e' medium, 'i'/'u' narrower
    const aCount = (lower.match(/a/g) || []).length;
    const oCount = (lower.match(/o/g) || []).length;
    const eCount = (lower.match(/e/g) || []).length;
    const iuCount = (lower.match(/[iu]/g) || []).length;
    const totalVowels = Math.max(1, aCount + oCount + eCount + iuCount);

    let openness =
      (aCount * 1.0 + oCount * 0.88 + eCount * 0.65 + iuCount * 0.44) / totalVowels;

    const hasExclamation = /!/.test(rawToken);
    const hasQuestion = /\?/.test(rawToken);
    const hasComma = /[,;:]/.test(rawToken);
    const hasPeriod = /\./.test(rawToken);

    const isExpressiveKeyword =
      /^(halo|wah|wih|hore|asyik|hebat|keren|mantap|selamat|ayo|yuk|budi|siapa|berapa)$/i.test(
        lower
      );

    if (hasExclamation || isExpressiveKeyword) {
      openness = Math.min(1.0, openness + 0.16);
    }

    const wordEmphasis = Math.min(
      1.0,
      0.35 +
        (hasExclamation ? 0.35 : 0) +
        (hasQuestion ? 0.25 : 0) +
        (isExpressiveKeyword ? 0.3 : 0) +
        Math.min(0.2, syllables * 0.05)
    );

    // Indonesian conversational syllable duration (~155ms per syllable + consonant onset)
    const wordDurationMs = Math.round((85 + syllables * 150) * speedScale);

    let pauseAfterMs = Math.round(32 * speedScale);
    if (hasExclamation || hasPeriod) {
      pauseAfterMs = Math.round(310 * speedScale);
    } else if (hasQuestion) {
      pauseAfterMs = Math.round(320 * speedScale);
    } else if (hasComma) {
      pauseAfterMs = Math.round(210 * speedScale);
    }

    const startMs = cursorMs;
    const endMs = startMs + wordDurationMs;

    tokens.push({
      word: cleanWord,
      rawToken,
      index: tokens.length,
      charIndex,
      syllables,
      vowelOpenness: Math.max(0.38, Math.min(1.0, openness)),
      wordEmphasis,
      startMs,
      endMs,
      pauseAfterMs,
    });

    cursorMs = endMs + pauseAfterMs;
  }

  return {
    tokens,
    totalDurationMs: cursorMs + 120,
  };
}

/**
 * Returns live 60fps speech cadence metrics for `CharviMascot` so mouth opening,
 * comma/period pauses, speaker blinks, and head/posture nods match the active word.
 */
export function getActiveSpeechCadence(): SpeechCadenceState {
  if (!activeSpeechPlan || activeSpeechPlan.tokens.length === 0) {
    return {
      isSpeaking: false,
      isInPunctuationPause: false,
      vowelOpenness: 0,
      wordEmphasis: 0,
      syllableRate: 11.0,
      currentWord: '',
      wordIndex: 0,
      totalWords: 0,
    };
  }

  const elapsed = Math.max(0, performance.now() - activeSpeechPlan.startedAtMs);
  const { tokens } = activeSpeechPlan;

  // Find token matching current elapsed time or fallback to activeSpeechPlan.currentTokenIdx
  let token = tokens[Math.min(activeSpeechPlan.currentTokenIdx, tokens.length - 1)];
  for (let i = 0; i < tokens.length; i++) {
    const tk = tokens[i];
    if (elapsed >= tk.startMs && elapsed <= tk.endMs + tk.pauseAfterMs) {
      token = tk;
      break;
    }
  }

  const inPunctuationPause =
    activeSpeechPlan.inPause ||
    (elapsed > token.endMs && token.pauseAfterMs >= 140);

  // Syllable articulation rate adapts slightly to word length & emphasis
  const syllableRate = inPunctuationPause
    ? 9.5
    : 10.5 + token.vowelOpenness * 2.2 + (token.syllables >= 3 ? 0.8 : 0);

  return {
    isSpeaking: true,
    isInPunctuationPause: inPunctuationPause,
    vowelOpenness: inPunctuationPause ? 0 : token.vowelOpenness,
    wordEmphasis: inPunctuationPause ? 0.1 : token.wordEmphasis,
    syllableRate,
    currentWord: token.word,
    wordIndex: token.index,
    totalWords: tokens.length,
  };
}

export const cancelSpeechSynthesis = (): void => {
  activeUtteranceRef = null;
  clearActiveSpeechPlan();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors
    }
  }
};

export const speakTextUtterance = (text: string, options: SpeakOptions = {}): void => {
  clearActiveSpeechPlan();

  const rate = options.rate ?? 1.02;
  const plan = buildIndonesianSpeechPlan(text, rate);

  const startCadenceTimers = () => {
    clearActiveSpeechPlan();
    const now = performance.now();
    activeSpeechPlan = {
      startedAtMs: now,
      tokens: plan.tokens,
      totalDurationMs: plan.totalDurationMs,
      currentTokenIdx: 0,
      inPause: false,
    };

    plan.tokens.forEach((tk, idx) => {
      const wordTimer = setTimeout(() => {
        if (!activeSpeechPlan) return;
        activeSpeechPlan.currentTokenIdx = idx;
        activeSpeechPlan.inPause = false;
        options.onWordBoundary?.(tk);
      }, tk.startMs);
      activeWordTimers.push(wordTimer);

      if (tk.pauseAfterMs >= 140) {
        const pauseTimer = setTimeout(() => {
          if (!activeSpeechPlan) return;
          activeSpeechPlan.inPause = true;
          options.onClausePause?.();
        }, tk.endMs);
        activeWordTimers.push(pauseTimer);
      }
    });
  };

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const spokenCleanText = text
        .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
      const utterance = new SpeechSynthesisUtterance(spokenCleanText || text);
      activeUtteranceRef = utterance;

      const targetLang = options.lang || 'id-ID';
      utterance.lang = targetLang;
      utterance.rate = rate;
      utterance.pitch = options.pitch ?? 1.15;

      const voices = window.speechSynthesis.getVoices?.() || [];
      const indoVoice =
        voices.find((v) => v.lang.toLowerCase() === 'id-id' && /google|natural|online/i.test(v.name)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('id'));
      if (indoVoice) {
        utterance.voice = indoVoice;
      }

      let hasStarted = false;
      utterance.onstart = () => {
        hasStarted = true;
        startCadenceTimers();
        options.onStart?.();
      };

      // Sync to real browser word boundary events when emitted by the TTS engine
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (!activeSpeechPlan || event.name !== 'word') return;
        const charIdx = event.charIndex;
        const matchedIdx = activeSpeechPlan.tokens.findIndex(
          (tk) => Math.abs(tk.charIndex - charIdx) <= 3
        );
        if (matchedIdx >= 0) {
          const matchedToken = activeSpeechPlan.tokens[matchedIdx];
          activeSpeechPlan.currentTokenIdx = matchedIdx;
          activeSpeechPlan.inPause = false;
          // Recalibrate plan start time to keep subsequent pause windows aligned with real audio
          activeSpeechPlan.startedAtMs = performance.now() - matchedToken.startMs;
          options.onWordBoundary?.(matchedToken);
        }
      };

      // Start cadence timers immediately as fallback if browser doesn't fire onstart within 90ms
      const startFallback = setTimeout(() => {
        if (!hasStarted && activeUtteranceRef === utterance) {
          hasStarted = true;
          startCadenceTimers();
        }
      }, 90);
      activeWordTimers.push(startFallback);

      utterance.onend = () => {
        if (activeUtteranceRef === utterance) {
          activeUtteranceRef = null;
        }
        clearActiveSpeechPlan();
        options.onEnd?.();
      };
      utterance.onerror = () => {
        if (activeUtteranceRef === utterance) {
          activeUtteranceRef = null;
        }
        clearActiveSpeechPlan();
        options.onError?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      clearActiveSpeechPlan();
      options.onError?.();
    }
  } else {
    clearActiveSpeechPlan();
    options.onError?.();
  }
};
