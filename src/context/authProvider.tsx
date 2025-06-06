import { useEffect, useState, useCallback } from "react";
import { AuthContext } from "./authContext";
import useNav from "../hooks/navigate";

const apiUrl = import.meta.env.VITE_API_URL;

async function fetchUser(): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/check-session`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response from check-session:", response);
    return response.ok;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState<{
    name: string;
    id: string;
  } | null>(() => {
    try {
      const storedUser = localStorage.getItem("loggedUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error in parsing loggedUser:", error);
      return null;
    }
  });

  const { navigate } = useNav();
  const [loading, setLoading] = useState(true);

  const refreshAuthStatus = useCallback(async () => {
    if (!isAuthenticated) setLoading(true);
    try {
      const isAuth = await fetchUser();

      if (isAuthenticated !== isAuth) {
        setIsAuthenticated(isAuth);

        if (!loggedUser) {
          const storedUser = localStorage.getItem("loggedUser") || "";
          setLoggedUser(JSON.parse(storedUser));
        }
        if (!isAuth) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error in refreshAuthStatus:", error);
    } finally {
      setLoading(false);
    }
  }, [loggedUser, navigate, isAuthenticated]);

  useEffect(() => {
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        refreshAuthStatus,
        loggedUser,
        setLoggedUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
