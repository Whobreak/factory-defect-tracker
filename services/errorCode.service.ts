import api from './api';
import { ErrorCode } from '~/types'; // Projendeki tiplerin yolunu belirt

const getErrorCodes = () => {
  return api.get<ErrorCode[]>('/ErrorCodes');
};

const createErrorCode = (errorCode: ErrorCode) => {
  return api.post('/ErrorCodes', errorCode);
};

const updateErrorCode = (errorCode: ErrorCode) => {
  return api.put(`/ErrorCodes/${errorCode.id}`, errorCode);
};

const deleteErrorCode = (id: number) => {
  return api.delete(`/ErrorCodes/${id}`);
};

export const ErrorCodeService = {
  getErrorCodes,
  createErrorCode,
  updateErrorCode,
  deleteErrorCode,
};