import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import {
  QuizPackage,
  Situation,
  Team,
  AppSettings,
  SyncStatus,
} from '../types/competition';
import {
  DEFAULT_PACKAGES,
  DEFAULT_SITUATIONS,
  DEFAULT_TEAMS,
  DEFAULT_SETTINGS,
} from '../data/defaultData';

const LOCAL_STORAGE_KEY_PACKAGES = 'tamhai_quiz_packages';
const LOCAL_STORAGE_KEY_SITUATIONS = 'tamhai_situations';
const LOCAL_STORAGE_KEY_TEAMS = 'tamhai_teams';
const LOCAL_STORAGE_KEY_SETTINGS = 'tamhai_settings';

// Helper to remove any undefined fields before sending to Firestore
function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return null as unknown as T;
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

export class StorageService {
  private static currentStatus: SyncStatus = {
    state: isFirebaseConfigured ? 'synced' : 'offline',
    lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
    message: isFirebaseConfigured
      ? 'Đã kết nối Firebase Cloud'
      : 'Đang hoạt động trên LocalStorage (Offline)',
  };

  private static syncListeners: ((status: SyncStatus) => void)[] = [];

  public static getSyncStatus(): SyncStatus {
    return this.currentStatus;
  }

  public static subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  private static updateSyncStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.syncListeners.forEach((listener) => listener(status));
  }

  // ===== PACKAGES =====
  // Helper to ensure strictly 10 main team packages and strictly 3 audience packages
  public static sanitizePackages(rawPkgs: QuizPackage[]): QuizPackage[] {
    if (!rawPkgs || !Array.isArray(rawPkgs) || rawPkgs.length === 0) {
      return DEFAULT_PACKAGES;
    }

    // 1. Filter out completely unwanted / invalid packages:
    // - "CÂU HỎI DÀNH CHO KHÁN GIẢ" (15 câu)
    // - "GÓI SỐ 12" (0 câu)
    // - id 'pkg-audience'
    const filtered = rawPkgs.filter((p) => {
      if (!p) return false;
      const titleUpper = (p.title || '').trim().toUpperCase();
      // Remove any package with legacy title "CÂU HỎI DÀNH CHO KHÁN GIẢ"
      if (titleUpper.includes('CÂU HỎI DÀNH CHO KHÁN GIẢ')) return false;
      // Remove "GÓI SỐ 12" (or number 12 main package with 0 questions)
      if (titleUpper === 'GÓI SỐ 12' || (p.number === 12 && !p.isAudience && titleUpper.includes('GÓI SỐ'))) return false;
      // Remove legacy audience id
      if (p.id === 'pkg-audience') return false;
      return true;
    });

    // 2. Main Team Packages (strictly 10 packages: GÓI SỐ 1 to GÓI SỐ 10)
    const rawTeamPkgs = filtered.filter(
      (p) =>
        p.number <= 10 &&
        !p.isAudience &&
        !(p.title || '').toLowerCase().includes('khán giả')
    );

    const defaultTeamPkgs = DEFAULT_PACKAGES.filter((p) => p.number <= 10 && !p.isAudience);
    const cleanTeamPkgs: QuizPackage[] = [];
    const teamMap = new Map<number, QuizPackage>();
    rawTeamPkgs.forEach((p) => {
      if (p.number >= 1 && p.number <= 10 && !teamMap.has(p.number)) {
        teamMap.set(p.number, p);
      }
    });

    for (let i = 1; i <= 10; i++) {
      const existing = teamMap.get(i);
      if (existing) {
        cleanTeamPkgs.push({
          ...existing,
          number: i,
          title: existing.title || `GÓI SỐ ${i}`,
          isAudience: false,
        });
      } else {
        const fallback = defaultTeamPkgs.find((d) => d.number === i) || defaultTeamPkgs[i - 1];
        if (fallback) {
          cleanTeamPkgs.push(fallback);
        }
      }
    }
    cleanTeamPkgs.sort((a, b) => a.number - b.number);

    // 3. Audience Packages: STRICTLY ONLY 3 PACKAGES (Khán giả 1, Khán giả 2, Khán giả 3)
    const defaultAudiencePkgs = DEFAULT_PACKAGES.filter((p) => p.isAudience || p.number >= 11);

    // Audience 1 (pkg-11)
    const existingKg1 = filtered.find(
      (p) =>
        (p.id === 'pkg-11' || (p.title || '').toLowerCase().includes('khán giả 1')) &&
        !(p.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ')
    );
    const defKg1 = defaultAudiencePkgs.find((p) => p.id === 'pkg-11') || defaultAudiencePkgs[0];
    const kg1: QuizPackage = {
      id: 'pkg-11',
      number: 11,
      title: existingKg1?.title || 'Khán giả 1',
      status: existingKg1?.status || 'unplayed',
      isAudience: true,
      questions: existingKg1?.questions && existingKg1.questions.length > 0 ? existingKg1.questions : defKg1.questions,
    };

    // Audience 2 (pkg-12)
    const existingKg2 = filtered.find(
      (p) =>
        (p.id === 'pkg-12' || (p.title || '').toLowerCase().includes('khán giả 2')) &&
        (p.title || '').trim().toUpperCase() !== 'GÓI SỐ 12' &&
        !(p.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ')
    );
    const defKg2 = defaultAudiencePkgs.find((p) => p.id === 'pkg-12') || defaultAudiencePkgs[1];
    const kg2: QuizPackage = {
      id: 'pkg-12',
      number: 12,
      title: existingKg2?.title && existingKg2.title.trim().toUpperCase() !== 'GÓI SỐ 12' ? existingKg2.title : 'Khán giả 2',
      status: existingKg2?.status || 'unplayed',
      isAudience: true,
      questions: existingKg2?.questions && existingKg2.questions.length > 0 ? existingKg2.questions : defKg2.questions,
    };

    // Audience 3 (pkg-13)
    const existingKg3 = filtered.find(
      (p) =>
        (p.id === 'pkg-13' || (p.title || '').toLowerCase().includes('khán giả 3')) &&
        !(p.title || '').toUpperCase().includes('CÂU HỎI DÀNH CHO KHÁN GIẢ')
    );
    const defKg3 = defaultAudiencePkgs.find((p) => p.id === 'pkg-13') || defaultAudiencePkgs[2];
    const kg3: QuizPackage = {
      id: 'pkg-13',
      number: 13,
      title: existingKg3?.title || 'Khán giả 3',
      status: existingKg3?.status || 'unplayed',
      isAudience: true,
      questions: existingKg3?.questions && existingKg3.questions.length > 0 ? existingKg3.questions : defKg3.questions,
    };

    const cleanAudiencePkgs = [kg1, kg2, kg3];
    const finalPkgs = [...cleanTeamPkgs, ...cleanAudiencePkgs];
    finalPkgs.sort((a, b) => a.number - b.number);
    return finalPkgs;
  }

  public static getPackages(): QuizPackage[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_PACKAGES);
      if (data) {
        const pkgs: QuizPackage[] = JSON.parse(data);
        const sanitized = this.sanitizePackages(pkgs);
        this.savePackagesLocal(sanitized);
        return sanitized;
      }
    } catch {
      // Fallback to defaults
    }
    const defaultSanitized = this.sanitizePackages(DEFAULT_PACKAGES);
    this.savePackagesLocal(defaultSanitized);
    return defaultSanitized;
  }

  public static savePackagesLocal(packages: QuizPackage[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PACKAGES, JSON.stringify(packages));
  }

  public static async savePackages(packages: QuizPackage[], syncToCloud = true): Promise<void> {
    const cleanPkgs = this.sanitizePackages(packages);
    this.savePackagesLocal(cleanPkgs);
    const firestore = db;
    if (syncToCloud && isFirebaseConfigured && firestore && navigator.onLine) {
      try {
        this.updateSyncStatus({ state: 'syncing', message: 'Đang đồng bộ gói câu hỏi lên Cloud...' });
        const batch = writeBatch(firestore);
        cleanPkgs.forEach((pkg) => {
          const ref = doc(firestore, 'quizPackages', pkg.id);
          const cleanPkg = cleanForFirestore(pkg);
          batch.set(ref, cleanPkg);
        });

        // Also clean up obsolete legacy documents from Firestore
        try {
          const obsoleteDocIds = ['pkg-audience', 'pkg-14', 'pkg-15'];
          obsoleteDocIds.forEach((obsId) => {
            batch.delete(doc(firestore, 'quizPackages', obsId));
          });
        } catch {
          // Ignore delete errors
        }

        await batch.commit();
        this.updateSyncStatus({
          state: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
          message: 'Dữ liệu đã được đồng bộ lên Cloud thành công',
        });
      } catch (err) {
        console.error('Cloud sync error for packages:', err);
        this.updateSyncStatus({
          state: 'error',
          lastSyncedAt: this.currentStatus.lastSyncedAt,
          message: 'Lỗi đồng bộ Cloud (dữ liệu đã được lưu an toàn tại máy)',
        });
      }
    }
  }

  // ===== SITUATIONS =====
  public static getSituations(): Situation[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_SITUATIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveSituationsLocal(DEFAULT_SITUATIONS);
    return DEFAULT_SITUATIONS;
  }

  public static saveSituationsLocal(situations: Situation[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY_SITUATIONS, JSON.stringify(situations));
  }

  public static async saveSituations(situations: Situation[], syncToCloud = true): Promise<void> {
    this.saveSituationsLocal(situations);
    const firestore = db;
    if (syncToCloud && isFirebaseConfigured && firestore && navigator.onLine) {
      try {
        this.updateSyncStatus({ state: 'syncing', message: 'Đang đồng bộ tình huống lên Cloud...' });
        const batch = writeBatch(firestore);
        situations.forEach((sit) => {
          const ref = doc(firestore, 'situations', sit.id);
          const cleanSit = cleanForFirestore(sit);
          batch.set(ref, cleanSit);
        });
        await batch.commit();
        this.updateSyncStatus({
          state: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
          message: 'Tình huống đã được đồng bộ lên Cloud',
        });
      } catch (err) {
        console.error('Cloud sync error for situations:', err);
        this.updateSyncStatus({
          state: 'error',
          lastSyncedAt: this.currentStatus.lastSyncedAt,
          message: 'Lỗi đồng bộ Cloud',
        });
      }
    }
  }

  // ===== TEAMS =====
  public static getTeams(): Team[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_TEAMS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveTeamsLocal(DEFAULT_TEAMS);
    return DEFAULT_TEAMS;
  }

  public static saveTeamsLocal(teams: Team[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY_TEAMS, JSON.stringify(teams));
  }

  public static async saveTeams(teams: Team[], syncToCloud = true): Promise<void> {
    this.saveTeamsLocal(teams);
    const firestore = db;
    if (syncToCloud && isFirebaseConfigured && firestore && navigator.onLine) {
      try {
        const batch = writeBatch(firestore);
        teams.forEach((t) => {
          const ref = doc(firestore, 'teams', t.id);
          const cleanTeam = cleanForFirestore(t);
          batch.set(ref, cleanTeam);
        });
        await batch.commit();
      } catch (e) {
        console.warn('Sync teams warning:', e);
      }
    }
  }

  public static async deleteTeam(teamId: string, syncToCloud = true): Promise<Team[]> {
    const teams = this.getTeams().filter((t) => t.id !== teamId);
    this.saveTeamsLocal(teams);
    const firestore = db;
    if (syncToCloud && isFirebaseConfigured && firestore && navigator.onLine) {
      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestore, 'teams', teamId));
      } catch (e) {
        console.warn('Delete team cloud error:', e);
      }
    }
    return teams;
  }

  // ===== SETTINGS =====
  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    this.saveSettingsLocal(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  public static saveSettingsLocal(settings: AppSettings) {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  public static async saveSettings(settings: AppSettings, syncToCloud = true): Promise<void> {
    this.saveSettingsLocal(settings);
    const firestore = db;
    if (syncToCloud && isFirebaseConfigured && firestore && navigator.onLine) {
      try {
        const cleanSettings = cleanForFirestore(settings);
        await setDoc(doc(firestore, 'settings', 'general'), cleanSettings, { merge: true });
      } catch (e) {
        console.warn('Sync settings warning:', e);
      }
    }
  }

  // ===== RESET STATE FUNCTIONS =====
  public static resetRound1(): QuizPackage[] {
    const packages = this.getPackages();
    const updated = packages.map((pkg) => {
      const copy: QuizPackage = {
        ...pkg,
        status: 'unplayed',
        score: 0,
        results: [],
      };
      delete copy.playedAt;
      return copy;
    });
    this.savePackages(updated, true);
    return updated;
  }

  public static resetRound2(): Situation[] {
    const situations = this.getSituations();
    const updated = situations.map((sit) => {
      const copy: Situation = {
        ...sit,
        status: 'unplayed',
      };
      delete copy.elapsedSeconds;
      delete copy.overtimeSeconds;
      delete copy.judgeScore;
      delete copy.penaltyScore;
      delete copy.finalScore;
      delete copy.playedAt;
      return copy;
    });
    this.saveSituations(updated, true);
    return updated;
  }

  public static resetAllCompetition(): { packages: QuizPackage[]; situations: Situation[]; teams: Team[] } {
    const packages = this.resetRound1();
    const situations = this.resetRound2();
    const teams = this.getTeams().map((t) => ({
      ...t,
      round1Score: 0,
      round2Score: 0,
      totalScore: 0,
    }));
    this.saveTeams(teams, true);
    return { packages, situations, teams };
  }

  public static resetAll(): { packages: QuizPackage[]; situations: Situation[]; teams: Team[] } {
    return this.resetAllCompetition();
  }

  // Reset to initial clean factory default data
  public static resetToFactoryDefaults(): { packages: QuizPackage[]; situations: Situation[]; teams: Team[] } {
    this.savePackages(DEFAULT_PACKAGES, true);
    this.saveSituations(DEFAULT_SITUATIONS, true);
    this.saveTeams(DEFAULT_TEAMS, true);
    this.saveSettings(DEFAULT_SETTINGS, true);
    return { packages: DEFAULT_PACKAGES, situations: DEFAULT_SITUATIONS, teams: DEFAULT_TEAMS };
  }

  // ===== INITIALIZE CLOUD REALTIME LISTENER =====
  public static initCloudSync(
    onRemoteUpdate: (pkgs?: QuizPackage[], sits?: Situation[], teams?: Team[]) => void
  ) {
    const firestore = db;
    if (!isFirebaseConfigured || !firestore) {
      this.updateSyncStatus({
        state: 'offline',
        message: 'Hoạt động chế độ Offline Cache',
      });
      return;
    }

    try {
      // Realtime listener for quiz packages
      onSnapshot(
        collection(firestore, 'quizPackages'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as QuizPackage);
            const sanitized = StorageService.sanitizePackages(list);
            this.savePackagesLocal(sanitized);
            onRemoteUpdate(sanitized, undefined, undefined);
          }
        },
        (err) => {
          console.warn('Realtime snapshot packages error:', err);
        }
      );

      // Realtime listener for situations
      onSnapshot(
        collection(firestore, 'situations'),
        (snapshot) => {
          if (!snapshot.empty) {
            const sits = snapshot.docs.map((d) => d.data() as Situation);
            sits.sort((a, b) => a.number - b.number);
            this.saveSituationsLocal(sits);
            onRemoteUpdate(undefined, sits, undefined);
          }
        },
        (err) => {
          console.warn('Realtime snapshot situations error:', err);
        }
      );
    } catch (e) {
      console.warn('initCloudSync warning:', e);
    }
  }

  // Manual Sync All to Cloud
  public static async syncAllToCloud(
    packages: QuizPackage[],
    situations: Situation[],
    teams: Team[],
    settings: AppSettings
  ): Promise<{ success: boolean; error?: string }> {
    const firestore = db;
    if (!isFirebaseConfigured || !firestore) {
      return { success: false, error: 'Firebase chưa được kích hoạt. Đang lưu trên máy (LocalStorage).' };
    }

    try {
      this.updateSyncStatus({ state: 'syncing', message: 'Đang đẩy toàn bộ dữ liệu lên Firebase Cloud...' });
      await this.savePackages(packages, true);
      await this.saveSituations(situations, true);
      await this.saveTeams(teams, true);
      await this.saveSettings(settings, true);

      this.updateSyncStatus({
        state: 'synced',
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
        message: 'Đã đồng bộ toàn bộ dữ liệu lên Cloud',
      });
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ';
      this.updateSyncStatus({
        state: 'error',
        lastSyncedAt: this.currentStatus.lastSyncedAt,
        message: `Lỗi đồng bộ: ${msg}`,
      });
      return { success: false, error: msg };
    }
  }
}
