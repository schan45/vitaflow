"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type AuthType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  userId: string | null;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const session = data.session;

      if (!isMounted) {
        return;
      }

      setIsAuthenticated(!!session);
      setAccessToken(session?.access_token ?? null);
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setAccessToken(session?.access_token ?? null);
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async ({ email, password }: { email: string; password: string }) => {
    const signUpResult = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    if (signUpResult.error && !signUpResult.error.message.toLowerCase().includes("already")) {
      throw new Error(signUpResult.error.message);
    }

    const signInResult = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (signInResult.error) {
      throw new Error(signInResult.error.message);
    }
  };

  const logout = async () => {
    await supabaseBrowser.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, accessToken, userId, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Use inside provider");
  return context;
}
