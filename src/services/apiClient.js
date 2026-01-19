import axios from "axios";
import { toast } from "../utils/toast.js";

export function createApiClient({ baseUrl, apiKey }) {
  const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true, // IMPORTANT: Enviar cookies en requests cross-origin
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey || "",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Error inesperado en la API";
        toast.error(message);
      } else {
        toast.error("No se pudo conectar con el backend");
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

