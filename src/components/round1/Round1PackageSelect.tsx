import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Dices, Gift, HelpCircle, Play, RotateCcw, Sparkles, Users } from 'lucide-react';
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

  // Teams packages for draw: STRICTLY ONLY PACKAGES 1 to 10
  const teamPackages = packages
    .filter(
      (pkg) =>
        pkg.number <= 10 &&
        !pkg.isAudience &&
        !(pkg.title || '').toLowerCase().includes('khán giả') &&
        !(pkg.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ') &&
        (pkg.title || '').toUpperCase() !== 'GÓI SỐ 12'
    )
    .sort((a, b) => a.number - b.number);

  // Audience packages: STRICTLY ONLY 3 PACKAGES (Khán giả 1, Khán giả 2, Khán giả 3)
  const audiencePackages = packages
    .filter(
      (pkg) =>
        (pkg.id === 'pkg-11' ||
          pkg.id === 'pkg-12' ||
          pkg.id === 'pkg-13' ||
          ((pkg.isAudience || pkg.number > 10) && (pkg.title || '').toLowerCase().includes('khán giả'))) &&
        !(pkg.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ') &&
        !(pkg.title || '').toUpperCase().includes('GÓI SỐ 12') &&
        pkg.id !== 'pkg-audience'
    )
    .sort((a, b) => a.number - b.number)
    .slice(0, 3);

  const drawItems: DrawItem[] = teamPackages.map((pkg) => ({
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
    <div className="relative min-h-[calc(100vh-68px)] p-6 md:p-8 lg:p-12 flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(#0284c7 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-full mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm transition"
            title="Quay về Trang chủ"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="text-xs md:text-sm font-black tracking-widest text-cyan-700 dark:text-cyan-400 uppercase">
              PHẦN THI: HIỂU BIẾT SỐ
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              CHỌN GÓI CÂU HỎI
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Random Draw Button (Strictly for Packages 1 - 10) */}
          <button
            id="round1-random-draw-btn"
            onClick={() => setIsDrawModalOpen(true)}
            className="px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition"
            title="Bốc thăm ngẫu nhiên các gói từ 1 đến 10 cho các đội thi"
          >
            <Dices className="w-4 h-4 md:w-5 md:h-5 animate-pulse text-slate-950" />
            <span>Bốc Thăm Ngẫu Nhiên (Gói 1-10)</span>
          </button>

          <button
            onClick={onResetRound1}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-400 dark:hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs md:text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            title="Reset trạng thái các gói câu hỏi"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Phần thi</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 10 Competitive Packages for Teams */}
      <div className="relative z-10 max-w-full mx-auto w-full my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              Gói Câu Hỏi Đội Thi (Gói 1 Đến 10)
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Áp dụng bốc thăm ngẫu nhiên</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {teamPackages.map((pkg) => {
            const isCompleted = pkg.status === 'completed';
            const isPlaying = pkg.status === 'playing';

            return (
              <button
                key={pkg.id}
                id={`package-card-${pkg.number}`}
                onClick={() => onSelectPackage(pkg)}
                className={`relative group rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-50/80 dark:bg-slate-900/60 border-emerald-400 dark:border-emerald-500/40 opacity-90 hover:opacity-100 hover:border-emerald-500 shadow-md'
                    : isPlaying
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/20'
                    : 'bg-white dark:bg-slate-900/90 border-cyan-400/70 dark:border-cyan-500/40 hover:border-cyan-500 dark:hover:border-cyan-300 hover:bg-cyan-50/40 dark:hover:bg-slate-850 shadow-md dark:shadow-xl shadow-cyan-950/10 dark:shadow-cyan-950/30 hover:scale-105'
                }`}
              >
                {/* Number Badge */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black mb-3 shadow-inner transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                      : isPlaying
                      ? 'bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500/50 text-amber-800 dark:text-amber-300'
                      : 'bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/60 text-cyan-800 dark:text-cyan-300'
                  }`}
                >
                  {pkg.number}
                </div>

                {/* Title */}
                <div className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  {pkg.title}
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  {isCompleted ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ĐÃ THI ({pkg.score ?? 0}/20đ)</span>
                    </div>
                  ) : isPlaying ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                      <Play className="w-3 h-3" />
                      <span>ĐANG THI</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-[11px] font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                      <Sparkles className="w-3 h-3" />
                      <span>CHƯA THI</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Special Distinct Audience Packages (3 Gói: Khán giả 1, Khán giả 2, Khán giả 3 - Hiển thị tương tự 10 gói đội thi) */}
        {audiencePackages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  Gói Câu Hỏi Khán Giả (Khán Giả 1, Khán Giả 2, Khán Giả 3)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold">
                  3 Gói • 5 câu/gói
                </span>
              </div>
              <span className="text-[11px] text-amber-800 dark:text-amber-400/80 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 font-semibold self-start sm:self-auto">
                Tổ chức linh hoạt nhiều thời điểm • Không bốc thăm đội thi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
              {audiencePackages.map((audPkg, idx) => {
                const isCompleted = audPkg.status === 'completed';
                const isPlaying = audPkg.status === 'playing';

                return (
                  <button
                    key={audPkg.id}
                    id={`audience-package-card-${audPkg.number}`}
                    onClick={() => onSelectPackage(audPkg)}
                    className={`relative group rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 active:scale-95 ${
                      isCompleted
                        ? 'bg-emerald-50/80 dark:bg-slate-900/60 border-emerald-400 dark:border-emerald-500/40 opacity-90 hover:opacity-100 hover:border-emerald-500 shadow-md'
                        : isPlaying
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/20'
                        : 'bg-white dark:bg-slate-900/90 border-amber-400/80 dark:border-amber-500/50 hover:border-amber-500 dark:hover:border-amber-300 hover:bg-amber-50/40 dark:hover:bg-slate-850 shadow-md dark:shadow-xl shadow-amber-950/10 dark:shadow-amber-950/30 hover:scale-105'
                    }`}
                  >
                    {/* Badge */}
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-base md:text-lg font-black mb-3 shadow-inner transition-transform group-hover:scale-110 ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                          : isPlaying
                          ? 'bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500/50 text-amber-800 dark:text-amber-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      KG {idx + 1}
                    </div>

                    {/* Title */}
                    <div className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      {audPkg.title}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                      {audPkg.questions.length} câu hỏi • Giao lưu nhận quà
                    </div>

                    {/* Status Badge */}
                    <div className="mt-1">
                      {isCompleted ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ĐÃ THI</span>
                        </div>
                      ) : isPlaying ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-400 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                          <Play className="w-3 h-3" />
                          <span>ĐANG THI</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                          <Gift className="w-3 h-3" />
                          <span>GIAO LƯU NHẬN QUÀ</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stage Note Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs md:text-sm text-slate-600 dark:text-slate-400 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-cyan-700 dark:text-cyan-400 font-bold">Lưu ý máy chiếu:</span> Chức năng <strong className="text-cyan-800 dark:text-cyan-300">Bốc Thăm Ngẫu Nhiên</strong> chỉ áp dụng cho 10 gói của các đội thi (Gói 1 - 10). 3 gói khán giả dành riêng cho giao lưu cổ động viên ở các khung giờ khác nhau.
      </div>

      {/* Random Draw Modal for Round 1: Strictly Gói 1 - 10 */}
      <RandomDrawModal
        isOpen={isDrawModalOpen}
        title="BỐC THĂM GÓI CÂU HỎI ĐỘI THI"
        subtitle="Phần thi: Hiểu biết số (Chỉ áp dụng Gói 1 - 10)"
        items={drawItems}
        themeColor="cyan"
        soundEnabled={soundEnabled}
        onConfirmSelection={handleConfirmDraw}
        onClose={() => setIsDrawModalOpen(false)}
      />
    </div>
  );
};
