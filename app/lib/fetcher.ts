import xior, { merge } from "xior";

export const xiorInstance = xior.create({
  baseURL: "http://192.168.1.3:3000/api",
});

export function addAuthHeader(token: string | null) {
  xiorInstance.interceptors.request.use((config) => {
    if (!token) return config;

    return merge(config, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  });
}
