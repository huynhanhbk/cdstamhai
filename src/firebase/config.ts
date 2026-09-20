import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseConfigParams {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export function getStoredFirebaseConfig(): FirebaseConfigParams {
  try {
    const custom = localStorage.getItem('tamhai_custom_firebase_config');
    if (custom) {
      return JSON.parse(custom);
    }
  } catch {
    // Ignore parse error
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

const config = getStoredFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.apiKey !== 'YOUR_API_KEY'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config as Record<string, string>);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization notice (running in local offline mode):', err);
  }
}

export async function testFirebaseConnection(customConfig?: FirebaseConfigParams): Promise<{ success: boolean; message: string }> {
  try {
    const targetConfig = customConfig || getStoredFirebaseConfig();
    if (!targetConfig.apiKey || !targetConfig.projectId) {
      return { success: false, message: 'Thiếu apiKey hoặc projectId trong cấu hình Firebase.' };
    }
    const testApp = initializeApp(targetConfig as Record<string, string>, `test-${Date.now()}`);
    const testDb = getFirestore(testApp);
    const pingDoc = doc(testDb, '_system_health', 'ping');
    await getDoc(pingDoc);
    return { success: true, message: 'Kết nối Firebase Firestore thành công! Dữ liệu sẵn sàng đồng bộ.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('permission-denied')) {
      return {
        success: false,
        message: 'Đã kết nối được tới Firebase Project, nhưng Security Rules đang chặn đọc/ghi. Vui lòng vào Cloud Firestore -> Rules chọn cho phép đọc/ghi (allow read, write: if true;).',
      };
    }
    if (msg.includes('database') || msg.includes('not-found') || msg.includes('not found')) {
      return {
        success: false,
        message: 'Đã kết nối tới Firebase Project, nhưng bạn chưa bấm "Create Database" trong tab Cloud Firestore. Hãy vào Firebase Console -> Build -> Firestore Database -> Create database.',
      };
    }
    return {
      success: false,
      message: `Lỗi kết nối: ${msg}`,
    };
  }
}

export { app, db, auth };
