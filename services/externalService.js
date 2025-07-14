import fetch from "node-fetch";

const getExternalData = async (retries = 3) => {
  const url = "http://unstable-service:4000/data";
  try {
    const res = await fetch(url, { timeout: 2000 });
    if (!res.ok) {
      throw new Error("Failed external service");
    }
    return await res.json();
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying... (${3 - retries + 1})`);
      return getExternalData(retries - 1);
    }
    console.warn("Fallback used due to repeated failure.");
    return { message: "Fallback response" };
  }
};

export default getExternalData;
