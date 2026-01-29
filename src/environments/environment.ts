import { apiConfig } from '../app/config/api.config';

export const environment = {
  production: false,
  apiUrl: '/api/v1',  // Using proxy in development
  apiKey: apiConfig.apiKey
};
