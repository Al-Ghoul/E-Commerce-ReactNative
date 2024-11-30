import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { addAuthHeader, xiorInstance } from "@/lib/fetcher";
import setupTokenRefresh from "xior/plugins/token-refresh";
import { XiorResponse } from "xior";
import errorRetry from "xior/plugins/error-retry";

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
      const session = JSON.parse(
        (await SecureStore.getItemAsync("Auth")) as string,
      ) as JWT | null;
      if (!session) {
        setIsLoading(false);
        return;
      }
      setJWT(session);
      setIsLoading(false);
      addAuthHeader(session.access_token);

      xiorInstance.plugins.use(
        errorRetry({
          enableRetry: (config, error) => {
            if (error?.response && shouldRefresh(error.response)) {
              return true;
            }
          },
        }),
      );

      xiorInstance.interceptors.response.use(
        (result) => {
          const { data, request: config, response: originalResponse } = result;
          return result;
        },
        async (error) => {
          if (error.request?.url?.endsWith("/carts") && error.request.method === "GET") {
            const req = await xiorInstance.post(
              `/users/${session.userId}/carts`,
            );
            return Promise.resolve(req);
          }
          return Promise.reject(error);
        },
      );

      function shouldRefresh(response: XiorResponse) {
        return Boolean(
          session?.access_token &&
          response?.status &&
          [401, 403].includes(response.status),
        );
      }

      setupTokenRefresh(xiorInstance, {
        shouldRefresh,
        async refreshToken(error) {
          try {
            const { data } = await xiorInstance.post("/auth/refresh", {
              refresh_token: session.refresh_token,
            });
            if (data) {
              const userId = parseJwt(data.access_token).sub.split("|")[1];
              const jwtWithUserId = { ...data, userId: userId };
              saveJWT("Auth", jwtWithUserId);
              setJWT(jwtWithUserId);
              xiorInstance.interceptors.request.clear();
              addAuthHeader(data.access_token);
            } else {
              throw error;
            }
          } catch {
            saveJWT("Auth", null);
            xiorInstance.interceptors.request.clear();
            setJWT(null);
            return Promise.reject(error);
          }
        },
      });
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: (JWT: JWT) => {
          const userId = parseJwt(JWT.access_token).sub.split("|")[1];
          const jwtWithUserId = { ...JWT, userId: userId };
          saveJWT("Auth", jwtWithUserId);
          setJWT(jwtWithUserId);
          addAuthHeader(JWT.access_token);
        },
        signOut: () => {
          saveJWT("Auth", null);
          setJWT(null);
          xiorInstance.interceptors.request.clear();
        },
        session: JWT,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export async function saveJWT(key: string, value: JWT | null) {
  if (value === null) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Convert Base64Url to Base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(jsonPayload); // Parse to JSON
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
