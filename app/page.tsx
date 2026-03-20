"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ================== 型定義 ==================
type PairResult = {
  members: string[];
};

// ================== 音源URL（ローカルファイル） ==================
// public/sounds/ フォルダに以下のファイルを配置してください：
// - bgm.mp3 (BGM - クリスマスソング)
// - tick.mp3 (ルーレット回転 - ベル音)
// - feint.mp3 (フェイント - あれ？)
// - grab.mp3 (つまむ時 - キラーン)
// - fanfare.mp3 (決定時 - ファンファーレ)
// - applause.mp3 (全完了 - 拍手歓声)
// - jingle.mp3 (ジングルベル)
const SOUNDS = {
  // BGM - クリスマスソング
  bgm: "/sounds/bgm.mp3",
  // ルーレット回転 - ベル音
  tick: "/sounds/tick.mp3",
  // フェイント - 心臓の鼓動
  feint: "/sounds/心臓の鼓動1.mp3",
  // つまむ時 - キラーン
  grab: "/sounds/grab.mp3",
  // 決定時 - ファンファーレ
  fanfare: "/sounds/fanfare.mp3",
  // 全完了 - 拍手歓声
  applause: "/sounds/applause.mp3",
  // ジングルベル
  jingle: "/sounds/jingle.mp3",
  // ドラムロール - ルーレット開始時
  drumroll: "/sounds/ドラムロール.mp3",
};

// ================== 音声管理フック ==================
function useAudioManager() {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const soundsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const feintSoundRef = useRef<HTMLAudioElement | null>(null); // フェイント音（ループ用）
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 音声をプリロード
  useEffect(() => {
    let bgm: HTMLAudioElement | null = null;
    const handlePlay = () => setIsBgmPlaying(true);
    const handlePause = () => setIsBgmPlaying(false);
    const handleEnded = () => setIsBgmPlaying(false);
    
    const loadSounds = async () => {
      try {
        // BGM
        bgm = new Audio(SOUNDS.bgm);
        bgm.loop = true;
        bgm.volume = 0.1; // BGMをもう少し小さく
        bgm.preload = 'auto';
        
        // 再生状態を追跡するイベントリスナー
        bgm.addEventListener('play', handlePlay);
        bgm.addEventListener('pause', handlePause);
        bgm.addEventListener('ended', handleEnded);
        
        // 読み込みエラーをキャッチ（警告のみ、アプリは動作し続ける）
        bgm.addEventListener('error', (e) => {
          console.warn('BGM読み込みエラー: 音源ファイルが見つかりません。public/sounds/bgm.mp3 を配置してください。');
          setLoadError('BGMファイルが見つかりません（音声なしで動作します）');
        });
        
        // 読み込み完了を待つ（エラーが発生しても続行）
        try {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.warn('BGM読み込みタイムアウト: 音源ファイルの読み込みに時間がかかっています');
              resolve(); // タイムアウトでも続行
            }, 10000); // 10秒でタイムアウト
            
            bgm!.addEventListener('canplaythrough', () => {
              clearTimeout(timeout);
              resolve();
            }, { once: true });
            
            bgm!.addEventListener('error', () => {
              clearTimeout(timeout);
              resolve(); // エラーでも続行（エラーハンドラーで処理済み）
            }, { once: true });
            
            // 読み込みを開始
            bgm!.load();
          });
        } catch (err) {
          console.warn('BGM読み込み中にエラー:', err);
        }
        
        bgmRef.current = bgm;
        // エラーがなければエラーメッセージをクリア
        if (!bgm.error) {
          setLoadError(null);
        }

        // 効果音をプリロード（エラーがあっても続行）
        const soundKeys = Object.keys(SOUNDS).filter(k => k !== 'bgm') as (keyof typeof SOUNDS)[];
        for (const key of soundKeys) {
          try {
            const audio = new Audio(SOUNDS[key]);
            // 音量設定
            if (key === 'applause') {
              audio.volume = 0.5;
            } else if (key === 'drumroll') {
              audio.volume = 0.4; // ドラムロールを小さく
            } else if (key === 'fanfare') {
              audio.volume = 0.4; // ファンファーレを小さく
            } else if (key === 'feint') {
              audio.volume = 1.0; // 鼓動音をもう少し大きく
            } else {
              audio.volume = 0.6;
            }
            audio.preload = 'auto';
            audio.addEventListener('error', (e) => {
              console.warn(`効果音 ${key} の読み込みに失敗:`, SOUNDS[key], e);
            });
            // 読み込み完了を待つ（オプション）
            audio.addEventListener('canplaythrough', () => {
              console.log(`効果音 ${key} の読み込み完了`);
            }, { once: true });
            soundsRef.current.set(key, audio);
            
            // フェイント音（鼓動音）をループ用に別途設定
            if (key === 'feint') {
              const feintLoop = new Audio(SOUNDS.feint);
              feintLoop.loop = true;
              feintLoop.volume = 1.0; // 鼓動音をもう少し大きく
              feintLoop.preload = 'auto';
              feintSoundRef.current = feintLoop;
            }
          } catch (err) {
            console.warn(`効果音 ${key} の読み込みに失敗:`, err);
          }
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.warn('音声読み込みエラー:', error);
        setLoadError('音源ファイルが見つかりません（音声なしで動作します）');
        setIsLoaded(true); // エラーでも読み込み完了として扱う（音声なしで動作）
      }
    };

    loadSounds();

    return () => {
      if (bgm) {
        bgm.removeEventListener('play', handlePlay);
        bgm.removeEventListener('pause', handlePause);
        bgm.removeEventListener('ended', handleEnded);
      }
      bgmRef.current?.pause();
      soundsRef.current.forEach(audio => audio.pause());
    };
  }, []);

  // BGMトグル
  const toggleBgm = useCallback(async () => {
    if (!bgmRef.current) {
      console.warn('BGMが読み込まれていません');
      return;
    }
    
    if (isBgmPlaying) {
      bgmRef.current.pause();
      // pause()は同期的なので、イベントリスナーが状態を更新します
    } else {
      try {
        // 現在の再生位置を確認（読み込み済みかチェック）
        if (bgmRef.current.readyState >= 2) { // HAVE_CURRENT_DATA以上
          await bgmRef.current.play();
        } else {
          // まだ読み込まれていない場合は読み込みを待つ
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('BGM読み込みタイムアウト'));
            }, 5000);
            
            const handleCanPlay = () => {
              clearTimeout(timeout);
              bgmRef.current!.removeEventListener('canplaythrough', handleCanPlay);
              bgmRef.current!.play().then(resolve).catch(reject);
            };
            
            bgmRef.current!.addEventListener('canplaythrough', handleCanPlay);
            bgmRef.current!.load();
          });
        }
        // play()が成功した場合、イベントリスナーが状態を更新します
      } catch (error: any) {
        console.error('BGM再生エラー:', error);
        // エラーが発生した場合は状態を更新しません
        const errorMessage = error?.message || '不明なエラー';
        if (errorMessage.includes('play()') || errorMessage.includes('user gesture')) {
          // ユーザーインタラクションが必要な場合
          console.warn('ユーザーインタラクションが必要です');
          // この場合は既にユーザーがクリックしているので、別の問題の可能性
        }
        // alertは表示しない（コンソールに記録するだけ）
      }
    }
  }, [isBgmPlaying]);

  // 効果音再生
  const playSound = useCallback((key: keyof typeof SOUNDS) => {
    const audio = soundsRef.current.get(key);
    if (audio) {
      // エラー状態をチェック
      if (audio.error) {
        console.warn(`効果音 ${key} の読み込みエラー:`, audio.error);
        // エラーが発生している場合は再読み込みを試みる
        audio.load();
        return;
      }
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`効果音 ${key} の再生エラー:`, error);
        // 再生に失敗した場合は再読み込みを試みる
        audio.load();
      });
    } else {
      console.warn(`効果音 ${key} が見つかりません`);
    }
  }, []);

  // 効果音停止
  const stopSound = useCallback((key: keyof typeof SOUNDS) => {
    const audio = soundsRef.current.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // フェイント音（鼓動音）をループ再生
  const startFeintLoop = useCallback(() => {
    if (feintSoundRef.current) {
      feintSoundRef.current.currentTime = 0;
      feintSoundRef.current.play().catch(console.error);
    }
  }, []);

  // フェイント音（鼓動音）を停止
  const stopFeintLoop = useCallback(() => {
    if (feintSoundRef.current) {
      feintSoundRef.current.pause();
      feintSoundRef.current.currentTime = 0;
    }
  }, []);

  return { toggleBgm, isBgmPlaying, playSound, stopSound, isLoaded, loadError, startFeintLoop, stopFeintLoop };
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

// ================== BGMボタン ==================
function BgmButton({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-4 right-4 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg transition-all duration-300 border-2
        ${isPlaying
          ? "bg-gradient-to-br from-red-500 to-green-600 border-yellow-300/60 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          : "bg-white/90 hover:bg-white border-white/40 hover:border-yellow-300/60 hover:shadow-[0_0_16px_rgba(255,215,0,0.2)]"}`}
      title={isPlaying ? "BGMを停止" : "BGMを再生"}
    >
      {isPlaying ? "🎵" : "🔇"}
    </button>
  );
}

// ================== オーナメント数字バッジ ==================
function OrnamentNumber({
  number,
  label,
  size = "md",
}: {
  number: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const circleSize = size === "sm" ? "w-9 h-9 text-sm" : "w-12 h-12 text-base";
  const capSize = size === "sm" ? "w-4 h-2" : "w-5 h-2.5";
  const stringHeight = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-block">
        {/* cap */}
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${capSize} rounded-sm bg-yellow-300 shadow`} />
        {/* string */}
        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-px ${stringHeight} bg-yellow-100/90`} />
        {/* ball */}
        <div
          className={`${circleSize} rounded-full flex items-center justify-center font-extrabold text-white shadow-lg border border-white/40
            bg-gradient-to-br from-red-500 via-red-600 to-rose-700`}
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.55)",
          }}
        >
          {number}
        </div>
        {/* highlight */}
        <div className="pointer-events-none absolute top-1 left-2 w-4 h-4 rounded-full bg-white/25 blur-[0.5px]" />
      </div>
      {label && <span className="font-bold text-gray-600">{label}</span>}
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn px-4">
      <div className="bg-gradient-to-b from-white to-green-50/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-modalPop border border-white/60">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🎄</div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <OrnamentNumber number={pairIndex + 1} />
            <span className="text-gray-300 font-bold text-lg">/</span>
            <OrnamentNumber number={totalPairs} size="sm" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">ペア決定！</h2>

          <div className="my-5 p-5 bg-gradient-to-br from-red-50 via-white to-green-50 rounded-2xl border border-yellow-200/60 shadow-inner">
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {pair.members.map((member, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="text-xl sm:text-2xl font-bold text-gray-800 bg-white px-4 py-2 rounded-xl shadow-md animate-memberReveal border border-gray-100"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {member}
                  </div>
                  {i < pair.members.length - 1 && (
                    <span className="text-2xl sm:text-3xl">🎁</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAllDone ? (
            <div className="mb-4">
              <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">
                🎉 全ペア決定！ 🎉
              </p>
              <p className="text-gray-400 text-sm mt-1">メリークリスマス！🎅</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">次のペアを決めています...</p>
          )}

          <button
            onClick={onClose}
            className="btn-festive px-8 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-green-600 shadow-lg hover:shadow-xl"
          >
            {isAllDone ? "結果を見る 🎁" : "OK ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================== 結果表示モーダル ==================
function ResultsModal({
  show,
  results,
  onClose,
}: {
  show: boolean;
  results: PairResult[];
  onClose: () => void;
}) {
  if (!show || results.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn px-4">
      <div className="bg-gradient-to-b from-white to-green-50/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl animate-modalPop max-h-[90vh] overflow-y-auto border border-white/60">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce">🎊</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5">
            全ペア決定！
          </h2>

          <div className="space-y-3 mb-6">
            {results.map((pair, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-green-50/80 border border-yellow-300/50 shadow-sm"
              >
                <div className="mb-2">
                  <OrnamentNumber number={i + 1} label="ペア" size="sm" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {pair.members.map((member, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        {member}
                      </span>
                      {j < pair.members.length - 1 && <span className="text-2xl sm:text-3xl">🎁</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50">
            <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">
              🎉 メリークリスマス！ 🎉
            </p>
            <p className="text-gray-500 text-sm mt-2">🎄 素敵なペア決めになりました 🎄</p>
          </div>

          <button
            onClick={onClose}
            className="btn-festive px-8 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-green-600 shadow-lg hover:shadow-xl text-base sm:text-lg"
          >
            閉じる ✨
          </button>
        </div>
      </div>
    </div>
  );
}

// ================== 柊（ホリー）アイコン ==================
function HollyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" role="img" aria-label="holly">
      {/* leaves */}
      <path
        d="M26 30c-10-12-22-8-22 6 0 10 10 18 22 12 6-3 8-10 8-18 0-2-1-4-2-6-2 2-4 3-6 3-2 0-4-1-6-3z"
        fill="#1f7a3a"
        stroke="#14532d"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M38 30c10-12 22-8 22 6 0 10-10 18-22 12-6-3-8-10-8-18 0-2 1-4 2-6 2 2 4 3 6 3 2 0 4-1 6-3z"
        fill="#1f7a3a"
        stroke="#14532d"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* berries */}
      <circle cx="32" cy="34" r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
      <circle cx="24" cy="40" r="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
      <circle cx="40" cy="40" r="5" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
      {/* highlights */}
      <circle cx="30" cy="32" r="2" fill="white" opacity="0.25" />
      <circle cx="22" cy="38" r="1.8" fill="white" opacity="0.25" />
      <circle cx="38" cy="38" r="1.8" fill="white" opacity="0.25" />
    </svg>
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
  isSpinning,
}: {
  names: string[];
  rotation: number;
  handPosition: { x: number; y: number } | null;
  handEmoji: string;
  targetName: string | null;
  grabbedMembers: string[];
  isGrabbing: boolean;
  isSpinning?: boolean;
}) {
  const count = names.length;
  if (count === 0) return null;

  const segmentAngle = 360 / count;

  // 擬似乱数（毎回同じ見た目になるように、Math.randomは使わない）
  const pr = (n: number) => {
    const x = Math.sin(n * 999) * 10000;
    return x - Math.floor(x);
  };

  return (
    <div className="relative flex items-center justify-center w-[min(500px,85vw)] h-[min(500px,85vw)]">
      {/* 下向きのポインター（1人目決定用） */}
      <div className="absolute z-50 pointer-events-none top-2 left-1/2 -translate-x-1/2">
        {/* 影＋縁取りの二重三角 */}
        <div className="relative drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)] animate-pulse">
          {/* 外側（ゴールド） */}
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-300" />
          {/* 内側（赤） */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-red-500" />
        </div>
        {/* 小さな軸（飾り） */}
        <div className="mx-auto mt-1 w-1.5 h-6 rounded-full bg-yellow-200 shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
      </div>
      
      {/* 外周リース（ルーレット全体をリース風に） */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* ベース（針葉テクスチャ：conic + radial を重ねて“写真っぽい葉”へ） */}
        <div
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{
            backgroundImage: [
              // 針葉の流れ（細かい筋）
              "repeating-conic-gradient(from 0deg, rgba(34,197,94,0.18) 0deg, rgba(16,185,129,0.06) 3deg, rgba(6,95,70,0.14) 6deg)",
              // 影と立体感
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.14), transparent 40%)",
              "radial-gradient(circle at 70% 70%, rgba(0,0,0,0.28), transparent 45%)",
              // 色のうねり（葉の濃淡）
              "conic-gradient(from 20deg, #14532d, #166534, #14532d, #064e3b, #14532d)",
            ].join(", "),
            filter: "saturate(1.12) contrast(1.05)",
            borderRadius: "9999px",
          }}
        />
        {/* ふわっとしたボリューム */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.10), transparent 55%), radial-gradient(circle at 20% 70%, rgba(255,255,255,0.10), transparent 50%)",
            filter: "blur(0.4px)",
          }}
        />
        {/* 内側の影（穴っぽく見せる） */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "64px",
            boxShadow: "inset 0 0 0 42px rgba(0,0,0,0.22)",
            borderRadius: "9999px",
          }}
        />

        {/* 暖色ライト */}
        {Array.from({ length: 110 }, (_, i) => {
          const a = pr(i + 100) * 360;
          const r = 43 + pr(i + 200) * 13;
          const x = 50 + r * Math.cos((a * Math.PI) / 180);
          const y = 50 + r * Math.sin((a * Math.PI) / 180);
          const s = 3 + pr(i + 300) * 6;
          const delay = (pr(i + 400) * 1.6).toFixed(2);
          const warm = 210 + Math.floor(pr(i + 500) * 30); // 色味のブレ
          return (
            <div
              key={`light-${i}`}
              className="absolute animate-wreathTwinkle"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${s}px`,
                height: `${s}px`,
                animationDelay: `${delay}s`,
                borderRadius: "9999px",
                background: `radial-gradient(circle, rgba(255, ${warm}, 140, 1) 0%, rgba(255, ${warm}, 140, 0.55) 55%, rgba(255, ${warm}, 140, 0.0) 72%)`,
                boxShadow: `0 0 10px rgba(255, ${warm}, 140, 0.85), 0 0 24px rgba(255, ${warm}, 140, 0.55), 0 0 44px rgba(255, ${warm}, 140, 0.25)`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}

        {/* 飾り（松ぼっくり/雪結晶/ボール） */}
        <div
          className="absolute"
          style={{
            left: "58px",
            top: "130px",
            width: "28px",
            height: "38px",
            borderRadius: "55% 55% 60% 60%",
            backgroundImage:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 60% 70%, rgba(0,0,0,0.35), transparent 55%), repeating-linear-gradient(135deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 3px, rgba(0,0,0,0.12) 4px, rgba(0,0,0,0.0) 7px)",
            backgroundColor: "#6b3f1f",
            boxShadow: "0 6px 10px rgba(0,0,0,0.45)",
          }}
        />
        <div
          className="absolute"
          style={{
            right: "64px",
            top: "142px",
            width: "26px",
            height: "36px",
            borderRadius: "55% 55% 60% 60%",
            backgroundImage:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at 60% 70%, rgba(0,0,0,0.35), transparent 55%), repeating-linear-gradient(135deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 3px, rgba(0,0,0,0.12) 4px, rgba(0,0,0,0.0) 7px)",
            backgroundColor: "#6b3f1f",
            boxShadow: "0 6px 10px rgba(0,0,0,0.45)",
          }}
        />
        <div className="absolute bottom-[96px] right-[72px] text-xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]">❄️</div>
        <div className="absolute bottom-[118px] left-[90px] text-xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]">❄️</div>
        <div className="absolute top-[210px] left-[128px] w-4 h-4 rounded-full bg-red-500 shadow border border-white/50" />
        <div className="absolute bottom-[168px] right-[132px] w-4 h-4 rounded-full bg-red-400 shadow border border-white/50" />

        {/* 大きめの赤リボン（SVGで立体感） */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)]">
          <svg width="170" height="110" viewBox="0 0 170 110" role="img" aria-label="ribbon">
            <defs>
              <linearGradient id="rb" x1="0" x2="1">
                <stop offset="0" stopColor="#ef4444" />
                <stop offset="0.55" stopColor="#b91c1c" />
                <stop offset="1" stopColor="#7f1d1d" />
              </linearGradient>
              <linearGradient id="rb2" x1="0" x2="1">
                <stop offset="0" stopColor="#fecaca" stopOpacity="0.55" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* left loop */}
            <path
              d="M78 48 C40 20, 18 38, 38 60 C50 74, 70 70, 78 58 Z"
              fill="url(#rb)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
            />
            {/* right loop */}
            <path
              d="M92 48 C130 20, 152 38, 132 60 C120 74, 100 70, 92 58 Z"
              fill="url(#rb)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
            />
            {/* knot */}
            <ellipse cx="85" cy="55" rx="12" ry="10" fill="#991b1b" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            <ellipse cx="81" cy="51" rx="8" ry="6" fill="url(#rb2)" />
            {/* tails */}
            <path
              d="M78 62 L58 104 C56 108, 62 110, 67 106 L86 82 Z"
              fill="url(#rb)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <path
              d="M92 62 L112 104 C114 108, 108 110, 103 106 L84 82 Z"
              fill="url(#rb)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      
      {/* ルーレット本体 */}
      <div
        className="rounded-full relative overflow-hidden shadow-xl transition-transform duration-100 z-10 w-[88%] h-[88%]"
        style={{
          transform: `rotate(${rotation}deg)`
        }}
      >
        {/* セグメント背景 - SVGで正確に描画 */}
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
          
          const radians = (angle - 90) * (Math.PI / 180);
          const radius = 38;
          const x = 50 + radius * Math.cos(radians);
          const y = 50 + radius * Math.sin(radians);
          
          return (
            <div
              key={`name-${i}`}
              className={`absolute font-bold text-center transition-all duration-300
                ${isGrabbed ? "opacity-15" : "opacity-100"}
                ${isTarget ? "z-20" : "z-10"}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, ${isTarget && isGrabbing ? '-70%' : '-50%'}) rotate(${-rotation}deg)${isTarget && isGrabbing ? ' scale(1.3)' : ''}`,
                maxWidth: "90px",
                wordBreak: "break-all",
                transition: "all 0.3s ease-out",
              }}
            >
              <div className="inline-block">
                {/* cap + string */}
                <div className="relative mx-auto w-fit">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 rounded-sm bg-yellow-300 shadow" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-px h-3 bg-yellow-100/90" />
                </div>
                {/* ornament ball */}
                <div
                  className={`relative mt-1 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-sm
                    ${isTarget && isGrabbing
                      ? "bg-yellow-300/95 text-black border-yellow-100 scale-105"
                      : isTarget
                        ? "bg-white/95 text-red-700 border-yellow-300 animate-pulse scale-105"
                        : i % 2 === 0
                          ? "bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white border-white/35"
                          : "bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-800 text-white border-white/30"}
                  `}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.55)" }}
                >
                  {/* highlight */}
                  <div className="pointer-events-none absolute top-0.5 left-2 w-6 h-3 rounded-full bg-white/20 blur-[0.5px]" />
                  <span className="relative text-sm leading-none">{name}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 中央の円 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center border-4 border-yellow-300">
          <HollyIcon className="w-12 h-12 drop-shadow" />
        </div>
      </div>

      {/* 手のアイコン */}
      {handPosition && (
        <div
          className="absolute z-40 text-5xl transition-all pointer-events-none"
          style={{
            left: `${handPosition.x}%`,
            top: `${handPosition.y}%`,
            transform: "translate(-50%, -50%)",
            transitionDuration: "600ms", // 手の移動をもう少し早く
            transitionTimingFunction: "ease-out",
            filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
          }}
        >
          {handEmoji}
        </div>
      )}

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
  const [isSpinning, setIsSpinning] = useState(false);
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
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  const { toggleBgm, isBgmPlaying, playSound, stopSound, isLoaded, loadError, startFeintLoop, stopFeintLoop } = useAudioManager();

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

  // 名前の位置を計算（ルーレットの回転を考慮して手のアイコンを正確に配置）
  const getNamePosition = useCallback((name: string, names: string[], currentRotation: number) => {
    const index = names.indexOf(name);
    if (index === -1) return { x: 50, y: 50 };
    
    const segmentAngle = 360 / names.length;
    // 名前の表示と同じ計算方法を使用
    const angle = segmentAngle * index + segmentAngle / 2;
    const radians = (angle - 90) * (Math.PI / 180);
    const radius = 38; // 名前表示と同じradius
    
    // ルーレットが回転しているので、手の位置も回転を考慮する必要がある
    // 名前はルーレット内で rotate(${-rotation}deg) で回転を打ち消しているが、
    // 手のアイコンはルーレットの外側にあるので、回転を考慮した位置を計算する
    const rotatedRadians = radians + (currentRotation * Math.PI / 180);
    const x = 50 + radius * Math.cos(rotatedRadians);
    const y = 50 + radius * Math.sin(rotatedRadians);
    
    return { x, y };
  }, []);

  // 手を中央（待機位置）に移動
  const moveHandToCenter = useCallback(() => {
    setHandPosition({ x: 50, y: -10 });
    setHandEmoji("🖐️");
  }, []);

  // 手を名前の位置に移動（より近づけてピック感を出す）
  const moveHandToName = useCallback((name: string, names: string[], currentRotation: number) => {
    const pos = getNamePosition(name, names, currentRotation);
    // y位置を0に変更して名前により被せる
    setHandPosition({ x: pos.x, y: pos.y });
  }, [getNamePosition]);

  // 一人をつまみ出す演出
  const grabOnePerson = useCallback(
    async (remaining: string[], currentRotation: number, pauseSpinning?: () => void, resumeSpinning?: () => void, skipFeint: boolean = false): Promise<{ name: string; remaining: string[] }> => {
      return new Promise((resolve) => {
        // フェイントをスキップする場合は鼓動音を開始しない
        if (!skipFeint) {
          // 手のアイコンが動き出す時点で鼓動音を開始
          startFeintLoop();
        }
        
        moveHandToCenter();
        setHandEmoji("🖐️");
        
        // フェイント開始時にドラムロールを停止
        stopSound("drumroll");
        
        setTimeout(() => {
          const shuffled = shuffle(remaining);
          const finalTarget = shuffled[0];
          
          // 1人目の場合はフェイントをスキップ
          if (skipFeint) {
            // フェイントなしで直接つまみ出し
            setTimeout(() => {
              playSound("tick");
              setTargetName(finalTarget);
              moveHandToName(finalTarget, remaining, currentRotation);
              
              setTimeout(() => {
                setHandEmoji("🤏");
                setIsGrabbing(true);
                // 選択時：回転を一時停止
                pauseSpinning?.();
                playSound("grab");
                
                setTimeout(() => {
                  setHandPosition({ x: 50, y: -20 });
                  playSound("fanfare");
                  
                  setTimeout(() => {
                    setIsGrabbing(false);
                    setTargetName(null);
                    setHandPosition(null);
                    setHandEmoji("🖐️");
                    // 選択後：回転を再開
                    resumeSpinning?.();
                    
                    // 本番のつまみ出しが終わったら鼓動音を停止
                    stopFeintLoop();
                    
                    const newRemaining = remaining.filter((n) => n !== finalTarget);
                    resolve({ name: finalTarget, remaining: newRemaining });
                  }, 500);
                }, 400);
              }, 300);
            }, 300);
            return;
          }
          
          // 2人目以降はフェイントあり
          const feintCount = 1 + Math.floor(Math.random() * 2); // 1〜2回のフェイント
          const feintTargets: string[] = [];
          
          for (let i = 1; i < Math.min(feintCount + 1, shuffled.length); i++) {
            feintTargets.push(shuffled[i] || shuffled[0]);
          }
          
          let feintsDone = 0;
          
          const doFeint = () => {
            if (feintsDone < feintTargets.length) {
              const feintTarget = feintTargets[feintsDone];
              
              playSound("tick");
              setTargetName(feintTarget);
              moveHandToName(feintTarget, remaining, currentRotation);
              
              setTimeout(() => {
                setHandEmoji("🤏");
                // フェイント時：回転を一時停止
                pauseSpinning?.();
                
                setTimeout(() => {
                  // フェイント！心臓の鼓動音
                  playSound("feint");
                  // 心臓の鼓動が聞こえるように少し待つ
                  setTimeout(() => {
                    setHandEmoji("🖐️");
                    setTargetName(null);
                    moveHandToCenter();
                    // フェイント後：回転を再開
                    resumeSpinning?.();
                    
                    feintsDone++;
                    // 次のフェイントまでの時間を短くする
                    setTimeout(doFeint, 800);
                  }, 600); // 心臓の鼓動が聞こえる時間を短縮
                }, 400); // 手を🤏にする時間を短縮
              }, 400); // 名前の位置に移動する時間を短縮
            } else {
              // 本番のつまみ出し
              setTimeout(() => {
                playSound("tick");
                setTargetName(finalTarget);
                moveHandToName(finalTarget, remaining, currentRotation);
                
                setTimeout(() => {
                  setHandEmoji("🤏");
                  setIsGrabbing(true);
                  // 選択時：回転を一時停止
                  pauseSpinning?.();
                  playSound("grab");
                  
                  setTimeout(() => {
                    setHandPosition({ x: 50, y: -20 });
                    playSound("fanfare");
                    
                    setTimeout(() => {
                      setIsGrabbing(false);
                      setTargetName(null);
                      setHandPosition(null);
                      setHandEmoji("🖐️");
                      // 選択後：回転を再開
                      resumeSpinning?.();
                      
                      // 本番のつまみ出しが終わったら鼓動音を停止
                      stopFeintLoop();
                      
                      const newRemaining = remaining.filter((n) => n !== finalTarget);
                      resolve({ name: finalTarget, remaining: newRemaining });
                    }, 500);
                  }, 400);
                }, 300);
              }, 300);
            }
          };
          
          doFeint();
        }, 400);
      });
    },
    [moveHandToCenter, moveHandToName, playSound]
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

    let spinInterval: NodeJS.Timeout | null = null;
    let jingleInterval: NodeJS.Timeout | null = null;
    
    // 回転を開始（継続的に回転させる）
    const startSpinning = () => {
      if (spinInterval) clearInterval(spinInterval);
      spinInterval = setInterval(() => {
        currentRotation += 5; // さらにゆっくりに
        setRotation(currentRotation);
      }, 70); // さらにゆっくりに
    };
    
    // 回転を一時停止
    const pauseSpinning = () => {
      if (spinInterval) {
        clearInterval(spinInterval);
        spinInterval = null;
      }
    };
    
    // 回転を再開
    const resumeSpinning = () => {
      if (!spinInterval) {
        startSpinning();
      }
    };
    
    // ジングル音を繰り返し
    const startJingle = () => {
      if (jingleInterval) clearInterval(jingleInterval);
      jingleInterval = setInterval(() => {
        playSound("jingle");
      }, 400);
    };
    
    // ジングル音を停止
    const stopJingle = () => {
      if (jingleInterval) {
        clearInterval(jingleInterval);
        jingleInterval = null;
      }
    };
    
    // 回転を停止
    const stopSpinning = () => {
      if (spinInterval) {
        clearInterval(spinInterval);
        spinInterval = null;
      }
      if (jingleInterval) {
        clearInterval(jingleInterval);
        jingleInterval = null;
      }
      setIsSpinning(false);
    };
    
    // 全ペアを順番に決める
    while (remaining.length >= groupSize) {
      setCurrentPair([]);
      
      // 最後のペア判定（残り人数がグループサイズ以下なら最後）
      const isLastPair = remaining.length <= groupSize;
      
      if (isLastPair) {
        // 最後のペアは演出なしで自動決定
        const lastPair: PairResult = { members: [...remaining] };
        setGrabbedMembers((prev) => [...prev, ...remaining]);
        setCurrentPair(remaining);
        allResults.push(lastPair);
        setResults([...allResults]);
        setRemainingParticipants([]);
        
        // モーダル表示（最後のペア）
        playSound("fanfare");
        setModalPair(lastPair);
        setShowModal(true);
        
        await new Promise((r) => setTimeout(r, 2500));
        setShowModal(false);
        
        remaining = [];
      } else {
        // ペアを決める
        const members: string[] = [];
        let currentRemaining = remaining;
        const actualSize = Math.min(groupSize, currentRemaining.length);
        
        // 1人目はルーレットで決定
        // ルーレット回転開始 - ドラムロールを再生
        playSound("drumroll");
        setIsSpinning(true); // 回転開始
        
        // ルーレットを回転させて停止（Promiseで包む）
        const firstPersonResult = await new Promise<{ name: string; finalRotation: number }>((resolve) => {
          if (spinInterval) clearInterval(spinInterval);
          
          let spinSpeed = 15;
          let deceleration = 0.98;
          const minSpeed = 0.3;
          
          const animate = () => {
            currentRotation += spinSpeed;
            setRotation(currentRotation);
            
            if (spinSpeed > minSpeed) {
              spinSpeed *= deceleration;
              spinInterval = setTimeout(animate, 50);
            } else {
              // 停止
              if (spinInterval) {
                clearInterval(spinInterval);
                spinInterval = null;
              }
              setIsSpinning(false);
              stopSound("drumroll");
              
              // 下向きのポインター（上/0度）が指している人を計算
              // ポインターは0度（上・ルーレットの一番上）を指している（固定位置）
              // ルーレットが回転しているので、ルーレット上のどの角度がポインターの位置にあるかを計算
              // 名前の表示は angle = segmentAngle * i + segmentAngle / 2 で、0度が上
              const normalizedRotation = ((currentRotation % 360) + 360) % 360;
              const pointerAngle = 0; // 下向きのポインターは0度（固定位置、上が0度）
              
              // ルーレット上の角度を計算
              // ルーレットが時計回りに回転している場合、ポインターが指す位置は反時計回りに移動する
              // つまり、ルーレット上の角度 = (0 - rotation + 360) % 360
              // 正しい計算: ルーレット上の角度 = (0 - rotation + 360) % 360
              const rouletteAngle = (pointerAngle - normalizedRotation + 360) % 360;
              
              const segmentAngle = 360 / currentRemaining.length;
              
              // セグメントのインデックスを計算
              // セグメントiの中心角度は segmentAngle * i + segmentAngle / 2（0度が上）
              // ポインターが指している角度（rouletteAngle）に最も近いセグメントを選択
              // ただし、rouletteAngleは0度が上なので、セグメントの中心角度と直接比較できる
              let selectedIndex = 0;
              let minDistance = Infinity;
              
              for (let i = 0; i < currentRemaining.length; i++) {
                // セグメントiの中心角度（0度が上）
                const segmentCenter = segmentAngle * i + segmentAngle / 2;
                
                // 角度の差を計算（0-180度の範囲で最短距離）
                let distance = Math.abs(rouletteAngle - segmentCenter);
                if (distance > 180) {
                  distance = 360 - distance;
                }
                
                if (distance < minDistance) {
                  minDistance = distance;
                  selectedIndex = i;
                }
              }
              
              const selectedName = currentRemaining[selectedIndex];
              
 
              // 決定演出
              setTargetName(selectedName);
              setGrabbedMembers((prev) => [...prev, selectedName]);
              setCurrentPair((prev) => [...prev, selectedName]);
              playSound("fanfare");
              
              setTimeout(() => {
                setTargetName(null);
                resolve({ name: selectedName, finalRotation: currentRotation });
              }, 1500);
            }
          };
          
          // ドラムロールが鳴ったと同時に回転開始
          animate();
        });
        
        members.push(firstPersonResult.name);
        currentRemaining = currentRemaining.filter((n) => n !== firstPersonResult.name);
        setRemainingParticipants(currentRemaining);
        currentRotation = firstPersonResult.finalRotation;
        
        // 2人目以降は手でつまみ出す（フェイントあり、ルーレットは停止したまま）
        // pauseSpinningとresumeSpinningをundefinedにして、ルーレットを停止したままにする
        for (let i = 1; i < actualSize; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          
          const result = await grabOnePerson(currentRemaining, currentRotation, undefined, undefined, false);
          members.push(result.name);
          currentRemaining = result.remaining;
          setGrabbedMembers((prev) => [...prev, result.name]);
          setCurrentPair((prev) => [...prev, result.name]);
          setRemainingParticipants(currentRemaining);
        }
        
        // ペア完成
        const pair: PairResult = { members };
        allResults.push(pair);
        setResults([...allResults]);
        
        // モーダル表示
        setModalPair(pair);
        setShowModal(true);
        
        await new Promise((r) => setTimeout(r, 2500));
        setShowModal(false);
        
        remaining = currentRemaining;
        
        // 次のペアへ
        if (remaining.length >= groupSize) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }

    // 1人余った場合（グループサイズで割り切れない場合）
    if (remaining.length === 1 && allResults.length > 0) {
      allResults[allResults.length - 1].members.push(remaining[0]);
      setGrabbedMembers((prev) => [...prev, remaining[0]]);
      setResults([...allResults]);
      setRemainingParticipants([]);
    }

    // 完了！拍手歓声
    stopSpinning(); // 回転を停止
    playSound("applause");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 6000);
    setIsRunning(false);
    // 結果モーダルを表示
    setTimeout(() => {
      setShowResultsModal(true);
    }, 1000);
  };

  // リセット
  const resetAll = () => {
    stopSound("applause");
    setResults([]);
    setGrabbedMembers([]);
    setCurrentPair([]);
    setRemainingParticipants([]);
    setShowModal(false);
    setModalPair(null);
    setShowConfetti(false);
    setShowResultsModal(false);
    setIsRunning(false);
    setIsSpinning(false);
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
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 py-6 sm:py-8 px-3 sm:px-4 relative overflow-hidden">
      {/* 背景パターン（外部画像に依存しない） */}
      <div
        className="fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,215,0,0.1) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(220,38,38,0.08) 0%, transparent 45%)`,
        }}
      />
      <Snow />
      <Confetti show={showConfetti} />

      {/* BGMボタン */}
      <BgmButton isPlaying={isBgmPlaying} onToggle={toggleBgm} />

      {/* ペア発表モーダル */}
      <PairModal
        show={showModal}
        pair={modalPair}
        pairIndex={results.length - 1}
        totalPairs={Math.ceil(participants.length / groupSize)}
        onClose={() => setShowModal(false)}
        isAllDone={isAllDone}
      />

      {/* 結果表示モーダル */}
      <ResultsModal
        show={showResultsModal}
        results={results}
        onClose={() => setShowResultsModal(false)}
      />

      <div className="max-w-2xl mx-auto relative z-20">
        {/* ヘッダー */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="inline-block mb-2">
            <span className="text-4xl sm:text-5xl">🎄</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold title-shimmer leading-tight">
            Christmas Party
          </h1>
          <p className="text-white/70 text-sm sm:text-base mt-1 font-medium tracking-wide">12/20 ペア決めルーレット</p>
          {!isLoaded && (
            <p className="text-white/40 text-xs mt-2 flex items-center justify-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white/80 rounded-full animate-spin" />
              音声読み込み中...
            </p>
          )}
        </header>

        {/* 設定パネル */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 mb-4">
          <div className="section-label mb-3">
            <span>⚙️</span> ペア人数
          </div>
          <div className="flex gap-2 flex-wrap">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => !isRunning && setGroupSize(n)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                  groupSize === n
                    ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                } ${isRunning ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {n}人
              </button>
            ))}
          </div>
        </div>

        {/* 参加者入力 */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 mb-4">
          <div className="section-label mb-3">
            <span>👥</span> 参加者
            <span className="ml-1 text-xs font-normal text-gray-400">({participants.length}人)</span>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="名前を入力..."
              disabled={isRunning}
              className="festive-input flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none disabled:opacity-40 text-sm bg-white"
            />
            <button
              onClick={addParticipant}
              disabled={isRunning}
              className="btn-festive px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md shadow-green-500/20 disabled:opacity-40 disabled:shadow-none text-sm"
            >
              追加
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto py-1">
            {participants.map((name) => (
              <span
                key={name}
                className={`participant-tag inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  grabbedMembers.includes(name)
                    ? "bg-gray-100 text-gray-400 line-through border border-gray-200"
                    : "bg-gradient-to-r from-red-50 to-rose-50 text-gray-700 border border-red-200/60"
                }`}
              >
                {!grabbedMembers.includes(name) && <span className="text-xs opacity-60">🎅</span>}
                {name}
                {!isRunning && (
                  <button
                    onClick={() => removeParticipant(name)}
                    className="text-red-400 hover:text-red-600 font-bold ml-0.5 transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {participants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                {getGroupInfo()}
              </p>
            </div>
          )}
        </div>

        {/* ルーレット */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 mb-4">
          <div className="flex flex-col items-center">
            <RouletteWheel
              names={displayNames}
              rotation={rotation}
              handPosition={handPosition}
              handEmoji={handEmoji}
              targetName={targetName}
              grabbedMembers={grabbedMembers}
              isGrabbing={isGrabbing}
              isSpinning={isSpinning}
            />

            {/* 現在つまみ出し中の表示 */}
            {currentPair.length > 0 && isRunning && (
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200/60">
                <p className="text-xs text-gray-500 text-center mb-1 font-medium">決定中のペア</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {currentPair.map((name, i) => (
                    <span key={i} className="font-bold text-base sm:text-lg text-red-600 animate-pulse">{name}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 sm:mt-6 flex gap-3">
              {!isRunning && results.length === 0 && (
                <button
                  onClick={startRoulette}
                  disabled={participants.length < groupSize}
                  className="btn-festive group px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-br from-red-500 via-red-500 to-rose-600 text-white font-extrabold rounded-2xl hover:from-red-600 hover:via-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-lg sm:text-xl tracking-wide"
                >
                  <span className="group-hover:scale-110 inline-block transition-transform">🎰</span> スタート！
                </button>
              )}

              {!isRunning && results.length > 0 && (
                <button
                  onClick={resetAll}
                  className="btn-festive px-6 py-3 bg-gray-500/90 text-white font-bold rounded-xl hover:bg-gray-600 shadow-md"
                >
                  🔄 リセット
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {results.length > 0 && (
          <div className="glass-card rounded-2xl p-4 sm:p-5">
            <div className="section-label mb-4">
              <span>🎊</span> 結果
            </div>

            <div className="space-y-3">
              {results.map((pair, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-green-50/80 border border-yellow-300/50 shadow-sm"
                >
                  <div className="mb-2">
                    <OrnamentNumber number={i + 1} label="ペア" size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {pair.members.map((member, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-gray-800">{member}</span>
                        {j < pair.members.length - 1 && <span className="text-xl sm:text-2xl">🎁</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {isAllDone && (
              <div className="mt-5 text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50">
                <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">
                  🎉 全ペア決定！ 🎉
                </p>
                <p className="text-gray-500 text-sm mt-1">メリークリスマス！🎄</p>
              </div>
            )}
          </div>
        )}

        {/* フッター */}
        <footer className="text-center mt-8 mb-2">
          <p className="text-white/30 text-xs tracking-widest">🎄 Merry Christmas 2025 🎄</p>
        </footer>
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

        @keyframes wreathTwinkle {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.55; filter: brightness(0.9); }
          35% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; filter: brightness(1.25); }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; filter: brightness(1.0); }
        }
        .animate-wreathTwinkle {
          animation: wreathTwinkle 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
