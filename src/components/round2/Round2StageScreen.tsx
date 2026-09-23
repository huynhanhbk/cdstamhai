import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Award,
  Save,
  CheckCircle2,
  StopCircle,
  Sparkles,
} from 'lucide-react';
import { Situation } from '../../types/competition';
import { useSound } from '../../hooks/useSound';
import { useStageKeyboard } from '../../hooks/useStageKeyboard';

interface Round2StageScreenProps {
  situation: Situation;
  soundEnabled: boolean;
  onCompleteSituation: (updatedSituation: Situation) => void;
  onBackToSituationList: () => void;
  onToggleFullscreen: () => void;
}

export const Round2StageScreen: React.FC<Round2StageScreenProps> = ({
  situation,
  soundEnabled,
  onCompleteSituation,
  onBackToSituationList,
  onToggleFullscreen,
}) => {
  const {
    triggerTick,
    triggerUrgentTick,
    triggerTimeout,
    triggerCorrect,
    triggerWrong,
    triggerStart,
  } = useSound(soundEnabled);

  // Time configurations
  const BASE_TIME_SECONDS = 7 * 60; // 420 seconds = 07:00
  const [timeLeft, setTimeLeft] = useState(BASE_TIME_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBaseTimeOut, setIsBaseTimeOut] = useState(false);

  // Overtime states
  const [isOvertimeMode, setIsOvertimeMode] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);

  // Scoring states
  const [judgeScoreInput, setJudgeScoreInput] = useState<string>('30');
  const [isScoringComplete, setIsScoringComplete] = useState(false);

  // Accurate timestamp refs
  const baseTimerEndRef = useRef<number | null>(null);
  const remainingBaseTimeRef = useRef<number>(BASE_TIME_SECONDS);
  const overtimeStartTimestampRef = useRef<number | null>(null);
  const accumulatedOvertimeRef = useRef<number>(0);

  // Formatting helpers
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer
  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setIsBaseTimeOut(false);
    setIsOvertimeMode(false);
    setTimeLeft(BASE_TIME_SECONDS);
    setOvertimeSeconds(0);
    remainingBaseTimeRef.current = BASE_TIME_SECONDS;
    accumulatedOvertimeRef.current = 0;
    baseTimerEndRef.current = null;
    overtimeStartTimestampRef.current = null;
  }, [BASE_TIME_SECONDS]);

  // Start / Resume Timer
  const startTimer = useCallback(() => {
    triggerStart();
    setIsTimerRunning(true);

    if (!isBaseTimeOut) {
      baseTimerEndRef.current = Date.now() + remainingBaseTimeRef.current * 1000;
    } else {
      // Running in overtime
      overtimeStartTimestampRef.current = Date.now() - accumulatedOvertimeRef.current * 1000;
      setIsOvertimeMode(true);
    }
  }, [isBaseTimeOut, triggerStart]);

  // Pause Timer
  const pauseTimer = useCallback(() => {
    if (!isTimerRunning) return;
    setIsTimerRunning(false);

    if (!isBaseTimeOut && baseTimerEndRef.current) {
      const remaining = Math.max(0, (baseTimerEndRef.current - Date.now()) / 1000);
      remainingBaseTimeRef.current = remaining;
    } else if (isBaseTimeOut && overtimeStartTimestampRef.current) {
      const elapsed = Math.floor((Date.now() - overtimeStartTimestampRef.current) / 1000);
      accumulatedOvertimeRef.current = elapsed;
    }
  }, [isTimerRunning, isBaseTimeOut]);

  // Main high-precision timer loop
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();

      if (!isBaseTimeOut && baseTimerEndRef.current) {
        const msLeft = baseTimerEndRef.current - now;
        const secsLeft = Math.max(0, Math.ceil(msLeft / 1000));
        setTimeLeft(secsLeft);

        // Sound triggers for last 10 seconds of base time
        if (secsLeft <= 10 && secsLeft > 3) {
          triggerTick();
        } else if (secsLeft <= 3 && secsLeft > 0) {
          triggerUrgentTick();
        }

        if (msLeft <= 0) {
          setTimeLeft(0);
          setIsBaseTimeOut(true);
          triggerTimeout();
          // Stop running, prompt operator to start overtime if team continues
          setIsTimerRunning(false);
        }
      } else if (isBaseTimeOut && isOvertimeMode && overtimeStartTimestampRef.current) {
        const elapsedSecs = Math.floor((now - overtimeStartTimestampRef.current) / 1000);
        setOvertimeSeconds(elapsedSecs);
        accumulatedOvertimeRef.current = elapsedSecs;
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isTimerRunning, isBaseTimeOut, isOvertimeMode, triggerTick, triggerUrgentTick, triggerTimeout]);

  // Operator explicitly starts overtime tracking
  const handleStartOvertime = () => {
    setIsOvertimeMode(true);
    overtimeStartTimestampRef.current = Date.now() - accumulatedOvertimeRef.current * 1000;
    setIsTimerRunning(true);
  };

  // Stop all timers when presentation ends
  const handleStopAll = () => {
    setIsTimerRunning(false);
    if (overtimeStartTimestampRef.current) {
      const finalOver = Math.floor((Date.now() - overtimeStartTimestampRef.current) / 1000);
      setOvertimeSeconds(finalOver);
      accumulatedOvertimeRef.current = finalOver;
    }
  };

  // Calculate penalties according to official rules:
  // - Vượt dưới 2 phút (< 120s): trừ 2 điểm
  // - Vượt từ 3 đến 5 phút (120s - 300s): trừ 5 điểm
  // - Vượt trên 5 phút (> 300s): trừ 10 điểm
  let penaltyPoints = 0;
  if (overtimeSeconds > 0) {
    if (overtimeSeconds < 120) {
      penaltyPoints = 2;
    } else if (overtimeSeconds <= 300) {
      penaltyPoints = 5;
    } else {
      penaltyPoints = 10;
    }
  }

  const rawJudgeScore = Math.min(30, Math.max(0, parseFloat(judgeScoreInput) || 0));
  const finalScore = Math.max(0, rawJudgeScore - penaltyPoints);

  // Save situation score and mark as completed
  const handleSaveResult = () => {
    const updatedSituation: Situation = {
      ...situation,
      status: 'completed',
      elapsedSeconds: BASE_TIME_SECONDS - timeLeft,
      overtimeSeconds: overtimeSeconds,
      judgeScore: rawJudgeScore,
      penaltyScore: penaltyPoints,
      finalScore: finalScore,
      playedAt: new Date().toLocaleString('vi-VN'),
    };

    onCompleteSituation(updatedSituation);
    setIsScoringComplete(true);
    if (finalScore >= 25) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981'],
      });
    }
  };

  // Keyboard navigation
  useStageKeyboard({
    onSpace: () => {
      if (isTimerRunning) {
        pauseTimer();
      } else {
        if (isBaseTimeOut && !isOvertimeMode) {
          handleStartOvertime();
        } else {
          startTimer();
        }
      }
    },
    onResetTimer: resetTimer,
    onToggleFullscreen,
  });

  return (
    <div className="relative min-h-[calc(100vh-68px)] flex flex-col justify-between p-6 md:p-8 lg:p-12 bg-slate-950 select-none overflow-hidden">
      {/* Stage Header */}
      <div className="relative z-10 w-full flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSituationList}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Quay lại danh sách tình huống"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="px-3.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-black uppercase">
            {situation.title}
          </div>
          <div className="hidden sm:block text-sm md:text-base font-bold text-slate-300">
            PHẦN THI 2: XỬ LÝ TÌNH HUỐNG (TỐI ĐA 30 ĐIỂM)
          </div>
        </div>

        {/* Dual Timers Header Area */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Main 07:00 countdown timer */}
          <div
            className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-2xl border-2 shadow-xl transition-all ${
              timeLeft === 0
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-rose-950/50'
                : timeLeft <= 60
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-amber-950/50 animate-pulse'
                : 'bg-slate-900 border-indigo-500/50 text-indigo-300 shadow-indigo-950/40'
            }`}
          >
            <Clock className="w-6 h-6 md:w-7 md:h-7" />
            <div className="text-2xl md:text-4xl font-black font-mono tracking-tight leading-none">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Overtime display if applicable */}
          {overtimeSeconds > 0 && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-950 border-2 border-rose-500 text-rose-300 animate-pulse shadow-lg">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-xl md:text-2xl font-mono font-black">
                +{formatTime(overtimeSeconds)}
              </div>
            </div>
          )}

          {/* Timer controls */}
          <div className="flex items-center gap-1.5">
            {isTimerRunning ? (
              <button
                onClick={pauseTimer}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                title="Tạm dừng (Space)"
              >
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900"
                title="Bắt đầu / Tiếp tục (Space)"
              >
                <Play className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-indigo-300"
              title="Reset 07:00 (Phím R)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Situation Content Stage Display - Large font, High contrast */}
      <div className="relative z-10 max-w-5xl w-full mx-auto my-auto py-4 md:py-6">
        {/* Warning notification when base time runs out */}
        {isBaseTimeOut && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-600/90 text-white font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-between gap-3 shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>ĐÃ HẾT 07 PHÚT QUY ĐỊNH</span>
            </div>
            {!isOvertimeMode && (
              <button
                onClick={handleStartOvertime}
                className="px-4 py-1.5 rounded-xl bg-white text-rose-900 text-xs md:text-sm font-black hover:bg-slate-100 transition shadow"
              >
                BẮT ĐẦU TÍNH THỜI GIAN VƯỢT
              </button>
            )}
          </div>
        )}

        {/* Grand Card for Situation Text */}
        <div className="p-6 md:p-10 rounded-3xl bg-slate-900/95 border-2 border-indigo-500/40 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs md:text-sm font-black tracking-widest text-indigo-400 uppercase">
              NỘI DUNG TÌNH HUỐNG THỰC TẾ TẠI ĐỊA PHƯƠNG
            </span>
            <span className="text-xs text-slate-400">
              Đội thi có tối đa 07 phút để hội ý và trình bày
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-relaxed tracking-tight">
            {situation.content}
          </h2>

          {situation.imageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden flex justify-center max-h-56">
              <img
                src={situation.imageUrl}
                alt="Minh họa tình huống"
                className="object-contain max-h-56 rounded-xl border border-slate-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* Operator Scoring & Verdict Panel */}
      <div className="relative z-10 w-full max-w-5xl mx-auto pt-4 border-t border-slate-800/80">
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Overtime Controls */}
          <div className="flex items-center gap-3">
            {isBaseTimeOut && !isOvertimeMode && (
              <button
                onClick={handleStartOvertime}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-950/50"
              >
                <Clock className="w-4 h-4" />
                <span>Bắt đầu tính vượt giờ</span>
              </button>
            )}

            {isOvertimeMode && isTimerRunning && (
              <button
                onClick={handleStopAll}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
              >
                <StopCircle className="w-4 h-4" />
                <span>Dừng đếm vượt giờ</span>
              </button>
            )}

            <div className="text-xs text-slate-300">
              <div>Vượt giờ: <strong className="text-rose-400">{overtimeSeconds}s</strong></div>
              <div>Điểm trừ: <strong className="text-rose-400">-{penaltyPoints}đ</strong></div>
            </div>
          </div>

          {/* Judge score input & Official Score Calculation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="judge-score" className="text-xs md:text-sm font-bold text-slate-300">
                Điểm BGK (0-30):
              </label>
              <input
                id="judge-score"
                type="number"
                min="0"
                max="30"
                step="0.5"
                value={judgeScoreInput}
                onChange={(e) => setJudgeScoreInput(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-indigo-500 text-center font-black text-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Official Score Result */}
            <div className="px-4 py-1.5 rounded-xl bg-indigo-950 border border-indigo-500/50 text-center">
              <div className="text-[10px] uppercase font-bold text-indigo-300">ĐIỂM CHÍNH THỨC</div>
              <div className="text-2xl md:text-3xl font-black text-emerald-400">
                {finalScore} <span className="text-xs text-slate-400 font-normal">/ 30</span>
              </div>
            </div>

            {/* Save & Complete button */}
            <button
              id="save-round2-btn"
              onClick={handleSaveResult}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm md:text-base flex items-center gap-2 shadow-xl shadow-emerald-950/40 transition active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>LƯU KẾT QUẢ</span>
            </button>
          </div>
        </div>

        {/* Feedback after saving */}
        {isScoringComplete && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Đã ghi nhận kết quả {situation.title}: {finalScore}/30 điểm (Điểm gốc: {rawJudgeScore}, Trừ vượt giờ: -{penaltyPoints}đ)</span>
            </div>
            <button
              onClick={onBackToSituationList}
              className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-emerald-400"
            >
              Về danh sách tình huống
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
