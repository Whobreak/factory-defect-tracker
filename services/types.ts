export interface LoginResponse {
  token: string;
  role: string;
}

export interface UserInfo {
  username: string;
  line: string;
  role: string;
}

export interface Form {
  id: string;
  title: string;
  status: string;
  barcode: string;
  productType: string;
  lineNumber: string;
  errorCode: ErrorCodeDto;
  note?: string;
  photos: string[]; // URLs
  createdAt: string;
}

export interface FormUpdate {
  title?: string;
  status?: string;
}

export interface ApiError {
  userMessage: string;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isServerError?: boolean;
  isClientError?: boolean;
  response?: {
    status: number;
    data: any;
  };
  message?: string;
  code?: string;
}

export type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export type ErrorCodeDto = {
  id: number;
  code: string;
  description: string;
};

export type LineDto = {
  id: number;
  name: string;
};

export type CreateFormPayload = {
  Code: string;
  Type: string;
  Name: string;
  ProductError: string;
  ErrorCodeId: number;
  LineId: number;
  Quantity: number;
  Photos: string[]; // URL string array (PhotoUpload'dan gelen URL'ler)
};

export type PhotoUploadPayload = {
  serialNumber: string;
  base64Images: string[];
  lengthUnit: string;
};

export type PhotoUploadResponse = {
  success: boolean;
  message?: string;
  filePaths?: string[];
  uploadId?: string;
};
