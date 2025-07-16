import fetch from "node-fetch";
import {
  logExternalServiceCall,
  logExternalServiceSuccess,
  logExternalServiceFailure,
  logExternalServiceFallback,
} from "./logger.js";

const getExternalData = async (retries = 3, originalRetries = retries) => {
  const url = "http://unstable-service:4000/data";

  logExternalServiceCall(url, retries);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    let res;

    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error("Failed external service");
    }

    const data = await res.json();
    logExternalServiceSuccess(url, data);
    return data;
  } catch (err) {
    if (retries > 0) {
      logExternalServiceFailure(url, err);
      return await getExternalData(retries - 1, originalRetries);
    }

    logExternalServiceFallback(url);
    return { message: "Fallback response" };
  }
};

export default getExternalData;
