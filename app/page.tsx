"use client";

import { useState, useEffect, useCallback } from "react";

// Types
interface Pair {
  person1: string;
  person2: string;
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
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [remainingNames, setRemainingNames] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

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

  // Generate pairs from participants
  const generatePairs = useCallback(() => {
    const shuffled = shuffleArray(participants);
    const newPairs: Pair[] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        newPairs.push({ person1: shuffled[i], person2: shuffled[i + 1] });
      } else {
        // Odd number - last person pairs with first pair
        if (newPairs.length > 0) {
          newPairs.push({ person1: shuffled[i], person2: "（3人グループ）" });
        }
      }
    }

    return newPairs;
  }, [participants]);

  // Start roulette
  const startRoulette = () => {
    if (participants.length < 2) {
      alert("2人以上の参加者が必要です！");
      return;
    }

    const newPairs = generatePairs();
    setPairs(newPairs);
    setCurrentPairIndex(0);
    setShowResult(false);
    setRemainingNames([...participants]);
    spinForNextPair([...participants], newPairs, 0);
  };

  // Spin for next pair
  const spinForNextPair = (
    remaining: string[],
    allPairs: Pair[],
    pairIdx: number
  ) => {
    if (pairIdx >= allPairs.length) {
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
        setCurrentPairIndex(pairIdx);

        // Remove paired names from remaining
        const pair = allPairs[pairIdx];
        const newRemaining = remaining.filter(
          (n) => n !== pair.person1 && n !== pair.person2
        );
        setRemainingNames(newRemaining);
      }
    }, 50 + spinCount * 2);
  };

  // Continue to next pair
  const continueToNextPair = () => {
    if (currentPairIndex + 1 < pairs.length) {
      spinForNextPair(remainingNames, pairs, currentPairIndex + 1);
    }
  };

  // Reset all
  const resetAll = () => {
    setPairs([]);
    setShowResult(false);
    setCurrentPairIndex(0);
    setRemainingNames([]);
    setShowConfetti(false);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addParticipant();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      <Snowflakes />
      <Confetti show={showConfetti} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🎄 クリスマス 🎄
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">
            ペア決めルーレット
          </h2>
          <p className="text-white/80 mt-2">
            参加者を追加してルーレットを回そう！
          </p>
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
              {participants.length % 2 !== 0 && (
                <span className="text-orange-500 ml-2">
                  ※奇数のため1組は3人グループになります
                </span>
              )}
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

            <div className="mt-6 flex gap-4">
              {pairs.length === 0 ? (
                <button
                  onClick={startRoulette}
                  disabled={participants.length < 2 || isSpinning}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  🎰 ルーレットスタート！
                </button>
              ) : (
                <>
                  {showResult && currentPairIndex + 1 < pairs.length && (
                    <button
                      onClick={continueToNextPair}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg text-lg"
                    >
                      次のペア 🎄
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
        {pairs.length > 0 && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎁</span> ペア結果
            </h3>
            <div className="space-y-3">
              {pairs.map((pair, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center gap-4 p-4 rounded-xl transition-all
                    ${
                      index <= currentPairIndex && showResult
                        ? "bg-gradient-to-r from-red-100 via-white to-green-100 result-reveal"
                        : "bg-gray-100 opacity-50"
                    }`}
                >
                  <span className="text-xl font-bold text-red-600">
                    {index <= currentPairIndex && showResult ? pair.person1 : "?"}
                  </span>
                  <span className="text-2xl">💝</span>
                  <span className="text-xl font-bold text-green-600">
                    {index <= currentPairIndex && showResult ? pair.person2 : "?"}
                  </span>
                </div>
              ))}
            </div>

            {showResult && currentPairIndex + 1 >= pairs.length && (
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
                  🎉 全てのペアが決定しました！ 🎉
                </p>
                <p className="text-gray-600 mt-2">
                  メリークリスマス！素敵なペアで楽しんでね 🎄
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
