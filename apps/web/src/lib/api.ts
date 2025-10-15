import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getApiBase } from './config';

async function waitForAuth(): Promise<User> {
  const auth = getAuth();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, u => { unsub(); u ? resolve(u) : reject(new Error('not_authenticated')); });
  });
}

export async function authedFetch(path: string, init: RequestInit = {}) {
  const base = getApiBase();               // <-- throws if missing
  const go = async (fresh: boolean) => {
    const user = await waitForAuth();
    const token = await user.getIdToken(fresh);
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
      cache: 'no-store',
    });
    return res;
  };
  let res = await go(false);
  if (res.status === 401) res = await go(true);
  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    throw new Error(text || `HTTP_${res.status}`);
  }
  return res.json();
}