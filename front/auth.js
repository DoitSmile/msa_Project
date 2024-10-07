// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3000",
//   timeout: 5000,
//   withCredentials: true,
// });

// 요청 인터셉터
axios.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post("http://localhost:3000/auth/refresh");
        const { accessToken } = response.data;
        AuthService.setToken(accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        AuthService.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const AuthService = {
  setToken: (token) => {
    localStorage.setItem("accessToken", token);
  },

  getToken: () => {
    return localStorage.getItem("accessToken");
  },

  login: async (email, password) => {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      if (response.data && response.data.accessToken) {
        AuthService.setToken(response.data.accessToken);
        localStorage.setItem("isLoggedIn", "true");
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    delete axios.defaults.headers.common["Authorization"];
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    return (
      localStorage.getItem("isLoggedIn") === "true" && !!AuthService.getToken()
    );
  },
};
export { AuthService };
