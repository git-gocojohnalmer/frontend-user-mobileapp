import { auth } from '../lib/firebase';

const API_BASE = __DEV__
  ? 'http://YOUR_LOCAL_IP:3000/api'   // your machine's IP on LAN
  : 'https://your-production-url.com/api';

async function getHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getParkingLots() {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/parking-lots`, { headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getSpotsByLot(lotId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/layouts?lotId=${lotId}`, { headers });
  const data = await res.json();
  return data.data ?? [];
}