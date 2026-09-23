import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Keyboard,
  Shield,
  Home,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { AppSettings, CompetitionView, SyncStatus } from '../../types/competition';

interface NavbarProps {
  currentView: CompetitionView | string;
  settings?: AppSettings;
  soundEnabled: boolean;
  isFullscreen: boolean;
  isStageMode?: boolean;
  isAdminLoggedIn?: boolean;
  syncStatus: SyncStatus;
  theme?: 'light' | 'dark';
  onNavigateHome: () => void;
  onNavigateRound1?: () => void;
  onNavigateRound2?: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onToggleStageMode?: () => void;
  onToggleTheme?: () => void;
  onOpenAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  onLogoutAdmin?: () => void;
  onOpenKeyboardHelp: () => void;
  onManualSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  settings,
  soundEnabled,
  isFullscreen,
  isStageMode = false,
  isAdminLoggedIn = false,
  syncStatus,
  theme = 'dark',
  onNavigateHome,
  onToggleSound,
  onToggleFullscreen,
  onToggleStageMode,
  onToggleTheme,
  onOpenAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenKeyboardHelp,
  onManualSync,
}) => {
  const isPureStage =
    currentView === 'round1_stage' ||
    currentView === 'round2_stage' ||
    currentView === 'round1-stage' ||
    currentView === 'round2-stage';

  const handleAdminAction = () => {
    if (onOpenAdminLogin) {
      onOpenAdminLogin();
    } else if (onOpenAdmin) {
      onOpenAdmin();
    }
  };

  return (
    <header
      className={`relative z-40 w-full transition-colors duration-300 ${
        isPureStage
          ? 'bg-slate-100/90 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-300 dark:border-cyan-950/60 py-2 px-4'
          : 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 py-3 px-4 md:px-8'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group hover:opacity-95 transition"
            title="Trang chủ Hội thi"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Home className="w-5 h-5 text-white" />
            </div>
            {!isPureStage && (
              <div className="hidden sm:block">
                <div className="text-[11px] font-bold tracking-wider text-cyan-700 dark:text-cyan-400 uppercase">
                  {settings?.organizer || 'UBND & UBMTTQ VIỆT NAM XÃ TAM HẢI'}
                </div>
                <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white line-clamp-1">
                  {settings?.competitionName || 'HỘI THI “BAN CÔNG TÁC MẶT TRẬN VỚI CHUYỂN ĐỔI SỐ”'}
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Center / Cloud status indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={onManualSync}
            title={syncStatus.message || 'Trạng thái dữ liệu'}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              syncStatus.state === 'synced'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : syncStatus.state === 'syncing'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {syncStatus.state === 'synced' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" />
                <span>Đã kết nối Cloud</span>
              </>
            ) : syncStatus.state === 'syncing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                <span>Đang đồng bộ...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline (Cache máy)</span>
              </>
            )}
          </button>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
              }`}
              title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng (Light Mode)' : 'Chuyển sang Chế độ Tối (Dark Mode)'}
              aria-label="Chuyển chế độ Sáng / Tối"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-600 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              )}
            </button>
          )}

          {/* Sound toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition ${
              soundEnabled
                ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-500/20'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Tắt âm thanh (M)' : 'Bật âm thanh (M)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          {/* Keyboard help */}
          <button
            id="keyboard-help-btn"
            onClick={onOpenKeyboardHelp}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-400 dark:hover:border-cyan-500/40 transition"
            title="Phím tắt điều khiển (H hoặc ?)"
          >
            <Keyboard className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Stage mode toggle if available */}
          {onToggleStageMode && (
            <button
              id="stage-mode-btn"
              onClick={onToggleStageMode}
              className={`px-3 py-2 md:px-3.5 md:py-2 rounded-xl text-xs md:text-sm font-bold border flex items-center gap-1.5 transition ${
                isStageMode
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-900/40'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Bật/Tắt chế độ trình chiếu tối ưu sân khấu"
            >
              <span>Sân Khấu</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            id="fullscreen-toggle-btn"
            onClick={onToggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition"
            title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Toàn màn hình sân khấu (F)'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Maximize className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>

          {/* Admin area button */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                id="admin-dashboard-btn"
                onClick={handleAdminAction}
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold border flex items-center gap-1.5 transition ${
                  currentView === 'admin'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold shadow-lg shadow-cyan-500/20'
                    : 'bg-cyan-100 dark:bg-cyan-950/60 border-cyan-400 dark:border-cyan-600/60 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-900/80'
                }`}
              >
                <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Quản Trị</span>
              </button>
              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400 dark:hover:border-rose-500/40 transition"
                  title="Đăng xuất quản trị"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              id="admin-login-nav-btn"
              onClick={handleAdminAction}
              className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-cyan-400 dark:hover:border-cyan-500/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Quản Trị</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
