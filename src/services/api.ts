import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

// --- INTERCEPTOR DE RESPOSTA ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove dados de autenticação
      localStorage.removeItem('@Paraiso:token');
      localStorage.removeItem('@Paraiso:user');

      // Redireciona para login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
