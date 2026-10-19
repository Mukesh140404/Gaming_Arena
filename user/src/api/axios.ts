import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: import.meta.env.PROD ? "/api/v1" : `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Save the WebSocket token from any response that contains it
api.interceptors.response.use((response) => {
  const wsToken = response.data?.data?.wsToken;
  if (wsToken) {
    sessionStorage.setItem("wsToken", wsToken);
  }
  return response;
});
