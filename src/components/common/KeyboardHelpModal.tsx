import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Bắt đầu / Tạm dừng / Tiếp tục đếm giờ' },
    { key: 'Enter', desc: 'Xác nhận / Hiện đáp án đúng' },
    { key: 'Mũi tên phải (→)', desc: 'Chuyển sang câu hỏi / tình huống kế tiếp' },
    { key: 'Mũi tên trái (←)', desc: 'Quay lại câu hỏi trước' },
    { key: 'Phím F', desc: 'Bật / Tắt chế độ toàn màn hình sân khấu' },
    { key: 'Phím R', desc: 'Reset đồng hồ của câu hỏi hiện tại về ban đầu' },
    { key: 'Phím Esc', desc: 'Thoát toàn màn hình' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Phím Tắt Điều Hành Sân Khấu</h3>
            <p className="text-xs text-slate-400">Hỗ trợ kỹ thuật viên thao tác nhanh bằng bàn phím</p>
          </div>
        </div>

        <div className="space-y-3">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
            >
              <span className="text-sm font-medium text-slate-200">{sc.desc}</span>
              <kbd className="px-3 py-1 bg-slate-950 border border-cyan-500/40 rounded-lg text-cyan-300 font-mono text-xs font-semibold shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
