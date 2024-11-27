import xior, { merge } from "xior";

export const xiorInstance = xior.create({
  baseURL: "http://192.168.1.3:3000/api",
  headers: {
    // put your common custom headers here
  },
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
