import React from 'react';
import {
  Sparkles,
  HelpCircle,
  FileQuestion,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AppSettings, QuizPackage, Situation } from '../../types/competition';

interface HomeViewProps {
  settings: AppSettings;
  packages: QuizPackage[];
  situations: Situation[];
  onSelectRound1: () => void;
  onSelectRound2: () => void;
  onOpenRules1: () => void;
  onOpenRules2: () => void;
  onOpenAdmin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  packages,
  situations,
  onSelectRound1,
  onSelectRound2,
  onOpenRules1,
  onOpenRules2,
  onOpenAdmin,
}) => {
  const round1PlayedCount = packages.filter((p) => p.status === 'completed').length;
  const round2PlayedCount = situations.filter((s) => s.status === 'completed').length;

  return (
    <div className="relative min-h-[calc(100vh-68px)] flex flex-col justify-between p-4 md:p-8 lg:p-12 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Modern Digital Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(#0284c7 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        />
      </div>

      {/* Decorative Cyber Lighting Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner - Large for Projector Screen */}
      <div className="relative z-10 max-w-5xl mx-auto text-center pt-2 md:pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs md:text-sm font-bold tracking-wider uppercase mb-4 shadow-sm dark:shadow-lg dark:shadow-cyan-950/30">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{settings.organizer}</span>
        </div>

        <div className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-widest text-amber-600 dark:text-amber-300 uppercase mb-2 drop-shadow-sm">
          HỘI THI
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight uppercase drop-shadow-sm dark:drop-shadow-2xl">
          “BAN CÔNG TÁC MẶT TRẬN <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
            VỚI CHUYỂN ĐỔI SỐ”
          </span>
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
          Phát huy vai trò tiên phong của Ban công tác Mặt trận trong tuyên truyền, hướng dẫn công dân số, xây dựng chính quyền và xã hội số
        </p>
      </div>

      {/* Two Grand Competition Portals */}
      <div className="relative z-10 max-w-full w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 my-8">
        {/* ROUND 1 CARD */}
        <div className="group relative rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border-2 border-cyan-400/60 dark:border-cyan-500/30 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300 shadow-xl dark:shadow-2xl hover:shadow-cyan-500/20 p-6 md:p-8 flex flex-col justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>
              Đã thi: {round1PlayedCount}/{packages.length} gói
            </span>
          </div>

          <div>
            <div className="inline-block px-3.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs font-black uppercase tracking-wider mb-4">
              PHẦN THI
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              HIỂU BIẾT SỐ
            </h2>
            <div className="text-lg sm:text-xl font-bold text-cyan-700 dark:text-cyan-300 mt-1 mb-4">
              “AI HIỂU BIẾT SỐ HƠN”
            </div>

            <div className="space-y-2.5 my-6 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span><strong>10 gói câu hỏi</strong> trắc nghiệm A, B, C, D (04 câu/gói)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Thời gian suy nghĩ và trả lời: <strong>10 giây/câu</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Điểm số: Đúng <strong>05 điểm</strong>, Tối đa <strong>20 điểm/gói</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Thí sinh giơ bảng trả lời trực tiếp tại sân khấu</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="start-round1-btn"
              onClick={onSelectRound1}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg tracking-wide shadow-xl shadow-cyan-950/20 dark:shadow-cyan-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95 group-hover:scale-[1.02]"
            >
              <span>VÀO PHẦN THI</span>
              <ArrowRight className="w-5 h-5 text-slate-950 font-bold" />
            </button>

            <button
              id="rules-round1-btn"
              onClick={onOpenRules1}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 font-semibold text-sm flex items-center justify-center gap-1.5 transition"
              title="Xem thể lệ chi tiết Phần thi 1"
            >
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Thể lệ</span>
            </button>
          </div>
        </div>

        {/* ROUND 2 CARD */}
        <div className="group relative rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border-2 border-indigo-400/60 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 shadow-xl dark:shadow-2xl hover:shadow-indigo-500/20 p-6 md:p-8 flex flex-col justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>
              Đã thi: {round2PlayedCount}/{situations.length} tình huống
            </span>
          </div>

          <div>
            <div className="inline-block px-3.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300 text-xs font-black uppercase tracking-wider mb-4">
              PHẦN THI
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              XỬ LÝ TÌNH HUỐNG
            </h2>
            <div className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-1 mb-4">
              “CÔNG DÂN SỐ THÔNG THÁI”
            </div>

            <div className="space-y-2.5 my-6 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span><strong>14 tình huống thực tế</strong> về chuyển đổi số tại địa phương</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Thời gian hội ý & trình bày: <strong>không quá 07 phút</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Điểm tối đa: <strong>30 điểm</strong> (tự động trừ nếu vượt thời gian)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Đại diện bốc thăm và trình bày trực tiếp trên sân khấu</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="start-round2-btn"
              onClick={onSelectRound2}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-lg tracking-wide shadow-xl shadow-indigo-950/20 dark:shadow-indigo-950/50 flex items-center justify-center gap-2 transition-transform active:scale-95 group-hover:scale-[1.02]"
            >
              <span>VÀO PHẦN THI</span>
              <ArrowRight className="w-5 h-5 font-bold" />
            </button>

            <button
              id="rules-round2-btn"
              onClick={onOpenRules2}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700 font-semibold text-sm flex items-center justify-center gap-1.5 transition"
              title="Xem thể lệ chi tiết Phần thi 2"
            >
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Thể lệ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Operator Quick Bar */}
      <div className="relative z-10 max-w-4xl mx-auto w-full pt-4 pb-2 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <button
            id="admin-home-btn"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Quản trị hệ thống & Cài đặt</span>
          </button>
        </div>

        <div className="text-right font-medium">
          <span>Đơn vị: UBND & UBMTTQ xã Tam Hải</span>
        </div>
      </div>
    </div>
  );
};
