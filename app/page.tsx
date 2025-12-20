"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types
interface Group {
  members: string[];
}

// Snowflake component
function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<
    { id: number; left: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 5 + Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
}

// Confetti component
function Confetti({ show }: { show: boolean }) {
  const [confetti, setConfetti] = useState<
    { id: number; left: number; color: string; delay: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      const pieces = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ["#c41e3a", "#228b22", "#ffd700", "#ff6b6b", "#4ecdc4"][
          Math.floor(Math.random() * 5)
        ],
        delay: Math.random() * 2,
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
          className="confetti text-2xl"
          style={{
            left: `${piece.left}%`,
            color: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {["🎄", "⭐", "🎁", "🔔", "❄"][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </>
  );
}

// BGM Player component
function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // クリスマスBGM URLs (著作権フリー)
  const bgmTracks = [
    {
      name: "Jingle Bells",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  ];

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    // Use a royalty-free Christmas-style music
    audioRef.current.src = "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c8.mp3?filename=christmas-eve-116763.mp3";

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg ${
            isPlaying
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
              : "bg-gradient-to-r from-green-500 to-green-600 text-white"
          }`}
        >
          {isPlaying ? "🔊" : "🔇"}
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600 font-medium">🎵 BGM</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-2 accent-red-500"
          />
        </div>
      </div>
    </div>
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
      <div
        className={`w-64 h-64 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 
        flex items-center justify-center border-8 border-yellow-400 shadow-2xl
        ${isSpinning ? "christmas-glow" : ""}`}
      >
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center border-4 border-yellow-300">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-inner">
            <span
              className={`text-2xl font-bold text-center px-2 ${
                isSpinning ? "animate-pulse" : ""
              }`}
              style={{ color: "#c41e3a" }}
            >
              {isSpinning ? "🎄" : displayName}
            </span>
          </div>
        </div>
      </div>
      {/* Pointer */}
      <div className="absolute -top-4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-yellow-400"></div>
    </div>
  );
}

// Main component
export default function ChristmasPairRoulette() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [remainingNames, setRemainingNames] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [groupSize, setGroupSize] = useState(2); // 1グループの人数

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
      const members = shuffled.slice(i, Math.min(i + groupSize, shuffled.length));
      newGroups.push({ members });
    }

    // 最後のグループが小さすぎる場合、前のグループと合併
    if (newGroups.length > 1) {
      const lastGroup = newGroups[newGroups.length - 1];
      if (lastGroup.members.length < Math.ceil(groupSize / 2)) {
        const prevGroup = newGroups[newGroups.length - 2];
        prevGroup.members.push(...lastGroup.members);
        newGroups.pop();
      }
    }

    return newGroups;
  }, [participants, groupSize]);

  // Calculate group info
  const getGroupInfo = () => {
    if (participants.length < groupSize) {
      return { groupCount: 0, remainder: participants.length };
    }
    const groupCount = Math.floor(participants.length / groupSize);
    const remainder = participants.length % groupSize;
    return { groupCount, remainder };
  };

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
      setTimeout(() => setShowConfetti(false), 5000);
      return;
    }

    setIsSpinning(true);
    setShowResult(false);

    let spinCount = 0;
    const maxSpins = 30 + Math.floor(Math.random() * 20);

    const spinInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % remaining.length);
      spinCount++;

      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setShowResult(true);
        setCurrentGroupIndex(groupIdx);

        // Remove grouped names from remaining
        const group = allGroups[groupIdx];
        const newRemaining = remaining.filter(
          (n) => !group.members.includes(n)
        );
        setRemainingNames(newRemaining);
      }
    }, 50 + spinCount * 2);
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

  const { groupCount, remainder } = getGroupInfo();

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      <Snowflakes />
      <Confetti show={showConfetti} />
      <BGMPlayer />

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
            参加者を追加してルーレットを回そう！
          </p>
        </div>

        {/* Group Size Settings */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚙️</span> グループ設定
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-700 font-medium">1グループの人数:</span>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((size) => (
                <button
                  key={size}
                  onClick={() => setGroupSize(size)}
                  className={`w-12 h-12 rounded-xl font-bold text-lg transition-all shadow-md ${
                    groupSize === size
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white scale-110"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {size}人
                </button>
              ))}
            </div>
          </div>
          {participants.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-green-50 rounded-lg">
              <p className="text-sm text-gray-600">
                📊 {participants.length}人 → 
                {groupCount > 0 ? (
                  <>
                    <span className="font-bold text-green-600"> {groupCount}グループ</span>
                    {remainder > 0 && (
                      <span className="text-orange-500">
                        （1グループは{groupSize + remainder}人になります）
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-red-500"> 人数が足りません</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👥</span> 参加者を追加
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="名前を入力..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-gray-800"
            />
            <button
              onClick={addParticipant}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              追加
            </button>
          </div>

          {/* Participants list */}
          <div className="flex flex-wrap gap-2">
            {participants.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-100 to-green-100 text-gray-800 rounded-full border border-gray-200"
              >
                {name}
                <button
                  onClick={() => removeParticipant(name)}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {participants.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              参加者数: {participants.length}人
            </p>
          )}
        </div>

        {/* Roulette Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <RouletteWheel
              names={remainingNames.length > 0 ? remainingNames : participants}
              isSpinning={isSpinning}
              currentIndex={currentIndex}
            />

            <div className="mt-6 flex gap-4 flex-wrap justify-center">
              {groups.length === 0 ? (
                <button
                  onClick={startRoulette}
                  disabled={participants.length < groupSize || isSpinning}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  🎰 ルーレットスタート！
                </button>
              ) : (
                <>
                  {showResult && currentGroupIndex + 1 < groups.length && (
                    <button
                      onClick={continueToNextGroup}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg text-lg"
                    >
                      次のグループ 🎄
                    </button>
                  )}
                  <button
                    onClick={resetAll}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                  >
                    リセット
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {groups.length > 0 && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎁</span> グループ結果
            </h3>
            <div className="space-y-3">
              {groups.map((group, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl transition-all
                    ${
                      index <= currentGroupIndex && showResult
                        ? "bg-gradient-to-r from-red-100 via-white to-green-100 result-reveal"
                        : "bg-gray-100 opacity-50"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-700">
                      グループ {index + 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({group.members.length}人)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {index <= currentGroupIndex && showResult ? (
                      group.members.map((member, mIdx) => (
                        <span
                          key={mIdx}
                          className={`px-4 py-2 rounded-full font-bold text-lg ${
                            mIdx % 2 === 0
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {member}
                        </span>
                      ))
                    ) : (
                      Array.from({ length: group.members.length }).map((_, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-4 py-2 rounded-full font-bold text-lg bg-gray-300 text-gray-500"
                        >
                          ?
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            {showResult && currentGroupIndex + 1 >= groups.length && (
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
                  🎉 全てのグループが決定しました！ 🎉
                </p>
                <p className="text-gray-600 mt-2">
                  メリークリスマス！素敵なグループで楽しんでね 🎄
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>🎄 Merry Christmas 2024 🎄</p>
        </div>
      </div>
    </div>
  );
}
