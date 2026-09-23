import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  X as XIcon,
  ArrowRight,
  Eye,
  Award,
  Clock,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { QuizPackage } from '../../types/competition';
import { useSound } from '../../hooks/useSound';
import { useStageKeyboard } from '../../hooks/useStageKeyboard';

interface Round1StageScreenProps {
  pkg: QuizPackage;
  soundEnabled: boolean;
  onCompletePackage: (updatedPackage: QuizPackage) => void;
  onBackToPackageList: () => void;
  onToggleFullscreen: () => void;
}

export const Round1StageScreen: React.FC<Round1StageScreenProps> = ({
  pkg,
  soundEnabled,
  onCompletePackage,
  onBackToPackageList,
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

  // States: 'intro' | 'question' | 'summary'
  const [stagePhase, setStagePhase] = useState<'intro' | 'question' | 'summary'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timer states (10 seconds per question)
  const TIME_LIMIT = 10;
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);

  // Question Answer status
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [questionVerdict, setQuestionVerdict] = useState<'correct' | 'wrong' | null>(null);

  // Results tracker: 4 questions
  const [questionResults, setQuestionResults] = useState<
    { questionId: string; isCorrect: boolean; points: number }[]
  >([]);

  const timerEndTimeRef = useRef<number | null>(null);
  const remainingTimeWhenPausedRef = useRef<number>(TIME_LIMIT);
  const lastSecondRef = useRef<number>(TIME_LIMIT);

  const currentQ = pkg.questions[currentQuestionIndex] || pkg.questions[0];
  const totalQuestions = pkg.questions.length;

  // Sound and confetti celebration
  const launchConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
    });
  };

  // Reset timer for current question
  const resetCurrentTimer = useCallback(() => {
    setIsTimerRunning(false);
    setIsTimeOut(false);
    setTimeLeft(TIME_LIMIT);
    remainingTimeWhenPausedRef.current = TIME_LIMIT;
    timerEndTimeRef.current = null;
    lastSecondRef.current = TIME_LIMIT;
  }, [TIME_LIMIT]);

  // Start question timer
  const startTimer = useCallback(() => {
    if (isTimeOut) return;
    triggerStart();
    const duration = remainingTimeWhenPausedRef.current > 0 ? remainingTimeWhenPausedRef.current : TIME_LIMIT;
    timerEndTimeRef.current = Date.now() + duration * 1000;
    lastSecondRef.current = Math.ceil(duration);
    setIsTimerRunning(true);
  }, [isTimeOut, TIME_LIMIT, triggerStart]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!isTimerRunning) return;
    if (timerEndTimeRef.current) {
      const remainingMs = Math.max(0, timerEndTimeRef.current - Date.now());
      remainingTimeWhenPausedRef.current = remainingMs / 1000;
    }
    setIsTimerRunning(false);
  }, [isTimerRunning]);

  // Timer loop based on real timestamp (never drifts)
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      if (!timerEndTimeRef.current) return;
      const msLeft = timerEndTimeRef.current - Date.now();
      const currentSec = Math.max(0, Math.ceil(msLeft / 1000));

      if (currentSec !== lastSecondRef.current) {
        lastSecondRef.current = currentSec;
        setTimeLeft(currentSec);

        // Sound triggers
        if (currentSec > 3 && currentSec <= 10) {
          triggerTick();
        } else if (currentSec > 0 && currentSec <= 3) {
          triggerUrgentTick();
        }
      }

      if (msLeft <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setIsTimerRunning(false);
        setIsTimeOut(true);
        triggerTimeout();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isTimerRunning, triggerTick, triggerUrgentTick, triggerTimeout]);

  // Handler for starting the package
  const handleStartPackage = () => {
    setStagePhase('question');
    setCurrentQuestionIndex(0);
    setQuestionResults([]);
    setIsAnswerRevealed(false);
    setQuestionVerdict(null);
    resetCurrentTimer();
    // Do NOT auto-start timer: allow MC to read question and options first
  };

  // Reveal correct answer
  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  // Mark verdict: Correct (+5 pts)
  const handleMarkCorrect = () => {
    setIsAnswerRevealed(true);
    setQuestionVerdict('correct');
    triggerCorrect();
    launchConfetti();
  };

  // Mark verdict: Wrong (0 pts)
  const handleMarkWrong = () => {
    setIsAnswerRevealed(true);
    setQuestionVerdict('wrong');
    triggerWrong();
  };

  // Move to next question or complete package
  const handleNextQuestion = () => {
    // Record result for this question
    const isCorrect = questionVerdict === 'correct';
    const points = isCorrect ? 5 : 0;
    const newResults = [
      ...questionResults.filter((r) => r.questionId !== currentQ.id),
      { questionId: currentQ.id, isCorrect, points },
    ];
    setQuestionResults(newResults);

    if (currentQuestionIndex < totalQuestions - 1) {
      // Go to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsAnswerRevealed(false);
      setQuestionVerdict(null);
      resetCurrentTimer();
      // Do NOT auto-start timer: allow MC to read question and options first
    } else {
      // Finish package
      const totalScore = newResults.reduce((sum, r) => sum + r.points, 0);
      const updatedPkg: QuizPackage = {
        ...pkg,
        status: 'completed',
        score: totalScore,
        results: newResults,
        playedAt: new Date().toLocaleString('vi-VN'),
      };
      setStagePhase('summary');
      onCompletePackage(updatedPkg);
      if (totalScore >= 15) {
        launchConfetti();
      }
    }
  };

  // Keyboard controls
  useStageKeyboard({
    onSpace: () => {
      if (stagePhase === 'intro') {
        handleStartPackage();
      } else if (stagePhase === 'question') {
        if (isTimerRunning) {
          pauseTimer();
        } else if (!isTimeOut && timeLeft > 0) {
          startTimer();
        }
      }
    },
    onEnter: () => {
      if (stagePhase === 'question') {
        if (!isAnswerRevealed) {
          handleRevealAnswer();
        } else if (questionVerdict !== null) {
          handleNextQuestion();
        }
      }
    },
    onNext: () => {
      if (stagePhase === 'question' && (isAnswerRevealed || questionVerdict !== null)) {
        handleNextQuestion();
      }
    },
    onResetTimer: () => {
      if (stagePhase === 'question') {
        resetCurrentTimer();
      }
    },
    onToggleFullscreen,
  });

  // Calculate current progress
  const currentQuestionNumber = currentQuestionIndex + 1;
  const currentTotalScore = questionResults.reduce((acc, r) => acc + r.points, 0);

  // ==========================================
  // PHASE 1: INTRO SPLASH SCREEN
  // ==========================================
  if (stagePhase === 'intro') {
    return (
      <div className="relative min-h-[calc(100vh-68px)] flex flex-col justify-between items-center p-6 md:p-12 text-center bg-slate-950 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="relative z-10 w-full flex justify-between items-center max-w-5xl">
          <button
            onClick={onBackToPackageList}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách gói</span>
          </button>
          <div className="text-cyan-400 text-sm font-bold tracking-widest uppercase">
            PHẦN THI: HIỂU BIẾT SỐ
          </div>
        </div>

        {/* Grand Title */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-block px-5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-black tracking-widest text-sm uppercase mb-4 shadow-lg shadow-cyan-950/40">
            {pkg.isAudience || pkg.number === 11 ? 'GIAO LƯU KHÁN GIẢ & CỔ ĐỘNG VIÊN' : 'MÀN HÌNH SÂN KHẤU'}
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
            {pkg.title}
          </h1>
          <p className="mt-4 text-slate-300 text-lg md:text-2xl font-medium">
            {pkg.isAudience || pkg.number === 11
              ? `Gồm ${totalQuestions} câu hỏi trắc nghiệm • 10 giây suy nghĩ/câu • Khán giả trả lời đúng nhận quà từ BTC!`
              : 'Gồm 04 câu hỏi trắc nghiệm • 10 giây/câu • Thí sinh giơ bảng trả lời trực tiếp'}
          </p>

          <div className="mt-10 flex items-center justify-center">
            <button
              id="start-pkg-btn"
              onClick={handleStartPackage}
              className="px-12 py-5 rounded-3xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-2xl md:text-3xl font-black tracking-wider uppercase shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-4 hover:scale-105"
            >
              <Play className="w-8 h-8 fill-current" />
              <span>BẮT ĐẦU</span>
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-400">Có thể bấm phím [Space] trên bàn phím để bắt đầu</p>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          Ủy ban nhân dân và Ủy ban MTTQ Việt Nam xã Tam Hải
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 3: SUMMARY FINISH SCREEN
  // ==========================================
  if (stagePhase === 'summary') {
    const finalScore = questionResults.reduce((acc, r) => acc + r.points, 0);

    return (
      <div className="relative min-h-[calc(100vh-68px)] flex flex-col justify-between items-center p-6 md:p-12 text-center bg-slate-950">
        <div className="relative z-10 w-full max-w-4xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4">
            {pkg.isAudience || pkg.number === 11 ? 'GIAO LƯU KHÁN GIẢ HOÀN THÀNH' : 'KẾT THÚC PHẦN THI'}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            HOÀN THÀNH {pkg.title}
          </h1>

          <div className="my-8 p-8 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-2xl max-w-xl mx-auto">
            {pkg.isAudience || pkg.number === 11 ? (
              <>
                <div className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2">
                  KẾT QUẢ GIAO LƯU KHÁN GIẢ
                </div>
                <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 drop-shadow-xl">
                  {questionResults.filter((r) => r.isCorrect).length}{' '}
                  <span className="text-3xl md:text-4xl text-slate-400 font-bold">/ {totalQuestions}</span>
                </div>
                <div className="text-sm text-cyan-300 font-semibold mt-2">
                  {questionResults.filter((r) => r.isCorrect).length} khán giả xuất sắc nhận quà từ Ban Tổ chức
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                  TỔNG ĐIỂM ĐẠT ĐƯỢC
                </div>
                <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-xl">
                  {finalScore} <span className="text-3xl md:text-4xl text-slate-400 font-bold">/ 20</span>
                </div>
                <div className="text-sm text-cyan-300 font-semibold mt-2">
                  Đạt {finalScore / 5} / 4 câu trả lời đúng
                </div>
              </>
            )}
          </div>

          {/* Breakdown of each question */}
          <div
            className={`max-w-4xl mx-auto grid gap-2.5 my-6 ${
              totalQuestions > 4
                ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-7'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {pkg.questions.map((q, idx) => {
              const res = questionResults.find((r) => r.questionId === q.id);
              const isWin = res?.isCorrect ?? false;
              return (
                <div
                  key={q.id}
                  className={`p-2.5 rounded-2xl border text-center ${
                    isWin
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase">Câu {idx + 1}</div>
                  <div className="text-sm font-black mt-0.5">
                    {isWin ? (pkg.isAudience ? 'Nhận quà' : '+5 điểm') : (pkg.isAudience ? 'Chưa đúng' : '0 điểm')}
                  </div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Đáp án: {q.correctAnswer}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              id="back-to-pkgs-btn"
              onClick={onBackToPackageList}
              className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xl font-black tracking-wide shadow-xl shadow-cyan-950/50 transition-transform active:scale-95 flex items-center gap-3"
            >
              <span>QUAY VỀ DANH SÁCH GÓI</span>
              <ArrowRight className="w-6 h-6 text-slate-950 font-bold" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 2: STAGE QUESTION SCREEN (16:9 OPTIMIZED)
  // ==========================================
  const options = [
    { key: 'A', text: currentQ.optionA },
    { key: 'B', text: currentQ.optionB },
    { key: 'C', text: currentQ.optionC },
    { key: 'D', text: currentQ.optionD },
  ];

  return (
    <div className="relative min-h-[calc(100vh-68px)] flex flex-col justify-between p-6 md:p-8 lg:p-12 bg-slate-950 select-none overflow-hidden">
      {/* Top Header Information for Stage */}
      <div className="relative z-10 w-full flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-black uppercase">
            {pkg.title}
          </div>
          <div className="text-lg md:text-xl font-extrabold text-white">
            CÂU HỎI {currentQuestionNumber} / {totalQuestions}
          </div>
        </div>

        {/* Giant Accurate Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            onClick={!isTimerRunning && !isTimeOut && timeLeft > 0 ? startTimer : isTimerRunning ? pauseTimer : undefined}
            className={`flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-2xl border-2 shadow-xl transition-all cursor-pointer select-none ${
              timeLeft === 0
                ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse shadow-rose-950/60'
                : timeLeft <= 3
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 animate-bounce shadow-amber-950/60'
                : !isTimerRunning
                ? 'bg-slate-900 border-emerald-500/50 text-emerald-300 hover:border-emerald-400 shadow-emerald-950/40'
                : 'bg-slate-900 border-cyan-500/50 text-cyan-300 shadow-cyan-950/40'
            }`}
            title={
              !isTimerRunning && !isTimeOut && timeLeft > 0
                ? 'Bấm để bắt đầu đếm 10 giây (hoặc bấm phím Space)'
                : isTimerRunning
                ? 'Bấm để tạm dừng đếm giờ (hoặc bấm phím Space)'
                : 'Đã hết thời gian'
            }
          >
            <Clock className={`w-6 h-6 md:w-8 md:h-8 ${isTimerRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <div className="text-3xl md:text-5xl font-black font-mono tracking-tight leading-none">
              {timeLeft.toString().padStart(2, '0')}s
            </div>
          </div>

          {/* Quick Timer Controls */}
          <div className="flex items-center gap-2">
            {isTimerRunning ? (
              <button
                onClick={pauseTimer}
                className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-lg transition active:scale-95"
                title="Tạm dừng đếm giờ (Phím Space)"
              >
                <Pause className="w-4 h-4" />
                <span>Tạm dừng</span>
              </button>
            ) : !isTimeOut && timeLeft === TIME_LIMIT ? (
              <button
                onClick={startTimer}
                className="px-3.5 md:px-4 py-2 md:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 border border-emerald-300 transition active:scale-95 animate-pulse"
                title="Bắt đầu đếm ngược 10 giây (Phím Space)"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>BẮT ĐẦU TÍNH GIỜ (Space)</span>
              </button>
            ) : !isTimeOut && timeLeft > 0 ? (
              <button
                onClick={startTimer}
                className="px-3.5 md:px-4 py-2 md:py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 transition active:scale-95"
                title="Tiếp tục đếm giờ (Phím Space)"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Tiếp tục ({timeLeft}s)</span>
              </button>
            ) : null}

            <button
              onClick={resetCurrentTimer}
              className="p-2 md:p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-slate-500 transition"
              title="Đặt lại 10 giây (Phím R)"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Display - Large font, High contrast */}
      <div className="relative z-10 max-w-full w-full mx-auto my-auto py-3 md:py-6">
        {/* Status banner when time out */}
        {isTimeOut && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-600/90 text-white font-black text-sm uppercase tracking-wider mb-4 animate-bounce">
            HẾT THỜI GIAN TRẢ LỜI - THÍ SINH GIƠ BẢNG
          </div>
        )}

        <div className="p-6 md:p-8 lg:p-12 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/30 shadow-2xl mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-snug">
            {currentQ.question}
          </h2>
          {currentQ.imageUrl && (
            <div className="mt-4 max-h-48 rounded-xl overflow-hidden flex justify-center">
              <img
                src={currentQ.imageUrl}
                alt="Minh họa câu hỏi"
                className="object-contain max-h-48 rounded-xl border border-slate-700"
              />
            </div>
          )}
        </div>

        {/* 4 Options Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {options.map((opt) => {
            const isThisCorrect = opt.key === currentQ.correctAnswer;
            const isRevealed = isAnswerRevealed;

            let cardStyle = 'bg-slate-900/90 border-slate-700/80 text-slate-100 hover:border-slate-500';

            if (isRevealed) {
              if (isThisCorrect) {
                cardStyle = 'bg-emerald-950 border-2 border-emerald-400 text-emerald-100 shadow-2xl shadow-emerald-900/50 scale-[1.02] ring-2 ring-emerald-500/50';
              } else {
                cardStyle = 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <div
                key={opt.key}
                className={`p-4 md:p-6 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${cardStyle}`}
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl flex-shrink-0 shadow-md ${
                    isRevealed && isThisCorrect
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 border border-slate-600 text-cyan-300'
                  }`}
                >
                  {opt.key}
                </div>
                <div className="text-base sm:text-lg md:text-xl font-bold leading-relaxed pt-1.5">
                  {opt.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Verdict Display Banner */}
      {isAnswerRevealed && (
        <div className="relative z-10 max-w-5xl mx-auto w-full my-2 text-center">
          <div
            className={`p-3 md:p-4 rounded-2xl border flex items-center justify-center gap-4 text-lg md:text-2xl font-black ${
              questionVerdict === 'correct'
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-xl'
                : questionVerdict === 'wrong'
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-xl'
                : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
            }`}
          >
            <span>ĐÁP ÁN ĐÚNG: {currentQ.correctAnswer}</span>
            {questionVerdict === 'correct' && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-base md:text-lg">
                +05 ĐIỂM
              </span>
            )}
            {questionVerdict === 'wrong' && (
              <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-base md:text-lg">
                +00 ĐIỂM
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Stage Control Bar for Program Operator */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Reveal Button */}
        <div className="flex items-center gap-2">
          <button
            id="reveal-answer-btn"
            onClick={handleRevealAnswer}
            disabled={isAnswerRevealed}
            className={`px-5 py-3 rounded-2xl font-black text-sm md:text-base flex items-center gap-2 transition shadow-lg ${
              isAnswerRevealed
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300 active:scale-95'
            }`}
            title="Hiện đáp án đúng (Phím Enter)"
          >
            <Eye className="w-5 h-5" />
            <span>HIỆN ĐÁP ÁN</span>
          </button>
        </div>

        {/* Center: Offline Verdict Buttons (ĐÚNG / SAI) */}
        <div className="flex items-center gap-3">
          <button
            id="verdict-correct-btn"
            onClick={handleMarkCorrect}
            className={`px-6 py-3 rounded-2xl font-black text-base md:text-lg flex items-center gap-2 border-2 transition active:scale-95 shadow-xl ${
              questionVerdict === 'correct'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-105 shadow-emerald-950/60'
                : 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-500 text-emerald-300'
            }`}
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>ĐÚNG (+5Đ)</span>
          </button>

          <button
            id="verdict-wrong-btn"
            onClick={handleMarkWrong}
            className={`px-6 py-3 rounded-2xl font-black text-base md:text-lg flex items-center gap-2 border-2 transition active:scale-95 shadow-xl ${
              questionVerdict === 'wrong'
                ? 'bg-rose-600 text-white border-rose-400 scale-105 shadow-rose-950/60'
                : 'bg-rose-950/70 hover:bg-rose-900 border-rose-500 text-rose-300'
            }`}
          >
            <XIcon className="w-6 h-6 stroke-[3]" />
            <span>SAI (0Đ)</span>
          </button>
        </div>

        {/* Right: Next Question Button */}
        <div className="flex items-center gap-3">
          <button
            id="next-question-btn"
            onClick={handleNextQuestion}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base md:text-lg flex items-center gap-2 shadow-xl shadow-blue-950/50 transition active:scale-95"
            title="Chuyển sang câu hỏi kế tiếp (Phím →)"
          >
            <span>
              {currentQuestionIndex < totalQuestions - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}
            </span>
            <ArrowRight className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
};
