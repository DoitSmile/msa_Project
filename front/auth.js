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
  decodeToken: (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const decodedToken = AuthService.decodeToken(token);
    return decodedToken
      ? { id: decodedToken.id, name: decodedToken.name }
      : null;
  },

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

  isAuthenticated: () => {
    return (
      localStorage.getItem("isLoggedIn") === "true" && !!AuthService.getToken()
    );
  },
};
export { AuthService };
