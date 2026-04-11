import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse, LoginCredentials, User } from "@/types/user";

// Demo data for frontend development
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "owner@autodrive.uz": {
    password: "owner123",
    user: {
      id: "1",
      name: "Abdulloh Karimov",
      email: "owner@autodrive.uz",
      role: "owner",
      phone: "+998901234567",
    },
  },
  "manager@autodrive.uz": {
    password: "manager123",
    user: {
      id: "2",
      name: "Sardor Aliyev",
      email: "manager@autodrive.uz",
      role: "manager",
      branch_id: "minor",
      branch_name: "Minor",
      phone: "+998907654321",
    },
  },
};

const loginApi = async (creds: LoginCredentials): Promise<AuthResponse> => {
   const demoUser = DEMO_USERS[creds.email];
  if (demoUser && demoUser.password === creds.password) {
    return { token: 'demo-jwt-token-' + Date.now(), user: demoUser.user };
  }
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
