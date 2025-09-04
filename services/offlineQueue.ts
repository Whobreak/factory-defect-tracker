// lib/offlineQueue.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Report } from "~/services/mock";
import { getUserName, getUserRole } from "~/services/storage";
import { createFormWithPhotos } from "~/services/forms";

type EnqueuedReport = {
  tempId: string;
  payload: {
    barcode: string;
    productType: string;
    lineNumber: string;
    errorCode: any;
    note?: string;
    photos: string[];
    userId: number;
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

export async function enqueueReportIfOffline(payload: Omit<EnqueuedReport["payload"], "userId">): Promise<boolean> {
  const state = await NetInfo.fetch();
  const isOnline = !!state.isConnected && !!state.isInternetReachable;

  if (isOnline) {
    // online ise kuyruk yerine direkt gönderim için false dön
    return false;
  }

  // Kullanıcı ID'sini role'den belirle
  const userRole = await getUserRole();
  const userId = userRole === 'SuperAdmin' ? 1 : 2; // Admin: 1, User: 2

  const q = await getQueue();
  q.push({
    tempId: `tmp_${Date.now()}`,
    payload: {
      ...payload,
      userId: userId,
    },
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
      // Gerçek API çağrısı yap
      const submissionData = {
        code: item.payload.barcode,
        type: item.payload.productType,
        name: item.payload.productType,
        productError: item.payload.note,
        quantity: 1,
        lineId: 1, // Line ID'yi API'den al
        errorCodeId: item.payload.errorCode.id,
      };

      await createFormWithPhotos(submissionData, item.payload.photos);
      console.log('Offline queue item processed successfully:', item.tempId);
    } catch (e) {
      console.error('Failed to process offline item:', e);
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
