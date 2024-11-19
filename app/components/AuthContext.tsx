import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

async function save(key: string, value: JWT | null) {
  if (value === null) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

type JWT = {
 access_token: string;
 refresh_token: string;
};

const AuthContext = createContext<{
  signIn: (JWT: JWT) => void;
  signOut: () => void;
  session?: JWT | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [JWT, setJWT] = useState<JWT | null>(null);
 
  useEffect(() => {
    (async () => {
      const session = await SecureStore.getItemAsync("Auth") as string | null;
      if (!session) {
        setIsLoading(false);
        return;
      }
      setJWT(JSON.parse(session));
      setIsLoading(false);
    })();
  }, [isLoading, JWT]);

  return (
    <AuthContext.Provider
      value={{
        signIn: (JWT: JWT) => {
          save("Auth", JWT);
          setJWT(JWT);
        },
        signOut: () => {
          save("Auth", null);
          setJWT(null);
        },
        session: JWT,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
