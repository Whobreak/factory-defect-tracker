// lib/offlineQueue.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { addReport, Report, currentUser } from "~/lib/mock";

type EnqueuedReport = {
  tempId: string;
  payload: {
    barcode: string;
    productType: string;
    lineNumber: string;
    errorCode: any;
    note?: string;
    photos: string[];
  };
  createdAtISO: string;
};

const KEY = "@offline_report_queue";

export async function getQueue(): Promise<EnqueuedReport[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setQueue(q: EnqueuedReport[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(q));
}

export async function enqueueReportIfOffline(payload: EnqueuedReport["payload"]): Promise<boolean> {
  const state = await NetInfo.fetch();
  const isOnline = !!state.isConnected && !!state.isInternetReachable;

  if (isOnline) {
    // online ise kuyruk yerine direkt gönderim için false dön
    return false;
  }

  const q = await getQueue();
  q.push({
    tempId: `tmp_${Date.now()}`,
    payload,
    createdAtISO: new Date().toISOString(),
  });
  await setQueue(q);
  return true;
}

export async function flushQueueIfOnline() {
  const state = await NetInfo.fetch();
  const isOnline = !!state.isConnected && !!state.isInternetReachable;
  if (!isOnline) return;

  const q = await getQueue();
  if (!q.length) return;

  const remaining: EnqueuedReport[] = [];
  for (const item of q) {
    try {
      // Burayı gerçek API çağrısına değiştir (Swagger client):
      // await api.reports.create(item.payload)
      const newReport: Report = {
        id: Date.now(),
        barcode: item.payload.barcode,
        productType: item.payload.productType,
        lineNumber: item.payload.lineNumber,
        errorCode: item.payload.errorCode,
        note: item.payload.note,
        photos: item.payload.photos,
        createdAt: item.createdAtISO, // kuyruklandığı an
        userId: currentUser.id,
      };
      addReport(newReport);
    } catch (e) {
      // başarısız olanları kuyrukta tut
      remaining.push(item);
    }
  }
  await setQueue(remaining);
}

// app başlarken ve bağlantı değiştiğinde flush et
let subscribed = false;
export function subscribeQueueFlush() {
  if (subscribed) return;
  NetInfo.addEventListener(() => {
    flushQueueIfOnline();
  });
  subscribed = true;
}
