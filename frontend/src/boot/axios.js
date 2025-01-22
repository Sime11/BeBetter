import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// Interceptor za dodavanje tokena iz localStorage
api.interceptors.request.use(request => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Sending request:', {
    method: request.method,
    url: request.url,
    headers: request.headers,
    data: request.data,
    baseURL: request.baseURL
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Received response:', {
      status: response.status,
      data: response.data,
      config: {
        url: response.config.url,
        baseURL: response.config.baseURL,
        method: response.config.method
      }
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    });
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
