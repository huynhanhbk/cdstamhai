import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
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
  public static getPackages(): QuizPackage[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_PACKAGES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback to defaults
    }
    this.savePackagesLocal(DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES;
  }

  public static savePackagesLocal(packages: QuizPackage[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PACKAGES, JSON.stringify(packages));
  }

  public static async savePackages(packages: QuizPackage[], syncToCloud = true): Promise<void> {
    this.savePackagesLocal(packages);
    const firestore = db;
    if (syncToCloud && isFirebaseConfigured && firestore && navigator.onLine) {
      try {
        this.updateSyncStatus({ state: 'syncing', message: 'Đang đồng bộ gói câu hỏi lên Cloud...' });
        const batch = writeBatch(firestore);
        packages.forEach((pkg) => {
          const ref = doc(firestore, 'quizPackages', pkg.id);
          batch.set(ref, pkg, { merge: true });
        });
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
          batch.set(ref, sit, { merge: true });
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
          batch.set(ref, t, { merge: true });
        });
        await batch.commit();
      } catch (e) {
        console.warn('Sync teams warning:', e);
      }
    }
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
        await setDoc(doc(firestore, 'settings', 'general'), settings, { merge: true });
      } catch (e) {
        console.warn('Sync settings warning:', e);
      }
    }
  }

  // ===== RESET STATE FUNCTIONS =====
  public static resetRound1(): QuizPackage[] {
    const packages = this.getPackages();
    const updated = packages.map((pkg) => ({
      ...pkg,
      status: 'unplayed' as const,
      score: 0,
      results: [],
      playedAt: undefined,
    }));
    this.savePackages(updated, true);
    return updated;
  }

  public static resetRound2(): Situation[] {
    const situations = this.getSituations();
    const updated = situations.map((sit) => ({
      ...sit,
      status: 'unplayed' as const,
      elapsedSeconds: undefined,
      overtimeSeconds: undefined,
      judgeScore: undefined,
      penaltyScore: undefined,
      finalScore: undefined,
      playedAt: undefined,
    }));
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
            list.sort((a, b) => a.number - b.number);
            this.savePackagesLocal(list);
            onRemoteUpdate(list, undefined, undefined);
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
