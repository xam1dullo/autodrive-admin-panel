import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://autodrive-backend-production.up.railway.app';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // send httpOnly cookie on every request
});

// Endpoints under /platform/* are platform-admin only and intentionally
// list every company — they must never be scoped to one. Everything else
// gets `company_id` appended when a dev user has a company selected.
const PLATFORM_PREFIX = /^\/platform(\/|$)/;

axiosInstance.interceptors.request.use((config) => {
  const { token, user, activeCompanyId } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = (config.url ?? '').replace(API_BASE_URL, '');
  const isPlatformRoute = PLATFORM_PREFIX.test(url);
  if (user?.role === 'dev' && activeCompanyId && !isPlatformRoute) {
    config.params = { ...(config.params ?? {}), company_id: activeCompanyId };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
