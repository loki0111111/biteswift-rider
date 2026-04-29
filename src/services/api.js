import axios from "axios";

const api = axios.create({
  baseURL: "https://biteswift-qw3s.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("riderToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;