import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Dices, Play, RotateCcw, Sparkles } from 'lucide-react';
import { QuizPackage } from '../../types/competition';
import { RandomDrawModal, DrawItem } from '../common/RandomDrawModal';

interface Round1PackageSelectProps {
  packages: QuizPackage[];
  onSelectPackage: (pkg: QuizPackage) => void;
  onBackToHome: () => void;
  onResetRound1: () => void;
  soundEnabled?: boolean;
}

export const Round1PackageSelect: React.FC<Round1PackageSelectProps> = ({
  packages,
  onSelectPackage,
  onBackToHome,
  onResetRound1,
  soundEnabled = true,
}) => {
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  const drawItems: DrawItem[] = packages.map((pkg) => ({
    id: pkg.id,
    number: pkg.number,
    title: pkg.title,
    status: pkg.status,
    score: pkg.score,
  }));

  const handleConfirmDraw = (item: DrawItem) => {
    setIsDrawModalOpen(false);
    const targetPkg = packages.find((p) => p.id === item.id);
    if (targetPkg) {
      onSelectPackage(targetPkg);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-68px)] p-4 md:p-8 lg:p-10 flex flex-col justify-between bg-slate-950">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-slate-850 transition"
            title="Quay về Trang chủ"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="text-xs md:text-sm font-black tracking-widest text-cyan-400 uppercase">
              PHẦN THI 1: HIỂU BIẾT SỐ
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              CHỌN GÓI CÂU HỎI
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Random Draw Button */}
          <button
            id="round1-random-draw-btn"
            onClick={() => setIsDrawModalOpen(true)}
            className="px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition"
            title="Mở bảng bốc thăm ngẫu nhiên gói câu hỏi trên sân khấu"
          >
            <Dices className="w-4 h-4 md:w-5 md:h-5 animate-pulse text-slate-950" />
            <span>Bốc Thăm Ngẫu Nhiên</span>
          </button>

          <button
            onClick={onResetRound1}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-950/20 text-xs md:text-sm font-semibold flex items-center gap-2 transition"
            title="Reset trạng thái 10 gói câu hỏi"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Phần 1</span>
          </button>
        </div>
      </div>

      {/* Strict Stage-Optimized Grid: ONLY DISPLAY "GÓI SỐ 1", "GÓI SỐ 2", ... */}
      <div className="relative z-10 max-w-6xl mx-auto w-full my-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {packages.map((pkg) => {
            const isCompleted = pkg.status === 'completed';
            const isPlaying = pkg.status === 'playing';

            return (
              <button
                key={pkg.id}
                id={`package-card-${pkg.number}`}
                onClick={() => onSelectPackage(pkg)}
                className={`relative group rounded-3xl p-5 md:p-7 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 active:scale-95 ${
                  isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/40 opacity-85 hover:opacity-100 hover:border-emerald-400 shadow-md'
                    : isPlaying
                    ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/30'
                    : 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-300 hover:bg-slate-850 shadow-xl shadow-cyan-950/30 hover:scale-105'
                }`}
              >
                {/* Number Badge */}
                <div
                  className={`w-14 h-14 md:w-18 md:h-18 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black mb-4 shadow-inner transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                      : isPlaying
                      ? 'bg-amber-950 border border-amber-500/50 text-amber-300'
                      : 'bg-cyan-950/80 border border-cyan-500/60 text-cyan-300'
                  }`}
                >
                  {pkg.number}
                </div>

                {/* Sole Title Required: "GÓI SỐ X" */}
                <div className="text-lg md:text-xl font-black text-white uppercase tracking-wider mb-2">
                  {pkg.title}
                </div>

                {/* Status Badge */}
                <div className="mt-2">
                  {isCompleted ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ĐÃ THI ({pkg.score ?? 0}/20đ)</span>
                    </div>
                  ) : isPlaying ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-xs font-bold">
                      <Play className="w-3.5 h-3.5" />
                      <span>ĐANG THI</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
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

      {/* Stage Note Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs md:text-sm text-slate-400 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span className="text-cyan-400 font-bold">Lưu ý máy chiếu:</span> Màn hình chỉ hiển thị tên gói để đảm bảo tính khách quan và bí mật câu hỏi. Khi đội bốc/chọn gói, nhấn trực tiếp vào gói hoặc sử dụng tính năng <strong className="text-cyan-300">Bốc Thăm Ngẫu Nhiên</strong>.
      </div>

      {/* Random Draw Modal for Round 1 */}
      <RandomDrawModal
        isOpen={isDrawModalOpen}
        title="BỐC THĂM GÓI CÂU HỎI"
        subtitle="Phần thi 1: Hiểu biết số"
        items={drawItems}
        themeColor="cyan"
        soundEnabled={soundEnabled}
        onConfirmSelection={handleConfirmDraw}
        onClose={() => setIsDrawModalOpen(false)}
      />
    </div>
  );
};
