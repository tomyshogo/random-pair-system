"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types
interface Group {
  members: string[];
}

// Glee Christmas Songs (YouTube audio - using free Christmas music alternatives)
const CHRISTMAS_SONGS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder - will use Web Audio API for actual implementation
];

// Sound effects URLs (using Web Audio API to generate)
const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playSpinSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Sound not available', e);
    }
  }, []);

  const playWinSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 - Christmas bell sound
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.15 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5);
        
        oscillator.start(ctx.currentTime + i * 0.15);
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.5);
      });
    } catch (e) {
      console.log('Sound not available', e);
    }
  }, []);

  const playTickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (e) {
      console.log('Sound not available', e);
    }
  }, []);

  return { playSpinSound, playWinSound, playTickSound };
};

// Christmas Background with lights
function ChristmasBackground() {
  return (
    <>
      <div className="christmas-background" />
      <div className="floating-lights">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="light-orb"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${30 + Math.random() * 50}px`,
              height: `${30 + Math.random() * 50}px`,
              backgroundColor: ['#ff6b6b', '#ffd700', '#4ecdc4', '#ff9f43', '#a29bfe'][i % 5],
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// Realistic 3D Snowflakes
function RealisticSnow() {
  const [snowflakes, setSnowflakes] = useState<
    { id: number; left: number; delay: number; duration: number; size: number; depth: 'far' | 'mid' | 'near'; char: string }[]
  >([]);

  useEffect(() => {
    const snowChars = ['❄', '❅', '❆', '✻', '✼', '•'];
    const flakes = Array.from({ length: 100 }, (_, i) => {
      const depth = i < 30 ? 'far' : i < 70 ? 'mid' : 'near';
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: depth === 'far' ? 15 + Math.random() * 10 : depth === 'mid' ? 10 + Math.random() * 8 : 6 + Math.random() * 6,
        size: depth === 'far' ? 0.5 + Math.random() * 0.5 : depth === 'mid' ? 0.8 + Math.random() * 0.6 : 1 + Math.random() * 0.8,
        depth,
        char: snowChars[Math.floor(Math.random() * snowChars.length)],
      };
    });
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snow-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className={`snowflake ${flake.depth}`}
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}rem`,
          }}
        >
          {flake.char}
        </div>
      ))}
    </div>
  );
}

// Confetti component
function Confetti({ show }: { show: boolean }) {
  const [confetti, setConfetti] = useState<
    { id: number; left: number; color: string; delay: number; emoji: string }[]
  >([]);

  useEffect(() => {
    if (show) {
      const emojis = ['🎄', '⭐', '🎁', '🔔', '❄', '🎅', '🦌', '🍪', '🥛', '✨'];
      const pieces = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ['#c41e3a', '#228b22', '#ffd700', '#ff6b6b', '#4ecdc4'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 3,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setConfetti(pieces);
    } else {
      setConfetti([]);
    }
  }, [show]);

  return (
    <>
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti text-3xl"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {piece.emoji}
        </div>
      ))}
    </>
  );
}

// Music Player Component
function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const christmasSongs = [
    { name: "Jingle Bells", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Silent Night", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Deck the Halls", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  ];

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(christmasSongs[currentSong].url);
      audioRef.current.loop = false;
      audioRef.current.volume = 0.3;
      audioRef.current.onended = () => {
        const nextSong = (currentSong + 1) % christmasSongs.length;
        setCurrentSong(nextSong);
        if (audioRef.current) {
          audioRef.current.src = christmasSongs[nextSong].url;
          audioRef.current.play();
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleMusic}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-r from-red-600 to-green-600 text-white shadow-lg hover:shadow-xl transition-all ${isPlaying ? 'music-playing' : ''}`}
      title={isPlaying ? 'BGMを停止' : 'BGMを再生'}
    >
      {isPlaying ? '🎵' : '🔇'}
    </button>
  );
}

// Roulette wheel component
function RouletteWheel({
  names,
  isSpinning,
  currentIndex,
}: {
  names: string[];
  isSpinning: boolean;
  currentIndex: number;
}) {
  if (names.length === 0) return null;

  const displayName = names[currentIndex] || names[0];

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer decorative ring */}
      <div className="absolute w-80 h-80 rounded-full border-4 border-yellow-400/30 animate-pulse" />
      
      {/* Main roulette */}
      <div
        className={`w-72 h-72 rounded-full bg-gradient-to-br from-red-700 via-red-600 to-red-800 
        flex items-center justify-center border-8 border-yellow-400 shadow-2xl relative overflow-hidden
        ${isSpinning ? 'christmas-glow' : ''}`}
      >
        {/* Decorative segments */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-1 bg-yellow-400/20"
            style={{
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: 'center',
            }}
          />
        ))}
        
        {/* Inner green ring */}
        <div className="w-56 h-56 rounded-full bg-gradient-to-br from-green-700 via-green-600 to-green-800 flex items-center justify-center border-4 border-yellow-300 shadow-inner">
          {/* Center display */}
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center shadow-inner relative">
            {/* Sparkles */}
            {isSpinning && (
              <>
                <span className="sparkle absolute top-2 left-4 text-yellow-400">✦</span>
                <span className="sparkle absolute bottom-4 right-2 text-yellow-400" style={{ animationDelay: '0.5s' }}>✦</span>
                <span className="sparkle absolute top-8 right-4 text-yellow-400" style={{ animationDelay: '1s' }}>✦</span>
              </>
            )}
            <span
              className={`text-2xl font-bold text-center px-3 ${isSpinning ? 'animate-pulse' : ''}`}
              style={{ color: '#c41e3a' }}
            >
              {isSpinning ? (
                <span className="text-4xl">🎄</span>
              ) : (
                displayName
              )}
            </span>
          </div>
        </div>
      </div>
      
      {/* Pointer */}
      <div className="absolute -top-2 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
        <div className="text-2xl -mt-1">⭐</div>
      </div>
    </div>
  );
}

// Main component
export default function ChristmasPairRoulette() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");
  const [groupSize, setGroupSize] = useState(2); // New: group size setting
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [remainingNames, setRemainingNames] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { playTickSound, playWinSound } = useSoundEffects();

  // Add participant
  const addParticipant = () => {
    const trimmedName = inputName.trim();
    if (trimmedName && !participants.includes(trimmedName)) {
      setParticipants([...participants, trimmedName]);
      setInputName("");
    }
  };

  // Remove participant
  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  // Shuffle array (Fisher-Yates)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate groups from participants
  const generateGroups = useCallback(() => {
    const shuffled = shuffleArray(participants);
    const newGroups: Group[] = [];

    for (let i = 0; i < shuffled.length; i += groupSize) {
      const members = shuffled.slice(i, i + groupSize);
      newGroups.push({ members });
    }

    // Handle remainder - merge with last complete group
    const lastGroup = newGroups[newGroups.length - 1];
    if (lastGroup && lastGroup.members.length < groupSize && newGroups.length > 1) {
      const secondLastGroup = newGroups[newGroups.length - 2];
      secondLastGroup.members.push(...lastGroup.members);
      newGroups.pop();
    }

    return newGroups;
  }, [participants, groupSize]);

  // Start roulette
  const startRoulette = () => {
    if (participants.length < groupSize) {
      alert(`${groupSize}人以上の参加者が必要です！`);
      return;
    }

    const newGroups = generateGroups();
    setGroups(newGroups);
    setCurrentGroupIndex(0);
    setShowResult(false);
    setRemainingNames([...participants]);
    spinForNextGroup([...participants], newGroups, 0);
  };

  // Spin for next group
  const spinForNextGroup = (
    remaining: string[],
    allGroups: Group[],
    groupIdx: number
  ) => {
    if (groupIdx >= allGroups.length) {
      setShowConfetti(true);
      playWinSound();
      setTimeout(() => setShowConfetti(false), 6000);
      return;
    }

    setIsSpinning(true);
    setShowResult(false);

    let spinCount = 0;
    const maxSpins = 35 + Math.floor(Math.random() * 25);

    const spinInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % remaining.length);
      playTickSound();
      spinCount++;

      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setShowResult(true);
        setCurrentGroupIndex(groupIdx);
        playWinSound();

        // Remove grouped names from remaining
        const group = allGroups[groupIdx];
        const newRemaining = remaining.filter((n) => !group.members.includes(n));
        setRemainingNames(newRemaining);
      }
    }, 40 + spinCount * 3);
  };

  // Continue to next group
  const continueToNextGroup = () => {
    if (currentGroupIndex + 1 < groups.length) {
      spinForNextGroup(remainingNames, groups, currentGroupIndex + 1);
    }
  };

  // Reset all
  const resetAll = () => {
    setGroups([]);
    setShowResult(false);
    setCurrentGroupIndex(0);
    setRemainingNames([]);
    setShowConfetti(false);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addParticipant();
    }
  };

  // Calculate how groups will be formed
  const getGroupInfo = () => {
    if (participants.length === 0) return null;
    const fullGroups = Math.floor(participants.length / groupSize);
    const remainder = participants.length % groupSize;
    
    if (remainder === 0) {
      return `${groupSize}人グループ × ${fullGroups}組`;
    } else if (fullGroups === 0) {
      return `参加者が足りません（最低${groupSize}人必要）`;
    } else {
      return `${groupSize}人グループ × ${fullGroups - 1}組 + ${groupSize + remainder}人グループ × 1組`;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      <ChristmasBackground />
      <RealisticSnow />
      <Confetti show={showConfetti} />
      <MusicPlayer />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🎄 クリスマス 🎄
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">
            グループ決めルーレット
          </h2>
          <p className="text-white/80 mt-2">
            参加者を追加してルーレットを回そう！🎅
          </p>
        </div>

        {/* Group Size Setting */}
        <div className="glass-card rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👥</span> グループ人数設定
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[2, 3, 4, 5, 6].map((size) => (
              <button
                key={size}
                onClick={() => setGroupSize(size)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  groupSize === size
                    ? 'bg-gradient-to-r from-red-500 to-green-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}人
              </button>
            ))}
          </div>
          {getGroupInfo() && (
            <p className="text-sm text-gray-600 mt-3 bg-yellow-50 p-2 rounded-lg">
              📊 {getGroupInfo()}
            </p>
          )}
        </div>

        {/* Input Section */}
        <div className="glass-card rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎁</span> 参加者を追加
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="名前を入力..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-800 text-lg"
            />
            <button
              onClick={addParticipant}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              追加 ✨
            </button>
          </div>

          {/* Participants list */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {participants.map((name, idx) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-50 to-green-50 text-gray-800 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-sm text-gray-400 mr-1">{idx + 1}.</span>
                {name}
                <button
                  onClick={() => removeParticipant(name)}
                  className="ml-1 text-red-400 hover:text-red-600 font-bold transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {participants.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              👥 参加者数: <span className="font-bold text-green-600">{participants.length}</span>人
            </p>
          )}
        </div>

        {/* Roulette Section */}
        <div className="glass-card rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <RouletteWheel
              names={remainingNames.length > 0 ? remainingNames : participants}
              isSpinning={isSpinning}
              currentIndex={currentIndex}
            />

            <div className="mt-8 flex gap-4 flex-wrap justify-center">
              {groups.length === 0 ? (
                <button
                  onClick={startRoulette}
                  disabled={participants.length < groupSize || isSpinning}
                  className="px-10 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white font-bold rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                >
                  🎰 ルーレットスタート！
                </button>
              ) : (
                <>
                  {showResult && currentGroupIndex + 1 < groups.length && (
                    <button
                      onClick={continueToNextGroup}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-xl"
                    >
                      次のグループ 🎄
                    </button>
                  )}
                  <button
                    onClick={resetAll}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                  >
                    🔄 リセット
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {groups.length > 0 && (
          <div className="glass-card rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎊</span> グループ結果
            </h3>
            <div className="space-y-4">
              {groups.map((group, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-2xl transition-all border-2
                    ${
                      index <= currentGroupIndex && showResult
                        ? 'bg-gradient-to-r from-red-50 via-white to-green-50 border-yellow-400 result-reveal winner-card'
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500">
                      グループ {index + 1}
                    </span>
                    {index <= currentGroupIndex && showResult && (
                      <span className="text-xl">🎄</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {group.members.map((member, memberIdx) => (
                      <div key={memberIdx} className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${memberIdx % 2 === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {index <= currentGroupIndex && showResult ? member : '?'}
                        </span>
                        {memberIdx < group.members.length - 1 && (
                          <span className="text-2xl">💝</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {showResult && currentGroupIndex + 1 >= groups.length && (
              <div className="mt-8 text-center p-6 bg-gradient-to-r from-red-100 via-yellow-50 to-green-100 rounded-2xl">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 mb-2">
                  🎉 全グループ決定！ 🎉
                </p>
                <p className="text-gray-600 text-lg">
                  メリークリスマス！🎅🎄<br />
                  素敵なグループで楽しんでね！
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>🎄 Merry Christmas 2024 🎄</p>
          <p className="text-xs mt-1 text-white/50">🔊 右上のボタンでBGMをON/OFF</p>
        </div>
      </div>
    </div>
  );
}
