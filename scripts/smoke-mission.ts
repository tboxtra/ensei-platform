import fetch from 'node-fetch';

const api = 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api';
const token = process.env.ENSEI_TEST_TOKEN!; // set a valid Firebase ID token

async function main() {
  const hdr = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 1) packs
  console.log('packs:', await (await fetch(`${api}/v1/packs`, { headers: hdr })).json());

  // 2) entitlements
  const ents = await (await fetch(`${api}/v1/entitlements`, { headers: hdr })).json();
  console.log('ents before:', ents);

  // 3) create mission with single-use (cap 100)
  const r1 = await fetch(`${api}/v1/missions`, {
    method: 'POST',
    headers: hdr,
    body: JSON.stringify({ model: 'fixed', cap: 100, payment: { type: 'single', clientRequestId: `smk-${Date.now()}` } })
  });
  console.log('create single-use:', r1.status, await r1.json());

  // 4) create mission with pack if exists
  const active = (ents?.items || []).find((e: any) => e.status === 'active' && e.remaining > 0);
  if (active) {
    const r2 = await fetch(`${api}/v1/missions`, {
      method: 'POST',
      headers: hdr,
      body: JSON.stringify({ model: 'fixed', cap: 100, payment: { type: 'pack', entitlementId: active.id, clientRequestId: `smk2-${Date.now()}` } })
    });
    console.log('create with pack:', r2.status, await r2.json());
  }
}
main().catch(console.error);
