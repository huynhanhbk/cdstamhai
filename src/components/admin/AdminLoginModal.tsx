import React, { useState } from 'react';
import { Shield, Lock, User, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../firebase/config';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. If Firebase Auth is configured and credentials look like email, try Firebase Auth
      if (isFirebaseConfigured && auth && username.includes('@')) {
        try {
          await signInWithEmailAndPassword(auth, username, password);
          setIsLoading(false);
          onLoginSuccess();
          return;
        } catch (firebaseErr: unknown) {
          console.warn('Firebase login attempt:', firebaseErr);
        }
      }

      // 2. Local Operator Authentication (Default Offline Demo & Event Operator)
      // Allows immediate secure offline operation in the hall without requiring internet access
      const isDefaultMatch =
        (username.trim().toLowerCase() === 'admin' &&
          (password.trim() === 'Tamhai@2026' || password.trim() === 'tamhai@2026')) ||
        (username.trim() === 'banbientap' && password.trim() === 'tamhai123');

      // Check stored custom admin password if any
      const storedCustomPass = localStorage.getItem('tamhai_admin_custom_password');
      const isCustomMatch = storedCustomPass && password.trim() === storedCustomPass;

      if (isDefaultMatch || isCustomMatch) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
      }
    } catch {
      setIsLoading(false);
      setError('Đã xảy ra lỗi khi xác thực.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/40 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-950/20 dark:shadow-cyan-950/60 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Đăng Nhập Quản Trị</h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bảng điều khiển Ban Tổ chức & Kỹ thuật viên
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tên đăng nhập / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500/70" />
          <span>Hệ thống bảo mật điều hành Hội thi UBND & UBMTTQ xã Tam Hải</span>
        </div>
      </div>
    </div>
  );
};
