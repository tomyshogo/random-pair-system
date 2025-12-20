"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ================== 型定義 ==================
type PairResult = {
  members: string[];
};

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
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.log(e);
    }
  }, [getCtx]);

  const playHover = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log(e);
    }
  }, [getCtx]);

  const playFeint = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.log(e);
    }
  }, [getCtx]);

  const playGrab = useCallback(() => {
    try {
      const ctx = getCtx();
      [800, 1000, 1200].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.15);
      });
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
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } catch (e) {
      console.log(e);
    }
  }, [getCtx]);

  return { playTick, playHover, playFeint, playGrab, playWin };
}

// ================== 雪アニメーション ==================
function Snow() {
  const [flakes, setFlakes] = useState<{ id: number; x: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    setFlakes(
      Array.from({ length: 50 }, (_, i) => ({
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

// ================== 紙吹雪 ==================
function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; emoji: string; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      const emojis = ["🎄", "⭐", "🎁", "🔔", "❄", "🎅", "🦌", "✨"];
      setPieces(
        Array.from({ length: 60 }, (_, i) => ({
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

// ================== ペア発表モーダル ==================
function PairModal({
  show,
  pair,
  pairIndex,
  totalPairs,
  onClose,
  isAllDone,
}: {
  show: boolean;
  pair: PairResult | null;
  pairIndex: number;
  totalPairs: number;
  onClose: () => void;
  isAllDone: boolean;
}) {
  if (!show || !pair) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl animate-modalPop">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎄</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ペア {pairIndex + 1} / {totalPairs} 決定！
          </h2>
          
          <div className="my-6 p-6 bg-gradient-to-r from-red-100 via-white to-green-100 rounded-2xl">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {pair.members.map((member, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div 
                    className="text-2xl font-bold text-gray-800 bg-white px-4 py-2 rounded-xl shadow-md animate-memberReveal" 
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {member}
                  </div>
                  {i < pair.members.length - 1 && (
                    <span className="text-3xl">💝</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAllDone ? (
            <div className="mb-4">
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">
                🎉 全ペア決定！ 🎉
              </p>
              <p className="text-gray-500 mt-1">メリークリスマス！🎅</p>
            </div>
          ) : (
            <p className="text-gray-500 mb-4">次のペアを決めています...</p>
          )}

          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-green-600 transition-all shadow-lg"
          >
            {isAllDone ? "結果を見る 🎁" : "OK ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================== ルーレットホイール ==================
function RouletteWheel({
  names,
  rotation,
  handPosition,
  handEmoji,
  targetName,
  grabbedMembers,
  isGrabbing,
}: {
  names: string[];
  rotation: number;
  handPosition: { x: number; y: number } | null;
  handEmoji: string;
  targetName: string | null;
  grabbedMembers: string[];
  isGrabbing: boolean;
}) {
  const count = names.length;
  if (count === 0) return null;

  const segmentAngle = 360 / count;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* 外側の装飾リング */}
      <div className="absolute w-80 h-80 rounded-full border-8 border-yellow-400 shadow-2xl" />
      
      {/* ルーレット本体 */}
      <div
        className="w-72 h-72 rounded-full relative overflow-hidden shadow-xl transition-transform duration-100"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* セグメント背景 - 動的に生成 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {names.map((_, i) => {
            const startAngle = (segmentAngle * i - 90) * (Math.PI / 180);
            const endAngle = (segmentAngle * (i + 1) - 90) * (Math.PI / 180);
            const x1 = 50 + 50 * Math.cos(startAngle);
            const y1 = 50 + 50 * Math.sin(startAngle);
            const x2 = 50 + 50 * Math.cos(endAngle);
            const y2 = 50 + 50 * Math.sin(endAngle);
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const color = i % 2 === 0 ? "#c41e3a" : "#228B22";
            
            return (
              <path
                key={`seg-${i}`}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={color}
              />
            );
          })}
          {/* 区切り線 */}
          {names.map((_, i) => {
            const angle = (segmentAngle * i - 90) * (Math.PI / 180);
            const x = 50 + 50 * Math.cos(angle);
            const y = 50 + 50 * Math.sin(angle);
            return (
              <line
                key={`line-${i}`}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="#ffd700"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>

        {/* 名前表示 */}
        {names.map((name, i) => {
          const angle = segmentAngle * i + segmentAngle / 2;
          const isGrabbed = grabbedMembers.includes(name);
          const isTarget = targetName === name;
          
          // 名前の位置を計算（中心から外側へ）
          const radians = (angle - 90) * (Math.PI / 180);
          const radius = 38; // 中心からの距離（%）
          const x = 50 + radius * Math.cos(radians);
          const y = 50 + radius * Math.sin(radians);
          
          return (
            <div
              key={`name-${i}`}
              className={`absolute text-white font-bold text-xs text-center transition-all duration-300
                ${isGrabbed ? "opacity-20" : ""}
                ${isTarget && isGrabbing ? "scale-125 text-yellow-300 z-10" : ""}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                textShadow: "1px 1px 2px black, -1px -1px 2px black",
                maxWidth: "60px",
                wordBreak: "break-all",
              }}
            >
              {name}
            </div>
          );
        })}

        {/* 中央の円 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center border-4 border-yellow-300">
          <span className="text-2xl">🎄</span>
        </div>
      </div>

      {/* 手のアイコン */}
      {handPosition && (
        <div
          className="absolute z-30 text-5xl transition-all pointer-events-none"
          style={{
            left: `${handPosition.x}%`,
            top: `${handPosition.y}%`,
            transform: "translate(-50%, -50%)",
            transitionDuration: "400ms",
            transitionTimingFunction: "ease-out",
          }}
        >
          {handEmoji}
        </div>
      )}

      {/* ポインター */}
      <div className="absolute -top-4 z-20 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
      </div>
    </div>
  );
}

// ================== メインコンポーネント ==================
export default function ChristmasRoulette() {
  // State
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  
  const [isRunning, setIsRunning] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const [handPosition, setHandPosition] = useState<{ x: number; y: number } | null>(null);
  const [handEmoji, setHandEmoji] = useState("🖐️");
  const [targetName, setTargetName] = useState<string | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  
  const [results, setResults] = useState<PairResult[]>([]);
  const [currentPair, setCurrentPair] = useState<string[]>([]);
  const [grabbedMembers, setGrabbedMembers] = useState<string[]>([]);
  const [remainingParticipants, setRemainingParticipants] = useState<string[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalPair, setModalPair] = useState<PairResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { playTick, playHover, playFeint, playGrab, playWin } = useSoundEffects();

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

  // 名前の位置を計算
  const getNamePosition = useCallback((name: string, names: string[], currentRotation: number) => {
    const index = names.indexOf(name);
    if (index === -1) return { x: 50, y: 50 };
    
    const segmentAngle = 360 / names.length;
    const angle = segmentAngle * index + segmentAngle / 2 + currentRotation;
    const radians = (angle - 90) * (Math.PI / 180);
    const radius = 35; // パーセント
    
    return {
      x: 50 + radius * Math.cos(radians),
      y: 50 + radius * Math.sin(radians),
    };
  }, []);

  // 手を中央（待機位置）に移動
  const moveHandToCenter = useCallback(() => {
    setHandPosition({ x: 50, y: -10 });
    setHandEmoji("🖐️");
  }, []);

  // 手を名前の位置に移動
  const moveHandToName = useCallback((name: string, names: string[], currentRotation: number) => {
    const pos = getNamePosition(name, names, currentRotation);
    // 少し上に調整
    setHandPosition({ x: pos.x, y: pos.y - 15 });
  }, [getNamePosition]);

  // 一人をつまみ出す演出
  const grabOnePerson = useCallback(
    async (remaining: string[], currentRotation: number): Promise<{ name: string; remaining: string[] }> => {
      return new Promise((resolve) => {
        // 手を待機位置に
        moveHandToCenter();
        setHandEmoji("🖐️");
        
        setTimeout(() => {
          // フェイント回数（1-2回）
          const feintCount = 1 + Math.floor(Math.random() * 2);
          const feintTargets: string[] = [];
          
          // フェイント対象を選ぶ（最終ターゲットとは別）
          const shuffled = shuffle(remaining);
          const finalTarget = shuffled[0];
          for (let i = 1; i < Math.min(feintCount + 1, shuffled.length); i++) {
            feintTargets.push(shuffled[i] || shuffled[0]);
          }
          
          let feintsDone = 0;
          
          const doFeint = () => {
            if (feintsDone < feintTargets.length) {
              const feintTarget = feintTargets[feintsDone];
              
              // 手を対象に移動
              playHover();
              setTargetName(feintTarget);
              moveHandToName(feintTarget, remaining, currentRotation);
              
              setTimeout(() => {
                // つまみそうな動き
                setHandEmoji("🤏");
                
                setTimeout(() => {
                  // やっぱりやめる
                  playFeint();
                  setHandEmoji("🖐️");
                  setTargetName(null);
                  moveHandToCenter();
                  
                  feintsDone++;
                  setTimeout(doFeint, 600);
                }, 400);
              }, 500);
            } else {
              // 本番のつまみ出し
              setTimeout(() => {
                playHover();
                setTargetName(finalTarget);
                moveHandToName(finalTarget, remaining, currentRotation);
                
                setTimeout(() => {
                  // つまむ！
                  setHandEmoji("🤏");
                  setIsGrabbing(true);
                  playGrab();
                  
                  setTimeout(() => {
                    // 持ち上げる
                    setHandPosition({ x: 50, y: -20 });
                    playWin();
                    
                    setTimeout(() => {
                      // 完了
                      setIsGrabbing(false);
                      setTargetName(null);
                      setHandPosition(null);
                      setHandEmoji("🖐️");
                      
                      const newRemaining = remaining.filter((n) => n !== finalTarget);
                      resolve({ name: finalTarget, remaining: newRemaining });
                    }, 600);
                  }, 500);
                }, 400);
              }, 400);
            }
          };
          
          doFeint();
        }, 300);
      });
    },
    [moveHandToCenter, moveHandToName, playHover, playFeint, playGrab, playWin]
  );

  // ペアを1組決める
  const decideOnePair = useCallback(
    async (remaining: string[], currentRotation: number): Promise<{ pair: PairResult; remaining: string[] }> => {
      const members: string[] = [];
      let currentRemaining = remaining;
      
      const actualSize = Math.min(groupSize, currentRemaining.length);
      
      for (let i = 0; i < actualSize; i++) {
        const result = await grabOnePerson(currentRemaining, currentRotation);
        members.push(result.name);
        currentRemaining = result.remaining;
        setGrabbedMembers((prev) => [...prev, result.name]);
        setCurrentPair((prev) => [...prev, result.name]);
        setRemainingParticipants(currentRemaining);
        
        if (i < actualSize - 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      
      return { pair: { members }, remaining: currentRemaining };
    },
    [groupSize, grabOnePerson]
  );

  // ルーレット開始
  const startRoulette = async () => {
    if (participants.length < groupSize) {
      alert(`${groupSize}人以上の参加者が必要です！`);
      return;
    }

    // リセット
    setIsRunning(true);
    setResults([]);
    setGrabbedMembers([]);
    setCurrentPair([]);
    const shuffled = shuffle(participants);
    setRemainingParticipants(shuffled);

    let remaining = shuffled;
    const allResults: PairResult[] = [];
    let currentRotation = rotation;

    // ルーレット回転
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      currentRotation += 8;
      setRotation(currentRotation);
      playTick();
    }, 50);

    await new Promise((r) => setTimeout(r, spinDuration));
    clearInterval(spinInterval);

    // 全ペアを順番に決める
    while (remaining.length >= 2) {
      setCurrentPair([]);
      
      const result = await decideOnePair(remaining, currentRotation);
      remaining = result.remaining;
      allResults.push(result.pair);
      setResults([...allResults]);
      
      // モーダル表示
      setModalPair(result.pair);
      setShowModal(true);
      
      // モーダル表示時間
      await new Promise((r) => setTimeout(r, 2500));
      setShowModal(false);
      
      // 次のペアへ（残りがあれば再度回転）
      if (remaining.length >= 2) {
        await new Promise((r) => setTimeout(r, 500));
        
        const nextSpinInterval = setInterval(() => {
          currentRotation += 8;
          setRotation(currentRotation);
          playTick();
        }, 50);
        
        await new Promise((r) => setTimeout(r, 1500));
        clearInterval(nextSpinInterval);
      }
    }

    // 1人余った場合
    if (remaining.length === 1 && allResults.length > 0) {
      allResults[allResults.length - 1].members.push(remaining[0]);
      setGrabbedMembers((prev) => [...prev, remaining[0]]);
      setResults([...allResults]);
      setRemainingParticipants([]);
    }

    // 完了
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    setIsRunning(false);
  };

  // リセット
  const resetAll = () => {
    setResults([]);
    setGrabbedMembers([]);
    setCurrentPair([]);
    setRemainingParticipants([]);
    setShowModal(false);
    setModalPair(null);
    setShowConfetti(false);
    setIsRunning(false);
    setHandPosition(null);
    setTargetName(null);
    setIsGrabbing(false);
  };

  // Enter キー
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addParticipant();
  };

  // グループ情報
  const getGroupInfo = () => {
    if (participants.length < groupSize) return `あと${groupSize - participants.length}人必要`;
    const count = Math.ceil(participants.length / groupSize);
    return `${groupSize}人ペア × ${count}組`;
  };

  const displayNames = remainingParticipants.length > 0 ? remainingParticipants : participants;
  const isAllDone = results.length > 0 && remainingParticipants.length < 2 && !isRunning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-8 px-4 relative overflow-hidden">
      {/* 背景 */}
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Snow />
      <Confetti show={showConfetti} />

      {/* モーダル */}
      <PairModal
        show={showModal}
        pair={modalPair}
        pairIndex={results.length - 1}
        totalPairs={Math.ceil(participants.length / groupSize)}
        onClose={() => setShowModal(false)}
        isAllDone={isAllDone}
      />

      <div className="max-w-2xl mx-auto relative z-20">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">🎄 クリスマス 🎄</h1>
          <h2 className="text-2xl font-bold text-yellow-300">ペア決めルーレット</h2>
        </div>

        {/* 設定パネル */}
        <div className="bg-white/95 rounded-2xl shadow-xl p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>⚙️</span> ペア人数
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => !isRunning && setGroupSize(n)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  groupSize === n
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {n}人
              </button>
            ))}
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
              disabled={isRunning}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={addParticipant}
              disabled={isRunning}
              className="px-5 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
            >
              追加
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {participants.map((name) => (
              <span
                key={name}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                  grabbedMembers.includes(name)
                    ? "bg-gray-200 text-gray-400 line-through"
                    : "bg-red-50 text-gray-800"
                }`}
              >
                {name}
                {!isRunning && (
                  <button onClick={() => removeParticipant(name)} className="text-red-500 font-bold ml-1">
                    ×
                  </button>
                )}
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
              names={displayNames}
              rotation={rotation}
              handPosition={handPosition}
              handEmoji={handEmoji}
              targetName={targetName}
              grabbedMembers={grabbedMembers}
              isGrabbing={isGrabbing}
            />

            {/* 現在つまみ出し中の表示 */}
            {currentPair.length > 0 && isRunning && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-xl">
                <p className="text-sm text-gray-600 text-center">決定中のペア:</p>
                <div className="flex gap-2 justify-center mt-1 flex-wrap">
                  {currentPair.map((name, i) => (
                    <span key={i} className="font-bold text-lg text-red-600 animate-pulse">{name}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              {!isRunning && results.length === 0 && (
                <button
                  onClick={startRoulette}
                  disabled={participants.length < groupSize}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                >
                  🎰 スタート！
                </button>
              )}
              
              {!isRunning && results.length > 0 && (
                <button
                  onClick={resetAll}
                  className="px-6 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
                >
                  🔄 リセット
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {results.length > 0 && (
          <div className="bg-white/95 rounded-2xl shadow-xl p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎊</span> 結果
            </h3>
            
            <div className="space-y-3">
              {results.map((pair, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-green-50 border-2 border-yellow-400 shadow-md"
                >
                  <div className="text-sm font-bold text-gray-500 mb-2">ペア {i + 1}</div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {pair.members.map((member, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-800">{member}</span>
                        {j < pair.members.length - 1 && <span className="text-2xl">💝</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {isAllDone && (
              <div className="mt-6 text-center p-4 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">
                  🎉 全ペア決定！ 🎉
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
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0.3; }
        }
        .animate-snow {
          animation: snow-fall linear infinite;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes modalPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modalPop {
          animation: modalPop 0.4s ease-out;
        }
        @keyframes memberReveal {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-memberReveal {
          animation: memberReveal 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
