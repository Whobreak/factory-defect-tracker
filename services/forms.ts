import { api } from '../services/api';
import { Report } from '../services/mock';
import * as FileSystem from 'expo-file-system';

export type LineDto = {
  id: number;
  name: string | null;
};

export type ErrorCodeDto = {
  id: number;
  code: string | null;
  description: string | null;
};

export type PhotoDto = {
  id: number;
  fileName?: string | null;
  filePath?: string | null;
  formId: number;
};

export type FormDataDto = {
  id: number;
  code?: string | null;
  type?: string | null;
  name?: string | null;
  productError?: string | null;
  quantity?: number | null;
  status?: string | null;
  errorCodeId?: number | null;
  errorCode?: ErrorCodeDto | null;
  lineId?: number | null;
  line?: LineDto | null;
  photos?: PhotoDto[] | null;
  formDate?: string | null;
};

export async function fetchForms(): Promise<FormDataDto[]> {
  const { data } = await api.get<FormDataDto[]>('/Forms');
  return data;
}

/**
 * API'den tüm line'ları çeker
 */
export async function fetchLines(): Promise<LineDto[]> {
  const { data } = await api.get<LineDto[]>('/Lines');
  return data;
}

/**
 * API'den tüm hata kodlarını çeker
 */
export async function fetchErrorCodes(): Promise<ErrorCodeDto[]> {
  const { data } = await api.get<ErrorCodeDto[]>('/ErrorCodes');
  return data;
}

export function mapFormToReport(form: FormDataDto): Report {
  return {
    id: form.id,
    barcode: form.code || '',
    productType: form.type || form.name || '',
    lineNumber: form.line?.name || '',
    errorCode: form.errorCode
      ? {
          id: form.errorCode.id,
          code: form.errorCode.code || '',
          description: form.errorCode.description || '',
        }
      : { id: 0, code: '', description: '' },
    note: form.productError || '',
    photos: (form.photos || []).map((p) => p.filePath || '').filter(Boolean),
    createdAt: form.formDate || new Date().toISOString(),
    userId: undefined,
  };
}

export type CreateFormPayload = {
  code?: string | null;
  type?: string | null;
  name?: string | null;
  productError?: string | null;
  quantity?: number | null;
  status?: string | null;
  errorCodeId?: number | null;
  lineId?: number | null;
  formDate?: string | null;
  photoUrls?: string[] | null;
};

export type PhotoUploadRequest = {
  serialNumber?: string | null;
  base64Images?: string[] | null;
  lengthUnit?: string | null;
};

export type PhotoUploadResponse = {
  success: boolean;
  message?: string;
  filePaths?: string[];
  uploadId?: string;
};

/**
 * URI'yi base64'e çevir
 */
async function convertUriToBase64(uri: string): Promise<string> {
  if (uri.startsWith('data:')) {
    return uri; // Zaten base64 formatında
  }
  
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Photo conversion failed:', error);
    throw new Error('Fotoğraf dönüştürülemedi');
  }
}

/**
 * Adım 1: Fotoğrafları Base64 formatında API'ye yükler.
 */
export async function uploadPhotos(
  serialNumber: string,
  photoUris: string[]
): Promise<PhotoUploadResponse> {
  // Fotoğrafları base64'e çevir
  const base64Images = await Promise.all(
    photoUris.map(uri => convertUriToBase64(uri))
  );

  const payload: PhotoUploadRequest = {
    serialNumber: serialNumber,
    base64Images: base64Images,
    lengthUnit: '100',
  };
  
  console.log(`[+] ${base64Images.length} adet fotoğraf yükleniyor...`);
  const { data } = await api.post<PhotoUploadResponse>('/PhotoUpload', payload);
  console.log('[+] Fotoğraf yükleme başarılı:', data);
  return data;
}

/**
 * Adım 2: Form verisini API'ye gönderir.
 */
export async function createForm(payload: CreateFormPayload): Promise<FormDataDto> {
  console.log('[+] Form verisi gönderiliyor:', payload);
  const { data } = await api.post<FormDataDto>('/Forms', payload);
  console.log('[+] Form başarıyla oluşturuldu:', data);
  return data;
}

/**
 * Adım 3: Fotoğrafları yükler ve ardından form verisini gönderir.
 */
export async function createFormWithPhotos(
  formData: {
    code: string;
    type: string;
    name: string;
    productError?: string;
    quantity: number;
    lineId: number;
    errorCodeId: number;
  },
  photoUris: string[]
): Promise<FormDataDto> {
  try {
    // 1. Fotoğrafları Yükle (eğer varsa)
    let photoUrls: string[] | undefined;
    if (photoUris && photoUris.length > 0) {
      const uploadResult = await uploadPhotos(formData.code, photoUris);
      photoUrls = uploadResult.filePaths;
    }

    // 2. Form Verisini Hazırla ve Gönder
    const formPayload: CreateFormPayload = {
      code: formData.code,
      type: formData.type,
      name: formData.name,
      productError: formData.productError,
      quantity: formData.quantity,
      lineId: formData.lineId,
      errorCodeId: formData.errorCodeId,
      status: 'işlem yapılmadı',
      formDate: new Date().toISOString(),
      photoUrls: photoUrls,
    };

    const createdForm = await createForm(formPayload);
    return createdForm;
  } catch (error) {
    console.error('Form gönderme işlemi sırasında bir hata oluştu:', error);
    throw new Error('Form ve fotoğraflar sunucuya gönderilemedi.');
  }
}


