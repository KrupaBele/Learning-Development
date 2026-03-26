import axios from "axios";

const api = axios.create({
  baseURL: "https://gaussconnect.com",
});

export const configureApi = (token: string) => {
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};

export default api;
