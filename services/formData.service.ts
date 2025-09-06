import api from './api';
import { CreateFormPayload, RNFile, Form } from '~/types'; // Projendeki doğru tipleri import et
import NetInfo from '@react-native-community/netinfo';
import { addFormToQueue } from '~/lib/offlineQueue'; // lib klasöründeki offlineQueue'yu kullanıyoruz

/**
 * Bu fonksiyon, form verisini ve fotoğrafları onlineken doğrudan API'ye gönderir.
 * Offline kuyruğu tarafından da kullanılır.
 * @param form - CreateFormPayload tipinde form verisi.
 * @param photos - RNFile tipinde fotoğraf dizisi.
 */
const submitFormOnline = (form: CreateFormPayload, photos: RNFile[]) => {
  const formDataPayload = new FormData();

  // CreateFormPayload tipindeki tüm alanları FormData'ya ekle
  // Not: Alan adları (Code, Type vb.) API'nin beklediği adlarla eşleşmelidir.
  Object.keys(form).forEach(key => {
    // Photos alanı FormData'ya ayrı ekleneceği için onu atlıyoruz
    if (key !== 'Photos' && form[key as keyof CreateFormPayload] !== undefined) {
      formDataPayload.append(key, String(form[key as keyof CreateFormPayload]));
    }
  });
  
  // RNFile tipindeki fotoğrafları FormData'ya ekle
  photos.forEach((photoFile) => {
    // Sunucunun dosyaları nasıl beklediğine bağlı olarak 'photos' anahtarını değiştirebilirsin
    formDataPayload.append('photos', {
      uri: photoFile.uri,
      type: photoFile.type,
      name: photoFile.name,
    } as any);
  });

  return api.post('/Forms', formDataPayload, {
    headers: {
      // Bu başlık FormData ile gönderim yaparken önemlidir.
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Bu ana fonksiyon, internet bağlantısını kontrol eder.
 * Bağlantı varsa formu direkt gönderir, yoksa offline kuyruğa ekler.
 * @param form - CreateFormPayload tipinde form verisi.
 * @param photos - RNFile tipinde fotoğraf dizisi.
 */
const submitForm = async (form: CreateFormPayload, photos: RNFile[]) => {
  const netState = await NetInfo.fetch();
  const isOnline = netState.isConnected && netState.isInternetReachable;

  if (isOnline) {
    console.log("Çevrimiçi: Form doğrudan gönderiliyor.");
    return submitFormOnline(form, photos);
  } else {
    console.log("Çevrimdışı: Form daha sonra gönderilmek üzere kuyruğa alınıyor.");
    // addFormToQueue fonksiyonu offlineQueue.ts dosyasından geliyor
    await addFormToQueue(form, photos);
    // Kullanıcıya formun kuyruğa alındığına dair bir geri bildirim verilir
    return Promise.resolve({ success: true, message: 'Form kuyruğa alındı.' });
  }
};

// Diğer form işlemleri
const getForms = () => {
  // API'den gelen form listesinin tipi 'Form[]' olarak ayarlandı
  return api.get<Form[]>('/Forms');
};

const deleteForm = (id: number) => {
  return api.delete(`/Forms/${id}`);
};

const getExcelExportLink = () => {
  return api.get<{ fileUrl: string }>('/Forms/export-link');
};

const updateFormStatus = (id: number, status: string) => {
  // JSON verisi gönderirken stringify etmeye gerek yok, axios bunu halleder.
  return api.put(`/Forms/${id}/status`, { status });
};

const clearData = () => {
  return api.delete('/Forms/clear');
};

// Tüm fonksiyonları tek bir yerden export ediyoruz
export const FormService = {
  submitForm,
  submitFormOnline, // Offline kuyruğun erişebilmesi için bu da export ediliyor
  getForms,
  deleteForm,
  getExcelExportLink,
  updateFormStatus,
  clearData,
};