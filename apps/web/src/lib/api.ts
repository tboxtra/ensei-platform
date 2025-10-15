// apps/web/src/lib/api.ts
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

async function whenAuthReady(): Promise<User> {
  const auth = getAuth();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      if (u) resolve(u);
      else reject(new Error('not_authenticated'));
    });
  });
}

export async function authedFetch(path: string, init: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const doFetch = async (forceFresh: boolean) => {
    const user = await whenAuthReady();
    const token = await user.getIdToken(forceFresh);
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-client': 'web',
        ...(init.headers || {}),
      },
      cache: 'no-store',
    });
    return res;
  };

  // first try with cached token, if 401 retry once with a forced fresh token
  let res = await doFetch(false);
  if (res.status === 401) res = await doFetch(true);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}