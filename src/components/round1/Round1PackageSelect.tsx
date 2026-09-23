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
    .filter((pkg) => pkg.number <= 10 && !pkg.isAudience && pkg.number !== 12)
    .sort((a, b) => a.number - b.number);

  // Audience package (Gói số 11)
  const audiencePackage = packages.find(
    (pkg) => pkg.number === 11 || pkg.isAudience || pkg.id === 'pkg-11'
  );

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
    <div className="relative min-h-[calc(100vh-68px)] p-6 md:p-8 lg:p-12 flex flex-col justify-between bg-slate-950">
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
      <div className="relative z-10 max-w-full mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
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
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-950/20 text-xs md:text-sm font-semibold flex items-center gap-2 transition"
            title="Reset trạng thái các gói câu hỏi"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Phần 1</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 10 Competitive Packages for Teams */}
      <div className="relative z-10 max-w-full mx-auto w-full my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-300">
              Gói Câu Hỏi Đội Thi (Gói 1 Đến 10)
            </span>
          </div>
          <span className="text-xs text-slate-400">Áp dụng bốc thăm ngẫu nhiên</span>
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
                    ? 'bg-slate-900/60 border-emerald-500/40 opacity-85 hover:opacity-100 hover:border-emerald-400 shadow-md'
                    : isPlaying
                    ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-900/30'
                    : 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-300 hover:bg-slate-850 shadow-xl shadow-cyan-950/30 hover:scale-105'
                }`}
              >
                {/* Number Badge */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black mb-3 shadow-inner transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                      : isPlaying
                      ? 'bg-amber-950 border border-amber-500/50 text-amber-300'
                      : 'bg-cyan-950/80 border border-cyan-500/60 text-cyan-300'
                  }`}
                >
                  {pkg.number}
                </div>

                {/* Title */}
                <div className="text-base md:text-lg font-black text-white uppercase tracking-wider mb-2">
                  {pkg.title}
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  {isCompleted ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ĐÃ THI ({pkg.score ?? 0}/20đ)</span>
                    </div>
                  ) : isPlaying ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                      <Play className="w-3 h-3" />
                      <span>ĐANG THI</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                      <Sparkles className="w-3 h-3" />
                      <span>CHƯA THI</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Special Distinct Audience Package (Gói 11: Câu hỏi dành cho khán giả) */}
        {audiencePackage && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-amber-300">
                  Phần Thi Giao Lưu Cùng Khán Giả
                </span>
              </div>
              <span className="text-[11px] text-amber-400/80 bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Không nằm trong bốc thăm đội thi
              </span>
            </div>

            <button
              onClick={() => onSelectPackage(audiencePackage)}
              className={`w-full group rounded-3xl p-5 md:p-6 text-left transition-all duration-300 border-2 active:scale-98 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                audiencePackage.status === 'completed'
                  ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-amber-500/50 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-950/50'
              }`}
            >
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-950/60 font-black text-2xl md:text-3xl shrink-0 group-hover:scale-105 transition-transform">
                  <Gift className="w-9 h-9 text-slate-950" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>GÓI SỐ 11 • GIAO LƯU KHÁN GIẢ</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                    {audiencePackage.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
                    Gồm <span className="text-amber-400 font-bold">{audiencePackage.questions.length} câu hỏi trắc nghiệm</span> về Chuyển đổi số, VNeID, Dịch vụ công, Tam Hải dành riêng cho bà con nhân dân và cổ động viên. Trả lời đúng nhận quà từ BTC!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                {audiencePackage.status === 'completed' ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ĐÃ THI GIAO LƯU</span>
                  </div>
                ) : (
                  <div className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs md:text-sm font-black flex items-center gap-2 shadow-lg shadow-amber-950/40 group-hover:scale-105 transition">
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Mở Gói Khán Giả</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Stage Note Banner */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs md:text-sm text-slate-400 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span className="text-cyan-400 font-bold">Lưu ý máy chiếu:</span> Chức năng <strong className="text-cyan-300">Bốc Thăm Ngẫu Nhiên</strong> chỉ áp dụng cho 10 gói của các đội thi (Gói 1 - 10). Gói 11 dành riêng cho tương tác khán giả.
      </div>

      {/* Random Draw Modal for Round 1: Strictly Gói 1 - 10 */}
      <RandomDrawModal
        isOpen={isDrawModalOpen}
        title="BỐC THĂM GÓI CÂU HỎI ĐỘI THI"
        subtitle="Phần thi 1: Hiểu biết số (Chỉ áp dụng Gói 1 - 10)"
        items={drawItems}
        themeColor="cyan"
        soundEnabled={soundEnabled}
        onConfirmSelection={handleConfirmDraw}
        onClose={() => setIsDrawModalOpen(false)}
      />
    </div>
  );
};
