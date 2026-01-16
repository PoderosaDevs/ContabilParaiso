import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// --- ADICIONE AQUI ---

// Interceptor para TRATAR a resposta
api.interceptors.response.use(
  (response) => {
    // Se a requisição deu certo, apenas retorna a resposta
    return response;
  },
  (error) => {
    // Se o backend retornar 401 (Não autorizado), significa que o token caiu ou é inválido
    if (error.response && error.response.status === 401) {
      
      // 1. Limpa o localStorage para deslogar o usuário no front
      localStorage.removeItem("@Paraiso:token");
      localStorage.setItem("@Paraiso:user", "");

      // 2. Redireciona para o login (opcional, mas recomendado)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;