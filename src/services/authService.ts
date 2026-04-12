import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse, LoginCredentials, User } from "@/types/user";


const loginApi = async (creds: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post("/auth/login", creds);
  return data.data;
};

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => setAuth(data.token, data.user),
  });
};

export const useCurrentUser = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/me");
      return data.data;
    },
    enabled: !!token,
  });
};
