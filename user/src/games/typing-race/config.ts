export interface TypingRacer {
  id: string;
  name: string;
  score: number; // 0 to 100 (% completed)
  wpm: number;
  accuracy: number;
  color: string;
  accentHex: string;
  avatar: string;
  isSelf: boolean;
  completed?: boolean;
  bg?: string;
  border?: string;
  isBot?: boolean;
  botTargetWpm?: number;
  rank?: number;
  finishTime?: number;
}

export interface QuoteData {
  id: string;
  category: "gaming" | "tech" | "wisdom" | "sprint";
  title: string;
  author: string;
  text: string;
}

export const SAMPLE_QUOTES: QuoteData[] = [
  {
    id: "g1",
    category: "gaming",
    title: "The Arena Call",
    author: "Esports Anthem",
    text: "Victory is not determined by the speed of your fingers, but by the calm focus of your mind under intense pressure.",
  },
  {
    id: "g2",
    category: "gaming",
    title: "Level Up",
    author: "Arcade Legend",
    text: "In the cyber speedway, every millisecond counts. Keep your eyes sharp, your keystrokes precise, and never lift your hands from the home row.",
  },
  {
    id: "t1",
    category: "tech",
    title: "Clean Code",
    author: "Robert C. Martin",
    text: "Even bad code can function. But if code is not clean, it can bring a development organization to its knees.",
  },
  {
    id: "t2",
    category: "tech",
    title: "Future of AI",
    author: "Alan Turing",
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
  },
  {
    id: "w1",
    category: "wisdom",
    title: "The Champion Mindset",
    author: "Bruce Lee",
    text: "Do not fear the opponent who has practiced ten thousand kicks once, but fear the one who has practiced one kick ten thousand times.",
  },
  {
    id: "s1",
    category: "sprint",
    title: "Hyper Sprint",
    author: "Speed Demon",
    text: "Fast and fearless, the engine roars as neon trails streak across the midnight tarmac towards the glowing finish line.",
  },
];

export const RACER_PALETTES = [
  {
    name: "Flame Coral",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-500",
    border: "border-rose-400",
    accentHex: "#FF6562",
    text: "text-rose-500",
  },
  {
    name: "Cyber Cyan",
    color: "from-cyan-400 to-blue-600",
    bg: "bg-cyan-500",
    border: "border-cyan-400",
    accentHex: "#06b6d4",
    text: "text-cyan-500",
  },
  {
    name: "Volt Lime",
    color: "from-emerald-400 to-teal-600",
    bg: "bg-emerald-500",
    border: "border-emerald-400",
    accentHex: "#10b981",
    text: "text-emerald-500",
  },
  {
    name: "Electric Purple",
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-500",
    border: "border-purple-400",
    accentHex: "#8b5cf6",
    text: "text-purple-500",
  },
  {
    name: "Solar Gold",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-500",
    border: "border-amber-400",
    accentHex: "#f59e0b",
    text: "text-amber-500",
  },
];

export const RACER_AVATARS = ["🏎️", "⚡", "🚀", "🏍️", "🛸", "🐆"];

export const DEFAULT_AI_BOTS: Omit<TypingRacer, "score" | "wpm" | "accuracy" | "isSelf">[] = [
  {
    id: "bot-1",
    name: "TurboBot",
    color: "from-cyan-400 to-blue-600",
    bg: "bg-cyan-500",
    border: "border-cyan-400",
    accentHex: "#06b6d4",
    avatar: "🚀",
    isBot: true,
    botTargetWpm: 68,
  } as any,
  {
    id: "bot-2",
    name: "CyberShift",
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-500",
    border: "border-purple-400",
    accentHex: "#8b5cf6",
    avatar: "⚡",
    isBot: true,
    botTargetWpm: 54,
  } as any,
  {
    id: "bot-3",
    name: "ApexTypist",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-500",
    border: "border-amber-400",
    accentHex: "#f59e0b",
    avatar: "🏍️",
    isBot: true,
    botTargetWpm: 78,
  } as any,
];

// -------------------------------------------------------------
// WEB AUDIO SYNTHESIZER (Pure Web Audio, zero external assets)
// -------------------------------------------------------------
class TypingSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Crisp mechanical switch click sound
  playKey(pitchVariation: number = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    // Soft click around 600-800Hz with subtle random flutter
    const baseFreq = 620 + (pitchVariation % 5) * 20 + Math.random() * 40;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      baseFreq * 0.4,
      this.ctx.currentTime + 0.04
    );

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Error typo thump
  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Combo Streak chime (whoosh + pitch rise)
  playComboChime(streakLevel: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const freq = Math.min(1200, 500 + streakLevel * 50);
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 1.5,
      this.ctx.currentTime + 0.12
    );

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Countdown beep (short pulse for 3, 2, 1)
  playCountdownBeep(isGo: boolean = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const freq = isGo ? 880 : 440;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + (isGo ? 0.35 : 0.15)
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + (isGo ? 0.35 : 0.15));
  }

  // Victory fanfare
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    melody.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = this.ctx!.currentTime + idx * 0.1;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(time);
      osc.stop(time + 0.3);
    });
  }
}

export const typingSfx = new TypingSoundEngine();
