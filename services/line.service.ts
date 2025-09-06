import api from './api';
import { LineDto } from '~/types'; // types/index.ts dosyasından LineDto tipini import et

/**
 * API'den tüm çalışma bantlarının listesini getirir.
 */
const getLines = () => {
  // API endpoint'inin '/Lines' olduğunu varsayıyoruz. Bu adres farklıysa güncellenmelidir.
  return api.get<LineDto[]>('/Lines');
};

export const LineService = {
  getLines,
};