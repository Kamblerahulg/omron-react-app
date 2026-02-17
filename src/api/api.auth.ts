// import { callApi } from "./apiClient";
// import { setToken } from "../utils/cookie.util";

import { setToken } from "../utils/cookies";
import { callApi } from "./api.util";

export const generateToken = async () => {
  const response = await callApi<{ access_token: string }>({
    url: "auth/token",
    method: "POST",
    data: {
      client_id: "myclientid",
      client_secret: "mysecret",
    },
    requiresAuth: false, // 🔥 Pre-login
  });

  if (response?.access_token) {
    setToken(response.access_token);
  }

  return response;
};
