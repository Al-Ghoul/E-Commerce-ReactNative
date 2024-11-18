import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

async function save(key: string, value: string | null) {
  if (value === null) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
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
  const [JWT, setJWT] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await SecureStore.getItemAsync("Auth");
      setJWT(session);
      setIsLoading(false);
    })();
  }, [isLoading, JWT]);

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          save("Auth", "xxx");
          setJWT("xxx");
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
