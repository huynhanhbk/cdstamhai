import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Dices,
  Play,
  RotateCcw,
  X,
  CheckCircle2,
  Trophy,
  Filter,
} from 'lucide-react';
import { useSound } from '../../hooks/useSound';

export interface DrawItem {
  id: string;
  number: number;
  title: string;
  status?: string;
  score?: number;
}

interface RandomDrawModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  items: DrawItem[];
  themeColor?: 'cyan' | 'indigo';
  soundEnabled?: boolean;
  onConfirmSelection: (item: DrawItem) => void;
  onClose: () => void;
}

export const RandomDrawModal: React.FC<RandomDrawModalProps> = ({
  isOpen,
  title,
  subtitle,
  items,
  themeColor = 'cyan',
  soundEnabled = true,
  onConfirmSelection,
  onClose,
}) => {
  const [onlyUnplayed, setOnlyUnplayed] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayItem, setDisplayItem] = useState<DrawItem | null>(null);
  const [winnerItem, setWinnerItem] = useState<DrawItem | null>(null);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { triggerSpinTick, triggerLotteryWin } = useSound(soundEnabled);

  const eligibleItems = items.filter((item) => {
    if (!onlyUnplayed) return true;
    return item.status !== 'completed';
  });

  // Effective list to draw from
  const candidatePool = eligibleItems.length > 0 ? eligibleItems : items;

  // Cleanup timer on unmount or close
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, []);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setWinnerItem(null);
      setIsSpinning(false);
      setDisplayItem(candidatePool[0] || null);
    }
  }, [isOpen]);

  const startDraw = useCallback(() => {
    if (isSpinning || candidatePool.length === 0) return;

    setIsSpinning(true);
    setWinnerItem(null);

    // Pick winning item in advance from candidate pool
    const winningIndex = Math.floor(Math.random() * candidatePool.length);
    const chosenWinner = candidatePool[winningIndex];

    const totalSpins = 32 + Math.floor(Math.random() * 8); // ~35 steps
    let currentStep = 0;
    let poolIndex = Math.floor(Math.random() * candidatePool.length);

    const runStep = () => {
      currentStep++;
      poolIndex = (poolIndex + 1) % candidatePool.length;
      
      const currentCandidate =
        currentStep >= totalSpins ? chosenWinner : candidatePool[poolIndex];
      setDisplayItem(currentCandidate);

      // Sound pitch changes slightly during spin
      const pitch = 750 + (currentStep % 5) * 60;
      triggerSpinTick(pitch);

      if (currentStep < totalSpins) {
        // Deceleration math: fast at beginning (45ms), slows down towards 350ms
        const progress = currentStep / totalSpins;
        let delay = 45;
        if (progress > 0.6) {
          delay = 45 + Math.pow((progress - 0.6) / 0.4, 2) * 320;
        } else if (progress > 0.4) {
          delay = 45 + (progress - 0.4) * 50;
        }
        spinTimerRef.current = setTimeout(runStep, delay);
      } else {
        // Finish spin!
        setIsSpinning(false);
        setWinnerItem(chosenWinner);
        setDisplayItem(chosenWinner);
        triggerLotteryWin();
      }
    };

    runStep();
  }, [candidatePool, isSpinning, triggerSpinTick, triggerLotteryWin]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isSpinning) onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isSpinning) return;
        if (winnerItem) {
          onConfirmSelection(winnerItem);
        } else {
          startDraw();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSpinning, winnerItem, onClose, onConfirmSelection, startDraw]);

  if (!isOpen) return null;

  const isCyan = themeColor === 'cyan';
  const unplayedCount = items.filter((i) => i.status !== 'completed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="random-draw-modal"
        className={`relative w-full max-w-2xl bg-white dark:bg-slate-950 border-2 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden transition-colors duration-200 ${
          isCyan
            ? 'border-cyan-400 dark:border-cyan-500/50 shadow-cyan-950/20 dark:shadow-cyan-950/80'
            : 'border-indigo-400 dark:border-indigo-500/50 shadow-indigo-950/20 dark:shadow-indigo-950/80'
        }`}
      >
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15 dark:opacity-25 ${
            isCyan ? 'bg-cyan-500' : 'bg-indigo-500'
          }`}
        />
        <div
          className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15 dark:opacity-20 ${
            isCyan ? 'bg-blue-500' : 'bg-purple-500'
          }`}
        />

        {/* Modal Top Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isCyan
                  ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40'
                  : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40'
              }`}
            >
              <Dices className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div
                className={`text-[11px] font-black tracking-widest uppercase ${
                  isCyan ? 'text-cyan-700 dark:text-cyan-400' : 'text-indigo-700 dark:text-indigo-400'
                }`}
              >
                {subtitle}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSpinning}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30"
            title="Đóng (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter settings & stats */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 my-4 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>
              Tổng số:{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{items.length}</strong> |
              Chưa thi:{' '}
              <strong
                className={
                  unplayedCount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'
                }
              >
                {unplayedCount}
              </strong>
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white select-none font-medium">
            <input
              type="checkbox"
              checked={onlyUnplayed}
              disabled={isSpinning || unplayedCount === 0}
              onChange={(e) => setOnlyUnplayed(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-500 focus:ring-0 w-4 h-4"
            />
            <span>Chỉ bốc thăm phần chưa thi</span>
          </label>
        </div>

        {/* Center Stage: The Draw Box */}
        <div className="relative z-10 my-6 flex flex-col items-center justify-center">
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border-3 flex flex-col items-center justify-center text-center transition-all duration-300 ${
              winnerItem
                ? isCyan
                  ? 'bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/80 dark:to-slate-950 border-cyan-400 shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-500/30 scale-105'
                  : 'bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/80 dark:to-slate-950 border-indigo-400 shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-500/30 scale-105'
                : isSpinning
                ? 'bg-amber-50 dark:bg-slate-900 border-amber-400 shadow-xl shadow-amber-950/20 dark:shadow-amber-950/40'
                : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 shadow-md dark:shadow-xl'
            }`}
          >
            {/* Crown / Trophy icon when winner found */}
            {winnerItem && (
              <div className="mb-2 animate-bounce">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase shadow-lg shadow-amber-500/30">
                  <Trophy className="w-3.5 h-3.5" />
                  KẾT QUẢ BỐC THĂM
                </span>
              </div>
            )}

            {/* Giant Number Badge */}
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-black mb-4 shadow-xl transition-transform ${
                winnerItem
                  ? isCyan
                    ? 'bg-cyan-500 text-slate-950 scale-110 shadow-cyan-400/50'
                    : 'bg-indigo-600 text-white scale-110 shadow-indigo-400/50'
                  : isSpinning
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {displayItem ? displayItem.number : '?'}
            </div>

            {/* Title / Description */}
            <h3
              className={`text-2xl sm:text-3xl font-black tracking-tight uppercase mb-2 ${
                winnerItem
                  ? 'text-slate-900 dark:text-white'
                  : isSpinning
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-slate-800 dark:text-slate-300'
              }`}
            >
              {displayItem ? displayItem.title : 'SẴN SÀNG QUAY'}
            </h3>

            {/* Sub-status description */}
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {winnerItem ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã bốc thăm trúng! Nhấn "VÀO THI NGAY" để tiến hành.
                </span>
              ) : isSpinning ? (
                <span className="text-amber-700 dark:text-amber-400 animate-pulse font-bold">
                  Đang quay số ngẫu nhiên hồi hộp...
                </span>
              ) : candidatePool.length === 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  Tất cả các gói/tình huống đã hoàn thành thi.
                </span>
              ) : (
                <span>
                  Nhấn "BẮT ĐẦU BỐC THĂM" hoặc phím cách (Space) để quay số.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!winnerItem ? (
            <button
              id="start-draw-btn"
              onClick={startDraw}
              disabled={isSpinning || candidatePool.length === 0}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl transition transform active:scale-95 disabled:opacity-40 ${
                isCyan
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isSpinning ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>ĐANG BỐC THĂM...</span>
                </>
              ) : (
                <>
                  <Dices className="w-6 h-6" />
                  <span>BẮT ĐẦU BỐC THĂM (Phím Space)</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="redraw-btn"
                onClick={startDraw}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bốc Thăm Lại</span>
              </button>

              <button
                id="confirm-draw-btn"
                onClick={() => onConfirmSelection(winnerItem)}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-xl transition transform active:scale-95 ${
                  isCyan
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>VÀO THI NGAY (Enter)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
