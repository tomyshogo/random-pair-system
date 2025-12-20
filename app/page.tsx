"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ================== 型定義 ==================
type Role = {
  name: string;
  emoji: string;
  color: string;
};

type PairResult = {
  members: string[];
  roles: Role[];
};

// ================== 定数 ==================
const ROLES: Role[] = [
  { name: "サンタ", emoji: "🎅", color: "#c41e3a" },
  { name: "トナカイ", emoji: "🦌", color: "#8B4513" },
  { name: "雪だるま", emoji: "⛄", color: "#4A90D9" },
  { name: "天使", emoji: "👼", color: "#FFD700" },
  { name: "エルフ", emoji: "🧝", color: "#228B22" },
  { name: "ツリー", emoji: "🎄", color: "#2E8B57" },
];

// ================== 効果音フック ==================
function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600 + Math.random() * 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.log(e);
    }
  }, [getCtx]);

  const playWin = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    } catch (e) {
      console.log(e);
    }
  }, [getCtx]);

  return { playTick, playWin };
}

// ================== 雪アニメーション ==================
function Snow() {
  const [flakes, setFlakes] = useState<{ id: number; x: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    setFlakes(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 12,
        size: 0.5 + Math.random() * 1,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute text-white opacity-80 animate-snow"
          style={{
            left: `${f.x}%`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            fontSize: `${f.size}rem`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

// ================== ルーレットホイール ==================
function RouletteWheel({
  names,
  isSpinning,
  rotation,
  onSpin,
  disabled,
}: {
  names: string[];
  isSpinning: boolean;
  rotation: number;
  onSpin: () => void;
  disabled: boolean;
}) {
  const segmentCount = names.length || 8;
  const segmentAngle = 360 / segmentCount;
  const colors = ["#c41e3a", "#228B22", "#c41e3a", "#228B22", "#c41e3a", "#228B22", "#c41e3a", "#228B22"];

  return (
    <div className="relative flex items-center justify-center">
      {/* 外側の装飾リング */}
      <div className="absolute w-80 h-80 rounded-full border-8 border-yellow-400 shadow-2xl" />
      
      {/* ルーレット本体（回転する部分） */}
      <div
        className="w-72 h-72 rounded-full relative overflow-hidden shadow-xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? "none" : "transform 0.1s ease-out",
          background: "conic-gradient(from 0deg, #c41e3a 0deg 45deg, #228B22 45deg 90deg, #c41e3a 90deg 135deg, #228B22 135deg 180deg, #c41e3a 180deg 225deg, #228B22 225deg 270deg, #c41e3a 270deg 315deg, #228B22 315deg 360deg)",
        }}
      >
        {/* 名前セグメント */}
        {names.length > 0 &&
          names.map((name, i) => {
            const angle = segmentAngle * i + segmentAngle / 2 - 90;
            return (
              <div
                key={i}
                className="absolute w-full h-full flex items-start justify-center pt-4"
                style={{
                  transform: `rotate(${segmentAngle * i}deg)`,
                }}
              >
                <span
                  className="text-white font-bold text-sm drop-shadow-lg px-1 truncate max-w-[70px]"
                  style={{ textShadow: "1px 1px 2px black" }}
                >
                  {name}
                </span>
              </div>
            );
          })}
        
        {/* セグメント区切り線 */}
        {names.length > 0 &&
          names.map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-yellow-400 origin-bottom"
              style={{ transform: `rotate(${segmentAngle * i}deg)` }}
            />
          ))}
      </div>

      {/* 中央のスタートボタン */}
      <button
        onClick={onSpin}
        disabled={disabled || isSpinning}
        className={`absolute w-24 h-24 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl z-10 transition-all
          ${disabled || isSpinning
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-400 hover:scale-105 active:scale-95 cursor-pointer"
          }`}
      >
        {isSpinning ? (
          <span className="text-3xl animate-pulse">🎄</span>
        ) : (
          <>
            <span className="text-2xl">🎰</span>
            <span className="text-xs mt-1">START</span>
          </>
        )}
      </button>

      {/* ポインター（上部の三角） */}
      <div className="absolute -top-2 z-20 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
      </div>
    </div>
  );
}

// ================== 紙吹雪 ==================
function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; emoji: string; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      const emojis = ["🎄", "⭐", "🎁", "🔔", "❄", "🎅", "🦌"];
      setPieces(
        Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          delay: Math.random() * 2,
        }))
      );
    } else {
      setPieces([]);
    }
  }, [show]);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="fixed top-0 text-2xl animate-confetti pointer-events-none z-50"
          style={{ left: `${p.x}%`, animationDelay: `${p.delay}s` }}
        >
          {p.emoji}
        </div>
      ))}
    </>
  );
}

// ================== メインコンポーネント ==================
export default function ChristmasRoulette() {
  // State
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  const [assignRoles, setAssignRoles] = useState(false);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [results, setResults] = useState<PairResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [remainingParticipants, setRemainingParticipants] = useState<string[]>([]);
  
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playTick, playWin } = useSoundEffects();

  // 参加者追加
  const addParticipant = () => {
    const name = inputName.trim();
    if (name && !participants.includes(name)) {
      setParticipants([...participants, name]);
      setInputName("");
    }
  };

  // 参加者削除
  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  // シャッフル
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // グループ生成
  const generateGroups = useCallback((): PairResult[] => {
    const shuffled = shuffle(participants);
    const groups: PairResult[] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      const members = shuffled.slice(i, Math.min(i + groupSize, shuffled.length));
      const roles = assignRoles ? shuffle(ROLES).slice(0, members.length) : [];
      groups.push({ members, roles });
    }
    
    // 最後のグループが少なすぎる場合、前のグループと統合
    if (groups.length > 1) {
      const last = groups[groups.length - 1];
      if (last.members.length < Math.ceil(groupSize / 2)) {
        const prev = groups[groups.length - 2];
        prev.members.push(...last.members);
        if (assignRoles) {
          prev.roles.push(...shuffle(ROLES).slice(0, last.members.length));
        }
        groups.pop();
      }
    }
    
    return groups;
  }, [participants, groupSize, assignRoles]);

  // ルーレット開始
  const startRoulette = () => {
    if (participants.length < groupSize) {
      alert(`${groupSize}人以上の参加者が必要です！`);
      return;
    }

    // リセット
    const groups = generateGroups();
    setResults(groups);
    setCurrentResultIndex(-1);
    setRemainingParticipants([...participants]);
    
    // 最初のスピン開始
    spinRoulette(participants, groups, 0);
  };

  // ルーレット回転
  const spinRoulette = (remaining: string[], groups: PairResult[], groupIndex: number) => {
    if (groupIndex >= groups.length) {
      setShowConfetti(true);
      playWin();
      setTimeout(() => setShowConfetti(false), 5000);
      return;
    }

    setIsSpinning(true);
    
    let currentRotation = rotation;
    let speed = 30; // 初速
    let spins = 0;
    const totalSpins = 40 + Math.floor(Math.random() * 30); // ランダムな回転数

    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }

    spinIntervalRef.current = setInterval(() => {
      spins++;
      
      // 徐々に減速
      if (spins > totalSpins * 0.6) {
        speed = Math.max(2, speed * 0.95);
      }
      
      currentRotation += speed;
      setRotation(currentRotation);
      playTick();

      // 停止
      if (spins >= totalSpins) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
        }
        setIsSpinning(false);
        setCurrentResultIndex(groupIndex);
        playWin();

        // 残りの参加者を更新
        const group = groups[groupIndex];
        const newRemaining = remaining.filter((n) => !group.members.includes(n));
        setRemainingParticipants(newRemaining);
      }
    }, 50);
  };

  // 次のグループへ
  const nextGroup = () => {
    if (currentResultIndex + 1 < results.length) {
      spinRoulette(remainingParticipants, results, currentResultIndex + 1);
    }
  };

  // リセット
  const resetAll = () => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }
    setResults([]);
    setCurrentResultIndex(-1);
    setRemainingParticipants([]);
    setShowConfetti(false);
    setIsSpinning(false);
  };

  // Enter キー
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addParticipant();
  };

  // グループ情報
  const getGroupInfo = () => {
    if (participants.length < groupSize) return `あと${groupSize - participants.length}人必要`;
    const count = Math.ceil(participants.length / groupSize);
    return `${groupSize}人グループ × ${count}組`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-8 px-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Snow />
      <Confetti show={showConfetti} />

      <div className="max-w-2xl mx-auto relative z-20">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">🎄 クリスマス 🎄</h1>
          <h2 className="text-2xl font-bold text-yellow-300">グループ＆役割ルーレット</h2>
        </div>

        {/* 設定パネル */}
        <div className="bg-white/95 rounded-2xl shadow-xl p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>⚙️</span> 設定
          </h3>
          
          {/* グループ人数 */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">グループ人数</label>
            <div className="flex gap-2 flex-wrap">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setGroupSize(n)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    groupSize === n
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {n}人
                </button>
              ))}
            </div>
          </div>

          {/* 役割割り当て */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assignRoles}
                onChange={(e) => setAssignRoles(e.target.checked)}
                className="w-5 h-5 accent-green-600"
              />
              <span className="text-gray-700">役割も決める</span>
            </label>
            {assignRoles && (
              <div className="flex gap-1 flex-wrap">
                {ROLES.slice(0, 4).map((r) => (
                  <span key={r.name} className="text-lg" title={r.name}>
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 参加者入力 */}
        <div className="bg-white/95 rounded-2xl shadow-xl p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>👥</span> 参加者 ({participants.length}人)
          </h3>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="名前を入力..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={addParticipant}
              className="px-5 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
            >
              追加
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {participants.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-gray-800 rounded-full border"
              >
                {name}
                <button onClick={() => removeParticipant(name)} className="text-red-500 font-bold ml-1">
                  ×
                </button>
              </span>
            ))}
          </div>
          
          {participants.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">📊 {getGroupInfo()}</p>
          )}
        </div>

        {/* ルーレット */}
        <div className="bg-white/95 rounded-2xl shadow-xl p-6 mb-5">
          <div className="flex flex-col items-center">
            <RouletteWheel
              names={remainingParticipants.length > 0 ? remainingParticipants : participants}
              isSpinning={isSpinning}
              rotation={rotation}
              onSpin={results.length === 0 ? startRoulette : nextGroup}
              disabled={participants.length < groupSize || (results.length > 0 && currentResultIndex + 1 >= results.length)}
            />

            {results.length > 0 && !isSpinning && currentResultIndex + 1 >= results.length && (
              <button
                onClick={resetAll}
                className="mt-6 px-6 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
              >
                🔄 リセット
              </button>
            )}
          </div>
        </div>

        {/* 結果表示 */}
        {results.length > 0 && (
          <div className="bg-white/95 rounded-2xl shadow-xl p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎊</span> 結果
            </h3>
            
            <div className="space-y-3">
              {results.map((group, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    i <= currentResultIndex
                      ? "bg-gradient-to-r from-red-50 to-green-50 border-yellow-400 shadow-md"
                      : "bg-gray-50 border-gray-200 opacity-40"
                  }`}
                >
                  <div className="text-sm font-bold text-gray-500 mb-2">グループ {i + 1}</div>
                  <div className="flex flex-wrap items-center gap-3">
                    {group.members.map((member, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <span className="text-lg font-bold" style={{ color: assignRoles && group.roles[j] ? group.roles[j].color : "#333" }}>
                          {i <= currentResultIndex ? member : "?"}
                        </span>
                        {assignRoles && group.roles[j] && i <= currentResultIndex && (
                          <span className="text-xl" title={group.roles[j].name}>
                            {group.roles[j].emoji}
                          </span>
                        )}
                        {j < group.members.length - 1 && <span className="text-xl mx-1">💝</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {currentResultIndex + 1 >= results.length && currentResultIndex >= 0 && (
              <div className="mt-6 text-center p-4 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">
                  🎉 全グループ決定！ 🎉
                </p>
                <p className="text-gray-600 mt-1">メリークリスマス！🎄</p>
              </div>
            )}
          </div>
        )}

        {/* フッター */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>🎄 Merry Christmas 2024 🎄</p>
        </div>
      </div>

      {/* アニメーション用CSS */}
      <style jsx global>{`
        @keyframes snow-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
        .animate-snow {
          animation: snow-fall linear infinite;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
