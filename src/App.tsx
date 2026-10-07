/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Music, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

import dhabaMemoryPhoto from './assets/images/memory_dhaba.jpg';
import mirrorSelfiePhoto from './assets/images/memory_freshers_mirror.png';
import radhaRaniTemplePhoto from './assets/images/memory_radha_rani.jpg';
import premMandirCloseupPhoto from './assets/images/memory_prem_mandir_closeup.jpg';
import premMandirStepsPhoto from './assets/images/memory_prem_mandir_steps.png';
import puzzlePhotoDefault from './assets/images/puzzle_photo_square.png';
import surprisePhotoDefault from './assets/images/surprise_photo.jpg';

type Stage =
  | 'gift'
  | 'lock'
  | 'curtains'
  | 'loading'
  | 'bear_intro'
  | 'cake_counter'
  | 'memories'
  | 'balloons'
  | 'puzzle'
  | 'scratch'
  | 'letter';

interface MemoryItem {
  id: string;
  image: string;
  caption: string;
}

// Permanently fixed 5 Cute Memories with custom messages
const CUTE_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    image: dhabaMemoryPhoto,
    caption: 'The way I look at you says everything my heart feels 🥰💕',
  },
  {
    id: 'm2',
    image: mirrorSelfiePhoto,
    caption: 'Our photo of freshers before we committed 🥹🥹',
  },
  {
    id: 'm3',
    image: radhaRaniTemplePhoto,
    caption: 'Seeking blessings together at Radha Rani Ji’s darbar 🙏💛',
  },
  {
    id: 'm4',
    image: premMandirCloseupPhoto,
    caption: 'Lost in your eyes right in front of Prem Mandir ❤️✨',
  },
  {
    id: 'm5',
    image: premMandirStepsPhoto,
    caption: 'Every trip and every step with you feels like pure magic 🌸💑',
  },
];

const BALLOON_WISHES = [
  { id: 0, color: 'from-[#ff8da8] via-[#ec4872] to-[#9b183e]', wish: 'You make my whole world brighter every day 🌟' },
  { id: 1, color: 'from-[#ffe082] via-[#eab308] to-[#9a6700]', wish: 'Thank you for every single laugh 😄' },
  { id: 2, color: 'from-[#93c5fd] via-[#3b82f6] to-[#1d4ed8]', wish: 'May all your sweetest dreams come true 🦋' },
  { id: 3, color: 'from-[#d8b4fe] via-[#9333ea] to-[#581c87]', wish: 'You are my favorite notification & my safest place 💕' },
  { id: 4, color: 'from-[#86efac] via-[#22c55e] to-[#15803d]', wish: 'Here is to a lifetime of cute memories together 🥂' },
  { id: 5, color: 'from-[#fda4af] via-[#f43f5e] to-[#9f1239]', wish: 'I am the luckiest, because of you ✨' },
];

const LETTER_GREETING = 'My Sansu Baby,';

const LETTER_BODY = `On this very special day, I just want to remind you how deeply loved and appreciated you are.

From our college stairs mirror selfies and sitting together at the dhaba, to seeking blessings together at Radha Rani Mandir and Prem Mandir, every single moment with you is a treasure I hold close to my heart.

Thank you for being my peace, my happiness, and my favorite person in the entire world. May this year bring you endless smiles, success, and everything your heart desires.

Happy 20th Birthday, my love! Forever & always yours ❤️`;

// Gentle synthesized music box melody using Web Audio API
function useMusicBox() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const playNote = useCallback((freq: number, duration = 0.7) => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const startMusic = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (intervalRef.current) return;

      const melody = [
        261.63, 261.63, 293.66, 261.63, 349.23, 329.63, 0,
        261.63, 261.63, 293.66, 261.63, 392.00, 349.23, 0,
        261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66, 0,
        466.16, 466.16, 440.00, 349.23, 392.00, 349.23, 0,
      ];
      let idx = 0;
      intervalRef.current = window.setInterval(() => {
        const note = melody[idx % melody.length];
        if (note > 0) {
          playNote(note, 0.85);
        }
        idx++;
      }, 480);
      setIsPlaying(true);
    } catch {
      // Ignore audio unlock errors
    }
  }, [playNote]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      startMusic();
    }
  }, [isPlaying, startMusic]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isPlaying, startMusic, toggleMusic };
}

// Floating twin pink hearts background matching screenshots
function FloatingHeartsBackground() {
  const hearts = [
    { id: 1, left: '8%', top: '12%', scale: 0.9, duration: 7, delay: 0 },
    { id: 2, left: '48%', top: '6%', scale: 0.65, duration: 8.5, delay: 1.2 },
    { id: 3, left: '84%', top: '18%', scale: 1.1, duration: 6.5, delay: 0.5 },
    { id: 4, left: '14%', top: '28%', scale: 0.75, duration: 9, delay: 2.1 },
    { id: 5, left: '72%', top: '34%', scale: 0.85, duration: 7.8, delay: 1.7 },
    { id: 6, left: '6%', top: '52%', scale: 0.7, duration: 8.2, delay: 0.8 },
    { id: 7, left: '88%', top: '58%', scale: 0.95, duration: 7.4, delay: 2.5 },
    { id: 8, left: '22%', top: '68%', scale: 0.8, duration: 6.9, delay: 1.4 },
    { id: 9, left: '62%', top: '73%', scale: 1.0, duration: 8.6, delay: 0.3 },
    { id: 10, left: '11%', top: '85%', scale: 0.9, duration: 7.2, delay: 1.9 },
    { id: 11, left: '44%', top: '89%', scale: 0.85, duration: 8.1, delay: 0.7 },
    { id: 12, left: '79%', top: '92%', scale: 0.75, duration: 7.6, delay: 2.3 },
    { id: 13, left: '36%', top: '42%', scale: 0.65, duration: 9.2, delay: 1.1 },
    { id: 14, left: '54%', top: '56%', scale: 0.8, duration: 8.0, delay: 2.8 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(92, 14, 42, 0.52) 0%, rgba(36, 5, 19, 0.88) 55%, #120209 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-[30vh] rounded-full blur-3xl opacity-45"
        style={{
          background: 'radial-gradient(circle, rgba(190, 24, 77, 0.55) 0%, transparent 75%)',
        }}
      />

      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute select-none"
          style={{ left: h.left, top: h.top }}
          animate={{
            y: [0, -18, 0],
            x: [0, 6, -4, 0],
            opacity: [0.55, 0.88, 0.55],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: 'easeInOut',
          }}
        >
          <svg
            width={36 * h.scale}
            height={26 * h.scale}
            viewBox="0 0 42 30"
            fill="none"
            className="drop-shadow-[0_0_8px_rgba(244,114,182,0.45)] opacity-85"
          >
            <path
              d="M13 24.5C13 24.5 3 17.8 3 10.5C3 6.8 5.9 4 9.3 4C11.4 4 13.3 5.1 14.3 6.8C15.3 5.1 17.2 4 19.3 4C22.7 4 25.6 6.8 25.6 10.5C25.6 17.8 15.6 24.5 13 24.5Z"
              fill="url(#heartGrad1)"
            />
            <path
              d="M27 25.5C27 25.5 17.5 19.2 17.5 12.2C17.5 8.7 20.2 6 23.5 6C25.5 6 27.3 7 28.2 8.6C29.1 7 30.9 6 32.9 6C36.2 6 38.9 8.7 38.9 12.2C38.9 19.2 29.5 25.5 27 25.5Z"
              fill="url(#heartGrad2)"
            />
            <defs>
              <linearGradient id="heartGrad1" x1="3" y1="4" x2="22" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff8da8" />
                <stop offset="1" stopColor="#be185d" />
              </linearGradient>
              <linearGradient id="heartGrad2" x1="18" y1="6" x2="38" y2="25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fda4af" />
                <stop offset="1" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState<Stage>('gift');
  const [giftOpened, setGiftOpened] = useState(false);

  // Stage 2: Lock Screen State
  const [pinInput, setPinInput] = useState('');
  const [currentTime, setCurrentTime] = useState('22:04');

  // Stage 3: Curtains State
  const [curtainsOpening, setCurtainsOpening] = useState(false);

  // Stage 6: Cake Candles State
  const [candlesLit, setCandlesLit] = useState(false);

  // Stage 7: Memories Polaroid Stack State
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);

  // Stage 8: Balloons State
  const [poppedIds, setPoppedIds] = useState<number[]>([]);
  const [lastPoppedWish, setLastPoppedWish] = useState<string | null>(null);

  // Stage 9: Sliding 3x3 Puzzle State
  const [tiles, setTiles] = useState<number[]>([0, 1, 2, 3, 4, 8, 6, 7, 5]);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  // Stage 10: Scratch Card State
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const isDrawingRef = useRef(false);

  // Stage 11: Letter State
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [typedLetter, setTypedLetter] = useState('');

  const { isPlaying, startMusic, toggleMusic } = useMusicBox();

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
  }, []);

  // Stage 4: Auto-advance from Loading screen
  useEffect(() => {
    if (stage === 'loading') {
      const timer = setTimeout(() => {
        setStage('bear_intro');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Stage 11: Typewriter effect when envelope opens
  useEffect(() => {
    if (stage === 'letter' && envelopeOpened) {
      setTypedLetter('');
      let index = 0;
      const timer = setInterval(() => {
        index += 1;
        setTypedLetter(LETTER_BODY.slice(0, index));
        if (index >= LETTER_BODY.length) {
          clearInterval(timer);
        }
      }, 32);
      return () => clearInterval(timer);
    }
  }, [stage, envelopeOpened]);

  // Initialize scratch card canvas when entering 'scratch' stage
  const initScratchCanvas = useCallback(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#9333ea');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#6366f1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    const stripeWidth = 18;
    for (let x = -height; x < width + height; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x + stripeWidth - height * 0.7, height);
      ctx.lineTo(x - height * 0.7, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 42; i++) {
      const sx = (Math.sin(i * 73.1) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 41.7) * 0.5 + 0.5) * height;
      const r = (i % 3) + 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.fillText('Scratch here 🪙', width / 2, height / 2 - 4);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('drag your finger across the card', width / 2, height / 2 + 24);
    ctx.shadowBlur = 0;
  }, []);

  useEffect(() => {
    if (stage === 'scratch' && !scratchRevealed) {
      const t = setTimeout(() => initScratchCanvas(), 60);
      return () => clearTimeout(t);
    }
  }, [stage, scratchRevealed, initScratchCanvas]);

  const handleScratchMove = (clientX: number, clientY: number) => {
    if (scratchRevealed) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    const totalPixels = imgData.data.length / 4;
    for (let i = 3; i < imgData.data.length; i += 16) {
      if (imgData.data[i] < 128) transparentPixels++;
    }
    const pct = Math.min(100, Math.round((transparentPixels / (totalPixels / 4)) * 100));
    setScratchPercent(pct);
    if (pct >= 42) {
      setScratchRevealed(true);
    }
  };

  const handleTapGift = () => {
    if (giftOpened) return;
    startMusic();
    setGiftOpened(true);
    setTimeout(() => {
      setStage('lock');
    }, 1850);
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length >= 4) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);

    if (nextPin.length === 4) {
      setTimeout(() => {
        setStage('curtains');
        setPinInput('');
      }, 350);
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleOpenCurtains = () => {
    if (curtainsOpening) return;
    setCurtainsOpening(true);
    setTimeout(() => {
      setStage('loading');
      setCurtainsOpening(false);
    }, 1150);
  };

  const handlePopBalloon = (id: number, wish: string) => {
    if (poppedIds.includes(id)) return;
    const updated = [...poppedIds, id];
    setPoppedIds(updated);
    if (updated.length === BALLOON_WISHES.length) {
      setLastPoppedWish('I am the luckiest, because of you ✨');
    } else {
      setLastPoppedWish(wish);
    }
  };

  const shufflePuzzle = () => {
    const board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let emptyIdx = 8;
    for (let i = 0; i < 24; i++) {
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;
      const neighbors: number[] = [];
      if (row > 0) neighbors.push(emptyIdx - 3);
      if (row < 2) neighbors.push(emptyIdx + 3);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < 2) neighbors.push(emptyIdx + 1);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      [board[emptyIdx], board[pick]] = [board[pick], board[emptyIdx]];
      emptyIdx = pick;
    }
    setTiles(board);
    setPuzzleMoves(0);
    setPuzzleSolved(false);
  };

  const handleTileClick = (index: number) => {
    if (puzzleSolved) return;
    const emptyIndex = tiles.indexOf(8);
    const row1 = Math.floor(index / 3);
    const col1 = index % 3;
    const row2 = Math.floor(emptyIndex / 3);
    const col2 = emptyIndex % 3;

    if (Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1) {
      const nextTiles = [...tiles];
      [nextTiles[index], nextTiles[emptyIndex]] = [nextTiles[emptyIndex], nextTiles[index]];
      setTiles(nextTiles);
      setPuzzleMoves((m) => m + 1);

      const isNowSolved = nextTiles.every((val, idx) => val === idx);
      if (isNowSolved) {
        setPuzzleSolved(true);
      }
    }
  };

  const handleSolveForMe = () => {
    setTiles([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    setPuzzleSolved(true);
  };

  const handleWatchAgain = () => {
    setGiftOpened(false);
    setPinInput('');
    setCurtainsOpening(false);
    setCandlesLit(false);
    setActiveMemoryIndex(0);
    setPoppedIds([]);
    setLastPoppedWish(null);
    setPuzzleMoves(0);
    setPuzzleSolved(false);
    setTiles([0, 1, 2, 3, 4, 8, 6, 7, 5]);
    setScratchPercent(0);
    setScratchRevealed(false);
    setEnvelopeOpened(false);
    setTypedLetter('');
    setStage('gift');
  };

  const showFloatingMusicBtn =
    stage === 'bear_intro' ||
    stage === 'cake_counter' ||
    stage === 'memories' ||
    stage === 'balloons' ||
    stage === 'puzzle' ||
    stage === 'scratch' ||
    stage === 'letter';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden select-none">
      <FloatingHeartsBackground />

      {/* Main Mobile-First Container */}
      <main className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col items-center justify-center px-5 py-10">
        <AnimatePresence mode="wait">
          {/* =========================================================
              STAGE 1 & 2: GIFT BOX (CLOSED & OPENING WITH HEART)
             ========================================================= */}
          {stage === 'gift' && (
            <motion.div
              key="stage-gift"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[31px] sm:text-[34px] font-bold tracking-tight leading-snug mb-1.5">
                A surprise awaits you... 🌟
              </h1>
              <p className="gold-text text-[15px] font-medium mb-10 flex items-center justify-center gap-1.5">
                <span>✨</span>
                <span>Something special, just for you</span>
                <span>✨</span>
              </p>

              <div
                onClick={handleTapGift}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTapGift()}
                aria-label="Tap the gift to open"
                className="relative w-72 h-72 flex items-center justify-center cursor-pointer group my-2"
              >
                <span className="absolute top-3 left-6 text-yellow-400 text-xl animate-pulse">✦</span>
                <span className="absolute top-4 right-5 text-amber-400 text-2xl animate-spin" style={{ animationDuration: '9s' }}>✴</span>
                <span className="absolute top-1/2 left-2 text-yellow-500/80 text-sm">✧</span>
                <span className="absolute top-1/2 right-4 text-yellow-400 text-base animate-pulse">✦</span>
                <span className="absolute bottom-8 left-7 text-yellow-400 text-lg animate-bounce">✸</span>
                <span className="absolute bottom-7 right-8 text-yellow-400/90 text-base">✦</span>

                {!giftOpened ? (
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, -1.5, 1.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    whileTap={{ scale: 0.92 }}
                    className="relative w-60 h-60 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 260 260" className="w-full h-full drop-shadow-[0_20px_35px_rgba(244,63,94,0.28)]">
                      <ellipse cx="130" cy="238" rx="75" ry="12" fill="rgba(225, 29, 72, 0.28)" />
                      <polygon points="46,104 152,122 152,228 46,204" fill="url(#boxPinkFront)" />
                      <polygon points="88,111 112,115 112,219 88,213" fill="url(#ribbonWhite)" />
                      <polygon points="152,122 204,96 200,196 152,228" fill="url(#boxYellowSide)" />
                      <polygon points="172,112 186,105 183,207 170,216" fill="url(#ribbonWhiteSide)" />
                      <polygon points="38,85 102,66 212,80 154,104" fill="#b77bf8" />
                      <polygon points="84,93 160,72 178,75 104,97" fill="#f8fafc" />
                      <polygon points="68,76 184,92 172,97 56,80" fill="#f8fafc" />
                      <polygon points="38,85 154,104 154,126 40,106" fill="#f4729b" />
                      <polygon points="85,93 111,97 111,119 85,114" fill="#ffffff" />
                      <polygon points="154,104 212,80 211,100 154,126" fill="#fcd34d" />
                      <polygon points="176,95 191,89 190,109 175,116" fill="#f1f5f9" />
                      <ellipse cx="105" cy="67" rx="18" ry="15" transform="rotate(-12 105 67)" fill="url(#bowLoop)" />
                      <ellipse cx="105" cy="67" rx="5" ry="4" fill="#a1887f" opacity="0.45" />
                      <ellipse cx="155" cy="70" rx="19" ry="15" transform="rotate(15 155 70)" fill="url(#bowLoop)" />
                      <ellipse cx="155" cy="70" rx="5" ry="4" fill="#a1887f" opacity="0.45" />
                      <circle cx="130" cy="60" r="10" fill="#ffffff" />
                      <defs>
                        <linearGradient id="boxPinkFront" x1="46" y1="104" x2="152" y2="228" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f67ca3" />
                          <stop offset="1" stopColor="#d83b6c" />
                        </linearGradient>
                        <linearGradient id="boxYellowSide" x1="152" y1="96" x2="204" y2="228" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#fde068" />
                          <stop offset="1" stopColor="#dda027" />
                        </linearGradient>
                        <linearGradient id="ribbonWhite" x1="88" y1="111" x2="112" y2="219" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ffffff" />
                          <stop offset="1" stopColor="#e2e8f0" />
                        </linearGradient>
                        <linearGradient id="ribbonWhiteSide" x1="170" y1="105" x2="186" y2="216" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f8fafc" />
                          <stop offset="1" stopColor="#cbd5e1" />
                        </linearGradient>
                        <radialGradient id="bowLoop" cx="50%" cy="40%" r="55%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="70%" stopColor="#f1f5f9" />
                          <stop offset="100%" stopColor="#cbd5e1" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="relative w-64 h-64 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 260 260" className="w-full h-full">
                      <ellipse cx="130" cy="236" rx="85" ry="15" fill="rgba(234, 179, 8, 0.26)" />
                      <polygon points="130,135 55,40 90,30" fill="rgba(251, 191, 36, 0.16)" />
                      <polygon points="130,135 110,20 155,20" fill="rgba(244, 114, 182, 0.22)" />
                      <polygon points="130,135 175,30 215,50" fill="rgba(251, 191, 36, 0.16)" />
                      <polygon points="46,110 104,76 204,96 152,130" fill="#5b1933" />
                      <polygon points="46,110 104,76 104,140 46,160" fill="#7c2d4d" opacity="0.6" />
                      <polygon points="48,110 104,78 202,96 152,132" fill="url(#innerBoxGlow)" />
                      <polygon points="46,110 152,130 152,228 46,204" fill="url(#boxPinkFrontOpen)" />
                      <polygon points="88,118 112,122 112,219 88,213" fill="#ffffff" />
                      <polygon points="152,130 204,96 200,196 152,228" fill="url(#boxYellowSideOpen)" />
                      <polygon points="172,117 186,108 183,207 170,216" fill="#f1f5f9" />
                      <text x="64" y="138" fill="rgba(255,255,255,0.22)" fontSize="13" fontWeight="600">
                        Made with love, just for
                      </text>
                      <defs>
                        <radialGradient id="innerBoxGlow" cx="50%" cy="60%" r="60%">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                          <stop offset="60%" stopColor="#db2777" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#4c0519" stopOpacity="0.1" />
                        </radialGradient>
                        <linearGradient id="boxPinkFrontOpen" x1="46" y1="110" x2="152" y2="228" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f67ca3" />
                          <stop offset="1" stopColor="#d83b6c" />
                        </linearGradient>
                        <linearGradient id="boxYellowSideOpen" x1="152" y1="96" x2="204" y2="228" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#fde068" />
                          <stop offset="1" stopColor="#dda027" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <motion.div
                      initial={{ y: 35, scale: 0.4, opacity: 0 }}
                      animate={{ y: -48, scale: 1.15, opacity: 1 }}
                      transition={{ duration: 0.75, type: 'spring', bounce: 0.45 }}
                      className="absolute text-7xl select-none drop-shadow-[0_0_25px_rgba(244,114,182,0.8)]"
                    >
                      💖
                    </motion.div>
                  </motion.div>
                )}
              </div>

              <p
                onClick={handleTapGift}
                className="gold-text text-lg font-semibold mt-4 cursor-pointer hover:opacity-90 transition-opacity"
              >
                Tap the gift to open 🎁
              </p>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 3: SECRET CODE LOCK SCREEN
             ========================================================= */}
          {stage === 'lock' && (
            <motion.div
              key="stage-lock"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <div className="w-full rounded-[34px] border border-[#4a182d] bg-gradient-to-b from-[#210714]/90 to-[#14030c]/95 px-6 py-8 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.75)] backdrop-blur-md">
                <div className="text-[64px] font-bold tracking-tight text-white leading-none tabular-nums">
                  {currentTime}
                </div>
                <div className="text-[#d9829f] text-[15px] font-medium mt-1.5 flex items-center gap-1.5">
                  <span>Birthday Surprise</span>
                  <span>💝</span>
                </div>

                <div className="text-5xl my-5 select-none drop-shadow-[0_4px_12px_rgba(234,179,8,0.35)]">
                  🔒
                </div>

                <div className="gold-text text-[15px] font-semibold mb-3">
                  Enter the secret code 💕
                </div>

                <div className="px-5 py-2 rounded-full border border-[#562438] bg-[#240a16]/90 text-[#e8c67a] text-sm font-medium mb-5 flex items-center gap-2">
                  <span>💡</span>
                  <span>You birthday (DDMM)</span>
                </div>

                <div className="flex items-center gap-4 mb-7">
                  {[0, 1, 2, 3].map((dotIdx) => {
                    const filled = pinInput.length > dotIdx;
                    return (
                      <div
                        key={dotIdx}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          filled
                            ? 'bg-[#f4729b] border-[#f4729b] scale-110 shadow-[0_0_10px_#f4729b]'
                            : 'border-[#8a3d5c] bg-transparent'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="w-full grid grid-cols-3 gap-3.5 max-w-[320px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePinDigit(num)}
                      className="h-14 rounded-full border border-[#441b2d] bg-[#220915]/85 hover:bg-[#330f21] active:scale-95 text-white text-xl font-semibold transition-all flex items-center justify-center cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <div />
                  <button
                    onClick={() => handlePinDigit('0')}
                    className="h-14 rounded-full border border-[#441b2d] bg-[#220915]/85 hover:bg-[#330f21] active:scale-95 text-white text-xl font-semibold transition-all flex items-center justify-center cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    onClick={handlePinBackspace}
                    aria-label="Delete digit"
                    className="h-14 rounded-full border border-[#441b2d] bg-[#220915]/85 hover:bg-[#330f21] active:scale-95 text-[#e883a4] transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 4: RED VELVET STAGE CURTAINS
             ========================================================= */}
          {stage === 'curtains' && (
            <motion.div
              key="stage-curtains"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: curtainsOpening ? '-102%' : '0%' }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="w-1/2 h-full curtain-pleats border-r border-black/50"
              />
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: curtainsOpening ? '102%' : '0%' }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="w-1/2 h-full curtain-pleats border-l border-black/50"
              />

              <motion.button
                onClick={handleOpenCurtains}
                animate={{
                  scale: curtainsOpening ? 0.8 : 1,
                  opacity: curtainsOpening ? 0 : 1,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute z-50 px-9 py-4 rounded-full bg-[#1a050c]/95 border-2 border-[#6e2236] shadow-[0_0_35px_rgba(0,0,0,0.85)] flex items-center gap-3 cursor-pointer"
              >
                <span className="text-3xl">💖</span>
                <span className="text-white text-xl font-bold tracking-wide">Open</span>
              </motion.button>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 5: LOADING SCREEN
             ========================================================= */}
          {stage === 'loading' && (
            <motion.div
              key="stage-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <div className="flex items-center gap-2.5 mb-5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.65,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    className="w-3 h-3 rounded-full bg-[#f493b2]"
                  />
                ))}
              </div>
              <p className="gold-text text-xl font-semibold tracking-wide">
                Loading something special...
              </p>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 6: CUTE BEAR INTRO
             ========================================================= */}
          {stage === 'bear_intro' && (
            <motion.div
              key="stage-bear"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-28 h-28 rounded-full bg-[#1e0813] border-2 border-[#8c6d32] shadow-[0_0_35px_rgba(215,177,91,0.22)] flex items-center justify-center mb-8">
                <span className="text-6xl select-none">🐻</span>
              </div>

              <h1 className="font-display-glow text-[31px] sm:text-[34px] font-bold leading-tight mb-4">
                There&apos;s something special
                <br />
                I want to tell you...
              </h1>

              <p className="gold-text text-[15px] font-medium mb-9">
                that&apos;s why I made something special for you...
              </p>

              <button
                onClick={() => setStage('cake_counter')}
                className="gold-btn px-11 py-4 rounded-full text-[#f99bb9] text-lg font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span>✨</span>
              </button>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 7: HAPPY BIRTHDAY COUNTER & CAKE
             ========================================================= */}
          {stage === 'cake_counter' && (
            <motion.div
              key="stage-cake"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[31px] sm:text-[35px] font-bold leading-tight mb-2">
                Happy Birthday Sansu Baby 🎂
              </h1>

              <p className="gold-text text-[15px] font-semibold mb-6">
                The World Has Been Better Since ❤️
              </p>

              <div className="w-full grid grid-cols-2 gap-y-5 gap-x-4 mb-6 max-w-[340px]">
                <div className="flex flex-col items-center">
                  <span className="font-display-glow text-3xl sm:text-4xl font-bold tabular-nums">
                    20
                  </span>
                  <span className="gold-text text-xs font-semibold tracking-widest mt-1">
                    YEARS
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display-glow text-3xl sm:text-4xl font-bold tabular-nums">
                    7,304
                  </span>
                  <span className="gold-text text-xs font-semibold tracking-widest mt-1">
                    DAYS
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display-glow text-3xl sm:text-4xl font-bold tabular-nums">
                    175,314
                  </span>
                  <span className="gold-text text-xs font-semibold tracking-widest mt-1">
                    HOURS
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display-glow text-3xl sm:text-4xl font-bold tabular-nums">
                    10,518,870
                  </span>
                  <span className="gold-text text-xs font-semibold tracking-widest mt-1">
                    MINUTES
                  </span>
                </div>
              </div>

              <div
                onClick={() => setCandlesLit((prev) => !prev)}
                className="relative w-64 h-48 flex flex-col items-center justify-end cursor-pointer my-1"
              >
                <svg viewBox="0 0 260 190" className="w-full h-full overflow-visible">
                  {candlesLit && (
                    <g className="animate-flame">
                      <path d="M77,28 C77,28 84,16 77,6 C70,16 77,28 77,28 Z" fill="#fbbf24" />
                      <circle cx="77" cy="22" r="8" fill="rgba(251, 191, 36, 0.35)" />
                      <path d="M110,16 C110,16 117,4 110,-6 C103,4 110,16 110,16 Z" fill="#fbbf24" />
                      <circle cx="110" cy="10" r="9" fill="rgba(251, 191, 36, 0.4)" />
                      <path d="M150,16 C150,16 157,4 150,-6 C143,4 150,16 150,16 Z" fill="#fbbf24" />
                      <circle cx="150" cy="10" r="9" fill="rgba(251, 191, 36, 0.4)" />
                      <path d="M183,28 C183,28 190,16 183,6 C176,16 183,28 183,28 Z" fill="#fbbf24" />
                      <circle cx="183" cy="22" r="8" fill="rgba(251, 191, 36, 0.35)" />
                    </g>
                  )}

                  <rect x="73" y="30" width="8" height="36" rx="2" fill="#ffffff" />
                  <path d="M73,38 L81,44 L81,50 L73,44 Z" fill="#991b1b" />
                  <path d="M73,52 L81,58 L81,64 L73,58 Z" fill="#991b1b" />

                  <rect x="179" y="30" width="8" height="36" rx="2" fill="#ffffff" />
                  <path d="M179,38 L187,44 L187,50 L179,44 Z" fill="#991b1b" />
                  <path d="M179,52 L187,58 L187,64 L179,58 Z" fill="#991b1b" />

                  <rect x="93" y="18" width="32" height="48" rx="8" fill="url(#numCandleGrad)" />
                  <text x="109" y="49" textAnchor="middle" fill="#5c0814" fontSize="24" fontWeight="800">
                    2
                  </text>

                  <rect x="135" y="18" width="32" height="48" rx="8" fill="url(#numCandleGrad)" />
                  <text x="151" y="49" textAnchor="middle" fill="#5c0814" fontSize="24" fontWeight="800">
                    0
                  </text>

                  <rect x="62" y="64" width="136" height="44" rx="12" fill="url(#cakeTopTier)" />
                  <rect x="36" y="102" width="188" height="66" rx="14" fill="url(#cakeBottomTier)" />

                  <circle cx="66" cy="154" r="4" fill="#fce7f3" />
                  <circle cx="108" cy="154" r="4" fill="#fce7f3" />
                  <circle cx="152" cy="154" r="4" fill="#fce7f3" />
                  <circle cx="194" cy="154" r="4" fill="#fce7f3" />

                  <ellipse cx="130" cy="169" rx="108" ry="6" fill="#e2e8f0" />

                  <defs>
                    <linearGradient id="numCandleGrad" x1="0" y1="18" x2="0" y2="66" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="1" stopColor="#9f5866" />
                    </linearGradient>
                    <linearGradient id="cakeTopTier" x1="62" y1="64" x2="62" y2="108" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8c1222" />
                      <stop offset="1" stopColor="#560711" />
                    </linearGradient>
                    <linearGradient id="cakeBottomTier" x1="36" y1="102" x2="36" y2="168" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#750d1b" />
                      <stop offset="1" stopColor="#43040c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <button
                onClick={() => setCandlesLit((prev) => !prev)}
                className="px-5 py-2 rounded-full border border-[#5a2b3b] bg-[#210913]/90 hover:bg-[#320e1e] text-[#e0b872] text-sm font-medium flex items-center gap-1.5 mt-1 mb-6 cursor-pointer transition-all active:scale-95"
              >
                <span>{candlesLit ? '💨' : '🔥'}</span>
                <span>{candlesLit ? 'Blow Out' : 'Relight'}</span>
              </button>

              <p className="gold-text text-lg font-semibold mb-4">
                Make a wish... 🌠
              </p>

              <button
                onClick={() => setStage('memories')}
                className="gold-btn w-full max-w-[310px] py-4 rounded-full text-[#f99bb9] text-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>See Our Memories</span>
                <span>🌸</span>
              </button>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 8: CUTE MEMORIES POLAROID STACK (5 PERMANENT CARDS)
             ========================================================= */}
          {stage === 'memories' && (
            <motion.div
              key="stage-memories"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[33px] sm:text-[36px] font-bold mb-2 flex items-center justify-center gap-2">
                <span>Cute Memories</span>
                <span>💕</span>
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold tracking-wider text-[#f9a8d4] px-3.5 py-1 rounded-full bg-[#200813] border border-[#562438] shadow-[0_0_15px_rgba(244,114,182,0.15)]">
                  Memory {activeMemoryIndex + 1} of {CUTE_MEMORIES.length}
                </span>
              </div>

              {/* Stacked Polaroid Deck */}
              <div
                onClick={() => setActiveMemoryIndex((prev) => (prev + 1) % CUTE_MEMORIES.length)}
                className="relative w-[300px] sm:w-[325px] h-[410px] flex items-center justify-center cursor-pointer my-2 select-none"
              >
                <div className="absolute inset-0 bg-[#d8c8cf] rounded-sm rotate-[5deg] translate-x-2.5 translate-y-2 shadow-xl opacity-75" />
                <div className="absolute inset-0 bg-[#f5e1e8] rounded-sm rotate-[2.5deg] translate-x-1.5 translate-y-1 shadow-xl opacity-90" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={CUTE_MEMORIES[activeMemoryIndex].id}
                    initial={{ opacity: 0, rotate: -4, scale: 0.94 }}
                    animate={{ opacity: 1, rotate: -1.5, scale: 1 }}
                    exit={{ opacity: 0, x: -80, rotate: -10 }}
                    transition={{ duration: 0.28 }}
                    className="relative w-full h-full bg-[#fdfbf7] p-3.5 pb-12 rounded-sm shadow-[0_20px_45px_rgba(0,0,0,0.8)] flex flex-col justify-between"
                  >
                    <div className="w-full h-[305px] bg-[#ebe5df] overflow-hidden rounded-[2px] shadow-inner">
                      <img
                        src={CUTE_MEMORIES[activeMemoryIndex].image}
                        alt={CUTE_MEMORIES[activeMemoryIndex].caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <p className="font-handwriting text-[#3a2618] text-[20px] sm:text-[22px] leading-tight px-1 pt-2.5 line-clamp-2">
                      {CUTE_MEMORIES[activeMemoryIndex].caption}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Prev / Next & 5 Pagination Dots */}
              <div className="flex items-center justify-between w-full max-w-[310px] px-2 mt-4 mb-2">
                <button
                  onClick={() => setActiveMemoryIndex((prev) => (prev - 1 + CUTE_MEMORIES.length) % CUTE_MEMORIES.length)}
                  aria-label="Previous photo"
                  className="w-10 h-10 rounded-full border border-[#5e2c3e] bg-[#220915]/90 hover:bg-[#340f22] text-[#f99bb9] flex items-center justify-center cursor-pointer transition-all active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {CUTE_MEMORIES.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMemoryIndex(idx)}
                      aria-label={`Memory ${idx + 1}`}
                      className={`rounded-full transition-all cursor-pointer ${
                        idx === activeMemoryIndex
                          ? 'w-7 h-2.5 bg-gradient-to-r from-[#f4729b] to-[#fb7185] shadow-[0_0_8px_#f4729b]'
                          : 'w-2.5 h-2.5 bg-[#6e3b4b] hover:bg-[#9c546b]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveMemoryIndex((prev) => (prev + 1) % CUTE_MEMORIES.length)}
                  aria-label="Next photo"
                  className="w-10 h-10 rounded-full border border-[#5e2c3e] bg-[#220915]/90 hover:bg-[#340f22] text-[#f99bb9] flex items-center justify-center cursor-pointer transition-all active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <p className="gold-text text-xs sm:text-sm font-medium mb-6">
                Tap photo or use arrows to flip through our memories ✨
              </p>

              <button
                onClick={() => setStage('balloons')}
                className="gold-btn px-11 py-4 rounded-full text-[#f99bb9] text-lg font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-[0_0_25px_rgba(234,179,8,0.25)]"
              >
                <span>Next Surprise</span>
                <span>🎁</span>
              </button>
            </motion.div>
          )}

          {/* =========================================================
              STAGE 9: POP THE WISHES BALLOON GAME
             ========================================================= */}
          {stage === 'balloons' && (
            <motion.div
              key="stage-balloons"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[34px] font-bold mb-1.5 flex items-center justify-center gap-2">
                <span>Pop the Wishes</span>
                <span>🎈</span>
              </h1>
              <p className="gold-text text-[15px] font-medium mb-8">
                Tap each balloon to reveal a little wish
              </p>

              {poppedIds.length < BALLOON_WISHES.length && (
                <div className="w-full flex flex-col items-center gap-4 mb-6 min-h-[250px] justify-center">
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
                    {BALLOON_WISHES.slice(0, 5).map((b, idx) => {
                      const isPopped = poppedIds.includes(b.id);
                      return (
                        <div key={b.id} className="w-14 sm:w-16 h-32 flex flex-col items-center justify-start">
                          <AnimatePresence>
                            {!isPopped && (
                              <motion.button
                                initial={{ scale: 0 }}
                                animate={{
                                  scale: 1,
                                  y: [0, -7, 0],
                                }}
                                exit={{
                                  scale: [1, 1.35, 0],
                                  opacity: [1, 0.8, 0],
                                  transition: { duration: 0.22 },
                                }}
                                transition={{
                                  y: {
                                    duration: 2.4 + idx * 0.25,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  },
                                }}
                                onClick={() => handlePopBalloon(b.id, b.wish)}
                                className="relative flex flex-col items-center cursor-pointer group focus:outline-none"
                              >
                                <div
                                  className={`w-14 sm:w-16 h-[74px] rounded-[50%_50%_48%_48%/55%_55%_45%_45%] bg-gradient-to-br ${b.color} shadow-[inset_-6px_-8px_16px_rgba(0,0,0,0.35),0_8px_20px_rgba(0,0,0,0.4)] relative flex items-center justify-center group-hover:scale-105 transition-transform`}
                                >
                                  <div className="w-3.5 h-6 rounded-full bg-white/65 blur-[1px] absolute top-2.5 left-3 -rotate-12" />
                                </div>
                                <div className={`w-2.5 h-2 -mt-0.5 clip-triangle bg-gradient-to-b ${b.color}`} />
                                <div className="w-[1.5px] h-11 bg-white/45" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center">
                    {BALLOON_WISHES.slice(5, 6).map((b) => {
                      const isPopped = poppedIds.includes(b.id);
                      return (
                        <div key={b.id} className="w-16 h-32 flex flex-col items-center justify-start">
                          <AnimatePresence>
                            {!isPopped && (
                              <motion.button
                                initial={{ scale: 0 }}
                                animate={{
                                  scale: 1,
                                  y: [0, -8, 0],
                                }}
                                exit={{
                                  scale: [1, 1.35, 0],
                                  opacity: [1, 0.8, 0],
                                  transition: { duration: 0.22 },
                                }}
                                transition={{
                                  y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
                                }}
                                onClick={() => handlePopBalloon(b.id, b.wish)}
                                className="relative flex flex-col items-center cursor-pointer group focus:outline-none"
                              >
                                <div
                                  className={`w-14 sm:w-16 h-[74px] rounded-[50%_50%_48%_48%/55%_55%_45%_45%] bg-gradient-to-br ${b.color} shadow-[inset_-6px_-8px_16px_rgba(0,0,0,0.35),0_8px_20px_rgba(0,0,0,0.4)] relative flex items-center justify-center group-hover:scale-105 transition-transform`}
                                >
                                  <div className="w-3.5 h-6 rounded-full bg-white/65 blur-[1px] absolute top-2.5 left-3 -rotate-12" />
                                </div>
                                <div className={`w-2.5 h-2 -mt-0.5 bg-gradient-to-b ${b.color}`} />
                                <div className="w-[1.5px] h-11 bg-white/45" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {lastPoppedWish && (
                  <motion.div
                    key={lastPoppedWish}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`w-full max-w-[350px] px-5 py-4 rounded-2xl border border-[#5e243b] bg-[#220915]/90 text-white text-[16px] font-semibold shadow-lg ${
                      poppedIds.length === BALLOON_WISHES.length ? 'mt-20 mb-7' : 'mb-6'
                    }`}
                  >
                    {lastPoppedWish}
                  </motion.div>
                )}
              </AnimatePresence>

              {poppedIds.length < BALLOON_WISHES.length ? (
                <div className="px-10 py-3.5 rounded-full border border-[#573c28] bg-[#1c0711]/90 text-[#a5697f] text-lg font-bold">
                  Popped {poppedIds.length}/{BALLOON_WISHES.length}
                </div>
              ) : (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setStage('puzzle')}
                  className="gold-btn px-11 py-4 rounded-full text-[#f99bb9] text-lg font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <span>💫</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* =========================================================
              STAGE 10: BIRTHDAY PUZZLE
             ========================================================= */}
          {stage === 'puzzle' && (
            <motion.div
              key="stage-puzzle"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[33px] font-bold mb-1 flex items-center justify-center gap-2">
                <span>Birthday Puzzle</span>
                <span>🎂</span>
              </h1>
              <p className="gold-text text-[15px] font-medium mb-5">
                Solve to unlock a special message ✨
              </p>

              {!puzzleSolved ? (
                <>
                  <div className="flex items-center justify-center gap-5 mb-5">
                    <div className="w-24 h-24 rounded-2xl border border-[#4f2837] bg-[#1c0711]/90 flex flex-col items-center justify-center">
                      <span className="font-display-glow text-3xl font-bold tabular-nums">
                        {puzzleMoves}
                      </span>
                      <span className="gold-text text-[11px] font-semibold tracking-widest mt-1">
                        MOVES
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#5e2c3f] shadow-md">
                        <img
                          src={puzzlePhotoDefault}
                          alt="Target preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="gold-text text-[11px] font-semibold tracking-widest mt-1.5">
                        PICTURE
                      </span>
                    </div>
                  </div>

                  <div className="w-[318px] h-[318px] sm:w-[336px] sm:h-[336px] rounded-2xl overflow-hidden bg-[#0c0206] p-1 grid grid-cols-3 gap-1 border border-[#4a1c2f] shadow-2xl mb-6">
                    {tiles.map((tileNum, gridIdx) => {
                      if (tileNum === 8) {
                        return (
                          <div
                            key="empty-tile"
                            className="w-full h-full bg-[#090104] rounded-md"
                          />
                        );
                      }
                      const origRow = Math.floor(tileNum / 3);
                      const origCol = tileNum % 3;
                      return (
                        <button
                          key={tileNum}
                          onClick={() => handleTileClick(gridIdx)}
                          aria-label={`Tile ${tileNum + 1}`}
                          className="w-full h-full overflow-hidden rounded-md relative cursor-pointer active:scale-[0.98] transition-transform focus:outline-none"
                          style={{
                            backgroundImage: `url(${puzzlePhotoDefault})`,
                            backgroundSize: '300% 300%',
                            backgroundPosition: `${origCol * 50}% ${origRow * 50}%`,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex flex-col items-center gap-3 w-full max-w-[270px]">
                    <button
                      onClick={shufflePuzzle}
                      className="gold-btn w-full py-3.5 rounded-full text-[#f99bb9] text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>🔀</span>
                      <span>Shuffle Again</span>
                    </button>

                    <button
                      onClick={handleSolveForMe}
                      className="w-full py-3.5 rounded-full border border-[#a17c38] bg-gradient-to-r from-[#4b1927] to-[#5e2131] hover:from-[#5e2031] hover:to-[#73283c] text-[#f99bb9] text-base font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(215,177,91,0.2)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>✨</span>
                      <span>Solve it for me</span>
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative w-[318px] h-[318px] sm:w-[340px] sm:h-[340px] rounded-2xl overflow-hidden border-2 border-[#b5893d] shadow-[0_0_40px_rgba(215,177,91,0.35)] mb-5">
                    <img
                      src={puzzlePhotoDefault}
                      alt="Completed Birthday Puzzle"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-[#f493b2] text-lg font-bold mb-4 flex items-center gap-2">
                    <span>🎉</span>
                    <span>Puzzle complete!</span>
                    <span>🎊</span>
                  </p>

                  <button
                    onClick={() => setStage('scratch')}
                    className="gold-btn w-full max-w-[310px] py-4 rounded-full text-[#f99bb9] text-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>One Last Surprise</span>
                    <span>✨</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* =========================================================
              STAGE 11: ONE LAST SURPRISE SCRATCH CARD
             ========================================================= */}
          {stage === 'scratch' && (
            <motion.div
              key="stage-scratch"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[33px] font-bold mb-1.5 flex items-center justify-center gap-2">
                <span>One Last Surprise</span>
                <span>✨</span>
              </h1>
              <p className="gold-text text-[15px] font-medium mb-7">
                {scratchRevealed ? 'You uncovered it! 💝' : 'Scratch the golden card to reveal it'}
              </p>

              <div className="relative w-full max-w-[350px] h-[225px] rounded-2xl overflow-hidden shadow-[0_0_45px_rgba(168,85,247,0.35)] border border-white/20 select-none touch-none">
                <div className="absolute inset-0">
                  <img
                    src={surprisePhotoDefault}
                    alt="Hidden Birthday Surprise"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-center pointer-events-none">
                    <h2 className="text-[#fde047] text-2xl font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] mb-0.5">
                      Happy Birthday Sansu Baby! 🎉
                    </h2>
                    <p className="text-white text-xs sm:text-sm font-semibold drop-shadow">
                      You found our special surprise memory 💝
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {!scratchRevealed && (
                    <motion.canvas
                      ref={scratchCanvasRef}
                      width={350}
                      height={225}
                      exit={{ opacity: 0, transition: { duration: 0.45 } }}
                      onMouseDown={(e) => {
                        isDrawingRef.current = true;
                        handleScratchMove(e.clientX, e.clientY);
                      }}
                      onMouseMove={(e) => {
                        if (isDrawingRef.current) {
                          handleScratchMove(e.clientX, e.clientY);
                        }
                      }}
                      onMouseUp={() => {
                        isDrawingRef.current = false;
                      }}
                      onMouseLeave={() => {
                        isDrawingRef.current = false;
                      }}
                      onTouchStart={(e) => {
                        isDrawingRef.current = true;
                        const touch = e.touches[0];
                        if (touch) handleScratchMove(touch.clientX, touch.clientY);
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        if (touch) handleScratchMove(touch.clientX, touch.clientY);
                      }}
                      onTouchEnd={() => {
                        isDrawingRef.current = false;
                      }}
                      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                    />
                  )}
                </AnimatePresence>
              </div>

              {!scratchRevealed && (
                <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden mt-6">
                  <div
                    className="h-full bg-pink-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, scratchPercent * 2.2)}%` }}
                  />
                </div>
              )}

              {scratchRevealed && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setStage('letter')}
                  className="gold-btn px-10 py-4 rounded-full text-[#f99bb9] text-lg font-bold flex items-center gap-2.5 mt-7 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Read My Letter</span>
                  <span>💌</span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* =========================================================
              STAGE 12: A LETTER JUST FOR YOU
             ========================================================= */}
          {stage === 'letter' && (
            <motion.div
              key="stage-letter"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center text-center"
            >
              <h1 className="font-display-glow text-[31px] sm:text-[34px] font-bold mb-6">
                A Letter Just For You
              </h1>

              {!envelopeOpened ? (
                <div className="flex flex-col items-center w-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEnvelopeOpened(true)}
                    className="w-full max-w-[340px] aspect-[1.45/1] rounded-2xl overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.65)] cursor-pointer relative mb-4"
                  >
                    <svg viewBox="0 0 340 235" className="w-full h-full">
                      <rect width="340" height="235" rx="12" fill="#e0b26b" />
                      <rect x="14" y="16" width="312" height="190" rx="10" fill="#fbf6ec" />
                      <polygon points="0,85 170,175 0,235" fill="#d7a55b" />
                      <polygon points="340,85 170,175 340,235" fill="#d7a55b" />
                      <polygon points="0,235 170,140 340,235" fill="#dfaf67" />
                      <polygon points="120,145 170,172 220,145" fill="#c7954c" />
                      <circle cx="170" cy="116" r="24" fill="url(#waxSealGrad)" />
                      <path
                        d="M170 124C170 124 162 118.2 162 113.2C162 110.8 163.9 109 166.2 109C167.7 109 169.1 109.8 170 111.1C170.9 109.8 172.3 109 173.8 109C176.1 109 178 110.8 178 113.2C178 118.2 170 124 170 124Z"
                        fill="#ffffff"
                      />
                      <defs>
                        <radialGradient id="waxSealGrad" cx="35%" cy="30%" r="65%">
                          <stop offset="0%" stopColor="#fb7185" />
                          <stop offset="55%" stopColor="#db2777" />
                          <stop offset="100%" stopColor="#831843" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  <p
                    onClick={() => setEnvelopeOpened(true)}
                    className="gold-text text-base font-medium mb-5 cursor-pointer"
                  >
                    Tap to open 💌
                  </p>

                  <button
                    onClick={handleWatchAgain}
                    className="px-6 py-2.5 rounded-full border border-[#5c2c3d] bg-[#210813]/90 hover:bg-[#330d1e] text-[#f3e1c0] text-sm font-medium flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>↻</span>
                    <span>Watch it again</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full max-w-[360px] min-h-[450px] rounded-2xl border border-[#57293a] lined-paper p-6 text-left shadow-[0_18px_45px_rgba(0,0,0,0.75)] mb-6 relative overflow-hidden">
                    <h2 className="font-handwriting text-[#f48fb1] text-3xl font-bold mb-4">
                      {LETTER_GREETING}
                    </h2>
                    <div className="font-handwriting text-[#e8cf9c] text-[22px] leading-[36px] whitespace-pre-line">
                      {typedLetter}
                      {typedLetter.length < LETTER_BODY.length && (
                        <span className="inline-block w-0.5 h-5 bg-pink-300 ml-1 animate-pulse" />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleWatchAgain}
                    className="px-6 py-2.5 rounded-full border border-[#5c2c3d] bg-[#210813]/90 hover:bg-[#330d1e] text-[#f3e1c0] text-sm font-medium flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>↻</span>
                    <span>Watch it again</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showFloatingMusicBtn && (
        <button
          onClick={toggleMusic}
          aria-label="Toggle background music"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#1a0610]/90 border border-[#7c5d2a] shadow-[0_0_20px_rgba(0,0,0,0.7)] flex items-center justify-center text-[#93c5fd] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {isPlaying ? (
            <Music className="w-5 h-5 text-[#7dd3fc]" />
          ) : (
            <VolumeX className="w-5 h-5 text-pink-300/70" />
          )}
        </button>
      )}
    </div>
  );
}
