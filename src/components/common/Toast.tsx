import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose, onDismiss }) => {
  const dismiss = onClose || onDismiss || (() => {});
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-600/50 text-emerald-100 shadow-emerald-950/50'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-600/50 text-rose-100 shadow-rose-950/50'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-600/50 text-amber-100 shadow-amber-950/50'
              : 'bg-slate-900/90 border-cyan-600/50 text-cyan-100 shadow-cyan-950/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
            <span className="text-sm font-medium leading-snug">{toast.text}</span>
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-3 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const ToastContainer = Toast;
