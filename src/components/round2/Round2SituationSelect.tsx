import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Dices, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Situation } from '../../types/competition';
import { RandomDrawModal, DrawItem } from '../common/RandomDrawModal';

interface Round2SituationSelectProps {
  situations: Situation[];
  onSelectSituation: (situation: Situation) => void;
  onBackToHome: () => void;
  onResetRound2: () => void;
  soundEnabled?: boolean;
}

export const Round2SituationSelect: React.FC<Round2SituationSelectProps> = ({
  situations,
  onSelectSituation,
  onBackToHome,
  onResetRound2,
  soundEnabled = true,
}) => {
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  const drawItems: DrawItem[] = situations.map((sit) => ({
    id: sit.id,
    number: sit.number,
    title: sit.title,
    status: sit.status,
    score: sit.finalScore,
  }));

  const handleConfirmDraw = (item: DrawItem) => {
    setIsDrawModalOpen(false);
    const targetSit = situations.find((s) => s.id === item.id);
    if (targetSit) {
      onSelectSituation(targetSit);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-68px)] p-6 md:p-8 lg:p-12 flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-full mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm transition"
            title="Quay về Trang chủ"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="text-xs md:text-sm font-black tracking-widest text-indigo-700 dark:text-indigo-400 uppercase">
              PHẦN THI: XỬ LÝ TÌNH HUỐNG
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              BỐC THĂM CHỌN TÌNH HUỐNG
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Random Draw Button */}
          <button
            id="round2-random-draw-btn"
            onClick={() => setIsDrawModalOpen(true)}
            className="px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-950/20 dark:shadow-indigo-950/60 hover:scale-105 active:scale-95 transition"
            title="Mở bảng bốc thăm ngẫu nhiên tình huống trực tiếp trên sân khấu"
          >
            <Dices className="w-4 h-4 md:w-5 md:h-5 animate-pulse text-amber-300" />
            <span>Bốc Thăm Ngẫu Nhiên</span>
          </button>

          <button
            onClick={onResetRound2}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-400 dark:hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs md:text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            title="Reset trạng thái 14 tình huống"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Phần thi</span>
          </button>
        </div>
      </div>

      {/* Strict Stage Selection: ONLY DISPLAY "TÌNH HUỐNG SỐ 1" ... "TÌNH HUỐNG SỐ 14" */}
      <div className="relative z-10 max-w-full mx-auto w-full my-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {situations.map((sit) => {
            const isCompleted = sit.status === 'completed';
            const isPlaying = sit.status === 'playing';

            return (
              <button
                key={sit.id}
                id={`situation-card-${sit.number}`}
                onClick={() => onSelectSituation(sit)}
                className={`relative group rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-50/80 dark:bg-slate-900/60 border-emerald-400 dark:border-emerald-500/40 opacity-90 hover:opacity-100 hover:border-emerald-500 shadow-md'
                    : isPlaying
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/20'
                    : 'bg-white dark:bg-slate-900/90 border-indigo-400/70 dark:border-indigo-500/40 hover:border-indigo-500 dark:hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:bg-slate-850 shadow-md dark:shadow-xl shadow-indigo-950/10 dark:shadow-indigo-950/30 hover:scale-105'
                }`}
              >
                {/* Number Badge */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black mb-3 shadow-inner transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                      : isPlaying
                      ? 'bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500/50 text-amber-800 dark:text-amber-300'
                      : 'bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-500/60 text-indigo-800 dark:text-indigo-300'
                  }`}
                >
                  {sit.number}
                </div>

                {/* Sole Title Required: "TÌNH HUỐNG SỐ X" */}
                <div className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  {sit.title}
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  {isCompleted ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ĐÃ THI ({sit.finalScore ?? 0}/30đ)</span>
                    </div>
                  ) : isPlaying ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <Play className="w-3.5 h-3.5" />
                      <span>ĐANG THI</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Sparkles className="w-3 h-3" />
                      <span>CHƯA THI</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Note */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs md:text-sm text-slate-600 dark:text-slate-400 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
        Màn hình chỉ hiển thị số thứ tự tình huống nhằm phục vụ đại diện các đội bốc thăm ngẫu nhiên trên sân khấu. Bạn có thể nhấn trực tiếp vào ô tình huống hoặc sử dụng nút <strong className="text-indigo-700 dark:text-indigo-300">Bốc Thăm Ngẫu Nhiên</strong>.
      </div>

      {/* Random Draw Modal for Round 2 */}
      <RandomDrawModal
        isOpen={isDrawModalOpen}
        title="BỐC THĂM TÌNH HUỐNG"
        subtitle="Phần thi: Xử lý tình huống"
        items={drawItems}
        themeColor="indigo"
        soundEnabled={soundEnabled}
        onConfirmSelection={handleConfirmDraw}
        onClose={() => setIsDrawModalOpen(false)}
      />
    </div>
  );
};
