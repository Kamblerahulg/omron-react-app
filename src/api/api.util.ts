import axios, { AxiosRequestConfig } from "axios";
import { ApiRequestConfig } from "../types/api.types";
import { getToken } from "../utils/cookies";
import { BASE_URL, PRIVATE_KEY } from "./api.constants";
// import { BASE_URL, PRIVATE_KEY } from "../constants/api.constants";
// import { getToken } from "../utils/cookie.util";
// import { ApiRequestConfig } from "../types/api.types";

export const callApi = async <T = any>({
  url,
  method = "GET",
  data,
  params,
  requiresAuth = false,
}: ApiRequestConfig): Promise<T> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Private-Key": PRIVATE_KEY,
    };

    if (requiresAuth) {
      const token = getToken();

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    const config: AxiosRequestConfig = {
      baseURL: BASE_URL,
      url,
      method,
      data,
      params,
      headers,
    };

    const response = await axios(config);

    return response.data;
  } catch (error: any) {
  // Use dir to see the hidden properties of the error object
  console.dir(error); 

  // This will tell you if it's a CORS issue vs a DNS/Connection issue
  console.log("Error Message:", error.message); 
  console.log("Is Axios Error?:", axios.isAxiosError(error));
  
  throw error;
}
};
