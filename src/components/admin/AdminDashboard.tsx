import React, { useState } from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  FileQuestion,
  Users,
  Settings,
  RefreshCw,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Save,
  Check,
  X,
  Eye,
  Wifi,
  WifiOff,
  Cloud,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Search,
  Trophy,
  UserPlus,
  Gift,
} from 'lucide-react';
import { AppSettings, QuizPackage, QuizQuestion, Situation, SyncStatus, Team } from '../../types/competition';
import { StorageService } from '../../services/storageService';
import {
  isFirebaseConfigured,
  getStoredFirebaseConfig,
  testFirebaseConnection,
  FirebaseConfigParams,
} from '../../firebase/config';
import { useSound } from '../../hooks/useSound';

interface AdminDashboardProps {
  packages: QuizPackage[];
  situations: Situation[];
  teams: Team[];
  settings: AppSettings;
  syncStatus: SyncStatus;
  onUpdatePackages: (pkgs: QuizPackage[]) => void;
  onUpdateSituations: (sits: Situation[]) => void;
  onUpdateTeams: (tms: Team[]) => void;
  onUpdateSettings: (stg: AppSettings) => void;
  onResetRound1: () => void;
  onResetRound2: () => void;
  onResetAll: () => void;
  onClose: () => void;
  onManualSync: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  packages,
  situations,
  teams,
  settings,
  syncStatus,
  onUpdatePackages,
  onUpdateSituations,
  onUpdateTeams,
  onUpdateSettings,
  onResetRound1,
  onResetRound2,
  onResetAll,
  onClose,
  onManualSync,
}) => {
  const [activeTab, setActiveTab] = useState<'main_packages' | 'audience_packages' | 'situations' | 'settings'>('main_packages');
  const { triggerTick, triggerUrgentTick, triggerTimeout, triggerCorrect, triggerWrong, triggerStart } = useSound(true);

  // Filter 10 main packages (strictly <= 10 and not audience)
  const teamPackages = packages
    .filter(
      (p) =>
        p.number <= 10 &&
        !p.isAudience &&
        !(p.title || '').toLowerCase().includes('khán giả') &&
        !(p.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ') &&
        (p.title || '').toUpperCase() !== 'GÓI SỐ 12'
    )
    .sort((a, b) => a.number - b.number);

  // Filter 3 audience packages (strictly Khán giả 1, Khán giả 2, Khán giả 3)
  const audiencePackages = packages
    .filter(
      (p) =>
        (p.id === 'pkg-11' ||
          p.id === 'pkg-12' ||
          p.id === 'pkg-13' ||
          ((p.isAudience || p.number >= 11) && (p.title || '').toLowerCase().includes('khán giả'))) &&
        !(p.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ') &&
        !(p.title || '').toUpperCase().includes('GÓI SỐ 12') &&
        p.id !== 'pkg-audience'
    )
    .sort((a, b) => a.number - b.number)
    .slice(0, 3);

  // Selected package for main questions (packages 1-10)
  const [selectedMainPkgId, setSelectedMainPkgId] = useState<string>(teamPackages[0]?.id || 'pkg-1');
  // Selected package for audience questions (Khán giả 1, 2, 3)
  const [selectedAudiencePkgId, setSelectedAudiencePkgId] = useState<string>(audiencePackages[0]?.id || 'pkg-11');

  const currentEditingMainPkg = teamPackages.find((p) => p.id === selectedMainPkgId) || teamPackages[0];
  const currentEditingAudiencePkg = audiencePackages.find((p) => p.id === selectedAudiencePkgId) || audiencePackages[0];

  const currentActivePkg = activeTab === 'audience_packages' ? currentEditingAudiencePkg : currentEditingMainPkg;

  // Specific package ID being edited
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Question editing modal / state
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);

  // Situation editing modal / state
  const [editingSituation, setEditingSituation] = useState<Situation | null>(null);
  const [isAddingNewSituation, setIsAddingNewSituation] = useState(false);

  // New admin password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Firebase manual config in UI state
  const initialFb = getStoredFirebaseConfig();
  const [fbSnippet, setFbSnippet] = useState('');
  const [fbApiKey, setFbApiKey] = useState(initialFb.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(initialFb.projectId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(initialFb.authDomain || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(initialFb.storageBucket || '');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(initialFb.messagingSenderId || '');
  const [fbAppId, setFbAppId] = useState(initialFb.appId || '');
  const [fbMsg, setFbMsg] = useState('');
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [fbTestResult, setFbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showFbGuide, setShowFbGuide] = useState(true);

  // Save new or edited question into current active package
  const handleSaveQuestion = (q: QuizQuestion) => {
    const targetPkgId =
      editingPkgId ||
      (activeTab === 'audience_packages' ? selectedAudiencePkgId : selectedMainPkgId) ||
      currentActivePkg?.id;
    if (!targetPkgId) return;

    const targetPkg = packages.find((p) => p.id === targetPkgId);
    if (!targetPkg) return;

    let updatedQuestions: QuizQuestion[];
    if (isAddingNewQuestion) {
      updatedQuestions = [
        ...targetPkg.questions,
        { ...q, id: `q-${Date.now()}`, order: targetPkg.questions.length + 1 },
      ];
    } else {
      updatedQuestions = targetPkg.questions.map((item) => (item.id === q.id ? q : item));
    }

    const updatedPkgs = packages.map((pkg) =>
      pkg.id === targetPkgId ? { ...pkg, questions: updatedQuestions } : pkg
    );

    onUpdatePackages(updatedPkgs);
    StorageService.savePackages(updatedPkgs, true);
    setEditingQuestion(null);
    setIsAddingNewQuestion(false);
    setEditingPkgId(null);
    setSaveSuccessNotice(`Đã lưu câu hỏi thành công vào ${targetPkg.title}! Dữ liệu đã được cập nhật an toàn.`);
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  // Delete question from package
  const handleDeleteQuestion = (qId: string, pkgId?: string) => {
    const targetPkgId =
      pkgId ||
      editingPkgId ||
      (activeTab === 'audience_packages' ? selectedAudiencePkgId : selectedMainPkgId) ||
      currentActivePkg?.id;
    if (!targetPkgId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    const targetPkg = packages.find((p) => p.id === targetPkgId);
    if (!targetPkg) return;

    const updatedQuestions = targetPkg.questions.filter((q) => q.id !== qId);
    const updatedPkgs = packages.map((pkg) =>
      pkg.id === targetPkgId ? { ...pkg, questions: updatedQuestions } : pkg
    );
    onUpdatePackages(updatedPkgs);
    StorageService.savePackages(updatedPkgs, true);
    setSaveSuccessNotice(`Đã xóa câu hỏi khỏi ${targetPkg.title}!`);
    setTimeout(() => setSaveSuccessNotice(null), 3500);
  };

  // Add new package (for main packages, max 10)
  const handleAddNewPackage = () => {
    if (teamPackages.length >= 10) {
      alert('Đã đủ 10 gói câu hỏi chính cho 10 đội thi (Gói 1 đến Gói 10).');
      return;
    }
    const nextNum = teamPackages.length + 1;
    const newPkg: QuizPackage = {
      id: `pkg-${nextNum}`,
      number: nextNum,
      title: `GÓI SỐ ${nextNum}`,
      status: 'unplayed',
      questions: [],
    };
    const updated = [...packages, newPkg];
    onUpdatePackages(updated);
    StorageService.savePackages(updated, true);
    setSelectedMainPkgId(newPkg.id);
  };

  // Delete package
  const handleDeletePackage = (pkgId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói câu hỏi này?')) return;
    const updated = packages.filter((p) => p.id !== pkgId);
    onUpdatePackages(updated);
    StorageService.savePackages(updated, true);
    if (activeTab === 'audience_packages') {
      setSelectedAudiencePkgId(audiencePackages.find((p) => p.id !== pkgId)?.id || '');
    } else {
      setSelectedMainPkgId(teamPackages.find((p) => p.id !== pkgId)?.id || '');
    }
  };

  // Save situation
  const handleSaveSituation = (sit: Situation) => {
    let updated: Situation[];
    if (isAddingNewSituation) {
      const nextNum = situations.length + 1;
      const newSit: Situation = {
        ...sit,
        id: `sit-${Date.now()}`,
        number: nextNum,
        title: sit.title || `TÌNH HUỐNG SỐ ${nextNum}`,
        status: 'unplayed',
      };
      updated = [...situations, newSit];
    } else {
      updated = situations.map((s) => (s.id === sit.id ? sit : s));
    }
    onUpdateSituations(updated);
    StorageService.saveSituations(updated, true);
    setEditingSituation(null);
    setIsAddingNewSituation(false);
  };

  // Delete situation
  const handleDeleteSituation = (sitId: string) => {
    if (situations.length <= 1) {
      alert('Không thể xóa hết tất cả tình huống.');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa tình huống này?')) return;
    const updated = situations.filter((s) => s.id !== sitId);
    onUpdateSituations(updated);
    StorageService.saveSituations(updated, true);
  };

  // Change custom password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    localStorage.setItem('tamhai_admin_custom_password', newPassword.trim());
    setPasswordMsg('Đã cập nhật mật khẩu quản trị thành công.');
    setNewPassword('');
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  // Automatic snippet parser for Firebase config code block
  const handleParseSnippet = (snippet: string) => {
    setFbSnippet(snippet);
    if (!snippet.trim()) return;

    const extract = (key: string) => {
      const regex = new RegExp(`${key}["']?\\s*:\\s*["']([^"']+)["']`);
      const match = snippet.match(regex);
      return match ? match[1] : '';
    };

    const parsedApiKey = extract('apiKey');
    const parsedProjectId = extract('projectId');
    const parsedAuthDomain = extract('authDomain');
    const parsedStorageBucket = extract('storageBucket');
    const parsedMessagingSenderId = extract('messagingSenderId');
    const parsedAppId = extract('appId');

    if (parsedApiKey) setFbApiKey(parsedApiKey);
    if (parsedProjectId) setFbProjectId(parsedProjectId);
    if (parsedAuthDomain) setFbAuthDomain(parsedAuthDomain);
    if (parsedStorageBucket) setFbStorageBucket(parsedStorageBucket);
    if (parsedMessagingSenderId) setFbMessagingSenderId(parsedMessagingSenderId);
    if (parsedAppId) setFbAppId(parsedAppId);

    if (parsedApiKey || parsedProjectId) {
      setFbMsg('✅ Đã tự động điền các trường cấu hình từ mã bạn vừa dán! Hãy nhấn "Lưu Cấu Hình Firebase" bên dưới.');
      setTimeout(() => setFbMsg(''), 5000);
    }
  };

  // Save custom Firebase config
  const handleSaveCustomFirebase = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fbApiKey.trim() || !fbProjectId.trim()) {
      setFbMsg('⚠️ Vui lòng nhập ít nhất API Key và Project ID.');
      return;
    }
    const cfg: FirebaseConfigParams = {
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      storageBucket: fbStorageBucket.trim() || `${fbProjectId.trim()}.appspot.com`,
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim(),
    };
    localStorage.setItem('tamhai_custom_firebase_config', JSON.stringify(cfg));
    setFbMsg('✅ Đã lưu cấu hình Firebase thành công! Vui lòng tải lại trang (F5) để kích hoạt kết nối với dự án.');
  };

  // Test Firebase connection directly
  const handleTestFirebase = async () => {
    setIsTestingFb(true);
    setFbTestResult(null);
    const cfg: FirebaseConfigParams = {
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      storageBucket: fbStorageBucket.trim() || `${fbProjectId.trim()}.appspot.com`,
      messagingSenderId: fbMessagingSenderId.trim(),
      appId: fbAppId.trim(),
    };
    const res = await testFirebaseConnection(cfg);
    setIsTestingFb(false);
    setFbTestResult(res);
  };

  // Disconnect & clear custom Firebase config
  const handleClearCustomFirebase = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cấu hình Firebase và chuyển về chế độ Offline (LocalStorage)? Dữ liệu trên trình duyệt này sẽ tiếp tục hoạt động độc lập.')) {
      localStorage.removeItem('tamhai_custom_firebase_config');
      setFbApiKey('');
      setFbProjectId('');
      setFbAuthDomain('');
      setFbStorageBucket('');
      setFbMessagingSenderId('');
      setFbAppId('');
      setFbSnippet('');
      setFbTestResult(null);
      setFbMsg('Đã xóa cấu hình Firebase. Vui lòng tải lại trang (F5) để hoàn tất.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-slate-100 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-300 dark:border-slate-800">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              HỆ THỐNG ĐIỀU HÀNH & CƠ SỞ DỮ LIỆU
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Bảng Quản Trị Hệ Thống
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onManualSync}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs md:text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Đồng bộ Cloud</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs md:text-sm font-black transition shadow-sm"
            >
              Về Hội Thi
            </button>
          </div>
        </div>

        {/* Success Notification Alert */}
        {saveSuccessNotice && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs md:text-sm font-bold shadow-sm transition-all animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
            <button
              onClick={() => setSaveSuccessNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('main_packages')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'main_packages'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Quản lý gói câu hỏi chính ({teamPackages.length} gói)</span>
          </button>

          <button
            onClick={() => setActiveTab('audience_packages')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'audience_packages'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/20 dark:shadow-amber-950/40'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>2. Quản lý gói câu hỏi cho khán giả ({audiencePackages.length} gói)</span>
          </button>

          <button
            onClick={() => setActiveTab('situations')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'situations'
                ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-950/20 dark:shadow-indigo-950/40'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>3. Quản lý tình huống ({situations.length} tình huống)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950 font-black shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài Đặt & Hệ Thống</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: MAIN PACKAGES (10 PACKAGES FOR TEAMS) */}
        {/* ============================================================ */}
        {activeTab === 'main_packages' && (
          <div className="py-6 space-y-6">
            {/* Header Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30">
              <div>
                <h3 className="text-base font-black text-cyan-900 dark:text-cyan-200 uppercase tracking-wide">
                  Quản Lý Gói Câu Hỏi Chính (10 Gói Đội Thi)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Phần thi "Hiểu biết số" • Mỗi gói gồm 04 câu hỏi trắc nghiệm (max 20đ) • Bốc thăm ngẫu nhiên cho 10 đội thi
                </p>
              </div>
              <div className="text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-cyan-300 dark:border-cyan-500/40 shadow-xs">
                Tổng: {teamPackages.length} Gói
              </div>
            </div>

            {/* Package selector bar: 10 main packages */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto max-w-4xl py-1">
                {teamPackages.map((pkg) => {
                  const hasValidCount = pkg.questions.length === 4;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedMainPkgId(pkg.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 flex-shrink-0 ${
                        currentEditingMainPkg?.id === pkg.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow font-black'
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <span>{pkg.title}</span>
                      {!hasValidCount ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title={`Hiện có ${pkg.questions.length}/4 câu hỏi`} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddNewPackage}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300 text-xs font-bold hover:bg-cyan-200 dark:hover:bg-cyan-900 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm gói mới</span>
                </button>
              </div>
            </div>

            {/* Current main package details & questions list */}
            {currentEditingMainPkg && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                      <span>{currentEditingMainPkg.title}</span>
                      {currentEditingMainPkg.questions.length === 4 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                          Đủ 04 câu hỏi
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Hiện có {currentEditingMainPkg.questions.length}/4 câu hỏi</span>
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onManualSync}
                      className="px-3.5 py-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/50 text-cyan-900 dark:text-cyan-200 text-xs font-bold hover:bg-cyan-200 dark:hover:bg-cyan-900 transition flex items-center gap-1.5 shadow-xs"
                      title="Đồng bộ tất cả câu hỏi lên Cloud Firebase"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đồng bộ Cloud</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingPkgId(currentEditingMainPkg.id);
                        setEditingQuestion({
                          id: '',
                          order: currentEditingMainPkg.questions.length + 1,
                          question: '',
                          optionA: '',
                          optionB: '',
                          optionC: '',
                          optionD: '',
                          correctAnswer: 'A',
                        });
                        setIsAddingNewQuestion(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm câu hỏi vào gói</span>
                    </button>
                    {teamPackages.length > 10 && (
                      <button
                        onClick={() => handleDeletePackage(currentEditingMainPkg.id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 dark:border-rose-500/50"
                        title="Xóa gói này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  {currentEditingMainPkg.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-relaxed">
                              {q.question}
                            </div>
                            {q.imageUrl && (
                              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Link ảnh: <span className="text-cyan-600 dark:text-cyan-400">{q.imageUrl}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingPkgId(currentEditingMainPkg.id);
                              setEditingQuestion({ ...q });
                              setIsAddingNewQuestion(false);
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300"
                            title="Sửa câu hỏi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id, currentEditingMainPkg.id)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800/60">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => {
                          const isCorrect = q.correctAnswer === key;
                          const optText = q[`option${key}` as keyof QuizQuestion];
                          return (
                            <div
                              key={key}
                              className={`p-2 rounded-xl flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent'
                              }`}
                            >
                              <span className="font-black">{key}.</span>
                              <span className="line-clamp-1">{optText as string}</span>
                              {isCorrect && (
                                <span className="ml-auto text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                                  ĐÚNG
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {currentEditingMainPkg.questions.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      Gói này chưa có câu hỏi nào. Nhấn "Thêm câu hỏi vào gói" để tạo mới.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: AUDIENCE PACKAGES (3 PACKAGES FOR AUDIENCE) */}
        {/* ============================================================ */}
        {activeTab === 'audience_packages' && (
          <div className="py-6 space-y-6">
            {/* Header Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30">
              <div>
                <h3 className="text-base font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Quản Lý Gói Câu Hỏi Cho Khán Giả (3 Gói Khán Giả)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Tách thành 3 gói nhỏ: <strong>Khán giả 1, Khán giả 2, Khán giả 3</strong> (mỗi gói đúng 5 câu hỏi) • Tổ chức giao lưu cổ động viên nhiều khung giờ
                </p>
              </div>
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-500/40 shadow-xs">
                Tổng: {audiencePackages.length} Gói • 5 câu/gói
              </div>
            </div>

            {/* Package selector bar: 3 audience packages */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto max-w-4xl py-1">
                {audiencePackages.map((pkg) => {
                  const hasValidCount = pkg.questions.length === 5;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedAudiencePkgId(pkg.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 flex-shrink-0 ${
                        currentEditingAudiencePkg?.id === pkg.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow font-black'
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{pkg.title}</span>
                      {!hasValidCount ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title={`Hiện có ${pkg.questions.length}/5 câu hỏi`} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tách từ 15 câu hỏi khán giả ban đầu
              </div>
            </div>

            {/* Current audience package details & questions list */}
            {currentEditingAudiencePkg && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={currentEditingAudiencePkg.title}
                      onChange={(e) => {
                        const updated = packages.map((p) =>
                          p.id === currentEditingAudiencePkg.id ? { ...p, title: e.target.value } : p
                        );
                        onUpdatePackages(updated);
                        StorageService.savePackages(updated, true);
                      }}
                      className="text-xl font-black bg-transparent border-b border-dashed border-amber-300 dark:border-amber-700 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white pb-1"
                      title="Nhấp để đổi tên gói câu hỏi khán giả"
                    />
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      Gói Khán Giả • {currentEditingAudiencePkg.questions.length} câu hỏi
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onManualSync}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900 transition flex items-center gap-1.5 shadow-xs"
                      title="Đồng bộ tất cả câu hỏi lên Cloud Firebase"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đồng bộ Cloud</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingPkgId(currentEditingAudiencePkg.id);
                        setEditingQuestion({
                          id: '',
                          order: currentEditingAudiencePkg.questions.length + 1,
                          question: '',
                          optionA: '',
                          optionB: '',
                          optionC: '',
                          optionD: '',
                          correctAnswer: 'A',
                          explanation: '',
                        });
                        setIsAddingNewQuestion(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm câu hỏi vào gói</span>
                    </button>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  {currentEditingAudiencePkg.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-relaxed">
                              {q.question}
                            </div>
                            {q.explanation && (
                              <div className="mt-1 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-500/30">
                                <strong>Căn cứ / Giải thích:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingPkgId(currentEditingAudiencePkg.id);
                              setEditingQuestion({ ...q });
                              setIsAddingNewQuestion(false);
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300"
                            title="Sửa câu hỏi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id, currentEditingAudiencePkg.id)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800/60">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => {
                          const isCorrect = q.correctAnswer === key;
                          const optText = q[`option${key}` as keyof QuizQuestion];
                          return (
                            <div
                              key={key}
                              className={`p-2 rounded-xl flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent'
                              }`}
                            >
                              <span className="font-black">{key}.</span>
                              <span className="line-clamp-1">{optText as string}</span>
                              {isCorrect && (
                                <span className="ml-auto text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                                  ĐÚNG
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {currentEditingAudiencePkg.questions.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      Gói này chưa có câu hỏi nào. Nhấn "Thêm câu hỏi vào gói" để tạo mới.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SITUATIONS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'situations' && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Danh Sách 14 Tình Huống Xử Lý Thực Tế
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phần thi 2: "Công dân số thông thái" • Điểm tối đa 30 điểm • Không quá 07 phút/đội
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingSituation({
                    id: '',
                    number: situations.length + 1,
                    title: `TÌNH HUỐNG SỐ ${situations.length + 1}`,
                    content: '',
                    status: 'unplayed',
                  });
                  setIsAddingNewSituation(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm tình huống mới</span>
              </button>
            </div>

            <div className="space-y-4">
              {situations.map((sit) => (
                <div
                  key={sit.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-sm">
                        {sit.number}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase">{sit.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Trạng thái: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{sit.status === 'completed' ? 'Đã thi' : 'Chưa thi'}</span>
                          {sit.finalScore !== undefined && ` (${sit.finalScore}/30đ)`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSituation(sit);
                          setIsAddingNewSituation(false);
                        }}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300"
                        title="Sửa tình huống"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSituation(sit.id)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Xóa tình huống"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-sm leading-relaxed border border-slate-200 dark:border-slate-850">
                    {sit.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SETTINGS, SOUND & CLOUD FIREBASE */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="py-6 space-y-6">
            {/* Quick Reset Station */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Reset Trạng Thái Hội Thi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sử dụng khi chuẩn bị bắt đầu một lượt thi mới hoặc phiên tổng duyệt (có xác nhận chống click nhầm)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  id="admin-reset-r1-btn"
                  onClick={onResetRound1}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/60 text-left transition shadow-xs"
                >
                  <div className="text-sm font-bold text-cyan-700 dark:text-cyan-300">Reset Phần thi 1</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Đưa toàn bộ các gói câu hỏi về trạng thái CHƯA THI
                  </div>
                </button>

                <button
                  id="admin-reset-r2-btn"
                  onClick={onResetRound2}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/60 text-left transition shadow-xs"
                >
                  <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Reset Phần thi 2</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Đưa toàn bộ 14 tình huống về trạng thái CHƯA THI
                  </div>
                </button>

                <button
                  id="admin-reset-all-btn"
                  onClick={onResetAll}
                  className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600/50 hover:border-rose-400 text-left transition shadow-xs"
                >
                  <div className="text-sm font-bold text-rose-700 dark:text-rose-300">Reset Toàn Bộ Hội Thi</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Đưa toàn bộ hội thi về ban đầu (Popup xác nhận an toàn)
                  </div>
                </button>
              </div>
            </div>

            {/* Sound Synthesizer Testing */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Kiểm Tra Âm Thanh Hội Thi (Web Audio)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Âm thanh được tổng hợp trực tiếp bằng Web Audio API, chạy mượt mà 100% không cần kết nối mạng
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={triggerTick}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-cyan-400"
                >
                  Tick đếm nhịp
                </button>
                <button
                  onClick={triggerUrgentTick}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-amber-400"
                >
                  3 giây cuối dồn dập
                </button>
                <button
                  onClick={triggerTimeout}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-amber-400"
                >
                  Chuông hết giờ (Bell)
                </button>
                <button
                  onClick={triggerCorrect}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:border-emerald-400"
                >
                  Chuông Trả lời ĐÚNG (+5đ)
                </button>
                <button
                  onClick={triggerWrong}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:border-rose-400"
                >
                  Còi Trả lời SAI
                </button>
                <button
                  onClick={triggerStart}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-semibold hover:border-cyan-400"
                >
                  Nhạc Bắt đầu
                </button>
              </div>
            </div>

            {/* Change Admin Password */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Đổi Mật Khẩu Quản Trị Hệ Thống</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bảo mật cho máy tính điều hành hội trường
                  </p>
                </div>
              </div>

              {passwordMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs">
                  {passwordMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="flex items-center gap-3 max-w-md">
                <input
                  type="password"
                  placeholder="Nhập mật khẩu quản trị mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-sm"
                >
                  Lưu
                </button>
              </form>
            </div>

            {/* Firebase Cloud Sync Configuration */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Cấu Hình Cloud Database (Firebase Firestore)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isFirebaseConfigured ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                          Đã kích hoạt kết nối Firebase (Dự án: {fbProjectId || 'hoithi'})
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">
                          Chế độ Offline LocalStorage (An toàn, độc lập không phụ thuộc Internet)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFbGuide(!showFbGuide)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{showFbGuide ? 'Ẩn Hướng Dẫn' : 'Xem Hướng Dẫn Kết Nối "hoithi"'}</span>
                  {showFbGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Step by Step Guide for 'hoithi' Project */}
              {showFbGuide && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-cyan-300 dark:border-cyan-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-3">
                  <div className="font-bold text-cyan-700 dark:text-cyan-400 text-sm flex items-center gap-2">
                    <span>📋 Hướng dẫn 4 bước kết nối với dự án Firebase "hoithi":</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li>
                      <strong className="text-slate-900 dark:text-white">Truy cập Firebase Console:</strong> Mở{' '}
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5 font-semibold"
                      >
                        console.firebase.google.com <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      và chọn dự án <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">hoithi</span> của bạn.
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">Lấy mã cấu hình Web App:</strong> Vào biểu tượng bánh răng (Cài đặt dự án - Project settings) &rarr; Cuộn xuống mục <em>"Các ứng dụng của bạn" (Your apps)</em> &rarr; Chọn ứng dụng Web bạn đã tạo &rarr; Chọn mục <strong>"Config"</strong> và sao chép (copy) toàn bộ khối mã <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-cyan-800 dark:text-cyan-300">firebaseConfig = &#123; ... &#125;</code>.
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">Bật Cloud Firestore Database:</strong> Tại menu trái, vào <strong>Build &rarr; Firestore Database</strong> &rarr; Bấm <strong>"Create database"</strong>. Sau khi tạo, chuyển sang tab <strong>Rules</strong> và đảm bảo cấp quyền đọc/ghi:
                      <pre className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 overflow-x-auto border border-slate-200 dark:border-slate-800">
                        allow read, write: if true;
                      </pre>
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">Dán vào ô bên dưới:</strong> Dán đoạn mã đã copy vào khung <em>"Dán nhanh mã cấu hình"</em> bên dưới. Ứng dụng sẽ tự động trích xuất các thông số và bạn chỉ việc bấm <strong>"Lưu Cấu Hình Firebase"</strong>!
                    </li>
                  </ol>
                </div>
              )}

              {/* Status or Alert messages */}
              {fbMsg && (
                <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-200 text-xs font-medium">
                  {fbMsg}
                </div>
              )}

              {fbTestResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                    fbTestResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  {fbTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{fbTestResult.success ? 'Kiểm tra thành công!' : 'Thông báo kết nối:'}</div>
                    <div className="mt-0.5">{fbTestResult.message}</div>
                  </div>
                </div>
              )}

              {/* Quick Paste Snippet Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ⚡ Dán nhanh đoạn mã cấu hình từ Firebase Console:
                </label>
                <textarea
                  rows={3}
                  value={fbSnippet}
                  onChange={(e) => handleParseSnippet(e.target.value)}
                  placeholder={`Dán đoạn mã bạn copy từ Firebase Console tại đây, ví dụ:\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "hoithi",\n  ...\n};`}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-cyan-900 dark:text-cyan-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400 shadow-inner"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hệ thống tự động phân tích và điền các trường bên dưới ngay khi bạn dán.
                </p>
              </div>

              {/* Detailed Form */}
              <form onSubmit={handleSaveCustomFirebase} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Firebase API Key (<span className="text-rose-500">*</span>):
                    </label>
                    <input
                      type="text"
                      placeholder="AIzaSy..."
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Firebase Project ID (<span className="text-rose-500">*</span>):
                    </label>
                    <input
                      type="text"
                      placeholder="hoithi"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Auth Domain (Tùy chọn):</label>
                    <input
                      type="text"
                      placeholder="hoithi.firebaseapp.com"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Storage Bucket (Tùy chọn):</label>
                    <input
                      type="text"
                      placeholder="hoithi.appspot.com"
                      value={fbStorageBucket}
                      onChange={(e) => setFbStorageBucket(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Firebase</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestFirebase}
                    disabled={isTestingFb || !fbApiKey.trim() || !fbProjectId.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-40"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTestingFb ? 'animate-spin' : ''}`} />
                    <span>{isTestingFb ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối (Test)'}</span>
                  </button>

                  {localStorage.getItem('tamhai_custom_firebase_config') && (
                    <button
                      type="button"
                      onClick={handleClearCustomFirebase}
                      className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa Cấu Hình (Về Offline)</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Question */}
        {editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-500/40 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAddingNewQuestion ? 'Thêm Câu Hỏi Mới' : 'Chỉnh Sửa Câu Hỏi'}
                </h3>
                <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nội dung câu hỏi:</label>
                  <textarea
                    rows={3}
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>

                {(['A', 'B', 'C', 'D'] as const).map((key) => (
                  <div key={key}>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Đáp án {key}:</label>
                    <input
                      type="text"
                      value={editingQuestion[`option${key}` as keyof QuizQuestion] as string}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          [`option${key}`]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      placeholder={`Nhập đáp án ${key}...`}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Đáp án ĐÚNG:</label>
                  <select
                    value={editingQuestion.correctAnswer}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-400 dark:border-cyan-500/60 text-cyan-800 dark:text-cyan-300 font-black text-sm focus:outline-none"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    <option value="D">Đáp án D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Căn cứ pháp lý / Giải thích đáp án (dành cho MC & Khán giả):
                  </label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    placeholder="Ví dụ: Theo Nghị quyết số... / Căn cứ Điều... Luật..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Link ảnh minh họa (nếu có):</label>
                  <input
                    type="text"
                    value={editingQuestion.imageUrl || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveQuestion(editingQuestion)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Câu Hỏi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Situation */}
        {editingSituation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/40 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAddingNewSituation ? 'Thêm Tình Huống Mới' : 'Chỉnh Sửa Tình Huống'}
                </h3>
                <button onClick={() => setEditingSituation(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tiêu đề tình huống:</label>
                  <input
                    type="text"
                    value={editingSituation.title}
                    onChange={(e) => setEditingSituation({ ...editingSituation, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="TÌNH HUỐNG SỐ ..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nội dung chi tiết tình huống:</label>
                  <textarea
                    rows={5}
                    value={editingSituation.content}
                    onChange={(e) => setEditingSituation({ ...editingSituation, content: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm leading-relaxed focus:outline-none focus:border-indigo-500"
                    placeholder="Mô tả chi tiết tình huống..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Link ảnh minh họa (nếu có):</label>
                  <input
                    type="text"
                    value={editingSituation.imageUrl || ''}
                    onChange={(e) => setEditingSituation({ ...editingSituation, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingSituation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveSituation(editingSituation)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-sm transition"
                >
                  Lưu Tình Huống
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
