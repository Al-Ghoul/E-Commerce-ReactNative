import xior from "xior";

export const xiorInstance = xior.create({
  baseURL: "http://192.168.1.2:3000/api",
  headers: {
    // put your common custom headers here
  },
});