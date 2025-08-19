
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7qQOXtH4uTc4liSy1M7ai1lRDiCnC9hQ",
  authDomain: "foxy-49edc.firebaseapp.com",
  projectId: "foxy-49edc",
  storageBucket: "foxy-49edc.firebasestorage.app",
  messagingSenderId: "115617075484",
  appId: "1:115617075484:web:cfa3a6b48f8e19c4dbead9",
  measurementId: "G-KBR3WM96B3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function getUid() {
  const curr = auth.currentUser;
  if (curr) return curr.uid;
  await signInAnonymously(auth);
  return new Promise((res) => onAuthStateChanged(auth, u => u && res(u.uid)));
}

export async function saveOnboarding(uid, answers) {
  await setDoc(doc(db, "users", uid, "profile", "main"), {
    ...answers,
    updatedAt: serverTimestamp()
  });
}

export async function saveDay(uid, isoDate, payload) {
  await setDoc(doc(db, "users", uid, "days", isoDate), {
    ...payload,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid, "profile", "main"));
  return snap.exists() ? snap.data() : null;
}

export const foxImageBase64 = "";
