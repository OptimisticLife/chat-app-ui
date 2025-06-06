import React, { createContext } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  refreshAuthStatus: () => void;
  loggedUser: { name: string; id: string } | null;
  setLoggedUser: React.Dispatch<
    React.SetStateAction<{ name: string; id: string } | null>
  >;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  refreshAuthStatus: () => {},
  loggedUser: { name: "John Doe", id: "12345" } as {
    name: string;
    id: string;
  } | null,
  setLoggedUser: () => {},
  loading: false,
});
