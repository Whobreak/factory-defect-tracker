import { api } from '../services/api';
import { Report } from '../services/mock';

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
};

export async function createForm(payload: CreateFormPayload): Promise<FormDataDto> {
  const { data } = await api.post<FormDataDto>('/Forms', payload);
  return data;
}

export type PhotoUploadRequest = {
  serialNumber?: string | null;
  base64Images?: string[] | null;
  lengthUnit?: string | null;
};

// If backend expects /Photos endpoint. Adjust path if different.
export async function uploadPhotos(body: PhotoUploadRequest) {
  // Swagger shows POST /api/PhotoUpload
  const { data } = await api.post('/PhotoUpload', body);
  return data;
}


