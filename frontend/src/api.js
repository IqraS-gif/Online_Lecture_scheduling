import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is not set in .env");
}

const api = axios.create({ baseURL });

export default api;
