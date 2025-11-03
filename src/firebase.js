import { initializeApp } from "firebase/app";
import {
  getFirestore, serverTimestamp, doc, setDoc, collection,
  addDoc, query, orderBy, onSnapshot, updateDoc, deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// === 単一コレクション: ideas ===
const ideasCol = () => collection(db, "ideas");

// 追加
export async function addIdea(text) {
  return addDoc(ideasCol(), {
    text,
    done: false,
    createdAt: serverTimestamp(),
  });
}

// 監視（作成日時降順）
export function watchIdeas(onNext, onError) {
  const q = query(ideasCol(), orderBy("createdAt", "desc"));
  return onSnapshot(q,
    (snap) => onNext(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// 完了トグル
export async function markDone(id, done) {
  const ref = doc(db, "ideas", id);
  await updateDoc(ref, { done, doneAt: done ? serverTimestamp() : null });
}

// 削除（必要なら）
export async function removeIdea(id) {
  const ref = doc(db, "ideas", id);
  await deleteDoc(ref);
}
