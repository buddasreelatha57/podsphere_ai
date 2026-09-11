import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      if (typeof window !== "undefined") {
        import("react-toastify").then(({ toast }) => {
          toast.error(error.response.data?.message || "Please log in to perform this action.");
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;