import apiClient from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken?: string;
  lastActiveTenantSubdomain?: string | null;
  error?: string;
};

async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiClient("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(payload),
    withCredentials: true, // ensure cookies are set
  });
  return res.data;
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
  });
}
