import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If the 401 comes from the login endpoint itself, do NOT force a redirect.
      // This allows the login page to show an error (e.g. Swal) and wait for user action.
      const requestUrl = error?.config?.url || '';
      const isLoginRequest =
        requestUrl.includes('/auth/login') || requestUrl.endsWith('/login');

      if (isLoginRequest) {
        return Promise.reject(error);
      }

      // For other 401s (expired token / unauthorized), clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/auth/sign-in';
    }

    return Promise.reject(error);
  }
);

export default api;
