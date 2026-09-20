import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  confirmLabel = 'Xác nhận',
  cancelText,
  cancelLabel = 'Hủy bỏ',
  isDanger,
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const resolvedConfirmLabel = confirmText || confirmLabel;
  const resolvedCancelLabel = cancelText || cancelLabel;
  const resolvedIsDangerous = isDanger !== undefined ? isDanger : isDangerous;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="confirm-modal-dialog"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl flex-shrink-0 ${
              resolvedIsDangerous ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-300 leading-relaxed text-base">{message}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            id="modal-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-600 bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition"
          >
            {resolvedCancelLabel}
          </button>
          <button
            id="modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transition ${
              resolvedIsDangerous
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'
            }`}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
