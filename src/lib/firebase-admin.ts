import * as admin from "firebase-admin";

let adminApp: admin.app.App | undefined;

function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0]!;
  if (adminApp) return adminApp;
  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
  return adminApp;
}

let _adminDb: admin.firestore.Firestore | null = null;
function getAdminDb() {
  if (_adminDb) return _adminDb;
  try {
    _adminDb = admin.firestore(getAdminApp());
  } catch (e) {
    console.error("Firebase Admin init failed:", e);
  }
  return _adminDb;
}

export const adminDb = getAdminDb();
