import React from 'react';
import { X, Clock, AlertTriangle, Award, Users } from 'lucide-react';

interface Round2RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Round2RulesModal: React.FC<Round2RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/40 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            THỂ LỆ CHÍNH THỨC
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            PHẦN THI 2: XỬ LÝ TÌNH HUỐNG
          </h2>
          <p className="text-indigo-700 dark:text-indigo-400 font-bold text-lg mt-1">“CÔNG DÂN SỐ THÔNG THÁI”</p>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-200">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Hình thức dự thi</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <li>Mỗi đội chọn <strong>03 thành viên</strong> tham gia.</li>
              <li>Đại diện đội bốc thăm <strong>01 câu hỏi tình huống</strong> do Ban Tổ chức chuẩn bị.</li>
              <li>Các đội có thời gian hội ý, chuẩn bị phương án xử lý.</li>
              <li>Cử người đại diện trình bày phương án xử lý trên sân khấu.</li>
              <li>Nếu chưa hết thời gian, thành viên khác trong đội có quyền bổ sung.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Thời gian quy định</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <li>Thời gian dành cho mỗi đội vừa suy nghĩ vừa trả lời: <strong>không quá 07 phút (07:00)</strong>.</li>
              <li>Hệ thống đếm ngược từ 07:00 về 00:00. Khi hết giờ, phát tín hiệu còi cảnh báo.</li>
              <li>Nếu đội vẫn tiếp tục trình bày, người điều hành bật tính thời gian vượt giờ.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Điểm số & Mức trừ thời gian</span>
            </h3>
            <div className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
              <p>Điểm tối đa: <strong className="text-emerald-600 dark:text-emerald-400 text-base">30 ĐIỂM</strong>.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Vượt dưới 02 phút</div>
                  <div className="text-rose-600 dark:text-rose-400 font-bold mt-1">-02 điểm</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Vượt 03 đến 05 phút</div>
                  <div className="text-rose-600 dark:text-rose-400 font-bold mt-1">-05 điểm</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Vượt trên 05 phút</div>
                  <div className="text-rose-600 dark:text-rose-400 font-bold mt-1">-10 điểm</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 italic">
                * Phần mềm tự động tính điểm trừ theo thời gian vượt thực tế, đảm bảo không có điểm âm.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition shadow-lg shadow-indigo-950/20 dark:shadow-indigo-950/50"
          >
            Đã Rõ Thể Lệ
          </button>
        </div>
      </div>
    </div>
  );
};
