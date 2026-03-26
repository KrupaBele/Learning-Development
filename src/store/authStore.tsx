import { create } from "zustand";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  company: string;
  isApproved: string;
  isFirstLogin: boolean;
  progress: {
    modules: any[];
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signin: (params: {
    credentials: { email: string; password: string };
    onSuccess: (user: User, token: string) => void;
  }) => Promise<void>;
  signout: () => void;
  loadUserFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load from localStorage when Zustand store initializes
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return {
    token: token || null,
    user: user ? JSON.parse(user) : null,
    isLoading: false,
    error: null,

    signin: async ({ credentials, onSuccess }) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch("https://gaussconnect.com/api/login", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Invalid credentials");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        set({ token: data.token, user: data.user, isLoading: false });

        onSuccess(data.user, data.token);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        set({ isLoading: false, error: errorMessage });
        console.error("Login failed:", errorMessage);
      }
    },

    signout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null, error: null });
    },

    loadUserFromStorage: () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        set({ token, user: JSON.parse(user) });
      }
    },
  };
});
