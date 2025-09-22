// apiClient.ts
import axios, { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// ---- Manage Refresh State ----
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ---- Interceptors ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/api/auth/refresh");

        processQueue(null);
        return apiClient(originalRequest); // retry original request
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---- Helper wrapper that allows custom headers ----
export const apiRequest = <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  return apiClient({
    headers: {
      "Content-Type": "application/json",
      ...config.headers, // merge caller’s headers
    },
    ...config,
    withCredentials: true, // ensure cookies are sent
  }).then((res) => res.data);
};

export default apiClient;
