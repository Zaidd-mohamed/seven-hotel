import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export function firebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "auth/email-already-in-use") return "That email is already registered.";
  if (code === "auth/invalid-email") return "Please enter a valid email address.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/wrong-password") return "Incorrect password.";
  if (code === "auth/user-not-found") return "No account found with that email.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection and try again.";
  return error?.message || "Something went wrong. Please try again.";
}

export async function registerUser({ name, email, password }) {
  // 1) Create Auth user (Auth enforces unique emails = single identity)
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // 2) Create Firestore profile doc (roles belong here)
  const uid = cred.user.uid;
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    name: name?.trim() || "Guest",
    email: email.toLowerCase(),
    role: "guest",
    hotelId: null,
    disabled: false,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
