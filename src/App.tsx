import React, { useState, useEffect, useCallback } from 'react';
import { AppSettings, CompetitionView, QuizPackage, Situation, SyncStatus, Team } from './types/competition';
import { StorageService } from './services/storageService';
import { Navbar } from './components/common/Navbar';
import { Toast, ToastMessage } from './components/common/Toast';
import { ConfirmModal } from './components/common/ConfirmModal';
import { KeyboardHelpModal } from './components/common/KeyboardHelpModal';
import { HomeView } from './components/home/HomeView';
import { Round1RulesModal } from './components/round1/Round1RulesModal';
import { Round2RulesModal } from './components/round2/Round2RulesModal';
import { Round1PackageSelect } from './components/round1/Round1PackageSelect';
import { Round1StageScreen } from './components/round1/Round1StageScreen';
import { Round2SituationSelect } from './components/round2/Round2SituationSelect';
import { Round2StageScreen } from './components/round2/Round2StageScreen';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useStageKeyboard } from './hooks/useStageKeyboard';

export default function App() {
  // Current Active View
  const [currentView, setCurrentView] = useState<CompetitionView>('home');

  // Core Data
  const [packages, setPackages] = useState<QuizPackage[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(StorageService.getSyncStatus());

  // Selected entities for stage mode
  const [activePackage, setActivePackage] = useState<QuizPackage | null>(null);
  const [activeSituation, setActiveSituation] = useState<Situation | null>(null);

  // App UI & Utility States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isRound1RulesOpen, setIsRound1RulesOpen] = useState(false);
  const [isRound2RulesOpen, setIsRound2RulesOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);

  // Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Helper to add toast
  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', text: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      text,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize data on mount and subscribe to cloud changes
  useEffect(() => {
    // 1. Load data from StorageService (Offline Cache first)
    const initialPkgs = StorageService.getPackages();
    const initialSits = StorageService.getSituations();
    const initialTms = StorageService.getTeams();
    const initialStg = StorageService.getSettings();

    setPackages(initialPkgs);
    setSituations(initialSits);
    setTeams(initialTms);
    setSettings(initialStg);

    // 2. Subscribe to storage sync status
    const unsubscribeSync = StorageService.subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });

    // 3. Attempt cloud initialization & synchronization
    StorageService.initCloudSync((remotePkgs, remoteSits, remoteTeams) => {
      if (remotePkgs) setPackages(remotePkgs);
      if (remoteSits) setSituations(remoteSits);
      if (remoteTeams) setTeams(remoteTeams);
      addToast('success', 'Đã cập nhật dữ liệu mới nhất từ Cloud Firestore');
    });

    return () => {
      unsubscribeSync();
    };
  }, [addToast]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      addToast('info', 'Đã kích hoạt chế độ Toàn màn hình sân khấu');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [addToast]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Global Keyboard Shortcuts
  useStageKeyboard({
    onToggleFullscreen: handleToggleFullscreen,
    onBack: () => {
      if (currentView === 'round1_stage') setCurrentView('round1_select');
      else if (currentView === 'round2_stage') setCurrentView('round2_select');
      else if (currentView === 'round1_select' || currentView === 'round2_select' || currentView === 'admin') {
        setCurrentView('home');
      }
    },
    onToggleSound: () => {
      setSoundEnabled((prev) => {
        const next = !prev;
        addToast('info', next ? 'Đã bật âm thanh hội thi' : 'Đã tắt âm thanh');
        return next;
      });
    },
    onShowHelp: () => setIsKeyboardHelpOpen(true),
  });

  // Package Selection in Round 1
  const handleSelectPackage = (pkg: QuizPackage) => {
    if (pkg.status === 'completed') {
      setConfirmModalConfig({
        isOpen: true,
        title: `MỞ LẠI ${pkg.title}`,
        message: `Gói này đã hoàn thành với điểm số ${pkg.score ?? 0}/20 điểm. Bạn có muốn mở lại gói này để trình chiếu lại không?`,
        confirmText: 'Mở Lại Gói',
        onConfirm: () => {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          setActivePackage(pkg);
          setCurrentView('round1_stage');
        },
      });
    } else {
      setActivePackage(pkg);
      setCurrentView('round1_stage');
    }
  };

  // Complete Package in Round 1
  const handleCompletePackage = (updatedPkg: QuizPackage) => {
    const newPkgs = packages.map((p) => (p.id === updatedPkg.id ? updatedPkg : p));
    setPackages(newPkgs);
    StorageService.savePackages(newPkgs, true);
    addToast('success', `Đã lưu kết quả ${updatedPkg.title}: ${updatedPkg.score ?? 0}/20 điểm`);
  };

  // Situation Selection in Round 2
  const handleSelectSituation = (situation: Situation) => {
    if (situation.status === 'completed') {
      setConfirmModalConfig({
        isOpen: true,
        title: `MỞ LẠI ${situation.title}`,
        message: `Tình huống này đã hoàn thành với kết quả ${situation.finalScore ?? 0}/30 điểm. Bạn có muốn mở lại để trình chiếu không?`,
        confirmText: 'Mở Lại',
        onConfirm: () => {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          setActiveSituation(situation);
          setCurrentView('round2_stage');
        },
      });
    } else {
      setActiveSituation(situation);
      setCurrentView('round2_stage');
    }
  };

  // Complete Situation in Round 2
  const handleCompleteSituation = (updatedSit: Situation) => {
    const newSits = situations.map((s) => (s.id === updatedSit.id ? updatedSit : s));
    setSituations(newSits);
    StorageService.saveSituations(newSits, true);
    addToast('success', `Đã lưu kết quả ${updatedSit.title}: ${updatedSit.finalScore ?? 0}/30 điểm`);
  };

  // Safe Reset Functions
  const handleResetRound1 = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'XÁC NHẬN RESET PHẦN THI 1',
      message: 'Toàn bộ 10 gói câu hỏi sẽ được đưa về trạng thái CHƯA THI (0 điểm). Dữ liệu câu hỏi vẫn được giữ nguyên. Bạn có chắc chắn?',
      confirmText: 'Đồng Ý Reset Phần 1',
      isDanger: true,
      onConfirm: () => {
        const resetPkgs = StorageService.resetRound1();
        setPackages(resetPkgs);
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        addToast('success', 'Đã reset toàn bộ 10 gói câu hỏi về trạng thái ban đầu');
      },
    });
  };

  const handleResetRound2 = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'XÁC NHẬN RESET PHẦN THI 2',
      message: 'Toàn bộ 14 tình huống sẽ được đưa về trạng thái CHƯA THI. Bạn có chắc chắn?',
      confirmText: 'Đồng Ý Reset Phần 2',
      isDanger: true,
      onConfirm: () => {
        const resetSits = StorageService.resetRound2();
        setSituations(resetSits);
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        addToast('success', 'Đã reset toàn bộ 14 tình huống về trạng thái ban đầu');
      },
    });
  };

  const handleResetAll = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'XÁC NHẬN RESET TOÀN BỘ HỘI THI',
      message: 'CẢNH BÁO: Toàn bộ kết quả điểm số của Phần thi 1 và Phần thi 2 sẽ được làm mới về ban đầu. Thao tác này phù hợp trước giờ khai mạc chính thức!',
      confirmText: 'Xác Nhận Reset Toàn Bộ',
      isDanger: true,
      onConfirm: () => {
        StorageService.resetAllCompetition();
        setPackages(StorageService.getPackages());
        setSituations(StorageService.getSituations());
        setTeams(StorageService.getTeams());
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        addToast('success', 'Đã làm mới toàn bộ hội thi sẵn sàng cho chương trình!');
      },
    });
  };

  // Manual Cloud Sync
  const handleManualSync = () => {
    addToast('info', 'Đang đồng bộ dữ liệu lên Cloud Firestore...');
    StorageService.syncAllToCloud(packages, situations, teams, settings).then((res) => {
      if (res.success) {
        addToast('success', 'Đồng bộ dữ liệu thành công!');
      } else {
        addToast('warning', res.error || 'Đang hoạt động trên Local Storage');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Universal Stage Top Navigation Bar */}
      <Navbar
        settings={settings}
        currentView={currentView}
        syncStatus={syncStatus}
        soundEnabled={soundEnabled}
        isFullscreen={isFullscreen}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateRound1={() => setCurrentView('round1_select')}
        onNavigateRound2={() => setCurrentView('round2_select')}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            settings={settings}
            packages={packages}
            situations={situations}
            onSelectRound1={() => setCurrentView('round1_select')}
            onSelectRound2={() => setCurrentView('round2_select')}
            onOpenRules1={() => setIsRound1RulesOpen(true)}
            onOpenRules2={() => setIsRound2RulesOpen(true)}
            onOpenAdmin={() => setIsAdminLoginOpen(true)}
          />
        )}

        {currentView === 'round1_select' && (
          <Round1PackageSelect
            packages={packages}
            soundEnabled={soundEnabled}
            onSelectPackage={handleSelectPackage}
            onBackToHome={() => setCurrentView('home')}
            onResetRound1={handleResetRound1}
          />
        )}

        {currentView === 'round1_stage' && activePackage && (
          <Round1StageScreen
            pkg={activePackage}
            soundEnabled={soundEnabled}
            onCompletePackage={handleCompletePackage}
            onBackToPackageList={() => setCurrentView('round1_select')}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentView === 'round2_select' && (
          <Round2SituationSelect
            situations={situations}
            soundEnabled={soundEnabled}
            onSelectSituation={handleSelectSituation}
            onBackToHome={() => setCurrentView('home')}
            onResetRound2={handleResetRound2}
          />
        )}

        {currentView === 'round2_stage' && activeSituation && (
          <Round2StageScreen
            situation={activeSituation}
            soundEnabled={soundEnabled}
            onCompleteSituation={handleCompleteSituation}
            onBackToSituationList={() => setCurrentView('round2_select')}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            packages={packages}
            situations={situations}
            teams={teams}
            settings={settings}
            syncStatus={syncStatus}
            onUpdatePackages={(pkgs) => setPackages(pkgs)}
            onUpdateSituations={(sits) => setSituations(sits)}
            onUpdateTeams={(tms) => setTeams(tms)}
            onUpdateSettings={(stg) => setSettings(stg)}
            onResetRound1={handleResetRound1}
            onResetRound2={handleResetRound2}
            onResetAll={handleResetAll}
            onClose={() => setCurrentView('home')}
            onManualSync={handleManualSync}
          />
        )}
      </main>

      {/* Global Modals */}
      <Round1RulesModal
        isOpen={isRound1RulesOpen}
        onClose={() => setIsRound1RulesOpen(false)}
      />

      <Round2RulesModal
        isOpen={isRound2RulesOpen}
        onClose={() => setIsRound2RulesOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
          addToast('success', 'Đăng nhập trang quản trị thành công');
        }}
      />

      <KeyboardHelpModal
        isOpen={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        isDanger={confirmModalConfig.isDanger}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}
