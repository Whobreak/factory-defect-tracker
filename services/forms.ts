import { api, uploadApi } from "~/services/api";
import { Form, FormUpdate, RNFile } from "~/services/types";

// Form gönderme
export const submitForm = async (formData: any, photos: any[]) => {
  const formDataPayload = new FormData();
  Object.keys(formData).forEach((key) => {
    formDataPayload.append(key, formData[key]);
  });

  photos.forEach((photo, index) => {
    const filename = photo.uri.split("/").pop() || `photo_${index}.jpg`;
    const type = photo.type || "image/jpeg";
    formDataPayload.append("photos", {
      uri: photo.uri,
      name: filename,
      type,
    } as any);
  });

  const { data } = await uploadApi.post("/Forms", formDataPayload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Form verisini ve fotoğrafları API'ye gönderir
export const createFormWithPhotos = async (formData: any, photoUris: string[]) => {
  try {
    console.log('[+] Form ve fotoğraf gönderim süreci başlıyor...');
    console.log('[+] Fotoğraf sayısı:', photoUris.length);
    
    // Form verisini hazırla
    const submissionData = {
      code: formData.code,
      type: formData.type,
      name: formData.name,
      productError: formData.productError || '',
      quantity: formData.quantity,
      lineId: formData.lineId,
      errorCodeId: formData.errorCodeId,
    };

    // Fotoğrafları RN file formatına çevir
    const photos = photoUris.map((uri, index) => ({
      uri,
      name: uri.split('/').pop() || `photo_${index}.jpg`,
      type: 'image/jpeg',
    }));

    console.log('[+] Gönderilecek form verisi:', submissionData);
    console.log('[+] Fotoğraf sayısı:', photos.length);
    
    const result = await submitForm(submissionData, photos);
    console.log('[+] Form başarıyla oluşturuldu:', result);
    
    return result;
  } catch (error) {
    console.error('Form gönderme işlemi sırasında bir hata oluştu:', error);
    throw new Error('Form ve fotoğraflar sunucuya gönderilemedi.');
  }
};

// Formları listeleme
export const fetchForms = async (): Promise<Form[]> => {
  try {
    console.log('[+] Formlar yükleniyor...');
    const { data } = await api.get<Form[]>("/Forms");
    console.log('[+] Formlar başarıyla yüklendi:', data);
    return data || [];
  } catch (error) {
    console.error('Formlar yüklenirken hata oluştu:', error);
    // Fallback olarak boş array döndür
    return [];
  }
};

// Formu güncelleme
export const updateForm = async (id: string, updates: FormUpdate) => {
  const { data } = await api.put(`/Forms/${id}`, updates);
  return data;
};

// Formu silme
export const deleteForm = async (id: string) => {
  const { data } = await api.delete(`/Forms/${id}`);
  return data;
};

// Form durumunu güncelleme
export const updateFormStatus = async (id: string, status: string) => {
  const { data } = await api.put(
    `/Forms/${id}/status`,
    { status },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
};

// Hata kodlarını getir
export type ErrorCode = { id: number; code: string; description?: string };

export const fetchErrorCodes = async (): Promise<ErrorCode[]> => {
  try {
    console.log('[+] Hata kodları yükleniyor...');
    const { data } = await api.get<ErrorCode[]>("/ErrorCodes");
    console.log('[+] Hata kodları başarıyla yüklendi:', data);
    return data || [];
  } catch (error) {
    console.error('Hata kodları yüklenirken hata oluştu:', error);
    // Fallback olarak boş array döndür
    return [];
  }
};

// Hatları getir
export type Line = { id: number; name: string };

export const fetchLines = async (): Promise<Line[]> => {
  try {
    console.log('[+] Hatlar yükleniyor...');
    const { data } = await api.get<Line[]>("/Lines");
    console.log('[+] Hatlar başarıyla yüklendi:', data);
    return data || [];
  } catch (error) {
    console.error('Hatlar yüklenirken hata oluştu:', error);
    // Fallback olarak boş array döndür
    return [];
  }
};

// Form'u Report formatına çevir
export const mapFormToReport = (form: any) => {
  return {
    id: form.id || Date.now().toString(),
    barcode: form.code || form.barcode || '',
    productType: form.type || form.productType || '',
    lineNumber: form.lineNumber || '1',
    errorCode: form.errorCode || { id: 1, code: 'E001', description: 'Bilinmeyen Hata' },
    note: form.productError || form.note || '',
    photos: form.photos || [],
    createdAt: form.createdAt || new Date().toISOString(),
    status: form.status || 'active'
  };
};