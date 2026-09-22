import React, { useEffect } from 'react';
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

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  // Automatically dismiss after 3 seconds (3000ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
        toast.type === 'success'
          ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/60'
          : toast.type === 'error'
          ? 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-950/60'
          : toast.type === 'warning'
          ? 'bg-amber-950/95 border-amber-500/60 text-amber-100 shadow-amber-950/60'
          : 'bg-slate-900/95 border-cyan-500/60 text-cyan-100 shadow-cyan-950/60'
      }`}
    >
      <div className="flex items-center gap-3 pr-2">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
        {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
        <span className="text-sm font-semibold leading-snug">{toast.text}</span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-3 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition flex-shrink-0"
        title="Tắt thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 3s countdown progress bar line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className={`h-full transition-all duration-3000 ease-linear ${
            toast.type === 'success'
              ? 'bg-emerald-400/80'
              : toast.type === 'error'
              ? 'bg-rose-400/80'
              : toast.type === 'warning'
              ? 'bg-amber-400/80'
              : 'bg-cyan-400/80'
          }`}
          style={{
            animation: 'shrinkWidth 3s linear forwards',
          }}
        />
      </div>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ toasts, onClose, onDismiss }) => {
  const dismiss = onClose || onDismiss || (() => {});
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
};

export const ToastContainer = Toast;
